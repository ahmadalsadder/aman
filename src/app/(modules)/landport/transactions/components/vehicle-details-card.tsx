
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TripInformation } from '@/types/live-processing';
import { Car } from 'lucide-react';

const DetailItem = ({ label, value }: { label: string; value?: string | null }) => (
    <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm font-medium">{value || 'N/A'}</p></div>
);

export function VehicleDetailsCard({ details }: { details: TripInformation }) {
    if (details.type !== 'landport') return null;

    return (
        <Card className="bg-secondary/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Car className="h-4 w-4" /> Vehicle Details
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                <DetailItem label="Plate Number" value={details.vehiclePlateNumber} />
                <DetailItem label="Vehicle Type" value={details.vehicleType} />
                <DetailItem label="Make" value={details.vehicleMake} />
                <DetailItem label="Lane Number" value={details.laneNumber} />
            </CardContent>
        </Card>
    );
}
