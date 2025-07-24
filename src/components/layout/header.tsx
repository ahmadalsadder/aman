
'use client';

import { LogOut, User as UserIcon, Globe, Zap, RadioTower } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import type { Module, Permission } from '@/types';
import { cn } from '@/lib/utils';

export default function Header() {
  const { user, logout, hasPermission } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('Header');

  const [currentLocale, setCurrentLocale] = React.useState('en');
  
  const currentModule = pathname.split('/')[1] as Module;

  const showQuickActions = ['airport', 'landport', 'seaport', 'shiftsupervisor', 'gate-supervisor'].includes(currentModule);
  const canProcessLive = React.useMemo(() => hasPermission([`${currentModule}:transactions:live` as Permission]), [hasPermission, currentModule]);


  React.useEffect(() => {
    const handleLocaleChange = (event: CustomEvent) => {
      setCurrentLocale(event.detail);
    };
    window.addEventListener('locale-changed', handleLocaleChange as EventListener);
    // Set initial value
    const storedLocale = localStorage.getItem('locale') || 'en';
    setCurrentLocale(storedLocale);
    return () => window.removeEventListener('locale-changed', handleLocaleChange as EventListener);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleLocaleChange = (locale: string) => {
    localStorage.setItem('locale', locale);
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="flex items-center">
        <div className="md:hidden">
            <SidebarTrigger />
        </div>
      </div>
      <div className="flex items-center gap-4">
        {showQuickActions && canProcessLive && (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <Zap className="mr-2 h-4 w-4 text-green-500 animate-pulse" />
                        Quick Actions
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem asChild>
                        <Link href={`/${currentModule}/transactions/live-processing`} className="flex items-center gap-2">
                           <RadioTower className="h-4 w-4 text-primary animate-pulse" />
                           <span>Live Processing</span>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Globe className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>{t('language')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={currentLocale} onValueChange={handleLocaleChange}>
              <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="es">Español</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="ar">العربية</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`https://i.pravatar.cc/40?u=${user.email}`} alt={user.name} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>{t('profile')}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
