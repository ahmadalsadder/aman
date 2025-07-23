'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LandPlot, Car, ScanText, UserSquare } from 'lucide-react';

export default function LandportDashboard() {
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
        <StatCard title="Vehicles Processed" value="4,589" icon={Car} />
        <StatCard title="Travelers Checked" value="7,123" icon={UserSquare} />
        <StatCard title="Documents Scanned" value="9,876" icon={ScanText} />
        <StatCard title="Active Lanes" value="8" icon={LandPlot} />
      </div>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Welcome to the Landport Module</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is where landport-specific content and features would be displayed.</p>
        </CardContent>
      </Card>
    </>
  );
}
