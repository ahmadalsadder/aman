
'use client';

import { TransactionsPage } from '@/components/transactions/transactions-page';

export default function AirportTransactionsPage() {
  return (
    <TransactionsPage
      module="airport"
      title="Airport Transaction Management"
      description="View, search, and manage all airport border crossing transactions."
    />
  );
}
