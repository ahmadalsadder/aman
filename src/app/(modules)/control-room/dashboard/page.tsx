
'use client';
import * as React from 'react';
import ModulePage from '@/components/module-page';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DoorOpen, Fingerprint, ShieldAlert, CheckCircle, Globe, RadioTower, Clock, Users, ArrowUp, ArrowDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ThroughputChart } from '@/components/charts/throughput-chart';
import { RiskRuleTriggerChart } from '@/components/charts/risk-rule-trigger-chart';
import { WorldMapChart } from '@/components/charts/world-map-chart';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { TransactionOverviewChart } from '@/components/charts/transaction-overview-chart';
import { useAuth } from '@/hooks/use-auth';
import { ForecastCard } from '@/components/forecast-card';

export default function ControlRoomDashboardPage() {
    const t = useTranslations('ControlRoomDashboard');
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

  const isSupervisor = user?.role === 'gate-supervisor';

  return (
    <ModulePage
      module="control-room"
      title={t('title')}
      description={t('description')}
      icon={RadioTower}
    >
        <div className="flex flex-col gap-8">
            {loading ? renderSkeleton() : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <StatCard title={t('successfulEntries')} value="8,210" icon={CheckCircle} />
                <StatCard title={t('failedAttempts')} value="14" icon={ShieldAlert} />
                <StatCard title={t('biometricVerifications')} value="8,224" icon={Fingerprint} />
                <StatCard title={t('activeGates')} value="24" icon={DoorOpen} />
                <StatCard title={t('avgProcessingTime')} value={data?.main?.avgProcessingTime?.['control-room'] || '...'} icon={Clock} />
            </div>
            )}
            
            {isSupervisor && (
              <div className="grid gap-8 md:grid-cols-2">
                <ForecastCard
                  title="Current Shift Forecast"
                  description="Expected system-wide traffic and resource needs for the current shift (08:00 - 16:00)."
                  items={[
                    { icon: Users, label: "Expected Traffic", value: "15,000", trend: <span className="flex items-center text-green-600"><ArrowUp className="h-4 w-4" /> 7%</span> },
                    { icon: ShieldAlert, label: "Potential Alerts", value: "5-8", trend: <span className="flex items-center text-yellow-600">Normal</span> },
                    { icon: Clock, label: "Peak Hours", value: "11:00 - 14:00", trend: <span className="flex items-center text-red-600"><ArrowUp className="h-4 w-4" /> High Activity</span> },
                  ]}
                />
                <ForecastCard
                  title="Next Shift Forecast"
                  description="Expected system-wide traffic and resource needs for the next shift (16:00 - 00:00)."
                  items={[
                    { icon: Users, label: "Expected Traffic", value: "11,500", trend: <span className="flex items-center text-red-600"><ArrowDown className="h-4 w-4" /> 15%</span> },
                    { icon: ShieldAlert, label: "Potential Alerts", value: "3-5", trend: <span className="flex items-center text-green-600">Low</span> },
                    { icon: Clock, label: "Peak Hours", value: "17:00 - 19:00", trend: <span className="flex items-center text-yellow-600">Medium Activity</span> },
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
