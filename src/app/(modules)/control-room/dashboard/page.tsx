
'use client';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DoorOpen, Fingerprint, ShieldAlert, CheckCircle, Globe, Clock, Users, LayoutDashboard } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ThroughputChart } from '@/components/charts/throughput-chart';
import { RiskRuleTriggerChart } from '@/components/charts/risk-rule-trigger-chart';
import { WorldMapChart } from '@/components/charts/world-map-chart';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { TransactionOverviewChart } from '@/components/charts/transaction-overview-chart';
import { useAuth } from '@/hooks/use-auth';
import { ForecastCard } from '@/components/forecast-card';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { GateRejectionReasonsChart } from '@/components/charts/gate-rejection-reasons-chart';
import { SimplePieChart } from '@/components/charts/simple-pie-chart';
import { GatePerformanceTable } from '@/components/charts/gate-performance-table';

export default function ControlRoomDashboardPage() {
    const t = useTranslations('ControlRoomDashboard');
    const { user } = useAuth();
    const [data, setData] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [mainResult, overviewResult, forecastResult, statsResult, rejectionResult, transactionBreakdownResult, gatePerformanceResult] = await Promise.all([
                api.get('/dashboard/main'),
                api.get('/dashboard/transaction-overview'),
                api.get('/dashboard/forecasts?module=control-room'),
                api.get('/dashboard/stats?module=control-room'),
                api.get('/dashboard/gate-rejection-reasons'),
                api.get('/dashboard/transaction-breakdown'),
                api.get('/dashboard/gate-performance'),
            ]);
            
            if (mainResult.isSuccess && overviewResult.isSuccess && forecastResult.isSuccess && statsResult.isSuccess && rejectionResult.isSuccess && transactionBreakdownResult.isSuccess && gatePerformanceResult.isSuccess) {
                setData({ 
                    main: mainResult.data,
                    overview: overviewResult.data,
                    forecasts: forecastResult.data,
                    stats: statsResult.data,
                    reasons: rejectionResult.data,
                    transactionBreakdown: transactionBreakdownResult.data,
                    gatePerformance: gatePerformanceResult.data,
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
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

  const isSupervisorOrAdmin = user?.role === 'shiftsupervisor' || user?.role === 'admin';
  
  const getForecastWithIcons = (forecastData: any) => {
    if (!forecastData) return forecastData;
    const metricsWithIcons = forecastData.metrics.map((metric: any, index: number) => ({
      ...metric,
      icon: index === 0 ? Users : ShieldAlert,
    }));
    return { ...forecastData, metrics: metricsWithIcons };
  };


  return (
    <div className="flex flex-col gap-8">
       <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/control-room/dashboard" icon={LayoutDashboard}>Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <DashboardHeader 
        title={t('title')}
        description={t('description')}
      />
        <div className="flex flex-col gap-8">
            {loading ? renderSkeleton() : (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                <StatCard title={t('successfulEntries')} value={data?.stats?.successfulEntries || '...'} icon={CheckCircle} color="text-green-500" />
                <StatCard title={t('failedAttempts')} value={data?.stats?.failedAttempts || '...'} icon={ShieldAlert} color="text-red-500" />
                <StatCard title={t('biometricVerifications')} value={data?.stats?.biometricVerifications || '...'} icon={Fingerprint} color="text-blue-500" />
                <StatCard title={t('activeGates')} value={data?.stats ? `${data.stats.activeGates}/${data.stats.totalGates}` : '...'} icon={DoorOpen} color="text-purple-500" />
                <StatCard title={t('activeAlerts')} value={data?.stats?.activeAlerts || '...'} icon={ShieldAlert} color="text-yellow-500" />
                <StatCard title={t('avgProcessingTime')} value={data?.main?.avgProcessingTime?.['control-room'] || '...'} icon={Clock} color="text-orange-500" />
            </div>
            )}
            
            {isSupervisorOrAdmin && (
              <div className="grid gap-8 md:grid-cols-2">
                 {loading || !data ? (
                    <>
                        <Skeleton className="h-[250px] w-full" />
                        <Skeleton className="h-[250px] w-full" />
                    </>
                ) : (
                    <>
                        <ForecastCard forecast={getForecastWithIcons(data.forecasts.current)} />
                        <ForecastCard forecast={getForecastWithIcons(data.forecasts.next)} />
                    </>
                )}
              </div>
            )}

            {loading || !data ? (
                 <div className="grid gap-8 md:grid-cols-3">
                    <Skeleton className="h-[250px] w-full" />
                    <Skeleton className="h-[250px] w-full" />
                    <Skeleton className="h-[250px] w-full" />
                </div>
            ) : (
                <div className="grid gap-8 md:grid-cols-3">
                    <SimplePieChart data={data.transactionBreakdown.gate} title="Gate Transactions" description="Success, rejected, cancelled." />
                    <SimplePieChart data={data.transactionBreakdown.counter} title="Counter Transactions" description="Success, rejected, cancelled." />
                    <SimplePieChart data={data.transactionBreakdown.total} title="Total Transactions" description="Success, rejected, cancelled." />
                </div>
            )}

            {loading || !data ? (
                <Skeleton className="h-[400px] w-full" />
            ) : (
                <TransactionOverviewChart data={data.overview} />
            )}

            {loading || !data ? <Skeleton className="h-[400px] w-full" /> : <GatePerformanceTable data={data.gatePerformance} /> }

            {loading || !data ? (
                <Skeleton className="h-[400px] w-full" />
            ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                <div className="lg:col-span-3">
                    <ThroughputChart data={data.main.throughput} className="h-full" />
                </div>
                <div className="lg:col-span-2">
                    <RiskRuleTriggerChart data={data.main.riskRules} className="h-full" />
                </div>
            </div>
            )}

            {loading || !data ? (
                <Skeleton className="h-[400px] w-full" />
            ) : (
                <GateRejectionReasonsChart data={data.reasons} />
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
