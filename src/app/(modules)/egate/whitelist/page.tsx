
'use client';
import { WhitelistPage } from '@/components/passengers/whitelist/whitelist-page';
import { api } from '@/lib/api';
import type { WhitelistEntry } from '@/types/live-processing';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function EgateWhitelistPage() {
    const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchWhitelist = useCallback(async () => {
        setLoading(true);
        const result = await api.get<WhitelistEntry[]>('/data/whitelist');
        if (result.isSuccess && result.data) {
            setWhitelist(result.data);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchWhitelist();
    }, [fetchWhitelist]);

    const handleDeleteEntry = async (entryId: string): Promise<boolean> => {
        const result = await api.post('/data/whitelist/delete', { id: entryId });
        if (result.isSuccess) {
            toast({
                title: 'Entry Deleted',
                description: `Whitelist entry has been permanently deleted.`,
                variant: 'info',
            });
            await fetchWhitelist();
            return true;
        } else {
            toast({
                title: 'Delete Failed',
                description: result.errors?.[0]?.message || 'There was an error deleting the whitelist entry.',
                variant: 'destructive',
            });
            return false;
        }
    };

    return <WhitelistPage module="egate" whitelist={whitelist} loading={loading} onDeleteEntry={handleDeleteEntry} />;
}
