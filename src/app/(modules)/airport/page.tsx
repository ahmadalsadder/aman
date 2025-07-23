'use client';
import ModulePage from '@/components/module-page';
import { Plane } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AirportPage() {
  return (
    <ModulePage
      module="airport"
      title="AirPort Module"
      description="Manage and monitor all airport operations."
      icon={Plane}
    >
        <div>
            <p className="mb-4">This is the main page for the AirPort module. From here you can navigate to the different sections of this module.</p>
            <Button asChild>
                <Link href="/airport/dashboard">Go to Dashboard</Link>
            </Button>
        </div>
    </ModulePage>
  );
}
