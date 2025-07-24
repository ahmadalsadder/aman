
'use client';

import { GateForm, type GateFormValues } from '@/components/gates/gate-form';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import type { Gate, Port, Terminal, Zone, Workflow, RiskProfile } from '@/types/live-processing';
import { useState, useEffect } from 'react';
import { Loader2, FilePenLine, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditGatePage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const { toast } = useToast();
    const { hasPermission } = useAuth();
    const t = useTranslations('GatesPage.form');
    
    const [pageData, setPageData] = useState<{
        gate: Gate,
        ports: Port[],
        terminals: Terminal[],
        zones: Zone[],
        workflows: Workflow[],
        riskProfiles: RiskProfile[],
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingError, setLoadingError] = useState<string | null>(null);
    const id = params.id;

    const canEdit = hasPermission(['egate:records:edit']);

    useEffect(() => {
        if (!canEdit) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const [gateRes, portsRes, terminalsRes, zonesRes, workflowsRes, riskProfilesRes] = await Promise.all([
                    api.get<{ gate: Gate }>(`/data/gates/${id}`),
                    api.get<Port[]>('/data/ports?moduleType=egate'),
                    api.get<Terminal[]>('/data/terminals'),
                    api.get<Zone[]>('/data/zones'),
                    api.get<Workflow[]>('/data/workflows'),
                    api.get<RiskProfile[]>('/data/risk-profiles'),
                ]);

                if (gateRes.isSuccess && gateRes.data && portsRes.isSuccess && terminalsRes.isSuccess && zonesRes.isSuccess && workflowsRes.isSuccess && riskProfilesRes.isSuccess) {
                    setPageData({
                        gate: gateRes.data.gate,
                        ports: portsRes.data!,
                        terminals: terminalsRes.data!,
                        zones: zonesRes.data!,
                        workflows: workflowsRes.data!,
                        riskProfiles: riskProfilesRes.data!,
                    });
                } else {
                    throw new Error(t('toast.loadError'));
                }
            } catch (error) {
                setLoadingError(t('toast.loadError'));
                toast({
                    title: t('toast.errorTitle'),
                    description: t('toast.loadError'),
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, canEdit, t]);

    const handleSave = async (formData: GateFormValues) => {
        setLoading(true);
        const result = await api.post<Gate>('/data/gates/save', { id, ...formData });

        if (result.isSuccess) {
            toast({
                title: t('toast.updateSuccessTitle'),
                description: t('toast.updateSuccessDesc', { gateName: result.data!.name }),
                variant: 'success',
            });
            router.push('/egate/gates');
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
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="max-w-md text-muted-foreground">
                    You do not have permission to edit E-Gate records.
                </p>
            </div>
        );
    }
    
    if (loadingError || !pageData) {
        return (
             <div className="flex h-full w-full items-center justify-center">
                 <div className="flex flex-col items-center gap-4 text-destructive">
                    <p>{loadingError || t('toast.loadError')}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <GradientPageHeader
                title={t('editTitle')}
                description={t('editDescription', { gateName: pageData.gate.name })}
                icon={FilePenLine}
            />
            <GateForm 
                onSave={handleSave} 
                gateToEdit={pageData.gate} 
                isLoading={loading}
                ports={pageData.ports}
                terminals={pageData.terminals}
                zones={pageData.zones}
                workflows={pageData.workflows}
                riskProfiles={pageData.riskProfiles}
            />
        </div>
    );
}
