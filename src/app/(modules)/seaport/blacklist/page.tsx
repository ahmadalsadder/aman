
'use client';
import { BlacklistPage } from '@/components/passengers/blacklist/blacklist-page';
import { api } from '@/lib/api';
import type { BlacklistEntry } from '@/types/live-processing';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function SeaportBlacklistPage() {
    const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchBlacklist = useCallback(async () => {
        setLoading(true);
        const result = await api.get<BlacklistEntry[]>('/data/blacklist');
        if (result.isSuccess && result.data) {
            setBlacklist(result.data);
        }
        setLoading(false);
    }, []);

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
            await fetchBlacklist(); // Refetch the list to update the UI
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

    return <BlacklistPage module="seaport" blacklist={blacklist} loading={loading} onDeleteEntry={handleDeleteEntry} />;
}
