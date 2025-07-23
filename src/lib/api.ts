'use client';

import { flagEdgeCaseResponse } from '@/ai/flows/flag-edge-case-responses';
import { toast } from '@/hooks/use-toast';
import { Result, ApiError } from '@/types/api/result';
import type { User } from '@/types';

const API_BASE_URL = 'http://localhost:3001/api';

const getAuthInfo = (): Partial<User> => {
  try {
    const authCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('guardian-gate-auth='))
      ?.split('=')[1];
      
    if (authCookie) {
      // The cookie is URI encoded
      return JSON.parse(decodeURIComponent(authCookie));
    }
  } catch (error) {
    console.error('Failed to parse auth data from cookie', error);
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
  
  let response: Response | undefined;
  let responseText: string = '';
  let result: Result<T>;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    responseText = await response.text();
    const parsedJson = JSON.parse(responseText);

    if (!response.ok) {
        console.error(`API Error: ${response.status} ${response.statusText}`, responseText);
        result = new Result<T>(parsedJson.data, parsedJson.errors, parsedJson.isSuccess, parsedJson.warnings, parsedJson.info);
    } else {
        result = new Result<T>(parsedJson.data, parsedJson.errors, parsedJson.isSuccess, parsedJson.warnings, parsedJson.info);
    }
  } catch (error: any) {
    console.error('Network or fetch error:', error);
    if (error instanceof SyntaxError && error.message.includes('JSON')) { // JSON parsing error
        result = Result.failure([new ApiError(String(response?.status ?? 500), "Invalid response from server.")]);
        responseText = `Invalid JSON Response: ${responseText}`;
    } else { // Network error or other exceptions
        result = Result.failure([new ApiError("NETWORK_ERROR", "Could not connect to the server.")]);
        responseText = error.message || "Failed to fetch";
    }
  }

  if (!result.isSuccess && result.errors) {
    toast({
        variant: 'destructive',
        title: 'API Error',
        description: result.errors[0].message,
        duration: 5000,
    });
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
