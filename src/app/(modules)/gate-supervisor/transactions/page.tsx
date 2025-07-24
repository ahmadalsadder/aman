
'use client';

import { TransactionsPage } from '@/components/transactions/transactions-page';

export default function GateSupervisorTransactionsPage() {
  return (
    <TransactionsPage
      module="gate-supervisor"
      title="Supervisor Transaction Management"
      description="View, search, and manage all border crossing transactions for your shift."
    />
  );
}
