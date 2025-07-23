
'use client';
import * as React from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { Module } from '@/types';
import { useRouter } from 'next/navigation';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { DashboardHeader } from './layout/dashboard-header';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from './ui/breadcrumb';

export default function ModulePage({ module, children, title, description, icon: Icon }: { module: Module, children: React.ReactNode, title: string, description: string, icon: React.ElementType }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = React.useState<boolean | null>(null);
  const t = useTranslations('ModulePage');

  React.useEffect(() => {
    if (!loading && user) {
      if (user.modules.includes(module)) {
        setAuthorized(true);
      } else {
        setAuthorized(false);
      }
    }
  }, [user, loading, module]);

  if (loading || authorized === null) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">{t('verifyingAccess')}</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
        <AlertTriangle className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold">{t('accessDenied')}</h1>
        <p className="max-w-md text-muted-foreground">
          {t('accessDeniedMessage', { title: title })}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${module}/dashboard`}>Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <DashboardHeader 
          title={title}
          description={description}
        />
      <div>{children}</div>
    </div>
  );
}
