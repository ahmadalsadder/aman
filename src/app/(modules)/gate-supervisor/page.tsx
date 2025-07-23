'use client';
import ModulePage from '@/components/module-page';
import { UserCog } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

export default function GateSupervisorPage() {
  const t = useTranslations('GateSupervisorModule');
  return (
    <ModulePage
      module="gate-supervisor"
      title={t('title')}
      description={t('description')}
      icon={UserCog}
    >
        <div className="flex flex-col gap-4">
            <p className="mb-4">{t('mainPageMessage')}</p>
             <div className="flex gap-4">
                <Button asChild>
                    <Link href="/gate-supervisor/dashboard">{t('goToDashboard')}</Link>
                </Button>
                 <Button asChild variant="outline">
                    <Link href="/">{t('goToAnalytics')}</Link>
                </Button>
            </div>
        </div>
    </ModulePage>
  );
}
