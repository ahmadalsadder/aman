'use client';

import { flagEdgeCaseResponse } from '@/ai/flows/flag-edge-case-responses';
import { toast } from '@/hooks/use-toast';
import type { Result } from '@/types/api/contracts';
import type { User } from '@/types';

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

// Mock API database
const mockApiResponses: Record<string, any> = {
  '/dashboard/stats': {
    isSuccess: true,
    data: {
      totalAnomalies: 12,
      monitoredEndpoints: 42,
      uptimePercentage: 99.9,
    },
    errors: null,
    warnings: null,
    info: null,
  },
  // This response is intentionally a raw string to test the GenAI flagging
  '/dashboard/stats-error': {
    responseText: `{ "error": "invalid_token", "error_description": "The access token is expired or invalid", "user_id": 12345, "internal_debug_info": "trace_id: xyz-abc-123" }`,
    statusCode: 401,
  },
};

export async function api<T>(endpoint: string, options: RequestInit = {}): Promise<Result<T>> {
  const { token, role } = getAuthInfo();
  
  console.log(`API Call to ${endpoint} with token: ${token ? 'present' : 'absent'}`);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const mockResponse = mockApiResponses[endpoint];
  let responseText: string;
  let result: Result<T>;

  if (!mockResponse) {
    responseText = JSON.stringify({ isSuccess: false, data: null, errors: [{ code: '404', message: 'Not Found' }], warnings: null, info: null });
    result = JSON.parse(responseText);
  } else if (mockResponse.responseText) {
    responseText = mockResponse.responseText;
    try {
      result = JSON.parse(responseText);
    } catch {
      // Simulate an incomplete/malformed response object for the result
      result = { data: null, isSuccess: false, errors: [{code: "PARSE_ERROR", message: "Could not parse API response"}], warnings: null, info: null };
    }
  } else {
    result = mockResponse as Result<T>;
    responseText = JSON.stringify(result);
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
    // Do not show a toast for errors in the detection itself, just log them.
  }
      
  return result;
}
