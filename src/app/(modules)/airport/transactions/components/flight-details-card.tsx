
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TripInformation } from '@/types/live-processing';
import { Plane } from 'lucide-react';
import { useTranslations } from 'next-intl';

const DetailItem = ({ label, value }: { label: string; value?: string | null }) => (
    <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm font-medium">{value || 'N/A'}</p></div>
);

export function FlightDetailsCard({ details }: { details: TripInformation }) {
    const t = useTranslations('Transactions');
    if (details.type !== 'airport') return null;

    return (
        <Card >
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Plane className="h-4 w-4" /> {t('flightDetails')}
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                <DetailItem label={t('flightNumber')} value={details.flightNumber} />
                <DetailItem label={t('carrier')} value={details.carrier} />
                <DetailItem label={t('departureCountry')} value={details.departureCountry} />
                <DetailItem label={t('seatNumber')} value={details.seatNumber} />
            </CardContent>
        </Card>
    );
}
