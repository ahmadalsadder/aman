'use client';
import { Shield, LayoutDashboard, BarChart3, Users, Settings, Activity, Ship, LandPlot, Plane, DoorOpen } from 'lucide-react';
import type { Role, Module } from '@/types';

export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

export const getNavItems = (role: Role, modules: Module[], t: any): NavItem[] => {

  const allNavItems: Record<string, NavItem> = {
    dashboard: { href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    users: { href: '/dashboard', label: t('userManagement'), icon: Users },
    settings: { href: '/dashboard', label: t('systemSettings'), icon: Settings },
  };

  const moduleNavItems: Record<Module, NavItem> = {
      airport: { href: '/airport', label: t('airport'), icon: Plane },
      landport: { href: '/landport', label: t('landport'), icon: LandPlot },
      seaport: { href: '/seaport', label: t('seaport'), icon: Ship },
      egate: { href: '/egate', label: t('egate'), icon: DoorOpen },
  };

  let items: NavItem[] = [];

  if (role === 'admin') {
    items.push(allNavItems.dashboard);
  }
  
  const sortedModules = modules.sort();
  sortedModules.forEach(module => {
    if (moduleNavItems[module]) {
      items.push(moduleNavItems[module]);
    }
  });

  if (role === 'admin') {
    items.push(allNavItems.users, allNavItems.settings);
  }

  return items;
};
