
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Transaction } from '@/types/live-processing';
import { IdCard } from 'lucide-react';
import { useTranslations } from 'next-intl';

const DetailItem = ({ label, value, children }: { label: string; value?: string | number | null; children?: React.ReactNode }) => (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      {value != null && <p className="text-sm font-medium">{value}</p>}
      {children}
    </div>
  );

export function CivilRecordCard({ transaction }: { transaction: Transaction }) {
    const t = useTranslations('Transactions');
    if (!transaction.civilInformation) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <IdCard className="h-4 w-4" /> {t('civilRecord')}
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                <DetailItem label={t('civilFileType')} value={transaction.civilInformation.fileType} />
                <DetailItem label={t('civilFileNumber')} value={transaction.civilInformation.fileNumber} />
                <DetailItem label={t('civilNationalId')} value={transaction.civilInformation.nationalId} />
                <DetailItem label={t('civilFileExpiry')} value={transaction.civilInformation.fileExpiryDate} />
            </CardContent>
        </Card>
    );
}
