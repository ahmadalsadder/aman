'use client';
import ModulePage from '@/components/module-page';
import { Ship } from 'lucide-react';
import SeaportDashboard from '../components/dashboard';

export default function SeaportDashboardPage() {
  return (
    <ModulePage
      module="seaport"
      title="SeaPort Dashboard"
      description="Manage and monitor all seaport operations."
      icon={Ship}
    >
        <SeaportDashboard />
    </ModulePage>
  );
}
