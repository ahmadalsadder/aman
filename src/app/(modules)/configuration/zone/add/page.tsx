
'use client';

import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { ZoneForm } from '@/components/configuration/zones/zone-form';
import type { ZoneFormValues } from '@/components/configuration/zones/zone-form';
import { PlusCircle, AlertTriangle, LayoutDashboard, Building, Map } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Zone, Terminal, Permission } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export default function AddZonePage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, hasPermission } = useAuth();
    const t = useTranslations('Configuration.Zones.form');
    const tNav = useTranslations('Navigation');
    
    const [isLoading, setIsLoading] = useState(false);
    const [terminals, setTerminals] = useState<Terminal[]>([]);

    const canCreate = hasPermission(['configuration:zones:create' as Permission]);

    useEffect(() => {
        if (!canCreate) return;
        const fetchTerminals = async () => {
            setIsLoading(true);
            const result = await api.get<Terminal[]>('/data/terminals');
            if (result.isSuccess) {
                setTerminals(result.data || []);
            }
            setIsLoading(false);
        };
        fetchTerminals();
    }, [canCreate]);

    const handleSave = async (formData: ZoneFormValues) => {
        setIsLoading(true);
        const newZoneData: Partial<Zone> = {
            ...formData,
            createdBy: user?.name || 'System',
        };

        const result = await api.post<Zone>('/data/zones/save', newZoneData);
        
        if (result.isSuccess) {
            toast({
                title: t('toast.addSuccessTitle'),
                description: t('toast.addSuccessDesc', { name: result.data!.name }),
                variant: 'success',
            });
            router.push('/configuration/zone');
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
                        <BreadcrumbLink href="/configuration/dashboard" icon={LayoutDashboard}>{tNav('dashboard')}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/configuration/terminals" icon={Building}>{tNav('terminals')}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                     <BreadcrumbItem>
                        <BreadcrumbLink href="/configuration/zone" icon={Map}>{t('pageTitle')}</BreadcrumbLink>
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
            {isLoading && <Skeleton className="h-96 w-full" />}
            {!isLoading && <ZoneForm onSave={handleSave} isLoading={isLoading} terminals={terminals} />}
        </div>
    );
}
