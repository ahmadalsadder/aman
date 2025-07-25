
'use client';

import { PassengersPage } from '@/components/passengers/passengers-page';
import { api } from '@/lib/api';
import type { Passenger } from '@/types/live-processing';
import { useState, useEffect } from 'react';

// This page will now be a general fallback or for a potential admin-level view
export default function AdminPassengersPage() {
    const [passengers, setPassengers] = useState<Passenger[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.get<Passenger[]>(`/data/passengers`).then(result => {
            if(result.isSuccess && result.data) {
                setPassengers(result.data);
            }
            setLoading(false);
        });
    }, []);

  return <PassengersPage module="admin" passengers={passengers} loading={loading} />;
}
