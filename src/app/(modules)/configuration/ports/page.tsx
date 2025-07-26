
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Permission } from '@/types';
import type { Port } from '@/types/configuration';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { PortPageClient } from '@/components/configuration/ports/port-page-client';
import { useTranslations } from 'next-intl';

export default function PortsPage() {
  const [ports, setPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const t = useTranslations('Configuration.Ports');

  const canView = hasPermission(['configuration:ports:view' as Permission]);
  const canEdit = hasPermission(['configuration:ports:edit' as Permission]);
  const canDelete = hasPermission(['configuration:ports:delete' as Permission]);
  const canCreate = hasPermission(['configuration:ports:create' as Permission]);

  useEffect(() => {
    if (!canView) {
      setLoading(false);
      return;
    }
    const fetchPorts = async () => {
      setLoading(true);
      const result = await api.get<Port[]>('/data/ports/all');
      if (result.isSuccess) {
        setPorts(result.data || []);
      }
      setLoading(false);
    };
    fetchPorts();
  }, [canView]);

  const handleDeletePort = async (portId: string): Promise<boolean> => {
    const result = await api.post('/data/ports/delete', { id: portId });
    if (result.isSuccess) {
      toast({
        title: t('toast.deleteSuccessTitle'),
        description: t('toast.deleteSuccessDesc'),
        variant: 'info',
      });
      setPorts(prev => prev.filter(p => p.id !== portId));
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

  const handleToggleStatus = async (portId: string) => {
    const result = await api.post<Port>('/data/ports/toggle-status', { id: portId });
    if (result.isSuccess && result.data) {
      setPorts(prev => prev.map(p => (p.id === portId ? result.data! : p)));
      toast({
        title: t('toast.statusUpdateTitle'),
        description: t('toast.statusUpdateDesc', { name: result.data.name, status: result.data.status }),
        variant: 'success',
      });
    } else {
      toast({
        title: t('toast.statusUpdateErrorTitle'),
        description: result.errors?.[0]?.message,
        variant: 'destructive',
      });
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
    <PortPageClient
      ports={ports}
      onDeletePort={handleDeletePort}
      onToggleStatus={handleToggleStatus}
      permissions={{ canCreate, canEdit, canDelete }}
    />
  );
}
