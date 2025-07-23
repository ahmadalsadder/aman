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
        <div>
            <p className="mb-4">{t('mainPageMessage')}</p>
            <Button asChild>
                <Link href="/landport/dashboard">{t('goToDashboard')}</Link>
            </Button>
        </div>
    </ModulePage>
  );
}
