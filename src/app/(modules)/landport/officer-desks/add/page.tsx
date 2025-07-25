
'use client';

import { useState, useEffect } from 'react';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { OfficerDeskForm, type OfficerDeskFormValues } from '@/components/configuration/officer-desks/officer-desk-form';
import { PlusCircle, AlertTriangle, Monitor, LayoutDashboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import type { Port, Terminal, Zone, Workflow, RiskProfile, OfficerDesk } from '@/types/configuration';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export default function AddLandportOfficerDeskPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { hasPermission } = useAuth();
    const t = useTranslations('OfficerDesks.form');
    const tNav = useTranslations('Navigation');

    const [isLoading, setIsLoading] = useState(false);
    const [loadingError, setLoadingError] = useState<string | null>(null);
    const [pageData, setPageData] = useState<{
        ports: Port[],
        terminals: Terminal[],
        zones: Zone[],
        workflows: Workflow[],
        riskProfiles: RiskProfile[],
    } | null>(null);
    
    const canCreate = hasPermission(['landport:desks:create']);

    useEffect(() => {
        if (!canCreate) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [portsRes, terminalsRes, zonesRes, workflowsRes, riskProfilesRes] = await Promise.all([
                    api.get<Port[]>('/data/ports?moduleType=landport'),
                    api.get<Terminal[]>('/data/terminals'),
                    api.get<Zone[]>('/data/zones'),
                    api.get<Workflow[]>('/data/workflows'),
                    api.get<RiskProfile[]>('/data/risk-profiles'),
                ]);

                if (portsRes.isSuccess && terminalsRes.isSuccess && zonesRes.isSuccess && workflowsRes.isSuccess && riskProfilesRes.isSuccess) {
                    setPageData({
                        ports: portsRes.data!,
                        terminals: terminalsRes.data!,
                        zones: zonesRes.data!,
                        workflows: workflowsRes.data!,
                        riskProfiles: riskProfilesRes.data!,
                    });
                } else {
                    throw new Error('Failed to load required configuration data.');
                }
            } catch (error) {
                setLoadingError('Failed to load page data. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [canCreate]);

    const handleSave = async (formData: OfficerDeskFormValues) => {
        setIsLoading(true);
        const result = await api.post<OfficerDesk>('/data/desks/save', formData);
        
        if (result.isSuccess) {
            toast({
                title: t('toast.addSuccessTitle'),
                description: t('toast.addSuccessDesc', { deskName: result.data!.name }),
                variant: 'success',
            });
            router.push('/landport/officer-desks');
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
                    You do not have permission to create new officer desks for this module.
                </p>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/landport/dashboard" icon={LayoutDashboard}>{tNav('dashboard')}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/landport/officer-desks" icon={Monitor}>{tNav('officerDesks')}</BreadcrumbLink>
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
            {loadingError && <p className="text-destructive">{loadingError}</p>}
            {pageData && (
                <OfficerDeskForm 
                    onSave={handleSave}
                    isLoading={isLoading}
                    ports={pageData.ports}
                    terminals={pageData.terminals}
                    zones={pageData.zones}
                    workflows={pageData.workflows}
                    riskProfiles={pageData.riskProfiles}
                />
            )}
        </div>
    );
}
