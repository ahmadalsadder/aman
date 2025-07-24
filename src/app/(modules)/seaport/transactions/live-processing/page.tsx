
'use client';

import { LiveProcessingFlow } from '@/components/transactions/live-processing-flow';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { LayoutDashboard, RadioTower, Ship, ArrowRightLeft } from 'lucide-react';

export default function SeaportLiveProcessingPage() {
  return (
    <div className="flex flex-col gap-4">
       <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/seaport/dashboard" icon={LayoutDashboard}>Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
           <BreadcrumbItem>
            <BreadcrumbLink href="/seaport/transactions" icon={ArrowRightLeft}>Transactions</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage icon={RadioTower}>Live Processing</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <DashboardHeader 
        title="Live Officer Processing"
        description="Real-time passenger processing workflow."
        icon={Ship}
      />
      <LiveProcessingFlow module="seaport" />
    </div>
  );
}
