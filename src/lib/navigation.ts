
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

const allModules: Record<string, Omit<NavItem, 'label' | 'href'>> = {
  airport: { icon: Plane },
  landport: { icon: LandPlot },
  seaport: { icon: Ship },
  egate: { icon: DoorOpen },
  analyst: { icon: PieChart },
  'control-room': { icon: RadioTower },
  shiftsupervisor: { icon: UserCog }, // Note: This module doesn't have a dedicated page, but can be a logical grouping
};

const adminNavItems: Record<string, Omit<NavItem, 'label'>> = {
    users: { href: '/users', icon: Users },
    settings: { href: '/settings', icon: Settings },
};

const getModuleSubNav = (module: Module, t: any): NavItem[] => {
    const subNav: NavItem[] = [];
    const moduleBaseUrl = `/${module}`;

    subNav.push({
        href: `${moduleBaseUrl}/dashboard`,
        label: t('dashboard'),
        icon: LayoutDashboard,
        permission: `${module}:dashboard:view` as Permission,
    });
    
    if (['airport', 'landport', 'seaport'].includes(module)) {
        subNav.push({
            href: `${moduleBaseUrl}/transactions`, 
            label: t('transactions'),
            icon: ArrowRightLeft,
            permission: `${module}:transactions:view` as Permission,
        });

        subNav.push({
            href: `${moduleBaseUrl}/officer-desks`,
            label: t('officerDesks'),
            icon: Monitor,
            permission: `${module}:desks:view` as Permission,
        });
    }

    if (module === 'egate') {
        subNav.push({
            href: '/egate/gates',
            label: t('gateManagement'),
            icon: ClipboardList,
            permission: 'egate:records:view'
        });
    }

    if (['airport', 'landport', 'seaport', 'egate'].includes(module)) {
        subNav.push({
            href: `${moduleBaseUrl}/prediction`,
            label: t('predictiveAnalytics'),
            icon: BrainCircuit,
            permission: `${module}:prediction:view` as Permission,
        });
    }

     if (['airport', 'landport', 'seaport', 'control-room'].includes(module)) {
        subNav.push({
            href: '/duty-manager',
            label: t('dutyManager'),
            icon: ShieldAlert,
            permission: 'duty-manager:view',
        });
    }

    return subNav;
}


export const getSidebarNavItems = (role: Role, modules: Module[], t: any): NavItem[] => {
    const nav: NavItem[] = [];

    modules.forEach(moduleKey => {
        const moduleInfo = allModules[moduleKey];
        if (moduleInfo) {
            nav.push({
                ...moduleInfo,
                href: `/${moduleKey}`,
                label: t(moduleKey),
                permission: `${moduleKey}:dashboard:view` as Permission,
                children: getModuleSubNav(moduleKey, t)
            });
        }
    });
    
    // Add admin-specific items if the role is admin
    if (role === 'admin') {
         if (adminNavItems.users) {
            nav.push({ ...adminNavItems.users, href: `${adminNavItems.users.href}`, label: t('userManagement') });
         }
         if (adminNavItems.settings) {
            nav.push({ ...adminNavItems.settings, href: `${adminNavItems.settings.href}`, label: t('systemSettings') });
         }
    }

    return nav;
};
