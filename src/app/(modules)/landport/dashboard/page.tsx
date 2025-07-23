'use client';
import ModulePage from '@/components/module-page';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LandPlot, Car, ScanText, UserSquare, Globe } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ThroughputChart } from '@/components/charts/throughput-chart';
import { RiskRuleTriggerChart } from '@/components/charts/risk-rule-trigger-chart';
import { WorldMapChart } from '@/components/charts/world-map-chart';
import { mainDashboardData } from '@/data/dashboard-data';

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
      <div className="flex flex-col gap-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title={t('vehiclesProcessed')} value="4,589" icon={Car} />
            <StatCard title={t('travelersChecked')} value="7,123" icon={UserSquare} />
            <StatCard title={t('documentsScanned')} value="9,876" icon={ScanText} />
            <StatCard title={t('activeLanes')} value="8" icon={LandPlot} />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            <div className="lg:col-span-3">
                <ThroughputChart data={mainDashboardData.throughput} />
            </div>
            <div className="lg:col-span-2">
                <RiskRuleTriggerChart data={mainDashboardData.riskRules} />
            </div>
        </div>

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
                <WorldMapChart data={mainDashboardData.nationalityDistribution} />
            </CardContent>
        </Card>
      </div>
    </ModulePage>
  );
}
