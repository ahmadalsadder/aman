
'use client';

import { TransactionsPage } from '@/components/transactions/transactions-page';

export default function LandportTransactionsPage() {
  return (
    <TransactionsPage
      module="landport"
      title="Landport Transaction Management"
      description="View, search, and manage all landport border crossing transactions."
    />
  );
}
