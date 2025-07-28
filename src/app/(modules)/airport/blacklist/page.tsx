
'use client';
import { BlacklistPage } from '@/components/passengers/blacklist/blacklist-page';
import { api } from '@/lib/api';
import type { BlacklistEntry } from '@/types/live-processing';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { Permission } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AirportBlacklistPage() {
    const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const { hasPermission } = useAuth();
    const t = useTranslations('BlacklistPage');
    
    const canView = useMemo(() => hasPermission(['airport:blacklist:view' as Permission]), [hasPermission]);

    const fetchBlacklist = useCallback(async () => {
        if (!canView) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const result = await api.get<BlacklistEntry[]>('/data/blacklist');
        if (result.isSuccess && result.data) {
            setBlacklist(result.data);
        }
        setLoading(false);
    }, [canView]);

    useEffect(() => {
        fetchBlacklist();
    }, [fetchBlacklist]);

    const handleDeleteEntry = async (entryId: string): Promise<boolean> => {
        const result = await api.post('/data/blacklist/delete', { id: entryId });
        if (result.isSuccess) {
            toast({
                title: t('toast.deleteSuccessTitle'),
                description: t('toast.deleteSuccessDesc'),
                variant: 'info',
            });
            await fetchBlacklist(); // Refetch the list to update the UI
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
    
    if (loading) {
        return <div className="space-y-6">
            <Skeleton className="h-24" />
            <Skeleton className="h-48" />
            <Skeleton className="h-96" />
        </div>;
    }

    if (!canView) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                <AlertTriangle className="h-16 w-16 text-destructive" />
                <h1 className="text-2xl font-bold">{t('accessDenied.title')}</h1>
                <p className="max-w-md text-muted-foreground">
                    {t('accessDenied.description')}
                </p>
            </div>
        );
    }

    return <BlacklistPage module="airport" blacklist={blacklist} loading={loading} onDeleteEntry={handleDeleteEntry} />;
}
