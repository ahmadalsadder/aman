
'use client';

import { useState, useEffect } from 'react';
import type { Permission } from '@/types';
import type { Terminal, Port } from '@/types/configuration';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { TerminalPageClient } from '@/components/configuration/terminals/terminal-page-client';
import { useTranslations } from 'next-intl';

export default function TerminalsPage() {
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const t = useTranslations('Configuration.Terminals');

  const canView = hasPermission(['configuration:terminals:view' as Permission]);
  const canEdit = hasPermission(['configuration:terminals:edit' as Permission]);
  const canDelete = hasPermission(['configuration:terminals:delete' as Permission]);
  const canCreate = hasPermission(['configuration:terminals:create' as Permission]);

  useEffect(() => {
    if (!canView) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      const [terminalsResult, portsResult] = await Promise.all([
        api.get<Terminal[]>('/data/terminals'),
        api.get<Port[]>('/data/ports/all')
      ]);
      if (terminalsResult.isSuccess) {
        setTerminals(terminalsResult.data || []);
      }
      if (portsResult.isSuccess) {
        setPorts(portsResult.data || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [canView]);

  const handleDeleteTerminal = async (terminalId: string): Promise<boolean> => {
    const result = await api.post('/data/terminals/delete', { id: terminalId });
    if (result.isSuccess) {
      toast({
        title: t('toast.deleteSuccessTitle'),
        description: t('toast.deleteSuccessDesc'),
        variant: 'info',
      });
      setTerminals(prev => prev.filter(p => p.id !== terminalId));
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

  const handleToggleStatus = async (terminalId: string) => {
    const result = await api.post<Terminal>('/data/terminals/toggle-status', { id: terminalId });
    if (result.isSuccess && result.data) {
      setTerminals(prev => prev.map(p => (p.id === terminalId ? result.data! : p)));
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
    <TerminalPageClient
      terminals={terminals}
      ports={ports}
      onDeleteTerminal={handleDeleteTerminal}
      onToggleStatus={handleToggleStatus}
      permissions={{ canCreate, canEdit, canDelete }}
    />
  );
}
