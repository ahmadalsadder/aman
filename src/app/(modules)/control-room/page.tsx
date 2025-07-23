'use client';
import ModulePage from '@/components/module-page';
import { RadioTower } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

export default function ControlRoomPage() {
  const t = useTranslations('ControlRoomModule');
  return (
    <ModulePage
      module="control-room"
      title={t('title')}
      description={t('description')}
      icon={RadioTower}
    >
        <div className="flex flex-col gap-4">
            <p className="mb-4">{t('mainPageMessage')}</p>
             <div className="flex gap-4">
                <Button asChild>
                    <Link href="/control-room/dashboard">{t('goToDashboard')}</Link>
                </Button>
                 <Button asChild variant="outline">
                    <Link href="/">{t('goToAnalytics')}</Link>
                </Button>
            </div>
        </div>
    </ModulePage>
  );
}
