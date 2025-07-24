
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TripInformation } from '@/types/live-processing';
import { Ship } from 'lucide-react';
import { useTranslations } from 'next-intl';

const DetailItem = ({ label, value }: { label: string; value?: string | null }) => (
    <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm font-medium">{value || 'N/A'}</p></div>
);

export function VesselDetailsCard({ details }: { details: TripInformation }) {
    const t = useTranslations('Transactions');
    if (details.type !== 'seaport') return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Ship className="h-4 w-4" /> {t('vesselDetails')}
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                <DetailItem label={t('vesselName')} value={details.vesselName} />
                <DetailItem label={t('voyageNumber')} value={details.voyageNumber} />
                <DetailItem label={t('berth')} value={details.berth} />
                <DetailItem label={t('lastPortOfCall')} value={details.lastPortOfCall} />
            </CardContent>
        </Card>
    );
}
