
'use client';

import { useState, useEffect } from 'react';
import type { Permission } from '@/types';
import type { Machine, Port, Terminal, Zone } from '@/types/configuration';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { MachinePageClient } from '@/components/configuration/machines/machine-page-client';
import { useTranslations } from 'next-intl';

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const t = useTranslations('Configuration.Machines');

  const canView = hasPermission(['configuration:machines:view' as Permission]);
  const canEdit = hasPermission(['configuration:machines:edit' as Permission]);
  const canDelete = hasPermission(['configuration:machines:delete' as Permission]);
  const canCreate = hasPermission(['configuration:machines:create' as Permission]);

  useEffect(() => {
    if (!canView) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      const [machinesResult, portsResult, terminalsResult, zonesResult] = await Promise.all([
        api.get<Machine[]>('/data/machines'),
        api.get<Port[]>('/data/ports/all'),
        api.get<Terminal[]>('/data/terminals'),
        api.get<Zone[]>('/data/zones'),
      ]);
      if (machinesResult.isSuccess) setMachines(machinesResult.data || []);
      if (portsResult.isSuccess) setPorts(portsResult.data || []);
      if (terminalsResult.isSuccess) setTerminals(terminalsResult.data || []);
      if (zonesResult.isSuccess) setZones(zonesResult.data || []);
      setLoading(false);
    };
    fetchData();
  }, [canView]);

  const handleDeleteMachine = async (machineId: string): Promise<boolean> => {
    const result = await api.post('/data/machines/delete', { id: machineId });
    if (result.isSuccess) {
      toast({
        title: t('toast.deleteSuccessTitle'),
        description: t('toast.deleteSuccessDesc'),
        variant: 'default',
      });
      setMachines(prev => prev.filter(p => p.id !== machineId));
      return true;
    } else {
      toast({
        title: t('toast.deleteErrorTitle'),
        description: result.errors?.[0]?.message || t('toast.deleteErrorDesc'),
        variant: 'destructive',
      });
      return false;
    }
  };
  
  const handleToggleStatus = async (machineId: string, currentStatus: string): Promise<boolean> => {
    const newStatus = currentStatus === 'Online' ? 'Offline' : 'Online';
    const result = await api.post<Machine>('/data/machines/toggle-status', { id: machineId, status: newStatus });
    if (result.isSuccess) {
        toast({
            title: t('toast.statusUpdateTitle'),
            description: t('toast.statusUpdateDesc', { name: result.data!.name, status: result.data!.status }),
        });
        setMachines(prev => prev.map(m => m.id === machineId ? result.data! : m));
        return true;
    } else {
        toast({
            title: t('toast.statusUpdateErrorTitle'),
            description: result.errors?.[0]?.message || 'An error occurred.',
            variant: 'destructive',
        });
        return false;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24" />
        <Skeleton className="h-32" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
        <AlertTriangle className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold">{t('accessDenied.title')}</h1>
        <p className="max-w-md text-muted-foreground">{t('accessDenied.description')}</p>
      </div>
    );
  }

  return (
    <MachinePageClient
      machines={machines}
      ports={ports}
      terminals={terminals}
      zones={zones}
      onDeleteMachine={handleDeleteMachine}
      onToggleStatus={handleToggleStatus}
      permissions={{ canCreate, canEdit, canDelete }}
    />
  );
}
