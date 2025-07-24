
'use client';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Ship, Anchor, UserCheck, Users as CruisePassengers, Globe, Clock, ArrowRight, ArrowLeft, Zap, LayoutDashboard } from 'lucide-react';
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
import PassengerTypeChart from '@/components/charts/passenger-type-chart';
import { TravelerCategoryChart } from '@/components/charts/traveler-category-chart';

export default function SeaportDashboardPage() {
    const t = useTranslations('SeaportDashboard');
    const { user } = useAuth();
    const [data, setData] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [mainResult, overviewResult, forecastResult, statsResult, passengerResult, travelerCategoriesResult] = await Promise.all([
                api.get('/dashboard/main'),
                api.get('/dashboard/transaction-overview'),
                api.get('/dashboard/forecasts?module=seaport'),
                api.get('/dashboard/stats?module=seaport'),
                api.get('/data/passengers'),
                api.get('/dashboard/seaport-traveler-categories'),
            ]);
            
            if (mainResult.isSuccess && overviewResult.isSuccess && forecastResult.isSuccess && statsResult.isSuccess && passengerResult.isSuccess && travelerCategoriesResult.isSuccess) {
                setData({ 
                    main: mainResult.data,
                    overview: overviewResult.data,
                    forecasts: forecastResult.data,
                    stats: statsResult.data,
                    passengers: passengerResult.data,
                    travelerCategories: travelerCategoriesResult.data,
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

  const isSupervisorOrAdmin = user?.role === 'shiftsupervisor' || user?.role === 'admin';
  
  const getForecastWithIcons = (forecastData: any) => {
    if (!forecastData) return forecastData;
    const metricsWithIcons = forecastData.metrics.map((metric: any) => ({
      ...metric,
      icon: metric.title.toLowerCase().includes('arrival') ? ArrowLeft : ArrowRight,
    }));
    return { ...forecastData, metrics: metricsWithIcons };
  };


  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb>
          <BreadcrumbList>
          <BreadcrumbItem>
              <BreadcrumbPage icon={LayoutDashboard}>Dashboard</BreadcrumbPage>
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
                <StatCard title={t('vesselsInPort')} value={data?.stats?.vesselsInPort || '...'} icon={Anchor} color="text-cyan-500" />
                <StatCard title={t('cruisePassengers')} value={data?.stats?.cruisePassengers || '...'} icon={CruisePassengers} color="text-teal-500" />
                <StatCard title={t('passengersProcessed')} value={data?.stats?.passengersProcessed || '...'} icon={UserCheck} color="text-green-500" />
                <StatCard title={t('activeBerths')} value={data?.stats?.activeBerths || '...'} icon={Ship} color="text-blue-500" />
                <StatCard title={t('avgProcessingTime')} value={data?.main?.avgProcessingTime?.seaport || '...'} icon={Clock} color="text-orange-500" />
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
                <Skeleton className="h-[400px] w-full" />
            ) : (
                <TransactionOverviewChart data={data.overview} />
            )}

            {loading || !data ? (
                <div className="grid gap-8 md:grid-cols-3">
                    <Skeleton className="h-[400px] w-full" />
                    <Skeleton className="h-[400px] w-full" />
                    <Skeleton className="h-[400px] w-full" />
                </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-3">
                <PassengerTypeChart data={data.passengers.seaport} />
                <TravelerCategoryChart data={data.travelerCategories} />
                <RiskRuleTriggerChart data={data.main.riskRules} className="h-full" />
              </div>
            )}

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
