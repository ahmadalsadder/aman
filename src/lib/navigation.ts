import { Shield, LayoutDashboard, BarChart3, Users, Settings, Activity, Ship, LandPlot, Plane, DoorOpen } from 'lucide-react';
import type { Role, Module } from '@/types';

export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const allNavItems: Record<string, NavItem> = {
  dashboard: { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  monitoring: { href: '/', label: 'Real-time Monitoring', icon: Activity },
  analytics: { href: '/', label: 'Security Analytics', icon: BarChart3 },
  users: { href: '/', label: 'User Management', icon: Users },
  settings: { href: '/', label: 'System Settings', icon: Settings },
};

export const moduleNavItems: Record<Module, NavItem> = {
    airport: { href: '/airport', label: 'AirPort', icon: Plane },
    landport: { href: '/landport', label: 'Landport', icon: LandPlot },
    seaport: { href: '/seaport', label: 'SeaPort', icon: Ship },
    egate: { href: '/egate', label: 'E-Gate', icon: DoorOpen },
};

// Note: For this demo, all extra links point to /.
// In a real app, they would point to e.g., /monitoring.

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
