'use client';
import ModulePage from '@/components/module-page';
import { DoorOpen } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

export default function EgatePage() {
  const t = useTranslations('EgateModule');
  return (
    <ModulePage
      module="egate"
      title={t('title')}
      description={t('description')}
      icon={DoorOpen}
    >
      <div>
        <p className="mb-4">{t('mainPageMessage')}</p>
        <Button asChild>
          <Link href="/egate/dashboard">{t('goToDashboard')}</Link>
        </Button>
      </div>
    </ModulePage>
  );
}
