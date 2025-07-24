
'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { getModuleNavItems, type NavItem } from '@/lib/navigation';
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

export default function AppSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const t = useTranslations('Navigation');

  const currentModule = pathname.split('/')[1] as any;
  const navItems = React.useMemo(() => {
    return user ? getModuleNavItems(currentModule, user.role, t) : [];
  }, [currentModule, user, t]);

  
  const [openCollapsibles, setOpenCollapsibles] = React.useState<Record<string, boolean>>({});

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  React.useEffect(() => {
    const activeStates: Record<string, boolean> = {};
    navItems.forEach(item => {
        if (item.children) {
            const isActive = item.children.some(child => pathname.startsWith(child.href));
            activeStates[item.href] = isActive;
        }
    });
    setOpenCollapsibles(activeStates);
  }, [pathname, navItems]);

  const toggleCollapsible = (href: string) => {
    setOpenCollapsibles(prev => ({ ...prev, [href]: !prev[href] }));
  };


  const shouldShowPortalsLink = user && user.modules && user.modules.length > 1;
  const moduleDashboardHref = currentModule ? `/${currentModule}/dashboard` : '/';

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
          {navItems.map((item: NavItem) => 
            item.children ? (
                <Collapsible key={item.href} open={openCollapsibles[item.href] || false} onOpenChange={() => toggleCollapsible(item.href)}>
                    <SidebarMenuItem>
                         <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                                tooltip={{ children: item.label }}
                                className="w-full justify-between"
                            >
                                <div className='flex items-center gap-2'>
                                    <item.icon />
                                    <span>{item.label}</span>
                                </div>
                                <ChevronDown className={cn("h-4 w-4 transition-transform", openCollapsibles[item.href] && "rotate-180")} />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                    </SidebarMenuItem>
                    <CollapsibleContent>
                        <SidebarMenuSub>
                        {item.children.map(child => (
                            <SidebarMenuSubItem key={child.href}>
                                <SidebarMenuSubButton
                                    asChild
                                    isActive={pathname.startsWith(child.href)}
                                >
                                    <Link href={child.href} className='flex items-center gap-2'>
                                        <child.icon className="h-4 w-4 text-primary" />
                                        <span>{child.label}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </Collapsible>
            ) : (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || (item.href !== moduleDashboardHref && pathname.startsWith(item.href))}
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
