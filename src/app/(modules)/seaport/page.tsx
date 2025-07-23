'use client';
import * as React from 'react';
import ModulePage from '@/components/module-page';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Ship, Anchor, Warehouse, Container, Globe } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ThroughputChart } from '@/components/charts/throughput-chart';
import { RiskRuleTriggerChart } from '@/components/charts/risk-rule-trigger-chart';
import { WorldMapChart } from '@/components/charts/world-map-chart';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';


export default function SeaportDashboardPage() {
    const t = useTranslations('SeaportDashboard');
    const [data, setData] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const result = await api.get('/dashboard/main');
            if (result.isSuccess) {
                setData(result.data);
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
      module="seaport"
      title={t('title')}
      description={t('description')}
      icon={Ship}
    >
        <div className="flex flex-col gap-8">
            {loading ? renderSkeleton() : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title={t('vesselsInPort')} value="23" icon={Anchor} />
                <StatCard title={t('containersProcessed')} value="2,480" icon={Container} />
                <StatCard title={t('cargoThroughput')} value="15,600" icon={Warehouse} />
                <StatCard title={t('activeBerths')} value="6" icon={Ship} />
            </div>
            )}
            
            {loading || !data ? (
                <Skeleton className="h-[400px] w-full" />
            ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                <div className="lg:col-span-3">
                    <ThroughputChart data={data.throughput} />
                </div>
                <div className="lg:col-span-2">
                    <RiskRuleTriggerChart data={data.riskRules} />
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
                    <WorldMapChart data={data.nationalityDistribution} />
                </CardContent>
            </Card>
            )}
        </div>
    </ModulePage>
  );
}
