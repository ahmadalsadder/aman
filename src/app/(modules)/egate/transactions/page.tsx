
'use client';

import { TransactionsPage } from '@/components/transactions/transactions-page';

export default function EgateTransactionsPage() {
  return (
    <TransactionsPage
      module="egate"
      title="E-Gate Transaction Management"
      description="View, search, and manage all E-Gate crossing transactions."
    />
  );
}
