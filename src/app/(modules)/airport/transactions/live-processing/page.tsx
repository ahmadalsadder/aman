
'use client';

import { LiveProcessingFlow } from '@/components/transactions/live-processing-flow';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { LayoutDashboard, RadioTower, Plane } from 'lucide-react';

export default function AirportLiveProcessingPage() {
  return (
    <div className="flex flex-col gap-4">
       <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/airport/dashboard" icon={LayoutDashboard}>Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/airport/transactions" icon={RadioTower}>Transactions</BreadcrumbLink>
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
        icon={Plane}
      />
      <LiveProcessingFlow module="airport" />
    </div>
  );
}
