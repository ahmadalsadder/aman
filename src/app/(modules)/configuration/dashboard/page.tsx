
'use client';
import * as React from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { Permission } from '@/types';
import { LayoutDashboard, AlertTriangle } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

export default function ConfigurationDashboardPage() {
  const { hasPermission } = useAuth();
  const canView = hasPermission(['configuration:dashboard:view' as Permission]);
  const t = useTranslations('Configuration.Dashboard');

  if (!canView) {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
            <AlertTriangle className="h-16 w-16 text-destructive" />
            <h1 className="text-2xl font-bold">{t('accessDenied.title')}</h1>
            <p className="max-w-md text-muted-foreground">
                {t('accessDenied.description')}
            </p>
        </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage icon={LayoutDashboard}>{t('title')}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <DashboardHeader
        title={t('title')}
        description={t('description')}
      />
      <Card>
        <CardHeader>
          <CardTitle>{t('welcome.title')}</CardTitle>
          <CardDescription>
            {t('welcome.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p>{t('welcome.content')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
