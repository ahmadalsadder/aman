'use client';
import ModulePage from '@/components/module-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LandPlot, Car, ScanText, UserSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function LandportDashboardPage() {
    const t = useTranslations('LandportDashboard');
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
      module="landport"
      title={t('title')}
      description={t('description')}
      icon={LandPlot}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t('vehiclesProcessed')} value="4,589" icon={Car} />
        <StatCard title={t('travelersChecked')} value="7,123" icon={UserSquare} />
        <StatCard title={t('documentsScanned')} value="9,876" icon={ScanText} />
        <StatCard title={t('activeLanes')} value="8" icon={LandPlot} />
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
