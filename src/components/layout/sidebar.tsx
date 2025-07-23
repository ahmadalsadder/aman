'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { getModuleNavItems, getPortalNavItems, type NavItem } from '@/lib/navigation';
import Logo from '@/components/logo';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';

export default function AppSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const t = useTranslations('Navigation');

  const currentModule = pathname.split('/')[1] as any;
  const navItems = user ? getModuleNavItems(currentModule, user.role, t) : [];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const shouldShowPortalsLink = user && user.modules && user.modules.length > 1;
  const moduleDashboardHref = currentModule ? `/${currentModule}` : '/';

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <Link href={moduleDashboardHref} className="flex items-center gap-2">
          <Logo />
          <span className="text-lg font-semibold tracking-tight">{t('title')}</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item: NavItem) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
                tooltip={{ children: item.label }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      {shouldShowPortalsLink && (
        <>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip={{ children: t('backToPortals') }}>
                        <Link href="/portal">
                            <ArrowLeft />
                            <span>{t('backToPortals')}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
            <SidebarSeparator />
        </>
      )}
      <SidebarFooter>
        {user && (
          <div className="flex items-center gap-2 p-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`https://i.pravatar.cc/40?u=${user.email}`} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-sm overflow-hidden">
                <span className="font-medium truncate">{user.name}</span>
                <span className="text-muted-foreground truncate">{user.email}</span>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
