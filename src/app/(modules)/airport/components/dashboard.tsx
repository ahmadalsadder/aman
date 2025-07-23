'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane, UserCheck, BaggageClaim, ShieldCheck } from 'lucide-react';

export default function AirportDashboard() {
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
        <StatCard title="Passengers Processed" value="12,453" icon={UserCheck} />
        <StatCard title="Bags Scanned" value="25,832" icon={BaggageClaim} />
        <StatCard title="Security Alerts" value="3" icon={ShieldCheck} />
        <StatCard title="Flights Monitored" value="128" icon={Plane} />
      </div>
       <Card className="mt-8">
        <CardHeader>
          <CardTitle>Welcome to the AirPort Module</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is where airport-specific content and features would be displayed.</p>
        </CardContent>
      </Card>
    </>
  );
}
