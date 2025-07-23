'use client';
import ModulePage from '@/components/module-page';
import { Plane } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

export default function AirportPage() {
  const t = useTranslations('AirportModule');
  return (
    <ModulePage
      module="airport"
      title={t('title')}
      description={t('description')}
      icon={Plane}
    >
        <div>
            <p className="mb-4">{t('mainPageMessage')}</p>
            <Button asChild>
                <Link href="/airport/dashboard">{t('goToDashboard')}</Link>
            </Button>
        </div>
    </ModulePage>
  );
}
