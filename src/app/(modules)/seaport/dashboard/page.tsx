
'use client';
import * as React from 'react';
import ModulePage from '@/components/module-page';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Ship, Anchor, UserCheck, Users as CruisePassengers, Globe, Clock, Users, ArrowUp, ArrowDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ThroughputChart } from '@/components/charts/throughput-chart';
import { RiskRuleTriggerChart } from '@/components/charts/risk-rule-trigger-chart';
import { WorldMapChart } from '@/components/charts/world-map-chart';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { TransactionOverviewChart } from '@/components/charts/transaction-overview-chart';
import { useAuth } from '@/hooks/use-auth';
import { ForecastCard } from '@/components/forecast-card';

export default function SeaportDashboardPage() {
    const t = useTranslations('SeaportDashboard');
    const { user } = useAuth();
    const [data, setData] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [mainResult, overviewResult] = await Promise.all([
                api.get('/dashboard/main'),
                api.get('/dashboard/transaction-overview')
            ]);
            
            if (mainResult.isSuccess && overviewResult.isSuccess) {
                setData({ 
                    main: mainResult.data,
                    overview: overviewResult.data
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

  return (
    <ModulePage
      module="seaport"
      title={t('title')}
      description={t('description')}
      icon={Ship}
    >
        <div className="flex flex-col gap-8">
            {loading ? renderSkeleton() : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <StatCard title={t('vesselsInPort')} value="23" icon={Anchor} />
                <StatCard title={t('cruisePassengers')} value="2,480" icon={CruisePassengers} />
                <StatCard title={t('passengersProcessed')} value="1,250" icon={UserCheck} />
                <StatCard title={t('activeBerths')} value="6" icon={Ship} />
                <StatCard title={t('avgProcessingTime')} value={data?.main?.avgProcessingTime?.seaport || '...'} icon={Clock} />
            </div>
            )}

            {isSupervisorOrAdmin && (
              <div className="grid gap-8 md:grid-cols-2">
                <ForecastCard
                  title="Current Shift Forecast"
                  description="Expected vessel arrivals and container traffic for the current shift (06:00 - 18:00)."
                  items={[
                    { icon: Ship, label: "Expected Vessel Arrivals", value: "4", trend: <span className="flex items-center text-gray-500">-</span> },
                    { icon: Users, label: "Expected Passengers", value: "850", trend: <span className="flex items-center text-green-600"><ArrowUp className="h-4 w-4" /> 10%</span> },
                    { icon: Clock, label: "Peak Activity", value: "10:00 - 14:00", trend: <span className="flex items-center text-red-600"><ArrowUp className="h-4 w-4" /> High Congestion</span> },
                  ]}
                />
                <ForecastCard
                  title="Next Shift Forecast"
                  description="Expected vessel arrivals and container traffic for the next shift (18:00 - 06:00)."
                  items={[
                    { icon: Ship, label: "Expected Vessel Arrivals", value: "2", trend: <span className="flex items-center text-red-600"><ArrowDown className="h-4 w-4" /> 50%</span> },
                    { icon: Users, label: "Expected Passengers", value: "400", trend: <span className="flex items-center text-red-600"><ArrowDown className="h-4 w-4" /> 25%</span> },
                    { icon: Clock, label: "Peak Activity", value: "20:00 - 22:00", trend: <span className="flex items-center text-green-600">Low Congestion</span> },
                  ]}
                />
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
    </ModulePage>
  );
}
