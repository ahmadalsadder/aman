'use client';
import * as React from 'react';
import ModulePage from '@/components/module-page';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LandPlot, Car, ScanText, UserSquare, Globe } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ThroughputChart } from '@/components/charts/throughput-chart';
import { RiskRuleTriggerChart } from '@/components/charts/risk-rule-trigger-chart';
import { WorldMapChart } from '@/components/charts/world-map-chart';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { TransactionOverviewChart } from '@/components/charts/transaction-overview-chart';

export default function LandportDashboardPage() {
    const t = useTranslations('LandportDashboard');
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
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

  return (
    <ModulePage
      module="landport"
      title={t('title')}
      description={t('description')}
      icon={LandPlot}
    >
      <div className="flex flex-col gap-8">
        {loading ? renderSkeleton() : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title={t('vehiclesProcessed')} value="4,589" icon={Car} />
            <StatCard title={t('travelersChecked')} value="7,123" icon={UserSquare} />
            <StatCard title={t('documentsScanned')} value="9,876" icon={ScanText} />
            <StatCard title={t('activeLanes')} value="8" icon={LandPlot} />
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
