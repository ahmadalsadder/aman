'use client';

import { AssignOfficerPageComponent } from '@/components/workloads/assign-officer/assign-officer-page';
import { api } from '@/lib/api';
import type { OfficerAssignment, Port, Terminal, Zone, Shift, User } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';

export default function LandportAssignOfficerPage() {
    const { hasPermission } = useAuth();
    const { toast } = useToast();
    const t = useTranslations('AssignOfficer');
    const module = 'landport';

    const [assignments, setAssignments] = useState<OfficerAssignment[]>([]);
    const [pageData, setPageData] = useState<{
        officers: User[];
        shifts: Shift[];
        ports: Port[];
        terminals: Terminal[];
        zones: Zone[];
    } | null>(null);
    const [loading, setLoading] = useState(true);

    const canView = useMemo(() => hasPermission([`${module}:workload:view`]), [hasPermission, module]);

    useEffect(() => {
        if (!canView) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            const [assignmentsRes, officersRes, shiftsRes, portsRes, terminalsRes, zonesRes] = await Promise.all([
                api.get<OfficerAssignment[]>(`/data/officer-assignments?module=${module}`),
                api.get<User[]>('/data/users?role=officer'),
                api.get<Shift[]>(`/data/shifts?module=${module}`),
                api.get<Port[]>(`/data/ports?moduleType=${module}`),
                api.get<Terminal[]>('/data/terminals'),
                api.get<Zone[]>('/data/zones'),
            ]);

            if (assignmentsRes.isSuccess) setAssignments(assignmentsRes.data || []);
            
            if (officersRes.isSuccess && shiftsRes.isSuccess && portsRes.isSuccess && terminalsRes.isSuccess && zonesRes.isSuccess) {
                setPageData({
                    officers: officersRes.data!,
                    shifts: shiftsRes.data!,
                    ports: portsRes.data!,
                    terminals: terminalsRes.data!,
                    zones: zonesRes.data!,
                });
            } else {
                toast({ title: t('toast.loadErrorTitle'), description: t('toast.loadErrorDesc'), variant: 'destructive' });
            }
            setLoading(false);
        };
        fetchData();
    }, [canView, module, t, toast]);

    const handleDeleteAssignment = async (assignmentId: string): Promise<boolean> => {
        const result = await api.post('/data/officer-assignments/delete', { id: assignmentId });
        if (result.isSuccess) {
            toast({ title: t('toast.deleteSuccessTitle'), description: t('toast.deleteSuccessDesc') });
            setAssignments(prev => prev.filter(a => a.id !== assignmentId));
            return true;
        } else {
            toast({ title: t('toast.deleteErrorTitle'), description: result.errors?.[0]?.message, variant: 'destructive' });
            return false;
        }
    };
    
    return (
        <AssignOfficerPageComponent
            module={module}
            assignments={assignments}
            pageData={pageData}
            loading={loading}
            onDeleteAssignment={handleDeleteAssignment}
        />
    );
}
