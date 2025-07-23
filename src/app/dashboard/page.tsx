'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, ShieldAlert, Wifi, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import type { Result } from '@/types/api/contracts';

interface DashboardStats {
  totalAnomalies: number;
  monitoredEndpoints: number;
  uptimePercentage: number;
}

export default function DashboardPage() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [testingAnomaly, setTestingAnomaly] = React.useState(false);

  React.useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      const result: Result<DashboardStats> = await api('/dashboard/stats');
      if (result.isSuccess && result.data) {
        setStats(result.data);
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  const handleTestAnomaly = async () => {
    setTestingAnomaly(true);
    await api('/dashboard/stats-error');
    setTestingAnomaly(false);
  };

  const StatCard = ({ title, value, icon: Icon, isLoading }: { title: string; value: string | number; icon: React.ElementType, isLoading: boolean }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? <div className="h-8 w-1/2 animate-pulse rounded-md bg-muted" /> : <div className="text-2xl font-bold">{value}</div> }
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your system's security and performance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard isLoading={loading} title="Anomalies Detected (24h)" value={stats?.totalAnomalies ?? 0} icon={ShieldAlert} />
        <StatCard isLoading={loading} title="Monitored Endpoints" value={stats?.monitoredEndpoints ?? 0} icon={BarChart3} />
        <StatCard isLoading={loading} title="System Uptime" value={`${stats?.uptimePercentage ?? 100}%`} icon={Wifi} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Anomaly Detection</CardTitle>
          <p className="text-muted-foreground">
            Our system uses GenAI to flag suspicious API responses. Click the button below to simulate an API call that returns an edge-case response.
          </p>
        </CardHeader>
        <CardContent>
          <Button onClick={handleTestAnomaly} disabled={testingAnomaly}>
            {testingAnomaly ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              'Trigger Test Anomaly'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
