
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TripInformation } from '@/types/live-processing';
import { Ship } from 'lucide-react';

const DetailItem = ({ label, value }: { label: string; value?: string | null }) => (
    <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm font-medium">{value || 'N/A'}</p></div>
);

export function VesselDetailsCard({ details }: { details: TripInformation }) {
    if (details.type !== 'seaport') return null;

    return (
        <Card className="bg-secondary/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Ship className="h-4 w-4" /> Vessel Details
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                <DetailItem label="Vessel Name" value={details.vesselName} />
                <DetailItem label="Voyage Number" value={details.voyageNumber} />
                <DetailItem label="Berth" value={details.berth} />
                <DetailItem label="Last Port of Call" value={details.lastPortOfCall} />
            </CardContent>
        </Card>
    );
}
