'use client';
import ModulePage from '@/components/module-page';
import { LandPlot } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

export default function LandportPage() {
  const t = useTranslations('LandportModule');
  return (
    <ModulePage
      module="landport"
      title={t('title')}
      description={t('description')}
      icon={LandPlot}
    >
        <div className="flex flex-col gap-4">
            <p className="mb-4">{t('mainPageMessage')}</p>
             <div className="flex gap-4">
                <Button asChild>
                    <Link href="/landport/dashboard">{t('goToDashboard')}</Link>
                </Button>
                 <Button asChild variant="outline">
                    <Link href="/">{t('goToAnalytics')}</Link>
                </Button>
            </div>
        </div>
    </ModulePage>
  );
}
