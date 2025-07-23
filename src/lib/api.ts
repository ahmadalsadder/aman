'use client';

import { flagEdgeCaseResponse } from '@/ai/flows/flag-edge-case-responses';
import { toast } from '@/hooks/use-toast';
import type { Result } from '@/types/api/contracts';
import type { User } from '@/types';

const API_BASE_URL = 'http://localhost:3001/api';

const getAuthInfo = (): Partial<User> => {
  try {
    const authData = localStorage.getItem('guardian-gate-auth');
    if (authData) {
      return JSON.parse(authData);
    }
  } catch (error) {
    console.error('Failed to parse auth data from localStorage', error);
  }
  return {};
};

export async function api<T>(endpoint: string, options: RequestInit = {}): Promise<Result<T>> {
  const { token, role } = getAuthInfo();

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };
  
  let response;
  let responseText: string = '';
  let result: Result<T>;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    responseText = await response.text();

    if (!response.ok) {
        // If the server returns a non-JSON error response, the AI can still analyze it
        console.error(`API Error: ${response.status} ${response.statusText}`, responseText);
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            // The response is not valid JSON, create a structured error
             result = { data: null, isSuccess: false, errors: [{code: String(response.status), message: response.statusText || "An unknown error occurred."}], warnings: null, info: null };
        }
    } else {
        result = JSON.parse(responseText);
    }
  } catch (error) {
    console.error('Network or fetch error:', error);
    result = { data: null, isSuccess: false, errors: [{code: "NETWORK_ERROR", message: "Could not connect to the server."}], warnings: null, info: null };
    if (error instanceof Error) {
        responseText = error.message;
    }
  }


  // Anomaly detection with GenAI
  try {
    const anomalyResult = await flagEdgeCaseResponse({
      apiEndpoint: endpoint,
      apiResponse: responseText,
      userRole: role || 'viewer',
    });

    if (anomalyResult.isEdgeCase) {
      toast({
        variant: anomalyResult.severity === 'high' ? 'destructive' : 'default',
        title: `Security Anomaly Detected (Severity: ${anomalyResult.severity})`,
        description: anomalyResult.reason,
        duration: 9000
      });
    }
  } catch (e) {
    console.error('Error during anomaly detection:', e);
  }
      
  return result;
}
