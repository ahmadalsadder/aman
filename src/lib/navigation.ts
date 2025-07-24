

'use client';
import { Shield, LayoutDashboard, BarChart3, Users, Settings, Activity, Ship, LandPlot, DoorOpen, PieChart, UserCog, RadioTower, Home, Plane, ArrowRightLeft } from 'lucide-react';
import type { Role, Module } from '@/types';

export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  children?: NavItem[];
}

const allModules: Record<Module, Omit<NavItem, 'label'>> = {
  dashboard: { href: '/dashboard', icon: LayoutDashboard },
  airport: { href: '/airport/dashboard', icon: Plane },
  landport: { href: '/landport/dashboard', icon: LandPlot },
  seaport: { href: '/seaport/dashboard', icon: Ship },
  egate: { href: '/egate/dashboard', icon: DoorOpen },
  analyst: { href: '/analyst/dashboard', icon: PieChart },
  'shiftsupervisor': { href: '/gate-supervisor/dashboard', icon: UserCog },
  'control-room': { href: '/control-room/dashboard', icon: RadioTower },
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
    const moduleBaseUrl = `/${module}`;

    // All modules get a dashboard
    baseNav.push({
        href: `${moduleBaseUrl}/dashboard`,
        label: t('dashboard'),
        icon: LayoutDashboard,
    });
    
    // Add transaction processing for specific modules
    if (['airport', 'landport', 'seaport', 'shiftsupervisor', 'gate-supervisor'].includes(module)) {
        baseNav.push({
            href: `${moduleBaseUrl}/transactions`, 
            label: t('transactions'),
            icon: ArrowRightLeft,
            children: [
                {
                    href: `${moduleBaseUrl}/transactions`,
                    label: t('allTransactions'),
                    icon: Activity,
                },
                {
                    href: `${moduleBaseUrl}/transactions/live-processing`,
                    label: t('liveProcessing'),
                    icon: RadioTower,
                }
            ]
        });
    }

    // Add admin-specific items if the role is admin
    if (role === 'admin') {
         if (adminNavItems.users) {
            baseNav.push({ ...adminNavItems.users, href: `${moduleBaseUrl}${adminNavItems.users.href}`, label: t('userManagement') });
         }
         if (adminNavItems.settings) {
            baseNav.push({ ...adminNavItems.settings, href: `${moduleBaseUrl}${adminNavItems.settings.href}`, label: t('systemSettings') });
         }
    }

    return baseNav;
};
