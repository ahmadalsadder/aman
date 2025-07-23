'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const t = useTranslations('HomePage');

  useEffect(() => {
    if (!loading) {
      if (user) {
         if (user.modules && user.modules.length > 1) {
          router.replace('/portal');
        } else if (user.modules && user.modules.length === 1) {
          router.replace(`/${user.modules[0]}`);
        } else {
          router.replace('/login'); // Or a 'no modules assigned' page
        }
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">{t('initializing')}</p>
    </div>
  );
}
