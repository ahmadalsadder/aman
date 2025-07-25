
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

export default function LandportBlacklistPage() {
    const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const { hasPermission } = useAuth();
    
    const canView = useMemo(() => hasPermission(['landport:blacklist:view' as Permission]), [hasPermission]);

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
                title: 'Entry Deleted',
                description: `Blacklist entry has been permanently deleted.`,
                variant: 'info',
            });
            await fetchBlacklist();
            return true;
        } else {
            toast({
                title: 'Delete Failed',
                description: result.errors?.[0]?.message || 'There was an error deleting the blacklist entry.',
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
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="max-w-md text-muted-foreground">
                    You do not have permission to view the blacklist for this module.
                </p>
            </div>
        );
    }

    return <BlacklistPage module="landport" blacklist={blacklist} loading={loading} onDeleteEntry={handleDeleteEntry} />;
}
