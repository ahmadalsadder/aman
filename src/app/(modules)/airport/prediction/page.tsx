
'use client';
import { PredictionPage } from '@/components/prediction/prediction-page';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function AirportPredictionPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const result = await api.get(`/dashboard/prediction?module=airport`);
            if (result.isSuccess) {
                setData(result.data);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    return <PredictionPage module="airport" data={data} loading={loading} />;
}
