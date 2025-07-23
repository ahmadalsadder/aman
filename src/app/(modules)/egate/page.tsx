'use client';
import ModulePage from '@/components/module-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DoorOpen, Fingerprint, ShieldAlert, CheckCircle } from 'lucide-react';

export default function EgatePage() {
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
      title="E-Gate Dashboard"
      description="Manage and monitor all E-Gate operations."
      icon={DoorOpen}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Successful Entries" value="8,210" icon={CheckCircle} />
        <StatCard title="Failed Attempts" value="14" icon={ShieldAlert} />
        <StatCard title="Biometric Verifications" value="8,224" icon={Fingerprint} />
        <StatCard title="Active Gates" value="24" icon={DoorOpen} />
      </div>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Welcome to the E-Gate Module</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is where E-Gate-specific content and features would be displayed.</p>
        </CardContent>
      </Card>
    </ModulePage>
  );
}
