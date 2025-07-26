
'use client';

import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { TerminalForm, type TerminalFormValues } from '@/components/configuration/terminals/terminal-form';
import { PlusCircle, AlertTriangle, Building, LayoutDashboard, Ship } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Terminal, Port, Permission } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export default function AddTerminalPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, hasPermission } = useAuth();
    const t = useTranslations('Configuration.Terminals.form');
    const tNav = useTranslations('Navigation');
    
    const [isLoading, setIsLoading] = useState(false);
    const [ports, setPorts] = useState<Port[]>([]);

    const canCreate = hasPermission(['configuration:terminals:create' as Permission]);

    useEffect(() => {
        if (!canCreate) return;
        const fetchPorts = async () => {
            setIsLoading(true);
            const result = await api.get<Port[]>('/data/ports/all');
            if (result.isSuccess) {
                setPorts(result.data || []);
            }
            setIsLoading(false);
        };
        fetchPorts();
    }, [canCreate]);

    const handleSave = async (formData: TerminalFormValues) => {
        setIsLoading(true);
        const newTerminalData: Partial<Terminal> = {
            ...formData,
            createdBy: user?.name || 'System',
        };

        const result = await api.post<Terminal>('/data/terminals/save', newTerminalData);
        
        if (result.isSuccess) {
            toast({
                title: t('toast.addSuccessTitle'),
                description: t('toast.addSuccessDesc', { name: result.data!.name }),
                variant: 'success',
            });
            router.push('/configuration/terminals');
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
                        <BreadcrumbLink href="/configuration/ports" icon={Ship}>{t('portsPageTitle')}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/configuration/terminals" icon={Building}>{t('pageTitle')}</BreadcrumbLink>
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
            {!isLoading && <TerminalForm onSave={handleSave} isLoading={isLoading} ports={ports} />}
        </div>
    );
}
