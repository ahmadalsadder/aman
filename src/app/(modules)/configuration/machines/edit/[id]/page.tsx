
'use client';

import { MachineForm, type MachineFormValues } from '@/components/configuration/machines/machine-form';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import type { Machine, Port, Terminal, Zone, Permission } from '@/types';
import { useState, useEffect } from 'react';
import { FilePenLine, AlertTriangle, HardDrive, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export default function EditMachinePage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const { toast } = useToast();
    const t = useTranslations('Configuration.Machines.form');
    const tNav = useTranslations('Navigation');
    const { hasPermission } = useAuth();
    
    const [pageData, setPageData] = useState<{
        machine: Machine;
        ports: Port[];
        terminals: Terminal[];
        zones: Zone[];
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const id = params.id;

    const canEdit = hasPermission(['configuration:machines:edit' as Permission]);

    useEffect(() => {
        if (!id || !canEdit) {
            setLoading(false);
            return;
        }
        const fetchData = async () => {
            setLoading(true);
             const [machineRes, portsRes, terminalsRes, zonesRes] = await Promise.all([
                api.get<{ machine: Machine }>(`/data/machines/${id}`),
                api.get<Port[]>('/data/ports/all'),
                api.get<Terminal[]>('/data/terminals'),
                api.get<Zone[]>('/data/zones'),
            ]);

            if (machineRes.isSuccess && machineRes.data && portsRes.isSuccess && terminalsRes.isSuccess && zonesRes.isSuccess) {
                 setPageData({
                    machine: machineRes.data.machine,
                    ports: portsRes.data || [],
                    terminals: terminalsRes.data || [],
                    zones: zonesRes.data || [],
                });
            } else {
                 toast({ title: t('toast.loadErrorTitle'), variant: 'destructive' });
            }
            setLoading(false);
        };
        fetchData();
    }, [id, t, toast, canEdit]);

    const handleSave = async (formData: MachineFormValues) => {
        if (!pageData) return;
        setLoading(true);

        const result = await api.post<Machine>('/data/machines/save', { id: pageData.machine.id, ...formData });

        if (result.isSuccess) {
            toast({
                title: t('toast.updateSuccessTitle'),
                description: t('toast.updateSuccessDesc', { name: result.data!.name }),
                variant: 'success',
            });
            router.push('/configuration/machines');
        } else {
            toast({
                title: t('toast.errorTitle'),
                description: result.errors?.[0]?.message || t('toast.errorDesc'),
                variant: 'destructive',
            });
            setLoading(false);
        }
    };

    if (loading) {
        return <Skeleton className="h-96 w-full" />;
    }
    
    if (!canEdit) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                <AlertTriangle className="h-16 w-16 text-destructive" />
                <h1 className="text-2xl font-bold">{t('accessDenied.title')}</h1>
                <p className="max-w-md text-muted-foreground">{t('accessDenied.editDescription')}</p>
            </div>
        );
    }
    
    if (!pageData) {
        return (
             <div className="flex h-full w-full items-center justify-center">
                 <div className="flex flex-col items-center gap-4 text-destructive">
                    <p>{t('toast.loadErrorTitle')}</p>
                </div>
            </div>
        )
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
                        <BreadcrumbPage icon={FilePenLine}>{t('editTitle')}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <GradientPageHeader
                title={t('editTitle')}
                description={t('editDescription', { name: pageData.machine.name })}
                icon={FilePenLine}
            />
            <MachineForm 
                onSave={handleSave} 
                isLoading={loading}
                machineToEdit={pageData.machine}
                ports={pageData.ports}
                terminals={pageData.terminals}
                zones={pageData.zones}
            />
        </div>
    );
}
