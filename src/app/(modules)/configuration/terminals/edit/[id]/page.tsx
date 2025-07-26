
'use client';

import { TerminalForm, type TerminalFormValues } from '@/components/configuration/terminals/terminal-form';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import type { Terminal, Port, Permission } from '@/types';
import { useState, useEffect } from 'react';
import { FilePenLine, AlertTriangle, Building, LayoutDashboard, Ship } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export default function EditTerminalPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const { toast } = useToast();
    const { hasPermission } = useAuth();
    const t = useTranslations('Configuration.Terminals.form');
    const tNav = useTranslations('Navigation');

    const [pageData, setPageData] = useState<{ terminal: Terminal; ports: Port[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const id = params.id;

    const canEdit = hasPermission(['configuration:terminals:edit' as Permission]);

    useEffect(() => {
        if (!id || !canEdit) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            const [terminalResult, portsResult] = await Promise.all([
                api.get<{ terminal: Terminal }>(`/data/terminals/${id}`),
                api.get<Port[]>('/data/ports/all')
            ]);
            
            if (terminalResult.isSuccess && terminalResult.data && portsResult.isSuccess) {
                setPageData({
                    terminal: terminalResult.data.terminal,
                    ports: portsResult.data || []
                });
            } else {
                toast({
                    title: t('toast.loadErrorTitle'),
                    description: terminalResult.errors?.[0]?.message || t('toast.loadErrorDesc'),
                    variant: 'destructive'
                });
            }
            setLoading(false);
        };
        fetchData();
    }, [id, canEdit, toast, t]);

    const handleSave = async (formData: TerminalFormValues) => {
        if (!pageData) return;
        setLoading(true);

        const result = await api.post<Terminal>('/data/terminals/save', { id: pageData.terminal.id, ...formData });

        if (result.isSuccess) {
            toast({
                title: t('toast.updateSuccessTitle'),
                description: t('toast.updateSuccessDesc', { name: result.data!.name }),
                variant: 'success',
            });
            router.push('/configuration/terminals');
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
                        <BreadcrumbLink href="/configuration/ports" icon={Ship}>{t('portsPageTitle')}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/configuration/terminals" icon={Building}>{t('pageTitle')}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage icon={FilePenLine}>{t('editTitle')}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <GradientPageHeader
                title={t('editTitle')}
                description={t('editDescription', { name: pageData.terminal.name })}
                icon={FilePenLine}
            />
            <TerminalForm onSave={handleSave} terminalToEdit={pageData.terminal} ports={pageData.ports} isLoading={loading} />
        </div>
    );
}
