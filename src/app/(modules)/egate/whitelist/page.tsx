
'use client';
import { WhitelistPage } from '@/components/passengers/whitelist/whitelist-page';
import { api } from '@/lib/api';
import type { WhitelistEntry } from '@/types/live-processing';
import { useState, useEffect } from 'react';

export default function EgateWhitelistPage() {
    const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWhitelist = async () => {
            setLoading(true);
            const result = await api.get<WhitelistEntry[]>('/data/whitelist');
            if (result.isSuccess && result.data) {
                setWhitelist(result.data);
            }
            setLoading(false);
        };
        fetchWhitelist();
    }, []);

    return <WhitelistPage module="egate" whitelist={whitelist} loading={loading} />;
}
