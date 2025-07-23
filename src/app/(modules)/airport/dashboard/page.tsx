'use client';
import ModulePage from '@/components/module-page';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plane, UserCheck, BaggageClaim, ShieldCheck, Globe } from 'lucide-react';
import PassengerTypeChart from '@/components/charts/passenger-type-chart';
import { passengerData } from '@/data/passenger-data';
import CreateRecordButton from '@/components/create-record-button';
import { useTranslations } from 'next-intl';
import { AgeDistributionChart } from '@/components/charts/age-distribution-chart';
import { NationalityDistributionChart } from '@/components/charts/nationality-distribution-chart';
import { airportDashboardData, mainDashboardData } from '@/data/dashboard-data';
import { ThroughputChart } from '@/components/charts/throughput-chart';
import { RiskRuleTriggerChart } from '@/components/charts/risk-rule-trigger-chart';
import { WorldMapChart } from '@/components/charts/world-map-chart';

export default function AirportDashboardPage() {
  const t = useTranslations('AirportDashboard');

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

  return (
    <ModulePage
      module="airport"
      title={t('title')}
      description={t('description')}
      icon={Plane}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t('passengersProcessed')} value="12,453" icon={UserCheck} />
        <StatCard title={t('bagsScanned')} value="25,832" icon={BaggageClaim} />
        <StatCard title={t('securityAlerts')} value="3" icon={ShieldCheck} />
        <StatCard title={t('flightsMonitored')} value="128" icon={Plane} />
      </div>
       <div className="mt-8 grid gap-8 grid-cols-1">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            <div className="lg:col-span-3">
                <ThroughputChart data={mainDashboardData.throughput} />
            </div>
            <div className="lg:col-span-2">
                <RiskRuleTriggerChart data={mainDashboardData.riskRules} />
            </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
            <PassengerTypeChart data={passengerData.airport} />
            <AgeDistributionChart data={airportDashboardData.ageDistribution} />
        </div>
        
        <NationalityDistributionChart data={airportDashboardData.nationalityDistribution} />

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
