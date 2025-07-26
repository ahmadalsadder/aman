
'use client';

import { ZoneForm, type ZoneFormValues } from '@/components/configuration/zones/zone-form';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import type { Zone, Terminal, Permission } from '@/types';
import { useState, useEffect } from 'react';
import { FilePenLine, AlertTriangle, Building, LayoutDashboard, Map } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export default function EditZonePage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const { toast } = useToast();
    const { hasPermission } = useAuth();
    const t = useTranslations('Configuration.Zones.form');
    const tNav = useTranslations('Navigation');

    const [pageData, setPageData] = useState<{ zone: Zone; terminals: Terminal[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const id = params.id;

    const canEdit = hasPermission(['configuration:zones:edit' as Permission]);

    useEffect(() => {
        if (!id || !canEdit) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            const [zoneResult, terminalsResult] = await Promise.all([
                api.get<{ zone: Zone }>(`/data/zones/${id}`),
                api.get<Terminal[]>('/data/terminals')
            ]);
            
            if (zoneResult.isSuccess && zoneResult.data && terminalsResult.isSuccess) {
                setPageData({
                    zone: zoneResult.data.zone,
                    terminals: terminalsResult.data || []
                });
            } else {
                toast({
                    title: t('toast.loadErrorTitle'),
                    description: zoneResult.errors?.[0]?.message || t('toast.loadErrorDesc'),
                    variant: 'destructive'
                });
            }
            setLoading(false);
        };
        fetchData();
    }, [id, canEdit, toast, t]);

    const handleSave = async (formData: ZoneFormValues) => {
        if (!pageData) return;
        setLoading(true);

        const result = await api.post<Zone>('/data/zones/save', { id: pageData.zone.id, ...formData });

        if (result.isSuccess) {
            toast({
                title: t('toast.updateSuccessTitle'),
                description: t('toast.updateSuccessDesc', { name: result.data!.name }),
                variant: 'success',
            });
            router.push('/configuration/zone');
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
                        <BreadcrumbLink href="/configuration/terminals" icon={Building}>{tNav('terminals')}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                     <BreadcrumbItem>
                        <BreadcrumbLink href="/configuration/zone" icon={Map}>{t('pageTitle')}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage icon={FilePenLine}>{t('editTitle')}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <GradientPageHeader
                title={t('editTitle')}
                description={t('editDescription', { name: pageData.zone.name })}
                icon={FilePenLine}
            />
            <ZoneForm onSave={handleSave} zoneToEdit={pageData.zone} terminals={pageData.terminals} isLoading={loading} />
        </div>
    );
}
