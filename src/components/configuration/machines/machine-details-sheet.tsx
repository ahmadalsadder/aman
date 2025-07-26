
'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import type { Machine } from '@/types/configuration';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from 'next-intl';

const DetailItem = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div className="flex justify-between py-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      {value != null && <p className="text-sm font-medium">{value}</p>}
    </div>
);

interface MachineDetailsSheetProps {
    machine: (Machine & { portName?: string, terminalName?: string, zoneName?: string }) | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function MachineDetailsSheet({ machine, isOpen, onOpenChange }: MachineDetailsSheetProps) {
    const t = useTranslations('Configuration.Machines.detailsSheet');
    if (!machine) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>{machine.name}</SheetTitle>
                    <SheetDescription>{t('description', { type: machine.type })}</SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-2">
                    <Separator />
                    <DetailItem label={t('status')} value={machine.status} />
                    <DetailItem label={t('port')} value={machine.portName} />
                    <DetailItem label={t('terminal')} value={machine.terminalName} />
                    <DetailItem label={t('zone')} value={machine.zoneName} />
                    <Separator />
                    <DetailItem label={t('ipAddress')} value={machine.ipAddress} />
                    <DetailItem label={t('macAddress')} value={machine.macAddress} />
                    <Separator />
                    <DetailItem label={t('lastModified')} value={new Date(machine.lastModified).toLocaleString()} />
                    <DetailItem label={t('createdBy')} value={machine.createdBy} />
                </div>
                <SheetFooter>
                    <Button onClick={() => onOpenChange(false)}>{t('close')}</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
