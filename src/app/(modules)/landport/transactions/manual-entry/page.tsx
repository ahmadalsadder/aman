
'use client';

import { ManualEntryForm } from '@/components/transactions/manual-entry-form';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { LayoutDashboard, ArrowRightLeft, Edit } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { AlertTriangle } from 'lucide-react';


export default function LandportManualTransactionPage() {
    const { hasPermission } = useAuth();

    if (!hasPermission(['landport:records:create'])) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                <AlertTriangle className="h-16 w-16 text-destructive" />
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="max-w-md text-muted-foreground">
                    You do not have permission to manually create transactions for this module.
                </p>
            </div>
        );
    }

  return (
    <div className="flex flex-col gap-4">
       <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/landport/dashboard" icon={LayoutDashboard}>Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/landport/transactions" icon={ArrowRightLeft}>Transactions</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage icon={Edit}>Manual Entry</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <DashboardHeader 
        title="Manual Transaction Entry"
        description="Manually create a new border crossing transaction record."
        icon={Edit}
      />
      <ManualEntryForm />
    </div>
  );
}
