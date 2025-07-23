'use client';
import { Shield, LayoutDashboard, BarChart3, Users, Settings, Activity, Ship, LandPlot, Plane, DoorOpen, PieChart, UserCog, RadioTower, Home } from 'lucide-react';
import type { Role, Module } from '@/types';

export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  children?: NavItem[];
}

const allModules: Record<Module, Omit<NavItem, 'label'>> = {
  dashboard: { href: '/dashboard', icon: LayoutDashboard },
  airport: { href: '/airport', icon: Plane },
  landport: { href: '/landport', icon: LandPlot },
  seaport: { href: '/seaport', icon: Ship },
  egate: { href: '/egate', icon: DoorOpen },
  analyst: { href: '/analyst', icon: PieChart },
  'gate-supervisor': { href: '/gate-supervisor', icon: UserCog },
  'control-room': { href: '/control-room', icon: RadioTower },
};

const adminNavItems: Record<string, Omit<NavItem, 'label'>> = {
    users: { href: '/users', icon: Users },
    settings: { href: '/settings', icon: Settings },
};

export const getPortalNavItems = (role: Role, modules: Module[], t: any): NavItem[] => {
    return modules
        .filter(m => allModules[m]) // Ensure module exists
        .map(m => ({
            ...allModules[m],
            label: t(m),
        }));
};

export const getModuleNavItems = (module: Module, role: Role, t: any): NavItem[] => {
    const baseNav: NavItem[] = [];

    // All modules get a dashboard
    if (allModules[module]) {
        baseNav.push({
            href: `${allModules[module].href}/dashboard`,
            label: t('dashboard'),
            icon: LayoutDashboard,
        });
    }

    // Future logic to add more module-specific items can go here.
    // For example:
    // if (module === 'airport') {
    //   baseNav.push({ href: '/airport/flights', label: 'Flights', icon: Plane });
    // }
    
    // Add admin-specific items if the role is admin
    if (role === 'admin') {
         if (adminNavItems.users) {
            baseNav.push({ ...adminNavItems.users, label: t('userManagement') });
         }
         if (adminNavItems.settings) {
            baseNav.push({ ...adminNavItems.settings, label: t('systemSettings') });
         }
    }

    return baseNav;
};
