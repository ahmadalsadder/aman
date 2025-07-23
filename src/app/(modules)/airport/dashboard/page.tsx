'use client';
import ModulePage from '@/components/module-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane, UserCheck, BaggageClaim, ShieldCheck } from 'lucide-react';
import PassengerTypeChart from '@/components/charts/passenger-type-chart';
import { passengerData } from '@/data/passenger-data';
import CreateRecordButton from '@/components/create-record-button';
import { useTranslations } from 'next-intl';

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
       <div className="mt-8 grid gap-8">
        <PassengerTypeChart data={passengerData.airport} />
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
