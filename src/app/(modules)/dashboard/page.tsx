'use client';
import { useTranslations } from 'next-intl';
import { LayoutDashboard, AlertTriangle, Timer, Activity, Globe } from 'lucide-react';
import { TransactionStatsCard } from '@/components/transactions/transaction-stats-card';
import { ThroughputChart } from '@/components/charts/throughput-chart';
import { RiskRuleTriggerChart } from '@/components/charts/risk-rule-trigger-chart';
import { WorldMapChart } from '@/components/charts/world-map-chart';
import { mainDashboardData } from '@/data/dashboard-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
    const t = useTranslations('Dashboard');

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                <p className="text-muted-foreground">{t('description')}</p>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <TransactionStatsCard
                    title={t('totalTransactions')}
                    value="1.2M"
                    description="+20.1% from last month"
                    icon={LayoutDashboard}
                />
                <TransactionStatsCard
                    title={t('avgProcessingTime')}
                    value="2.5m"
                    description={t('inMinutes')}
                    icon={Timer}
                />
                <TransactionStatsCard
                    title={t('realtimeAlerts')}
                    value="3"
                    description={t('criticalAlerts')}
                    icon={AlertTriangle}
                    iconColor="text-destructive"
                />
                <TransactionStatsCard
                    title={t('systemUptime')}
                    value="99.98%"
                    description={t('last30days')}
                    icon={Activity}
                />
            </div>
            
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                <div className="lg:col-span-3">
                    <ThroughputChart data={mainDashboardData.throughput} />
                </div>
                <div className="lg:col-span-2">
                    <RiskRuleTriggerChart data={mainDashboardData.riskRules} />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Passenger Volume by Nationality
                    </CardTitle>
                    <CardDescription>
                        A global overview of passenger traffic origins.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <WorldMapChart data={mainDashboardData.nationalityDistribution} />
                </CardContent>
            </Card>
        </div>
    );
}
