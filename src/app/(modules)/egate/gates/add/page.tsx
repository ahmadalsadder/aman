
'use client';

import { useState, useEffect } from 'react';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { GateForm, type GateFormValues } from '@/components/gates/gate-form';
import { PlusCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import type { Port, Terminal, Zone, Workflow, RiskProfile, Gate } from '@/types/live-processing';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';

export default function AddGatePage() {
    const router = useRouter();
    const { toast } = useToast();
    const { hasPermission } = useAuth();
    const t = useTranslations('GatesPage.form');

    const [isLoading, setIsLoading] = useState(false);
    const [loadingError, setLoadingError] = useState<string | null>(null);
    const [pageData, setPageData] = useState<{
        ports: Port[],
        terminals: Terminal[],
        zones: Zone[],
        workflows: Workflow[],
        riskProfiles: RiskProfile[],
    } | null>(null);
    
    const canCreate = hasPermission(['egate:records:create']);

    useEffect(() => {
        if (!canCreate) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [portsRes, terminalsRes, zonesRes, workflowsRes, riskProfilesRes] = await Promise.all([
                    api.get<Port[]>('/data/ports?moduleType=egate'),
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

    const handleSave = async (formData: GateFormValues) => {
        setIsLoading(true);
        const result = await api.post<Gate>('/data/gates/save', formData);
        
        if (result.isSuccess) {
            toast({
                title: t('toast.addSuccessTitle'),
                description: t('toast.addSuccessDesc', { gateName: result.data!.name }),
                variant: 'success',
            });
            router.push('/egate/gates');
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
                    You do not have permission to create new E-Gate records.
                </p>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <GradientPageHeader
                title={t('addTitle')}
                description={t('addDescription')}
                icon={PlusCircle}
            />
            {isLoading && !pageData && <Skeleton className="h-96 w-full" />}
            {loadingError && <p className="text-destructive">{loadingError}</p>}
            {pageData && (
                <GateForm 
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
