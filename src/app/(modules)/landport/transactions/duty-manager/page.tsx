
'use client';

import { DutyManagerPageComponent } from "@/components/transactions/duty-manager-page";
import { api } from "@/lib/api";
import type { Transaction } from "@/types/live-processing";
import { useState, useEffect } from "react";

export default function LandportDutyManagerPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const result = await api.get<Transaction[]>('/data/transactions/pending');
            if (result.isSuccess) {
                setTransactions(result.data || []);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    return <DutyManagerPageComponent module="landport" transactions={transactions} loading={loading} />;
}
