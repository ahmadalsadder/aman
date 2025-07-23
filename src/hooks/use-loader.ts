'use client';

import { useContext } from 'react';
import { LoaderContext, type LoaderContextType } from '@/components/loader-provider';

export const useLoader = (): LoaderContextType => {
  const context = useContext(LoaderContext);
  if (context === undefined) {
    throw new Error('useLoader must be used within a LoaderProvider');
  }
  return context;
};
