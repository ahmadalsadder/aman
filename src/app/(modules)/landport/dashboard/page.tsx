'use client';
import ModulePage from '@/components/module-page';
import { LandPlot } from 'lucide-react';
import LandportDashboard from '../components/dashboard';

export default function LandportDashboardPage() {
  return (
    <ModulePage
      module="landport"
      title="Landport Dashboard"
      description="Manage and monitor all landport operations."
      icon={LandPlot}
    >
      <LandportDashboard />
    </ModulePage>
  );
}
