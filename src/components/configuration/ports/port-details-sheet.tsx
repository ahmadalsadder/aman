
'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import type { Port } from '@/types/configuration';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from 'next-intl';

const DetailItem = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div className="flex justify-between py-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      {value != null && <p className="text-sm font-medium">{value}</p>}
    </div>
);

interface PortDetailsSheetProps {
    port: Port | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PortDetailsSheet({ port, isOpen, onOpenChange }: PortDetailsSheetProps) {
    const t = useTranslations('Configuration.Ports.detailsSheet');
    if (!port) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>{port.name}</SheetTitle>
                    <SheetDescription>{t('description', { type: port.type })}</SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-2">
                    <Separator />
                    <DetailItem label={t('status')} value={port.status} />
                    <DetailItem label={t('city')} value={port.city} />
                    <DetailItem label={t('country')} value={port.country} />
                    <Separator />
                    <DetailItem label={t('address')} value={port.address} />
                    <DetailItem label={t('localizedAddress')} value={port.localizedAddress} />
                    <Separator />
                    <DetailItem label={t('lastModified')} value={new Date(port.lastModified).toLocaleString()} />
                    <DetailItem label={t('createdBy')} value={port.createdBy} />
                </div>
                <SheetFooter>
                    <Button onClick={() => onOpenChange(false)}>{t('close')}</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
