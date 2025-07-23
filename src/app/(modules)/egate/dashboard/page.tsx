'use client';
import ModulePage from '@/components/module-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DoorOpen, Fingerprint, ShieldAlert, CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function EgateDashboardPage() {
    const t = useTranslations('EgateDashboard');
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
      module="egate"
      title={t('title')}
      description={t('description')}
      icon={DoorOpen}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t('successfulEntries')} value="8,210" icon={CheckCircle} />
        <StatCard title={t('failedAttempts')} value="14" icon={ShieldAlert} />
        <StatCard title={t('biometricVerifications')} value="8,224" icon={Fingerprint} />
        <StatCard title={t('activeGates')} value="24" icon={DoorOpen} />
      </div>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{t('welcome')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{t('contentPlaceholder')}</p>
        </CardContent>
      </Card>
    </ModulePage>
  );
}
