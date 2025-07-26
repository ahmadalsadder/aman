
'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import type { Terminal } from '@/types/configuration';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from 'next-intl';

const DetailItem = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div className="flex justify-between py-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      {value != null && <p className="text-sm font-medium">{value}</p>}
    </div>
);

interface TerminalDetailsSheetProps {
    terminal: (Terminal & { portName?: string }) | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TerminalDetailsSheet({ terminal, isOpen, onOpenChange }: TerminalDetailsSheetProps) {
    const t = useTranslations('Configuration.Terminals.detailsSheet');
    if (!terminal) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>{terminal.name}</SheetTitle>
                    <SheetDescription>{t('description', { portName: terminal.portName })}</SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-2">
                    <Separator />
                    <DetailItem label={t('status')} value={terminal.status} />
                    <DetailItem label={t('port')} value={terminal.portName} />
                    <Separator />
                    <DetailItem label={t('lastModified')} value={new Date(terminal.lastModified).toLocaleString()} />
                    <DetailItem label={t('createdBy')} value={terminal.createdBy} />
                </div>
                <SheetFooter>
                    <Button onClick={() => onOpenChange(false)}>{t('close')}</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
