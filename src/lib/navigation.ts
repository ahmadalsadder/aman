import { Shield, LayoutDashboard, BarChart3, Users, Settings, Activity, Ship, LandPlot, Plane, DoorOpen } from 'lucide-react';
import type { Role, Module } from '@/types';

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

export const moduleNavItems: Record<Module, NavItem> = {
    airport: { href: '/dashboard/airport', label: 'AirPort', icon: Plane },
    landport: { href: '/dashboard/landport', label: 'Landport', icon: LandPlot },
    seaport: { href: '/dashboard/seaport', label: 'SeaPort', icon: Ship },
    egate: { href: '/dashboard/egate', label: 'E-Gate', icon: DoorOpen },
};

// Note: For this demo, all extra links point to /dashboard.
// In a real app, they would point to e.g., /dashboard/monitoring.

export const getNavItems = (role: Role, modules: Module[]): NavItem[] => {
  let items: NavItem[] = [allNavItems.dashboard];
  
  // Add module-specific nav items
  modules.forEach(module => {
    if (moduleNavItems[module]) {
      items.push(moduleNavItems[module]);
    }
  });

  if (role === 'admin') {
    items.push(allNavItems.users, allNavItems.settings);
  }

  return items;
};
