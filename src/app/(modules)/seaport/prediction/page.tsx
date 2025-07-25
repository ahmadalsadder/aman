
'use client';
import { PredictionPage } from '@/components/prediction/prediction-page';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function SeaportPredictionPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const result = await api.get(`/dashboard/prediction?module=seaport`);
            if (result.isSuccess) {
                setData(result.data);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    return <PredictionPage module="seaport" data={data} loading={loading} />;
}
