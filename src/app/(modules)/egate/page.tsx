'use client';
import ModulePage from '@/components/module-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DoorOpen } from 'lucide-react';

export default function EgatePage() {
  return (
    <ModulePage
      module="egate"
      title="E-Gate"
      description="Manage and monitor all E-Gate operations."
      icon={DoorOpen}
    >
      <Card>
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
