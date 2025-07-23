'use client';
import ModulePage from '@/components/module-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane } from 'lucide-react';

export default function AirportPage() {
  return (
    <ModulePage
      module="airport"
      title="AirPort"
      description="Manage and monitor all airport operations."
      icon={Plane}
    >
      <Card>
        <CardHeader>
          <CardTitle>Welcome to the AirPort Module</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is where airport-specific content and features would be displayed.</p>
        </CardContent>
      </Card>
    </ModulePage>
  );
}
