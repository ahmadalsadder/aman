
'use client';

import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { MachineForm, type MachineFormValues } from '@/components/configuration/machines/machine-form';
import { PlusCircle, AlertTriangle, HardDrive, LayoutDashboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Machine, Port, Terminal, Zone, Permission } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export default function AddMachinePage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, hasPermission } = useAuth();
    const t = useTranslations('Configuration.Machines.form');
    const tNav = useTranslations('Navigation');
    const module = 'configuration';

    const [isLoading, setIsLoading] = useState(false);
    const [pageData, setPageData] = useState<{
        ports: Port[];
        terminals: Terminal[];
        zones: Zone[];
    } | null>(null);

    const canCreate = hasPermission(['configuration:machines:create' as Permission]);

    useEffect(() => {
        if (!canCreate) return;

        const fetchData = async () => {
            setIsLoading(true);
            const [portsRes, terminalsRes, zonesRes] = await Promise.all([
                api.get<Port[]>('/data/ports/all'),
                api.get<Terminal[]>('/data/terminals'),
                api.get<Zone[]>('/data/zones'),
            ]);

            if (portsRes.isSuccess && terminalsRes.isSuccess && zonesRes.isSuccess) {
                setPageData({
                    ports: portsRes.data || [],
                    terminals: terminalsRes.data || [],
                    zones: zonesRes.data || [],
                });
            } else {
                toast({ variant: 'destructive', title: t('toast.loadErrorTitle') });
            }
            setIsLoading(false);
        };
        fetchData();
    }, [canCreate, t, toast]);

    const handleSave = async (formData: MachineFormValues) => {
        setIsLoading(true);
        const result = await api.post<Machine>('/data/machines/save', { ...formData, createdBy: user?.name });
        
        if (result.isSuccess) {
            toast({
                title: t('toast.addSuccessTitle'),
                description: t('toast.addSuccessDesc', { name: result.data!.name }),
                variant: 'success',
            });
            router.push('/configuration/machines');
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
                        <BreadcrumbLink href="/configuration/machines" icon={HardDrive}>{t('pageTitle')}</BreadcrumbLink>
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
            {isLoading && !pageData && <Skeleton className="h-96 w-full" />}
            {pageData && (
                <MachineForm 
                    onSave={handleSave} 
                    isLoading={isLoading}
                    ports={pageData.ports}
                    terminals={pageData.terminals}
                    zones={pageData.zones}
                />
            )}
        </div>
    );
}
