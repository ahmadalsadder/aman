'use client';
import ModulePage from '@/components/module-page';
import { Ship } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SeaportPage() {
  return (
    <ModulePage
      module="seaport"
      title="SeaPort Module"
      description="Manage and monitor all seaport operations."
      icon={Ship}
    >
        <div>
            <p className="mb-4">This is the main page for the SeaPort module. From here you can navigate to the different sections of this module.</p>
            <Button asChild>
                <Link href="/seaport/dashboard">Go to Dashboard</Link>
            </Button>
        </div>
    </ModulePage>
  );
}
