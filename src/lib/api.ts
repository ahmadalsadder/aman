'use client';

import { flagEdgeCaseResponse } from '@/ai/flows/flag-edge-case-responses';
import { toast } from '@/hooks/use-toast';
import { Result, ApiError } from '@/types/api/result';
import type { User } from '@/types';
import { LoaderContext } from '@/components/loader-provider';
import { useContext } from 'react';
import { mockApi } from './mock-api';

// A bit of a hack to get the loader context outside of a component
// This relies on the fact that the context provider is in the root layout
// and this module is only used on the client.
let showLoaderGlobally = () => {};
let hideLoaderGlobally = () => {};

// We can't use the hook directly, but we can make a tiny component
// to snatch the context functions.
function ApiContextSnatcher() {
    const loaderContext = useContext(LoaderContext);
    if (loaderContext) {
        showLoaderGlobally = loaderContext.showLoader;
        hideLoaderGlobally = loaderContext.hideLoader;
    }
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
