
'use client';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LandPlot, Car, ScanText, UserSquare, Globe, Clock, Users, ArrowUp, ArrowDown } from 'lucide-react';
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
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export default function LandportDashboardPage() {
    const t = useTranslations('LandportDashboard');
    const { user } = useAuth();
    const [data, setData] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [mainResult, overviewResult, forecastResult] = await Promise.all([
              api.get('/dashboard/main'),
              api.get('/dashboard/transaction-overview'),
              api.get('/dashboard/forecasts?module=landport')
            ]);
            
            if (mainResult.isSuccess && overviewResult.isSuccess && forecastResult.isSuccess) {
                setData({ 
                    main: mainResult.data,
                    overview: overviewResult.data,
                    forecasts: forecastResult.data
                });
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const StatCard = ({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ElementType }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
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

  const renderForecastTrend = (trend: { direction: 'up' | 'down' | 'same', percentage?: number, text: string }) => {
    let colorClass = 'text-gray-500';
    if(trend.direction === 'up' && trend.text.toLowerCase().includes('high')) colorClass = 'text-red-600';
    else if (trend.direction === 'up') colorClass = 'text-green-600';
    else if (trend.direction === 'down') colorClass = 'text-red-600';

    if (trend.text.toLowerCase().includes('medium')) colorClass = 'text-yellow-600';
    if (trend.text.toLowerCase().includes('low')) colorClass = 'text-green-600';
    
    return (
        <span className={`flex items-center ${colorClass}`}>
            {trend.direction === 'up' && <ArrowUp className="h-4 w-4" />}
            {trend.direction === 'down' && <ArrowDown className="h-4 w-4" />}
            {trend.percentage !== undefined ? `${trend.percentage}%` : trend.text}
        </span>
    );
  };
  
  const getForecastItems = (forecastData: any) => {
    if(!forecastData) return [];
    return forecastData.items.map((item: any) => ({
      ...item,
      icon: item.label.includes('Vehicles') ? Car : Clock,
      trend: renderForecastTrend(item.trend)
    }));
  };

  return (
    <div className="flex flex-col gap-8">
       <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/landport/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <DashboardHeader 
        title="Dashboard"
        description={t('welcome')}
      />
      <div className="flex flex-col gap-8">
        {loading ? renderSkeleton() : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <StatCard title={t('vehiclesProcessed')} value="4,589" icon={Car} />
            <StatCard title={t('travelersChecked')} value="7,123" icon={UserSquare} />
            <StatCard title={t('documentsScanned')} value="9,876" icon={ScanText} />
            <StatCard title={t('activeLanes')} value="8" icon={LandPlot} />
            <StatCard title={t('avgProcessingTime')} value={data?.main?.avgProcessingTime?.landport || '...'} icon={Clock} />
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
                    <ForecastCard forecast={{ ...data.forecasts.current, items: getForecastItems(data.forecasts.current) }} />
                    <ForecastCard forecast={{ ...data.forecasts.next, items: getForecastItems(data.forecasts.next) }} />
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
          <Skeleton className="h-[400px] w-full" />
        ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            <div className="lg:col-span-3">
                <ThroughputChart data={data.main.throughput} />
            </div>
            <div className="lg:col-span-2">
                <RiskRuleTriggerChart data={data.main.riskRules} />
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
