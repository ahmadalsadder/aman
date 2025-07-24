
'use client';

import { TransactionStatsCard } from '@/components/transactions/transaction-stats-card';
import { Users, Car, Ship, Clock, UserPlus, ArrowUp, ArrowDown } from 'lucide-react';
import type { Module } from '@/types';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface PredictionStatsCardsProps {
    stats: {
        passengers: { total: number; change: number };
        vehicles: { total: number; change: number };
        vessels: { total: number; change: number };
        processingTime: { avg: string; change: number };
        staff: { recommended: number; change: number };
    };
    module: Module;
}

const ChangeIndicator = ({ value }: { value: number }) => {
    const isPositive = value >= 0;
    return (
        <span className={cn("flex items-center text-xs font-semibold", isPositive ? "text-green-600" : "text-red-600")}>
            {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {Math.abs(value)}%
        </span>
    );
};

export function PredictionStatsCards({ stats, module }: PredictionStatsCardsProps) {
    const t = useTranslations('Prediction.stats');

    const commonStats = [
        <TransactionStatsCard key="passengers" title={t('passenger')} value={stats.passengers.total.toLocaleString()} description="vs. last period" icon={Users} iconColor="text-blue-500" badge={<ChangeIndicator value={stats.passengers.change} />} />,
        <TransactionStatsCard key="time" title={t('processingTime')} value={stats.processingTime.avg} description="vs. last period" icon={Clock} iconColor="text-orange-500" badge={<ChangeIndicator value={stats.processingTime.change} />} />,
        <TransactionStatsCard key="staff" title={t('staff')} value={stats.staff.recommended.toLocaleString()} description="vs. last period" icon={UserPlus} iconColor="text-purple-500" badge={<ChangeIndicator value={stats.staff.change} />} />,
    ];

    switch (module) {
        case 'landport':
            return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <TransactionStatsCard title={t('vehicle')} value={stats.vehicles.total.toLocaleString()} description="vs. last period" icon={Car} iconColor="text-green-500" badge={<ChangeIndicator value={stats.vehicles.change} />} />
                {commonStats}
            </div>
        case 'seaport':
             return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <TransactionStatsCard title={t('vessel')} value={stats.vessels.total.toLocaleString()} description="vs. last period" icon={Ship} iconColor="text-cyan-500" badge={<ChangeIndicator value={stats.vessels.change} />} />
                {commonStats}
            </div>
        default: // airport, egate
            return <div className="grid gap-4 md:grid-cols-3">
                {commonStats}
            </div>
    }
}
