
'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import type { Zone } from '@/types/configuration';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from 'next-intl';

const DetailItem = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div className="flex justify-between py-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      {value != null && <p className="text-sm font-medium">{value}</p>}
    </div>
);

interface ZoneDetailsSheetProps {
    zone: (Zone & { portName?: string, terminalName?: string }) | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ZoneDetailsSheet({ zone, isOpen, onOpenChange }: ZoneDetailsSheetProps) {
    const t = useTranslations('Configuration.Zones.detailsSheet');
    if (!zone) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>{zone.name}</SheetTitle>
                    <SheetDescription>{t('description', { terminalName: zone.terminalName })}</SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-2">
                    <Separator />
                    <DetailItem label={t('status')} value={zone.status} />
                    <DetailItem label={t('port')} value={zone.portName} />
                    <DetailItem label={t('terminal')} value={zone.terminalName} />
                    <Separator />
                    <DetailItem label={t('lastModified')} value={new Date(zone.lastModified).toLocaleString()} />
                    <DetailItem label={t('createdBy')} value={zone.createdBy} />
                </div>
                <SheetFooter>
                    <Button onClick={() => onOpenChange(false)}>{t('close')}</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
