
'use client';

import { TransactionsPage } from '@/components/transactions/transactions-page';

export default function SeaportTransactionsPage() {
  return (
    <TransactionsPage
      module="seaport"
      title="Seaport Transaction Management"
      description="View, search, and manage all seaport border crossing transactions."
    />
  );
}
