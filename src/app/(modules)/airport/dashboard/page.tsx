'use client';
import ModulePage from '@/components/module-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane, UserCheck, BaggageClaim, ShieldCheck } from 'lucide-react';
import AirportDashboard from '../components/dashboard';

export default function AirportDashboardPage() {
  return (
    <ModulePage
      module="airport"
      title="AirPort Dashboard"
      description="Real-time monitoring of all airport operations."
      icon={Plane}
    >
      <AirportDashboard />
    </ModulePage>
  );
}
