
'use client';

import { TransactionsPage } from '@/components/transactions/transactions-page';
import { useAuth } from '@/hooks/use-auth';
import { AlertTriangle } from 'lucide-react';
import { useMemo } from 'react';
import type { Permission } from '@/types';

export default function EgateTransactionsPage() {
  const { hasPermission } = useAuth();
  const canView = useMemo(() => hasPermission(['egate:transactions:view' as Permission]), [hasPermission]);

  if (!canView) {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
            <AlertTriangle className="h-16 w-16 text-destructive" />
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="max-w-md text-muted-foreground">
                You do not have permission to view E-Gate transactions.
            </p>
        </div>
    );
  }

  return (
    <TransactionsPage
      module="egate"
      title="E-Gate Transaction Management"
      description="View, search, and manage all E-Gate crossing transactions."
    />
  );
}
