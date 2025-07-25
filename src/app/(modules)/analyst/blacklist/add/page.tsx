'use client';

import { BlacklistForm, type BlacklistFormValues } from '@/components/passengers/blacklist/blacklist-form';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { useToast } from '@/hooks/use-toast';
import { useRouter, usePathname } from 'next/navigation';
import { PlusCircle, ShieldOff, AlertTriangle, LayoutDashboard } from 'lucide-react';
import type { BlacklistEntry } from '@/types/live-processing';
import { useAuth } from '@/hooks/use-auth';
import type { Module, Permission } from '@/types';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { api } from '@/lib/api';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export default function AddBlacklistPage() {
    const router = useRouter();
    const pathname = usePathname();
    const module = pathname.split('/')[1] as Module || 'analyst';
    const { toast } = useToast();
    const { user, hasPermission } = useAuth();
    const t = useTranslations('BlacklistPage.form');
    const tNav = useTranslations('Navigation');
    const [isLoading, setIsLoading] = useState(false);

    const canCreate = hasPermission([`${module}:records:create` as Permission]);

    const handleSave = async (formData: BlacklistFormValues) => {
        setIsLoading(true);
        const newEntryData: Omit<BlacklistEntry, 'id'> = {
            ...formData,
            dateAdded: new Date().toISOString().split('T')[0],
            addedBy: user?.name || 'System',
        };

        const result = await api.post<BlacklistEntry>('/data/blacklist/save', newEntryData);
        
        if (result.isSuccess) {
            toast({
                title: t('toast.addSuccessTitle'),
                description: t('toast.addSuccessDesc', { name: result.data!.name }),
                variant: 'success',
            });
            router.push(`/${module}/blacklist`);
        } else {
             toast({
                title: t('toast.errorTitle'),
                description: result.errors?.[0]?.message || t('toast.errorDesc'),
                variant: 'destructive',
            });
            setIsLoading(false);
        }
    };

    if (!canCreate) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                <AlertTriangle className="h-16 w-16 text-destructive" />
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="max-w-md text-muted-foreground">
                    You do not have permission to add entries to the blacklist.
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
                        <BreadcrumbLink href={`/${module}/blacklist`} icon={ShieldOff}>{tNav('blacklist')}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage icon={PlusCircle}>{t('addTitle')}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <GradientPageHeader
                title={t('addTitle')}
                description={t('addDescription')}
                icon={PlusCircle}
            />
            <BlacklistForm onSave={handleSave} isLoading={isLoading} />
        </div>
    );
}
