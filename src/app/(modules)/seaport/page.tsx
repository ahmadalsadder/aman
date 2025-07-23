'use client';
import ModulePage from '@/components/module-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ship } from 'lucide-react';

export default function SeaportPage() {
  return (
    <ModulePage
      module="seaport"
      title="SeaPort"
      description="Manage and monitor all seaport operations."
      icon={Ship}
    >
      <Card>
        <CardHeader>
          <CardTitle>Welcome to the SeaPort Module</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is where seaport-specific content and features would be displayed.</p>
        </CardContent>
      </Card>
    </ModulePage>
  );
}
