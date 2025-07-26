
'use client';
import * as React from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { Permission } from '@/types';
import { LayoutDashboard, AlertTriangle } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function ConfigurationDashboardPage() {
  const { hasPermission } = useAuth();
  const canView = hasPermission(['configuration:dashboard:view' as Permission]);

  if (!canView) {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
            <AlertTriangle className="h-16 w-16 text-destructive" />
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="max-w-md text-muted-foreground">
                You do not have permission to view the configuration dashboard.
            </p>
        </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage icon={LayoutDashboard}>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <DashboardHeader
        title="System Configuration"
        description="Manage system-wide settings and parameters."
      />
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Configuration</CardTitle>
          <CardDescription>
            This section is under development. Use the sidebar to navigate to available configuration areas.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p>Future enhancements will consolidate high-level system settings here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
