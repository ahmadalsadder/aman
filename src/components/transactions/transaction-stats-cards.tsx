
'use client';

import { useMemo } from 'react';
import { TransactionStatsCard } from '@/components/transactions/transaction-stats-card';
import { Users, User, Clock, Check, BarChart3, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import type { Transaction } from '@/types/live-processing';
import { parse, isToday } from 'date-fns';

interface TransactionStatsCardsProps {
    transactions: Transaction[];
}

export function TransactionStatsCards({ transactions }: TransactionStatsCardsProps) {
    const transactionStats = useMemo(() => {
        const total = transactions.length;
        
        const today = transactions.filter(t => {
          try {
            const transactionDate = parse(t.dateTime, 'yyyy-MM-dd HH:mm', new Date());
            return isToday(transactionDate);
          } catch (e) {
            return false;
          }
        }).length;
    
        const pending = transactions.filter(t => t.status === 'Pending').length;
    
        const avgTime = "2:05"; // This would be a more complex calculation in a real app
    
        return { total, today, pending, avgTime };
      }, [transactions]);
    
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <TransactionStatsCard
                title="Total Transactions"
                value={transactionStats.total.toLocaleString()}
                description="All time transactions"
                icon={FileText}
                iconColor="text-blue-500"
            />
            <TransactionStatsCard
                title="Today's Transactions"
                value={transactionStats.today.toLocaleString()}
                description="Processed today"
                icon={CheckCircle}
                iconColor="text-green-500"
            />
            <TransactionStatsCard
                title="Avg Processing Time"
                value={transactionStats.avgTime}
                description="Minutes:Seconds"
                icon={Clock}
                iconColor="text-orange-500"
            />
            <TransactionStatsCard
                title="Pending Review"
                value={transactionStats.pending.toLocaleString()}
                description="Require attention"
                icon={AlertTriangle}
                iconColor="text-yellow-500"
            />
        </div>
    );
}
