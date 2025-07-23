'use client';
import ModulePage from '@/components/module-page';
import { Ship } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

export default function SeaportPage() {
  const t = useTranslations('SeaportModule');
  return (
    <ModulePage
      module="seaport"
      title={t('title')}
      description={t('description')}
      icon={Ship}
    >
        <div className="flex flex-col gap-4">
            <p className="mb-4">{t('mainPageMessage')}</p>
             <div className="flex gap-4">
                <Button asChild>
                    <Link href="/seaport/dashboard">{t('goToDashboard')}</Link>
                </Button>
                 <Button asChild variant="outline">
                    <Link href="/">{t('goToAnalytics')}</Link>
                </Button>
            </div>
        </div>
    </ModulePage>
  );
}
