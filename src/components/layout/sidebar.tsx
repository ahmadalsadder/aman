
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
    
    // Correctly filter modules based on whether the user has permission for the module
    // itself OR any of its children.
    return allItems.filter(module => {
      // If user has permission for the top-level module link, show it.
      if (module.permission && hasPermission([module.permission])) {
        return true;
      }
      // If the module has children, check if the user has permission for ANY of them.
      if (module.children) {
        // First, filter the children themselves.
        const permittedChildren = module.children.filter(child => {
            if (child.children) { // Handle nested children
                 child.children = child.children.filter(subChild => !subChild.permission || hasPermission([subChild.permission]));
                 return child.children.length > 0;
            }
            return !child.permission || hasPermission([child.permission]);
        });
        module.children = permittedChildren;
        // Then, if any children remain, the parent module should be visible.
        return module.children.length > 0;
      }
      // If no permission is set on the module and it has no children, show it by default.
      if (!module.permission && !module.children) {
        return true;
      }
      // Otherwise, hide it.
      return false;
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
    const pathSegments = pathname.split('/');
    if (pathSegments.length > 2) {
      const currentModulePath = `/${pathSegments[1]}`;
       navItems.forEach(item => {
        if(item.href === currentModulePath) {
            activeStates[item.href] = true;
        }
    });
    }
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
                             {child.children ? (
                                 <Collapsible>
                                     <CollapsibleTrigger asChild>
                                        <SidebarMenuSubButton className="justify-between">
                                             <div className="flex items-center gap-2">
                                                {child.icon && <child.icon className="h-4 w-4 text-primary" />}
                                                <span>{child.label}</span>
                                            </div>
                                             <ChevronDown className="h-4 w-4" />
                                        </SidebarMenuSubButton>
                                     </CollapsibleTrigger>
                                     <CollapsibleContent>
                                         <SidebarMenuSub>
                                             {child.children.map(subChild => (
                                                 <SidebarMenuSubItem key={subChild.href}>
                                                     <SidebarMenuSubButton asChild isActive={pathname.startsWith(subChild.href)}>
                                                         <Link href={subChild.href} className='flex items-center gap-2 pl-4'>
                                                            {subChild.icon && <subChild.icon className="h-4 w-4 text-primary" />}
                                                            <span>{subChild.label}</span>
                                                         </Link>
                                                     </SidebarMenuSubButton>
                                                 </SidebarMenuSubItem>
                                             ))}
                                         </SidebarMenuSub>
                                     </CollapsibleContent>
                                 </Collapsible>
                             ) : (
                                <SidebarMenuSubButton
                                    asChild
                                    isActive={pathname.startsWith(child.href)}
                                >
                                    <Link href={child.href} className='flex items-center gap-2'>
                                        {child.icon && <child.icon className="h-4 w-4 text-primary" />}
                                        <span>{child.label}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                             )}
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
