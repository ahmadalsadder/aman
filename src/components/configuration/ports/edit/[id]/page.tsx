
'use client';

import { PortForm, type PortFormValues } from '@/components/configuration/ports/port-form';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import type { Port, Permission } from '@/types';
import { useState, useEffect } from 'react';
import { Loader2, FilePenLine, AlertTriangle, Ship } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export default function EditPortPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const { toast } = useToast();
    const { hasPermission } = useAuth();
    const t = useTranslations('Configuration.Ports.form');
    const tPorts = useTranslations('Configuration.Ports');

    const [port, setPort] = useState<Port | null>(null);
    const [loading, setLoading] = useState(true);
    const id = params.id;

    const canEdit = hasPermission(['configuration:ports:edit' as Permission]);

    useEffect(() => {
        if (!id || !canEdit) {
            setLoading(false);
            return;
        }

        const fetchPort = async () => {
            setLoading(true);
            const result = await api.get<Port>(`/data/ports/${id}`);
            if (result.isSuccess && result.data) {
                setPort(result.data);
            } else {
                toast({
                    title: t('toast.loadErrorTitle'),
                    description: result.errors?.[0]?.message || t('toast.loadErrorDesc'),
                    variant: 'destructive'
                });
                setPort(null);
            }
            setLoading(false);
        };
        fetchPort();
    }, [id, canEdit, toast, t]);

    const handleSave = async (formData: PortFormValues) => {
        if (!port) return;
        setLoading(true);

        const result = await api.post<Port>('/data/ports/save', { id: port.id, ...formData });

        if (result.isSuccess) {
            toast({
                title: t('toast.updateSuccessTitle'),
                description: t('toast.updateSuccessDesc', { name: result.data!.name }),
                variant: 'success',
            });
            router.push('/configuration/ports');
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
        return (
            <div className="flex h-full w-full items-center justify-center">
                 <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>{t('toast.loading')}</p>
                </div>
            </div>
        );
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
    
    if (!port) {
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
                        <BreadcrumbLink href="/configuration/ports" icon={Ship}>{tPorts('pageTitle')}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage icon={FilePenLine}>{t('editTitle')}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <GradientPageHeader
                title={t('editTitle')}
                description={t('editDescription', { name: port.name })}
                icon={FilePenLine}
            />
            <PortForm onSave={handleSave} portToEdit={port} isLoading={loading} />
        </div>
    );
}
