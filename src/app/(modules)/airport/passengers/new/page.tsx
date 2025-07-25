
'use client';

import { PassengerForm } from '@/components/passengers/passenger-form';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { usePathname } from 'next/navigation';
import { UserPlus, LayoutDashboard, User, AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useAuth } from '@/hooks/use-auth';
import type { Permission, Module } from '@/types';
import { useMemo } from 'react';

export default function AddPassengerPage() {
    const { hasPermission } = useAuth();
    const t = useTranslations('PassengerForm');
    const tNav = useTranslations('Navigation');
    const module: Module = 'airport';
    
    const canCreate = hasPermission([`${module}:passengers:create` as Permission]);

    if (!canCreate) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                <AlertTriangle className="h-16 w-16 text-destructive" />
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="max-w-md text-muted-foreground">
                    You do not have permission to create new passenger records for this module.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
             <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`/${module}/dashboard`} icon={LayoutDashboard}>{tNav('dashboard')}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`/${module}/passengers`} icon={User}>{tNav('passengers')}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage icon={UserPlus}>{t('addTitle')}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <GradientPageHeader
                title={t('addTitle')}
                description={t('addDescription')}
                icon={UserPlus}
            />
            <PassengerForm />
        </div>
    );
}

