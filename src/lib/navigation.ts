import { Shield, LayoutDashboard, BarChart3, Users, Settings, Activity } from 'lucide-react';
import type { Role } from '@/types';

export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const allNavItems: Record<string, NavItem> = {
  dashboard: { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  monitoring: { href: '/dashboard', label: 'Real-time Monitoring', icon: Activity },
  analytics: { href: '/dashboard', label: 'Security Analytics', icon: BarChart3 },
  users: { href: '/dashboard', label: 'User Management', icon: Users },
  settings: { href: '/dashboard', label: 'System Settings', icon: Settings },
};

// Note: For this demo, all extra links point to /dashboard.
// In a real app, they would point to e.g., /dashboard/monitoring.

export const getNavItems = (role: Role): NavItem[] => {
  switch (role) {
    case 'admin':
      return [
        allNavItems.dashboard,
        allNavItems.monitoring,
        allNavItems.analytics,
        allNavItems.users,
        allNavItems.settings,
      ];
    case 'auditor':
      return [
        allNavItems.dashboard,
        allNavItems.monitoring,
        allNavItems.analytics,
      ];
    case 'viewer':
      return [allNavItems.dashboard];
    default:
      return [];
  }
};
