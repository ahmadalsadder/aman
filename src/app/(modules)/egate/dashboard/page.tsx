'use client';
import ModulePage from '@/components/module-page';
import { DoorOpen } from 'lucide-react';
import EgateDashboard from '../components/dashboard';

export default function EgateDashboardPage() {
  return (
    <ModulePage
      module="egate"
      title="E-Gate Dashboard"
      description="Manage and monitor all E-Gate operations."
      icon={DoorOpen}
    >
      <EgateDashboard />
    </ModulePage>
  );
}
