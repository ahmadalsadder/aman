'use client';

import * as React from 'react';

export interface LoaderContextType {
  isLoading: boolean;
  showLoader: () => void;
  hideLoader: () => void;
}

export const LoaderContext = React.createContext<LoaderContextType | undefined>(undefined);

export function LoaderProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = React.useState(false);
  const requestCount = React.useRef(0);

  const showLoader = React.useCallback(() => {
    requestCount.current++;
    if (!isLoading) {
      setIsLoading(true);
    }
  }, [isLoading]);

  const hideLoader = React.useCallback(() => {
    requestCount.current--;
    if (requestCount.current <= 0) {
      requestCount.current = 0; // Prevent negative counts
      setIsLoading(false);
    }
  }, []);

  const value = React.useMemo(() => ({
    isLoading,
    showLoader,
    hideLoader,
  }), [isLoading, showLoader, hideLoader]);

  return <LoaderContext.Provider value={value}>{children}</LoaderContext.Provider>;
}
