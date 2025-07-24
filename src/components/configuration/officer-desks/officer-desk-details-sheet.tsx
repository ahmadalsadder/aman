
'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import type { OfficerDesk } from '@/types/configuration';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from 'next-intl';

const DetailItem = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div className="flex justify-between py-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      {value != null && <p className="text-sm font-medium">{value}</p>}
    </div>
);

interface OfficerDeskDetailsSheetProps {
    desk: OfficerDesk | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function OfficerDeskDetailsSheet({ desk, isOpen, onOpenChange }: OfficerDeskDetailsSheetProps) {
    const t = useTranslations('OfficerDesks.detailsSheet');
    if (!desk) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>{t('title')}</SheetTitle>
                    <SheetDescription>{desk.name}</SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-2">
                    <Separator />
                    <DetailItem label="Status" value={desk.status} />
                    <DetailItem label="Movement Type" value={desk.movementType} />
                    <Separator />
                    <DetailItem label="Port" value={desk.portName} />
                    <DetailItem label="Terminal" value={desk.terminalName} />
                    <DetailItem label="Zone" value={desk.zoneName} />
                    <Separator />
                    <DetailItem label="IP Address" value={desk.ipAddress} />
                    <DetailItem label="MAC Address" value={desk.macAddress} />
                    <Separator />
                    <DetailItem label="Workflow Profile" value={desk.workflowId} />
                    <DetailItem label="Risk Rule Profile" value={desk.riskRuleId} />
                    <Separator />
                    <DetailItem label="Last Updated" value={new Date(desk.lastUpdatedAt).toLocaleString()} />
                </div>
                <SheetFooter>
                    <Button onClick={() => onOpenChange(false)}>{t('close')}</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
