
'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { getSidebarNavItems, type NavItem } from '@/lib/navigation';
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
import { ChevronDown, LogOut } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

export default function AppSidebar() {
  const { user, hasPermission, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('Navigation');

  const navItems = React.useMemo(() => {
    if (!user) return [];
    
    const allItems = getSidebarNavItems(user.role, user.modules, t);
    
    // Filter items based on permission
    return allItems.filter(module => {
      // If a module has children, check if any child has permission.
      if (module.children) {
        module.children = module.children.filter(child => !child.permission || hasPermission([child.permission]));
        // If after filtering, there are children left, the parent module should be visible.
        return module.children.length > 0;
      }
      // If no children, check permission on the module itself.
      return !module.permission || hasPermission([module.permission]);
    });

  }, [user, t, hasPermission]);
  
  const [openCollapsibles, setOpenCollapsibles] = React.useState<Record<string, boolean>>({});

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  React.useEffect(() => {
    const activeStates: Record<string, boolean> = {};
    const currentModulePath = `/${pathname.split('/')[1]}`;
    navItems.forEach(item => {
        if(item.href.startsWith(currentModulePath)) {
            activeStates[item.href] = true;
        }
    });
    setOpenCollapsibles(activeStates);
  }, [pathname, navItems]);

  const toggleCollapsible = (href: string) => {
    setOpenCollapsibles(prev => ({ ...prev, [href]: !prev[href] }));
  };

  const moduleDashboardHref = user?.modules?.[0] ? `/${user.modules[0]}/dashboard` : '/';

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
                    {item.children?.map(child => (
                        <SidebarMenuSubItem key={child.href}>
                            <SidebarMenuSubButton
                                asChild
                                isActive={pathname.startsWith(child.href)}
                            >
                                <Link href={child.href} className='flex items-center gap-2'>
                                    {child.icon && <child.icon className="h-4 w-4 text-primary" />}
                                    <span>{child.label}</span>
                                </Link>
                            </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                    ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} tooltip={{ children: t('logout') }}>
                    <LogOut />
                    <span>{t('logout')}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
       <SidebarSeparator />
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
