'use client';
import ModulePage from '@/components/module-page';
import { PieChart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

export default function AnalystPage() {
  const t = useTranslations('AnalystModule');
  return (
    <ModulePage
      module="analyst"
      title={t('title')}
      description={t('description')}
      icon={PieChart}
    >
        <div className="flex flex-col gap-4">
            <p className="mb-4">{t('mainPageMessage')}</p>
             <div className="flex gap-4">
                <Button asChild>
                    <Link href="/analyst/dashboard">{t('goToDashboard')}</Link>
                </Button>
                 <Button asChild variant="outline">
                    <Link href="/">{t('goToAnalytics')}</Link>
                </Button>
            </div>
        </div>
    </ModulePage>
  );
}
