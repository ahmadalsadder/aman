
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { Transaction } from '@/types/live-processing';
import { DataTable } from '@/components/shared/data-table';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Eye, User, Printer, AlertTriangle, LayoutDashboard, Search, X, Filter, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { TransactionStatsCard } from '@/components/transactions/transaction-stats-card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const riskColors: { [key: string]: { text: string; bg: string; border: string; } } = {
  High: { text: 'text-red-700 dark:text-red-300', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  Medium: { text: 'text-yellow-700 dark:text-yellow-300', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
};

export default function DutyManagerPage() {
  const [allPendingTransactions, setAllPendingTransactions] = useState<Transaction[]>([]);
  const { hasPermission } = useAuth();
  const t = useTranslations('DutyManager');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [appliedFilter, setAppliedFilter] = useState('');

  const canView = hasPermission(['duty-manager:view']);

  useEffect(() => {
    if (!canView) {
        setLoading(false);
        return;
    }
    const fetchData = async () => {
        const result = await api.get<Transaction[]>(`/data/transactions/pending`);
        if (result.isSuccess) {
            setAllPendingTransactions(result.data || []);
        }
        setLoading(false);
    };
    fetchData();
  }, [canView]);

  const filteredTransactions = useMemo(() => {
    if (!appliedFilter) return allPendingTransactions;
    const lowercasedFilter = appliedFilter.toLowerCase();
    return allPendingTransactions.filter(
      t => t.passportNumber && t.passportNumber.toLowerCase().includes(lowercasedFilter)
    );
  }, [allPendingTransactions, appliedFilter]);

  const stats = useMemo(() => {
    const highRisk = allPendingTransactions.filter(t => t.riskScore >= 75).length;
    const mediumRisk = allPendingTransactions.filter(t => t.riskScore > 40 && t.riskScore < 75).length;
    return {
        total: allPendingTransactions.length,
        highRisk,
        mediumRisk
    };
  }, [allPendingTransactions]);
  
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
      accessorKey: 'dateTime',
      header: t('columns.dateTime'),
    },
    {
      accessorKey: 'riskScore',
      header: t('columns.riskScore'),
      cell: ({row}) => {
        const riskLevel = getRiskLevel(row.original.riskScore);
        const colorClasses = riskColors[riskLevel];
        return (
            <div className={cn("flex flex-col gap-2 rounded-md border p-2 min-w-[120px]", colorClasses.bg, colorClasses.border)}>
                 <div className="flex items-center justify-between text-xs font-bold">
                    <span className={colorClasses.text}>{riskLevel} Risk</span>
                    <span className={colorClasses.text}>{row.original.riskScore}</span>
                </div>
                <Progress value={row.original.riskScore} className="h-1" />
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
        const module = transaction.tripInformation?.type || 'airport';
        return (
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon" className="text-primary hover:text-primary/80">
              <Link href={`/${module}/transactions/${transaction.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon" className="text-primary hover:text-primary/80" disabled>
                <Link href={`/${module}/passengers/${transaction.passengerId}/edit`}>
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

  const handleSearch = () => setAppliedFilter(filter);
  const handleReset = () => {
      setFilter('');
      setAppliedFilter('');
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
        <Collapsible>
          <CollapsibleTrigger asChild>
            <div className="flex w-full cursor-pointer items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5" />
                <h2 className="text-lg font-semibold">{t('filterTitle', {ns: 'Transactions'})}</h2>
              </div>
              <ChevronDown className="h-5 w-5 transition-transform duration-300 [&[data-state=open]]:rotate-180" />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-6 pt-0">
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    <Input 
                        placeholder={t('filterPlaceholder')}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="max-w-sm"
                    />
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <Button onClick={handleReset} variant="outline"><X className="mr-2 h-4 w-4" />{t('reset')}</Button>
                    <Button onClick={handleSearch}><Search className="mr-2 h-4 w-4" />{t('search')}</Button>
                </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('pendingTransactions')}</CardTitle>
          <CardDescription>{t('pendingTransactionsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
           <DataTable
            columns={columns}
            data={filteredTransactions}
            hideDefaultFilter
          />
        </CardContent>
      </Card>
    </div>
  );
}
