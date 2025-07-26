
'use client';

import { useState, useEffect } from 'react';
import type { Permission } from '@/types';
import type { Zone, Terminal, Port } from '@/types/configuration';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { ZonePageClient } from '@/components/configuration/zones/zone-page-client';
import { useTranslations } from 'next-intl';

export default function ZonesPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const t = useTranslations('Configuration.Zones');

  const canView = hasPermission(['configuration:zones:view' as Permission]);
  const canEdit = hasPermission(['configuration:zones:edit' as Permission]);
  const canDelete = hasPermission(['configuration:zones:delete' as Permission]);
  const canCreate = hasPermission(['configuration:zones:create' as Permission]);

  useEffect(() => {
    if (!canView) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      const [zonesResult, terminalsResult, portsResult] = await Promise.all([
        api.get<Zone[]>('/data/zones'),
        api.get<Terminal[]>('/data/terminals'),
        api.get<Port[]>('/data/ports/all')
      ]);
      if (zonesResult.isSuccess) setZones(zonesResult.data || []);
      if (terminalsResult.isSuccess) setTerminals(terminalsResult.data || []);
      if (portsResult.isSuccess) setPorts(portsResult.data || []);
      setLoading(false);
    };
    fetchData();
  }, [canView]);

  const handleDeleteZone = async (zoneId: string): Promise<boolean> => {
    const result = await api.post('/data/zones/delete', { id: zoneId });
    if (result.isSuccess) {
      toast({
        title: t('toast.deleteSuccessTitle'),
        description: t('toast.deleteSuccessDesc'),
        variant: 'info',
      });
      setZones(prev => prev.filter(p => p.id !== zoneId));
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

  const handleToggleStatus = async (zoneId: string) => {
    const result = await api.post<Zone>('/data/zones/toggle-status', { id: zoneId });
    if (result.isSuccess && result.data) {
      setZones(prev => prev.map(p => (p.id === zoneId ? result.data! : p)));
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
    <ZonePageClient
      zones={zones}
      terminals={terminals}
      ports={ports}
      onDeleteZone={handleDeleteZone}
      onToggleStatus={handleToggleStatus}
      permissions={{ canCreate, canEdit, canDelete }}
    />
  );
}
