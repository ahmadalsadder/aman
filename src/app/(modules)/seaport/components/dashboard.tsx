'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ship, Anchor, Warehouse, Container } from 'lucide-react';

export default function SeaportDashboard() {
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
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Vessels in Port" value="23" icon={Anchor} />
        <StatCard title="Containers Processed" value="2,480" icon={Container} />
        <StatCard title="Cargo Throughput (Tons)" value="15,600" icon={Warehouse} />
        <StatCard title="Active Berths" value="6" icon={Ship} />
      </div>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Welcome to the SeaPort Module</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is where seaport-specific content and features would be displayed.</p>
        </CardContent>
      </Card>
    </>
  );
}
