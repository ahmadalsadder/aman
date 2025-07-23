
'use client';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DoorOpen, Fingerprint, ShieldAlert, CheckCircle, Globe, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ThroughputChart } from '@/components/charts/throughput-chart';
import { RiskRuleTriggerChart } from '@/components/charts/risk-rule-trigger-chart';
import { WorldMapChart } from '@/components/charts/world-map-chart';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { TransactionOverviewChart } from '@/components/charts/transaction-overview-chart';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from '@/components/ui/breadcrumb';
import PassengerTypeChart from '@/components/charts/passenger-type-chart';

export default function AnalystDashboardPage() {
    const t = useTranslations('AnalystDashboard');
    const [data, setData] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [mainResult, overviewResult, statsResult, passengerResult] = await Promise.all([
              api.get('/dashboard/main'),
              api.get('/dashboard/transaction-overview'),
              api.get('/dashboard/stats?module=analyst'),
              api.get('/data/passengers'),
            ]);
            
            if (mainResult.isSuccess && overviewResult.isSuccess && statsResult.isSuccess && passengerResult.isSuccess) {
                setData({ 
                    main: mainResult.data,
                    overview: overviewResult.data,
                    stats: statsResult.data,
                    passengers: passengerResult.data,
                });
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: React.ElementType, color?: string }) => (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className={`h-4 w-4 text-muted-foreground ${color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value}</div>
          </CardContent>
        </Card>
      );

  const renderSkeleton = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-1/3" />
            </CardContent>
          </Card>
        ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
       <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/analyst/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <DashboardHeader 
        title={t('title')}
        description={t('description')}
      />
        <div className="flex flex-col gap-8">
            {loading ? renderSkeleton() : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <StatCard title={t('successfulEntries')} value={data?.stats?.successfulEntries || '...'} icon={CheckCircle} color="text-green-500" />
                <StatCard title={t('failedAttempts')} value={data?.stats?.failedAttempts || '...'} icon={ShieldAlert} color="text-red-500" />
                <StatCard title={t('biometricVerifications')} value={data?.stats?.biometricVerifications || '...'} icon={Fingerprint} color="text-blue-500" />
                <StatCard title={t('activeGates')} value={data?.stats?.activeGates || '...'} icon={DoorOpen} color="text-purple-500" />
                <StatCard title={t('avgProcessingTime')} value={data?.main?.avgProcessingTime?.analyst || '...'} icon={Clock} color="text-orange-500" />
            </div>
            )}
            
            {loading || !data ? (
                <Skeleton className="h-[400px] w-full" />
            ) : (
                <TransactionOverviewChart data={data.overview} />
            )}

            {loading || !data ? (
                <Skeleton className="h-[400px] w-full" />
            ) : (
               <PassengerTypeChart data={data.passengers.airport} />
            )}

            {loading || !data ? (
                <Skeleton className="h-[400px] w-full" />
            ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                <div className="lg:col-span-3">
                    <ThroughputChart data={data.main.throughput} className="h-full"/>
                </div>
                <div className="lg:col-span-2">
                    <RiskRuleTriggerChart data={data.main.riskRules} className="h-full"/>
                </div>
            </div>
            )}

            {loading || !data ? (
                <Skeleton className="h-[400px] w-full" />
            ) : (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Traffic Volume by Nationality
                    </CardTitle>
                    <CardDescription>
                        A global overview of traffic origins.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <WorldMapChart data={data.main.nationalityDistribution} />
                </CardContent>
            </Card>
            )}
        </div>
    </div>
  );
}
