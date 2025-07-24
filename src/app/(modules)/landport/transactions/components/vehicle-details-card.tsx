
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TripInformation } from '@/types/live-processing';
import { Car } from 'lucide-react';
import { useTranslations } from 'next-intl';

const DetailItem = ({ label, value }: { label: string; value?: string | null }) => (
    <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm font-medium">{value || 'N/A'}</p></div>
);

export function VehicleDetailsCard({ details }: { details: TripInformation }) {
    const t = useTranslations('Transactions');
    if (details.type !== 'landport') return null;

    return (
        <Card >
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Car className="h-4 w-4" /> {t('vehicleDetails')}
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                <DetailItem label={t('plateNumber')} value={details.vehiclePlateNumber} />
                <DetailItem label={t('vehicleType')} value={details.vehicleType} />
                <DetailItem label={t('make')} value={details.vehicleMake} />
                <DetailItem label={t('laneNumber')} value={details.laneNumber} />
            </CardContent>
        </Card>
    );
}
