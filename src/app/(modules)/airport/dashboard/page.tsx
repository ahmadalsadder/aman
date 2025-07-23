
'use client';
import * as React from 'react';
import ModulePage from '@/components/module-page';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserCheck, BaggageClaim, ShieldCheck, Globe, Clock, Users, ArrowUp, ArrowDown } from 'lucide-react';
import PassengerTypeChart from '@/components/charts/passenger-type-chart';
import CreateRecordButton from '@/components/create-record-button';
import { useTranslations } from 'next-intl';
import { AgeDistributionChart } from '@/components/charts/age-distribution-chart';
import { NationalityDistributionChart } from '@/components/charts/nationality-distribution-chart';
import { ThroughputChart } from '@/components/charts/throughput-chart';
import { RiskRuleTriggerChart } from '@/components/charts/risk-rule-trigger-chart';
import { WorldMapChart } from '@/components/charts/world-map-chart';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { TransactionOverviewChart } from '@/components/charts/transaction-overview-chart';
import PlaneIcon from '@/components/icons/plane-icon';
import { useAuth } from '@/hooks/use-auth';
import { ForecastCard } from '@/components/forecast-card';

export default function AirportDashboardPage() {
  const t = useTranslations('AirportDashboard');
  const { user } = useAuth();
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [mainResult, airportResult, passengerResult, overviewResult] = await Promise.all([
        api.get('/dashboard/main'),
        api.get('/dashboard/airport'),
        api.get('/data/passengers'),
        api.get('/dashboard/transaction-overview'),
      ]);
      
      if (mainResult.isSuccess && airportResult.isSuccess && passengerResult.isSuccess && overviewResult.isSuccess) {
        setData({
          main: mainResult.data,
          airport: airportResult.data,
          passengers: passengerResult.data,
          overview: overviewResult.data,
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
      module="airport"
      title={t('title')}
      description={t('description')}
      icon={PlaneIcon}
    >
      {loading ? renderSkeleton() : (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard title={t('passengersProcessed')} value="12,453" icon={UserCheck} />
        <StatCard title={t('bagsScanned')} value="25,832" icon={BaggageClaim} />
        <StatCard title={t('securityAlerts')} value="3" icon={ShieldCheck} />
        <StatCard title={t('flightsMonitored')} value="128" icon={PlaneIcon} />
        <StatCard title={t('avgProcessingTime')} value={data?.main?.avgProcessingTime?.airport || '...'} icon={Clock} />
      </div>
      )}
       <div className="mt-8 grid gap-8 grid-cols-1">
        {isSupervisorOrAdmin && (
          <div className="grid gap-8 md:grid-cols-2">
            <ForecastCard
              title="Current Shift Forecast"
              description="Expected passenger traffic and resource allocation for the current shift (08:00 - 16:00)."
              items={[
                { icon: Users, label: "Expected Passengers", value: "6,200", trend: <span className="flex items-center text-green-600"><ArrowUp className="h-4 w-4" /> 5%</span> },
                { icon: UserCheck, label: "Recommended Staff", value: "45 Officers", trend: <span className="flex items-center text-gray-500">-</span> },
                { icon: Clock, label: "Peak Hours", value: "10:00 - 12:00", trend: <span className="flex items-center text-red-600"><ArrowUp className="h-4 w-4" /> High Traffic</span> },
              ]}
            />
            <ForecastCard
              title="Next Shift Forecast"
              description="Expected passenger traffic and resource allocation for the next shift (16:00 - 00:00)."
              items={[
                { icon: Users, label: "Expected Passengers", value: "4,800", trend: <span className="flex items-center text-red-600"><ArrowDown className="h-4 w-4" /> 12%</span> },
                { icon: UserCheck, label: "Recommended Staff", value: "38 Officers", trend: <span className="flex items-center text-gray-500">-</span> },
                { icon: Clock, label: "Peak Hours", value: "18:00 - 20:00", trend: <span className="flex items-center text-yellow-600">Medium Traffic</span> },
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
          <div className="grid gap-8 md:grid-cols-2">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : (
        <div className="grid gap-8 md:grid-cols-2">
            <PassengerTypeChart data={data.passengers.airport} />
            <AgeDistributionChart data={data.airport.ageDistribution} />
        </div>
        )}
        
        {loading || !data ? (
            <Skeleton className="h-[400px] w-full" />
        ) : (
            <NationalityDistributionChart data={data.airport.nationalityDistribution} />
        )}
        
        {loading || !data ? (
          <Skeleton className="h-[400px] w-full" />
        ) : (
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
                <WorldMapChart data={data.main.nationalityDistribution} />
            </CardContent>
        </Card>
        )}

         <Card>
          <CardHeader>
            <CardTitle>{t('actions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{t('actionsDescription')}</p>
            <CreateRecordButton />
          </CardContent>
        </Card>
       </div>
    </ModulePage>
  );
}
