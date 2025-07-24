
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
    <div className="flex justify-between py-2 text-sm">
      <p className="text-muted-foreground">{label}</p>
      {value != null && <p className="font-medium text-right">{String(value)}</p>}
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
            <SheetContent className="sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{t('title')}: {gate.code}</SheetTitle>
                    <SheetDescription>{gate.name}</SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-2">
                    <Separator />
                    <h4 className="font-semibold text-base pt-2">Location & Status</h4>
                    <DetailItem label={t('status')} value={gate.status} />
                    <DetailItem label={t('type')} value={gate.type} />
                    <DetailItem label={t('terminal')} value={gate.terminalName} />
                    
                    <Separator />
                    <h4 className="font-semibold text-base pt-2">Technical Details</h4>
                    <DetailItem label={t('ipAddress')} value={gate.ipAddress} />
                    <DetailItem label={t('macAddress')} value={gate.macAddress} />
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
                    
                    {gate.entryConfig && (
                        <>
                            <Separator />
                            <h4 className="font-semibold text-base pt-2">Entry Configuration</h4>
                            <DetailItem label="Workflow Profile" value={gate.entryConfig.workflowId} />
                            <DetailItem label="Risk Profile" value={gate.entryConfig.riskProfileId} />
                            <DetailItem label="Queue Capacity" value={gate.entryConfig.capacity} />
                        </>
                    )}

                    {gate.exitConfig && (
                         <>
                            <Separator />
                            <h4 className="font-semibold text-base pt-2">Exit Configuration</h4>
                            <DetailItem label="Workflow Profile" value={gate.exitConfig.workflowId} />
                            <DetailItem label="Risk Profile" value={gate.exitConfig.riskProfileId} />
                            <DetailItem label="Queue Capacity" value={gate.exitConfig.capacity} />
                        </>
                    )}

                    <Separator />
                    <h4 className="font-semibold text-base pt-2">Maintenance & Warranty</h4>
                    <DetailItem label="Warranty Start" value={gate.warrantyStartDate ? new Date(gate.warrantyStartDate).toLocaleDateString() : 'N/A'} />
                    <DetailItem label="Warranty End" value={gate.warrantyEndDate ? new Date(gate.warrantyEndDate).toLocaleDateString() : 'N/A'} />
                    <DetailItem label={t('lastMaintenance')} value={new Date(gate.lastMaintenance).toLocaleDateString()} />
                    <DetailItem label={t('lastModified')} value={new Date(gate.lastModified).toLocaleString()} />

                </div>
                <SheetFooter className="mt-4">
                    <Button onClick={() => onOpenChange(false)}>{t('close')}</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
