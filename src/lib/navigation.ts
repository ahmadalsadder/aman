import { Shield, LayoutDashboard, BarChart3, Users, Settings, Activity, Ship, LandPlot, Plane, DoorOpen } from 'lucide-react';
import type { Role, Module } from '@/types';

export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

// Note: For this demo, all extra links point to /.
// In a real app, they would point to e.g., /monitoring.

export const getNavItems = (role: Role, modules: Module[], t: any): NavItem[] => {

  const allNavItems: Record<string, NavItem> = {
    dashboard: { href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    users: { href: '/', label: t('userManagement'), icon: Users },
    settings: { href: '/', label: t('systemSettings'), icon: Settings },
  };

  const moduleNavItems: Record<Module, NavItem> = {
      airport: { href: '/airport/dashboard', label: t('airport'), icon: Plane },
      landport: { href: '/landport/dashboard', label: t('landport'), icon: LandPlot },
      seaport: { href: '/seaport/dashboard', label: t('seaport'), icon: Ship },
      egate: { href: '/egate/dashboard', label: t('egate'), icon: DoorOpen },
  };

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
