'use client';
import ModulePage from '@/components/module-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LandPlot } from 'lucide-react';

export default function LandportPage() {
  return (
    <ModulePage
      module="landport"
      title="Landport"
      description="Manage and monitor all landport operations."
      icon={LandPlot}
    >
      <Card>
        <CardHeader>
          <CardTitle>Welcome to the Landport Module</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is where landport-specific content and features would be displayed.</p>
        </CardContent>
      </Card>
    </ModulePage>
  );
}
