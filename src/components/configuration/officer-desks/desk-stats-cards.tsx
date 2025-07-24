
'use client';

import { useMemo } from 'react';
import { TransactionStatsCard } from '@/components/transactions/transaction-stats-card';
import { ClipboardList, Check, PauseCircle, DoorClosed } from 'lucide-react';
import type { OfficerDesk } from '@/types/configuration';
import { useTranslations } from 'next-intl';

interface DeskStatsCardsProps {
    desks: OfficerDesk[];
}

export function DeskStatsCards({ desks }: DeskStatsCardsProps) {
    const t = useTranslations('OfficerDesks');
    
    const deskStats = useMemo(() => ({
        total: desks.length,
        active: desks.filter(d => d.status === 'Active').length,
        inactive: desks.filter(d => d.status === 'Inactive').length,
        closed: desks.filter(d => d.status === 'Closed').length,
    }), [desks]);
    
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <TransactionStatsCard title={t('totalDesks')} value={deskStats.total.toLocaleString()} description={t('totalDesksDesc')} icon={ClipboardList} iconColor="text-blue-500" />
            <TransactionStatsCard title={t('activeDesks')} value={deskStats.active.toLocaleString()} description={t('activeDesksDesc')} icon={Check} iconColor="text-green-500" />
            <TransactionStatsCard title={t('inactiveDesks')} value={deskStats.inactive.toLocaleString()} description={t('inactiveDesksDesc')} icon={PauseCircle} iconColor="text-yellow-500" />
            <TransactionStatsCard title={t('closedDesks')} value={deskStats.closed.toLocaleString()} description={t('closedDesksDesc')} icon={DoorClosed} iconColor="text-red-500" />
        </div>
    );
}
