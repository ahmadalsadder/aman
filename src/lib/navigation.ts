

'use client';
import { Shield, LayoutDashboard, BarChart3, Users, Settings, Activity, Ship, LandPlot, DoorOpen, PieChart, UserCog, RadioTower, Home, Plane, ArrowRightLeft, Monitor, ClipboardList, AlertTriangle, ShieldAlert, BrainCircuit } from 'lucide-react';
import type { Role, Module, Permission } from '@/types';

export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  children?: NavItem[];
  permission?: Permission;
}

const allModules: Record<string, Omit<NavItem, 'label'>> = {
  dashboard: { href: '/dashboard', icon: LayoutDashboard },
  airport: { href: '/airport/dashboard', icon: Plane },
  landport: { href: '/landport/dashboard', icon: LandPlot },
  seaport: { href: '/seaport/dashboard', icon: Ship },
  egate: { href: '/egate/dashboard', icon: DoorOpen },
  analyst: { href: '/analyst/dashboard', icon: PieChart },
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
        permission: `${module}:dashboard:view` as Permission,
    });
    
    // Add transaction processing for specific modules
    if (['airport', 'landport', 'seaport'].includes(module)) {
        baseNav.push({
            href: `${moduleBaseUrl}/transactions`, 
            label: t('transactions'),
            icon: ArrowRightLeft,
            permission: `${module}:transactions:view` as Permission,
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
                    permission: `${module}:transactions:live` as Permission,
                }
            ]
        });

        baseNav.push({
            href: `${moduleBaseUrl}/officer-desks`,
            label: t('officerDesks'),
            icon: Monitor,
            permission: `${module}:desks:view` as Permission,
        });
    }

    if (module === 'egate') {
        baseNav.push({
            href: '/egate/gates',
            label: t('gateManagement'),
            icon: ClipboardList,
            permission: 'egate:records:view'
        });
    }

    if (['airport', 'landport', 'seaport', 'egate'].includes(module)) {
        baseNav.push({
            href: `${moduleBaseUrl}/prediction`,
            label: t('predictiveAnalytics'),
            icon: BrainCircuit,
            permission: `${module}:dashboard:forecasts:view` as Permission,
        });
    }

    if (['airport', 'landport', 'seaport', 'control-room'].includes(module)) {
        baseNav.push({
            href: '/duty-manager',
            label: t('dutyManager'),
            icon: ShieldAlert,
            permission: 'duty-manager:view',
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
