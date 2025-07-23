'use client';
import ModulePage from '@/components/module-page';
import { LandPlot } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandportPage() {
  return (
    <ModulePage
      module="landport"
      title="Landport Module"
      description="Manage and monitor all landport operations."
      icon={LandPlot}
    >
        <div>
            <p className="mb-4">This is the main page for the Landport module. From here you can navigate to the different sections of this module.</p>
            <Button asChild>
                <Link href="/landport/dashboard">Go to Dashboard</Link>
            </Button>
        </div>
    </ModulePage>
  );
}
