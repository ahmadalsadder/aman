
'use client';

import { PassengersPage } from '@/components/passengers/passengers-page';
import { api } from '@/lib/api';
import type { Passenger } from '@/types/live-processing';
import { useState, useEffect } from 'react';

export default function EgatePassengersPage() {
    const [passengers, setPassengers] = useState<Passenger[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.get<Passenger[]>(`/data/passengers?module=egate`).then(result => {
            if(result.isSuccess && result.data) {
                setPassengers(result.data);
            }
            setLoading(false);
        });
    }, []);

    return <PassengersPage module="egate" passengers={passengers} loading={loading} />;
}
