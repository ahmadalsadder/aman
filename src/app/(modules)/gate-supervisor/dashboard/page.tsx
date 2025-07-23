
'use client';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DoorOpen, Fingerprint, ShieldAlert, CheckCircle, Globe, Clock, Users, ArrowRight, ArrowLeft } from 'lucide-react';
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
import { GateRejectionReasonsChart } from '@/components/charts/gate-rejection-reasons-chart';
import { SimplePieChart } from '@/components/charts/simple-pie-chart';
import { GatePerformanceTable } from '@/components/charts/gate-performance-table';
import { OfficerStatsCards } from '@/components/charts/officer-stats-cards';
import { OfficerProcessingTimeChart } from '@/components/charts/officer-processing-time-chart';
import { OfficerDecisionChart } from '@/components/charts/officer-decision-chart';
import { ForecastCard } from '@/components/forecast-card';

export default function GateSupervisorDashboardPage() {
    const t = useTranslations('GateSupervisorDashboard');
    const [data, setData] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [mainResult, overviewResult, statsResult, passengerResult, rejectionResult, transactionListResult, transactionBreakdownResult, gatePerformanceResult, officerPerformanceResult, forecastResult] = await Promise.all([
                api.get('/dashboard/main'),
                api.get('/dashboard/transaction-overview'),
                api.get('/dashboard/stats?module=shiftsupervisor'),
                api.get('/data/passengers'),
                api.get('/dashboard/gate-rejection-reasons'),
                api.get('/dashboard/transaction-lists'),
                api.get('/dashboard/transaction-breakdown'),
                api.get('/dashboard/gate-performance'),
                api.get('/dashboard/officer-performance'),
                api.get('/dashboard/forecasts?module=shiftsupervisor'),
            ]);
            
            if (mainResult.isSuccess && overviewResult.isSuccess && statsResult.isSuccess && passengerResult.isSuccess && rejectionResult.isSuccess && transactionListResult.isSuccess && transactionBreakdownResult.isSuccess && gatePerformanceResult.isSuccess && officerPerformanceResult.isSuccess && forecastResult.isSuccess) {
                setData({ 
                    main: mainResult.data,
                    overview: overviewResult.data,
                    stats: statsResult.data,
                    passengers: passengerResult.data,
                    reasons: rejectionResult.data,
                    transactionLists: transactionListResult.data,
                    transactionBreakdown: transactionBreakdownResult.data,
                    gatePerformance: gatePerformanceResult.data,
                    officerPerformance: officerPerformanceResult.data,
                    forecasts: forecastResult.data,
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
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
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
  
  const getForecastWithIcons = (forecastData: any) => {
    if (!forecastData) return forecastData;
    const metricsWithIcons = forecastData.metrics.map((metric: any, index: number) => ({
      ...metric,
      icon: index === 0 ? Users : Clock,
    }));
    return { ...forecastData, metrics: metricsWithIcons };
  };

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/gate-supervisor/dashboard">Dashboard</BreadcrumbLink>
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
                <StatCard title={t('avgOfficerProcessingTime')} value={data?.stats?.avgOfficerProcessingTime || '...'} icon={Clock} color="text-red-500" />
                <StatCard title={t('biometricVerifications')} value={data?.stats?.biometricVerifications || '...'} icon={Fingerprint} color="text-blue-500" />
                <StatCard title={t('activeGates')} value={data?.stats?.activeGates || '...'} icon={DoorOpen} color="text-purple-500" />
                <StatCard title={t('activeAlerts')} value={data?.stats?.activeAlerts || '...'} icon={ShieldAlert} color="text-yellow-500" />
                <StatCard title={t('avgGateProcessingTime')} value={data?.main?.avgProcessingTime?.['shiftsupervisor'] || '...'} icon={Clock} color="text-orange-500" />
            </div>
            )}
            
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

             {loading || !data ? (
                <div className="grid gap-8 md:grid-cols-3">
                    <Skeleton className="h-[250px] w-full" />
                    <Skeleton className="h-[250px] w-full" />
                    <Skeleton className="h-[250px] w-full" />
                </div>
            ) : (
                <div className="grid gap-8 md:grid-cols-3">
                    <SimplePieChart data={data.transactionLists.whitelisted} title="Whitelisted Transactions" description="Whitelisted vs. non-whitelisted." />
                    <SimplePieChart data={data.transactionLists.blacklisted} title="Blacklisted Transactions" description="Blacklisted vs. non-blacklisted." />
                    <SimplePieChart data={data.transactionLists.risky} title="Risky Transactions" description="Risky vs. non-risky." />
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

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Officer Performance
                    </CardTitle>
                    <CardDescription>
                        Key metrics for officer activity and efficiency.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-8">
                    {loading || !data ? <Skeleton className="h-24 w-full" /> : <OfficerStatsCards data={data.officerPerformance.officers} /> }
                    <div className="grid gap-8 md:grid-cols-2">
                        {loading || !data ? <Skeleton className="h-[300px] w-full" /> : <OfficerProcessingTimeChart data={data.officerPerformance.officers} /> }
                        {loading || !data ? <Skeleton className="h-[300px] w-full" /> : <OfficerDecisionChart data={data.officerPerformance.decisionBreakdown} /> }
                    </div>
                </CardContent>
            </Card>

            {loading || !data ? <Skeleton className="h-[400px] w-full" /> : <GatePerformanceTable data={data.gatePerformance} /> }


            <div className="grid gap-8 md:grid-cols-3">
              {loading || !data ? (
                  <>
                    <Skeleton className="h-[400px] w-full" />
                    <Skeleton className="h-[400px] w-full" />
                    <Skeleton className="h-[400px] w-full" />
                  </>
              ) : (
                <>
                  <PassengerTypeChart data={data.passengers.airport} />
                  <GateRejectionReasonsChart data={data.reasons} />
                  <RiskRuleTriggerChart data={data.main.riskRules} className="h-full" />
                </>
              )}
            </div>

            {loading || !data ? (
                 <Skeleton className="h-[400px] w-full" />
            ) : (
                <ThroughputChart data={data.main.throughput} className="h-full" />
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
