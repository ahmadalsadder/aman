
'use client';

import { useState, useEffect } from 'react';
import { CivilRecordsPage } from '@/components/civil-records/civil-records-page';
import { api } from '@/lib/api';
import type { CivilRecord } from '@/types/live-processing';

export default function LandportCivilRecordsPage() {
    const [records, setRecords] = useState<CivilRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const result = await api.get<CivilRecord[]>('/data/civil-records');
            if (result.isSuccess) {
                setRecords(result.data || []);
            }
            setLoading(false);
        };
        fetchData();
    }, []);
    
    return <CivilRecordsPage module="landport" records={records} isLoading={loading} />;
}
