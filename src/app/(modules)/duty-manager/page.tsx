'use client';

import { useState, useMemo, useEffect } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { Transaction } from '@/types/live-processing';
import { DataTable } from '@/components/shared/data-table';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Eye, User, Printer, AlertTriangle, LayoutDashboard, Badge } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { TransactionStatsCard } from '@/components/transactions/transaction-stats-card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';

const typeColors: { [key: string]: 'text-blue-500' | 'text-purple-500' | 'text-orange-500' } = {
    Entry: 'text-blue-500',
    Exit: 'text-purple-500',
    Transit: 'text-orange-500',
};

const riskColors: { [key: string]: string } = {
  High: 'bg-red-500/20 text-red-700 border-red-500/30',
  Medium: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
};

export default function DutyManagerPage() {
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
  const { hasPermission } = useAuth();
  const t = useTranslations('DutyManager');
  const [loading, setLoading] = useState(true);

  const canView = hasPermission(['duty-manager:view']);

  useEffect(() => {
    if (!canView) {
        setLoading(false);
        return;
    }
    const fetchData = async () => {
        const result = await api.get<Transaction[]>('/data/transactions/pending');
        if (result.isSuccess) {
            setPendingTransactions(result.data || []);
        }
        setLoading(false);
    };
    fetchData();
  }, [canView]);

  const stats = useMemo(() => {
    const highRisk = pendingTransactions.filter(t => t.riskScore >= 75).length;
    const mediumRisk = pendingTransactions.filter(t => t.riskScore > 40 && t.riskScore < 75).length;
    return {
        total: pendingTransactions.length,
        highRisk,
        mediumRisk
    };
  }, [pendingTransactions]);
  
  const getRiskLevel = (score: number): keyof typeof riskColors => {
    if (score >= 75) return 'High';
    return 'Medium';
  };

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: 'id',
      header: t('columns.id'),
      cell: ({row}) => <div className="font-mono text-xs">{row.original.id}</div>
    },
    {
      accessorKey: 'passengerName',
      header: t('columns.passenger'),
       cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.passengerName}</span>
          <span className="text-xs text-muted-foreground">{row.original.passportNumber}</span>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: t('columns.type'),
      cell: ({row}) => <div className={cn("font-medium", typeColors[row.original.type])}>{row.original.type}</div>
    },
    {
      accessorKey: 'dateTime',
      header: t('columns.dateTime'),
    },
    {
      accessorKey: 'riskScore',
      header: t('columns.riskScore'),
      cell: ({row}) => {
        const riskLevel = getRiskLevel(row.original.riskScore);
        return (
            <div className="flex flex-col gap-1 items-start">
                 <div className="flex items-center gap-2">
                    <Progress value={row.original.riskScore} className="h-2 w-20" />
                    <span>{row.original.riskScore}</span>
                </div>
                <Badge variant="outline" className={cn(riskColors[riskLevel])}>{riskLevel}</Badge>
            </div>
        )
      }
    },
    {
      accessorKey: 'officerName',
      header: t('columns.escalatedBy'),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const transaction = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon" className="text-primary hover:text-primary/80">
              <Link href={`/airport/transactions/${transaction.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon" className="text-primary hover:text-primary/80">
                <Link href={`/airport/passengers/${transaction.passengerId}/edit`}>
                    <User className="h-4 w-4" />
                </Link>
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-muted-foreground/80" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (!canView) {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
            <AlertTriangle className="h-16 w-16 text-destructive" />
            <h1 className="text-2xl font-bold">{t('accessDenied.title')}</h1>
            <p className="max-w-md text-muted-foreground">{t('accessDenied.description')}</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/airport/dashboard" icon={LayoutDashboard}>{t('dashboard', {ns: 'Navigation'})}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                    <BreadcrumbPage icon={ShieldAlert}>{t('title')}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
      <GradientPageHeader
        title={t('title')}
        description={t('description')}
        icon={ShieldAlert}
      />
      
      <div className="grid gap-4 md:grid-cols-3">
        <TransactionStatsCard title={t('stats.totalPending')} value={stats.total.toLocaleString()} description={t('stats.totalPendingDesc')} icon={ShieldAlert} iconColor="text-yellow-500" />
        <TransactionStatsCard title={t('stats.highRisk')} value={stats.highRisk.toLocaleString()} description={t('stats.highRiskDesc')} icon={AlertTriangle} iconColor="text-red-500" />
        <TransactionStatsCard title={t('stats.mediumRisk')} value={stats.mediumRisk.toLocaleString()} description={t('stats.mediumRiskDesc')} icon={AlertTriangle} iconColor="text-orange-500" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('pendingTransactions')}</CardTitle>
        </CardHeader>
        <CardContent>
           <DataTable
            columns={columns}
            data={pendingTransactions}
            filterColumnId="passengerName"
          />
        </CardContent>
      </Card>
    </div>
  );
}
