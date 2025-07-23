'use client';

import { flagEdgeCaseResponse } from '@/ai/flows/flag-edge-case-responses';
import { toast } from '@/hooks/use-toast';
import { Result, ApiError } from '@/types/api/result';
import type { User } from '@/types';
import { mockApi } from './mock-api';

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
  // All requests will now go to the mock API
  const result = await mockApi<T>(endpoint, options);
  
  const { role } = getAuthInfo();

  if (!result.isSuccess && result.errors) {
    toast({
        variant: 'destructive',
        title: 'API Error',
        description: result.errors[0].message,
        duration: 5000,
    });
  }


  // Anomaly detection with GenAI can still run on the mock responses
  /*
  try {
    const anomalyResult = await flagEdgeCaseResponse({
      apiEndpoint: endpoint,
      apiResponse: JSON.stringify(result),
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
  */
      
  return result;
}
