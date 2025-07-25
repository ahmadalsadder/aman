
'use client';

import { DutyManagerPageComponent } from "@/components/transactions/duty-manager-page";
import { api } from "@/lib/api";
import type { Transaction } from "@/types/live-processing";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AlertTriangle } from 'lucide-react';
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";


export default function AirportDutyManagerPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const { hasPermission } = useAuth();
    const t = useTranslations('DutyManager');

    const canView = hasPermission(['duty-manager:view']);

    useEffect(() => {
        if (!canView) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            const result = await api.get<Transaction[]>('/data/transactions/pending');
            if (result.isSuccess) {
                setTransactions(result.data || []);
            }
            setLoading(false);
        };
        fetchData();
    }, [canView]);

    if (!canView) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                <AlertTriangle className="h-16 w-16 text-destructive" />
                <h1 className="text-2xl font-bold">{t('accessDenied.title')}</h1>
                <p className="max-w-md text-muted-foreground">{t('accessDenied.description')}</p>
            </div>
        );
    }
    
    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-24" />
                <Skeleton className="h-32" />
                <Skeleton className="h-96" />
            </div>
        );
    }


    return <DutyManagerPageComponent module="airport" transactions={transactions} loading={loading} />;
}
