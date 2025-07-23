'use client';

import { flagEdgeCaseResponse } from '@/ai/flows/flag-edge-case-responses';
import { toast } from '@/hooks/use-toast';
import { Result, ApiError } from '@/types/api/result';
import type { User } from '@/types';
import { LoaderContext } from '@/components/loader-provider';
import { useContext } from 'react';

// A bit of a hack to get the loader context outside of a component
// This relies on the fact that the context provider is in the root layout
// and this module is only used on the client.
let showLoaderGlobally = () => {};
let hideLoaderGlobally = () => {};

// We can't use the hook directly, but we can make a tiny component
// to snatch the context functions.
function ApiContextSnatcher() {
    const { showLoader, hideLoader } = useContext(LoaderContext)!;
    showLoaderGlobally = showLoader;
    hideLoaderGlobally = hideLoader;
    return null;
}
// This helper component needs to be rendered once in the app.
// We'll add it to the AuthProvider.
export { ApiContextSnatcher };


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

// This is a stand-in for a real API client.
async function mockApi<T>(endpoint: string, options: RequestInit = {}): Promise<Result<T>> {
    const { method = 'GET' } = options;
    const url = new URL(`http://localhost:3001/api${endpoint}`);
    
    console.log(`[API] ${method} ${url.pathname}`);
    
    try {
        const response = await fetch(url.toString(), {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            let errorPayload;
            try {
                // Try to parse the error response from the server
                errorPayload = await response.json();
            } catch (e) {
                // If the body is not JSON or empty, create a generic error
                return Result.failure([new ApiError(`HTTP_${response.status}`, `Request failed with status: ${response.status}`)]);
            }

            // If the server sent a Result object, use its errors
            if (errorPayload && errorPayload.isSuccess === false && errorPayload.errors) {
                 return new Result<T>(null, errorPayload.errors, false, errorPayload.warnings, errorPayload.info);
            }
            
            // Otherwise, create a generic error from the payload
            const errorMessage = typeof errorPayload === 'string' ? errorPayload : JSON.stringify(errorPayload);
            return Result.failure([new ApiError(`HTTP_${response.status}`, errorMessage)]);
        }

        const data = await response.json();
        return data as Result<T>;

    } catch (error) {
        console.error("API Fetch Error:", error);
        if (error instanceof Error) {
            return Result.failure([new ApiError('NETWORK_ERROR', error.message)]);
        }
        return Result.failure([new ApiError('UNKNOWN_ERROR', 'An unknown network error occurred.')]);
    }
}


export async function api<T>(endpoint: string, options: RequestInit = {}): Promise<Result<T>> {
  showLoaderGlobally();
  try {
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
  } finally {
    hideLoaderGlobally();
  }
}
