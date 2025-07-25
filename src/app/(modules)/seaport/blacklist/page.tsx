
'use client';
import { BlacklistPage } from '@/components/passengers/blacklist/blacklist-page';
import { api } from '@/lib/api';
import type { BlacklistEntry } from '@/types/live-processing';
import { useState, useEffect } from 'react';

export default function SeaportBlacklistPage() {
    const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlacklist = async () => {
            setLoading(true);
            const result = await api.get<BlacklistEntry[]>('/data/blacklist');
            if (result.isSuccess && result.data) {
                setBlacklist(result.data);
            }
            setLoading(false);
        }
        fetchBlacklist();
    }, []);

    return <BlacklistPage module="seaport" blacklist={blacklist} loading={loading} />;
}
