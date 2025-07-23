'use client';
import ModulePage from '@/components/module-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ship, Anchor, Warehouse, Container } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function SeaportDashboardPage() {
    const t = useTranslations('SeaportDashboard');
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
      module="seaport"
      title={t('title')}
      description={t('description')}
      icon={Ship}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t('vesselsInPort')} value="23" icon={Anchor} />
        <StatCard title={t('containersProcessed')} value="2,480" icon={Container} />
        <StatCard title={t('cargoThroughput')} value="15,600" icon={Warehouse} />
        <StatCard title={t('activeBerths')} value="6" icon={Ship} />
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
