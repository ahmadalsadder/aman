'use client';
import ModulePage from '@/components/module-page';
import { DoorOpen } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function EgatePage() {
  return (
    <ModulePage
      module="egate"
      title="E-Gate Module"
      description="Manage and monitor all E-Gate operations."
      icon={DoorOpen}
    >
      <div>
        <p className="mb-4">This is the main page for the E-Gate module. From here you can navigate to the different sections of this module.</p>
        <Button asChild>
          <Link href="/egate/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </ModulePage>
  );
}
