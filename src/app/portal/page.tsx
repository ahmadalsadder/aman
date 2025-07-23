'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getPortalNavItems } from '@/lib/navigation';
import { useTranslations } from 'next-intl';
import Logo from '@/components/logo';
import { Background } from '@/components/background';

export default function PortalSelectionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const tNav = useTranslations('Navigation');
  const t = useTranslations('PortalPage');

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const availableModules = getPortalNavItems(user.role, user.modules, tNav);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
       <Background />
       <div className="z-10 mb-8 text-center">
            <div className="mx-auto mb-4 inline-block">
                <Logo className="h-16 w-16" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-lg text-muted-foreground mt-2">{t('description', { name: user.name.split(' ')[0] })}</p>
        </div>
      <div className="z-10 grid w-full max-w-4xl gap-4 md:grid-cols-2 lg:grid-cols-3">
        {availableModules.map((item) => {
          const Icon = item.icon;
          return (
            <Card 
                key={item.href} 
                className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 bg-card/80 backdrop-blur-sm"
                onClick={() => router.push(item.href)}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">{item.label}</CardTitle>
                <Icon className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{t('cardDescription', { module: item.label })}</p>
                <div className="mt-4 flex items-center font-semibold text-primary">
                    <span>{t('openModule')}</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
       <div className="z-10 mt-8 text-center text-sm text-muted-foreground">
        <p>{t('notYourPortals')}</p>
      </div>
    </div>
  );
}
