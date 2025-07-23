'use client';

import { useMemo } from 'react';
import { TransactionStatsCard } from '@/components/transactions/transaction-stats-card';
import { Users, User, Clock, Check, BarChart3 } from 'lucide-react';

type OfficerPerformanceData = {
  totalTransactions: number;
  avgProcessingTime: number;
  decisions: { approved: number };
  name: string;
  approvalRate: number;
};

interface OfficerStatsCardsProps {
    data: OfficerPerformanceData[];
}

export function OfficerStatsCards({ data }: OfficerStatsCardsProps) {
    const stats = useMemo(() => {
        if (data.length === 0) {
            return { totalOfficers: 0, mostActiveOfficer: 'N/A', fastestOfficer: 'N/A', highestApproval: 'N/A' };
        }

        const mostActive = data.length > 0 ? data.reduce((prev, current) => (prev.totalTransactions > current.totalTransactions) ? prev : current) : null;
        
        const officersWithProcessingTime = data.filter(o => o.avgProcessingTime > 0);
        const fastest = officersWithProcessingTime.length > 0 
            ? officersWithProcessingTime.reduce((prev, current) => (prev.avgProcessingTime < current.avgProcessingTime) ? prev : current)
            : null;
        
        const officersWithApprovalRate = data.filter(o => o.approvalRate > 0);
        const highestApprovalOfficer = officersWithApprovalRate.length > 0
            ? officersWithApprovalRate.reduce((prev, current) => (prev.approvalRate > current.approvalRate) ? prev : current)
            : null;

        return {
            totalOfficers: data.length,
            mostActiveOfficer: mostActive?.name || 'N/A',
            fastestOfficer: fastest?.name || 'N/A',
            highestApproval: highestApprovalOfficer?.name || 'N/A',
        };
    }, [data]);
    
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <TransactionStatsCard title="Total Officers" value={stats.totalOfficers.toString()} description="Officers with transaction records" icon={Users} iconColor="text-blue-500" />
            <TransactionStatsCard title="Most Active Officer" value={stats.mostActiveOfficer} description="Highest transaction volume" icon={BarChart3} iconColor="text-purple-500" />
            <TransactionStatsCard title="Fastest Officer" value={stats.fastestOfficer} description="Lowest average processing time" icon={Clock} iconColor="text-green-500" />
            <TransactionStatsCard title="Highest Approval Rate" value={stats.highestApproval} description="Best approval-to-transaction ratio" icon={Check} iconColor="text-orange-500" />
        </div>
    );
}
