
'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import type { Gate } from '@/types/live-processing';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from 'next-intl';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { Wifi, WifiOff } from 'lucide-react';

const DetailItem = ({ label, value, children }: { label: string; value?: string | number | null; children?: React.ReactNode }) => (
    <div className="flex justify-between py-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      {value != null && <p className="text-sm font-medium text-right">{value}</p>}
      {children}
    </div>
);

interface GateDetailsSheetProps {
    gate: Gate | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function GateDetailsSheet({ gate, isOpen, onOpenChange }: GateDetailsSheetProps) {
    const t = useTranslations('GatesPage.detailsSheet');
    if (!gate) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle>{t('title')}: {gate.code}</SheetTitle>
                    <SheetDescription>{gate.name}</SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-2">
                    <Separator />
                    <DetailItem label={t('status')} value={gate.status} />
                    <DetailItem label={t('type')} value={gate.type} />
                    <DetailItem label={t('terminal')} value={gate.terminalName} />
                    <Separator />
                    <DetailItem label={t('ipAddress')} value={gate.ipAddress} />
                    <DetailItem label={t('macAddress')} value={gate.macAddress} />
                    <Separator />
                    <DetailItem label={t('lastModified')} value={gate.lastModified} />
                    <DetailItem label={t('lastMaintenance')} value={gate.lastMaintenance} />
                    <Separator />
                    <div className="space-y-2 py-2">
                        <p className="text-sm text-muted-foreground">{t('equipmentStatus')}</p>
                        <div className="flex flex-wrap gap-2">
                            {gate.equipment?.map(eq => (
                                <Badge key={eq.name} variant={eq.status === 'online' ? 'default' : 'destructive'} className="border">
                                    {eq.status === 'online' ? <Wifi className="mr-1 h-3 w-3" /> : <WifiOff className="mr-1 h-3 w-3" />}
                                    {eq.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
                <SheetFooter>
                    <Button onClick={() => onOpenChange(false)}>{t('close')}</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
