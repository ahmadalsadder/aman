
'use client';

import { useState } from 'react';
import { BlacklistForm, type BlacklistFormValues } from '@/components/passengers/blacklist/blacklist-form';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Passenger, BlacklistEntry } from '@/types/live-processing';
import { PlusCircle, ShieldAlert, AlertTriangle, Search, Loader2, ListChecks, LayoutDashboard, ShieldOff } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export default function AddAirportBlacklistPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, hasPermission } = useAuth();
    const t = useTranslations('BlacklistPage.form');
    const tNav = useTranslations('Navigation');
    
    const [isLoading, setIsLoading] = useState(false);
    
    const module = 'airport';
    const canCreate = hasPermission([`${module}:blacklist:create`]);

    const handleSave = async (formData: BlacklistFormValues) => {
        setIsLoading(true);
        const newEntryData = {
            ...formData,
            addedBy: user?.name || 'System',
            dateAdded: new Date().toISOString().split('T')[0],
        };
        
        const result = await api.post<BlacklistEntry>('/data/blacklist/save', newEntryData);
        
        if (result.isSuccess) {
            toast({ title: t('toast.addSuccessTitle'), description: t('toast.addSuccessDesc', { name: result.data!.name }), variant: 'success' });
            router.push(`/${module}/blacklist`);
        } else {
            toast({ title: t('toast.errorTitle'), description: result.errors?.[0]?.message || t('toast.errorDesc'), variant: 'destructive' });
            setIsLoading(false);
        }
    };

    if (!canCreate) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                <AlertTriangle className="h-16 w-16 text-destructive" />
                <h1 className="text-2xl font-bold">{t('accessDenied.title')}</h1>
                <p className="max-w-md text-muted-foreground">{t('accessDenied.createDescription')}</p>
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
            <GradientPageHeader title={t('addTitle')} description={t('addDescription')} icon={PlusCircle} />
            <BlacklistForm onSave={handleSave} isLoading={isLoading} />
        </div>
    );
}
