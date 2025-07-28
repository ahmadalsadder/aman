

'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { Shift } from '@/types';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

const statusColors: { [key: string]: string } = {
  Active: 'bg-green-500/20 text-green-700 border-green-500/30',
  Inactive: 'bg-gray-500/20 text-gray-700 border-gray-500/30',
};

const DetailItem = ({ label, value, children }: { label: string; value?: string | number | null; children?: React.ReactNode }) => (
    <div className="flex justify-between py-2 text-sm">
      <p className="text-muted-foreground">{label}</p>
      {value != null && <p className="font-medium text-right">{String(value)}</p>}
      {children}
    </div>
);

interface ShiftDetailsSheetProps {
    shift: Shift | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ShiftDetailsSheet({ shift, isOpen, onOpenChange }: ShiftDetailsSheetProps) {
    const tEnum = useTranslations('Enums');
    if (!shift) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{shift.name}</SheetTitle>
                    <SheetDescription>Shift ID: {shift.id}</SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-2">
                    <Separator />
                    <DetailItem label="Status"><Badge variant="outline" className={cn(statusColors[shift.status])}>{tEnum(`Status.${shift.status}`)}</Badge></DetailItem>
                    <DetailItem label="Start Time" value={shift.startTime} />
                    <DetailItem label="End Time" value={shift.endTime} />
                    <Separator />
                    <div className="py-2 space-y-2">
                        <p className="text-sm text-muted-foreground">Operating Days</p>
                        <div className="flex flex-wrap gap-2">
                            {shift.days.map(dayId => {
                                const dayLabel = tEnum(`DayOfWeek.${dayId}`);
                                return <Badge key={dayId} variant="secondary">{dayLabel}</Badge>
                            })}
                        </div>
                    </div>
                    <Separator />
                     <div className="py-2 space-y-2">
                        <p className="text-sm text-muted-foreground">Assigned Officers</p>
                        <p className="text-sm font-medium italic">
                            {shift.assignedOfficers && shift.assignedOfficers.length > 0 
                                ? shift.assignedOfficers.map(o => o.name).join(', ') 
                                : 'No officers assigned.'}
                        </p>
                    </div>
                </div>
                <SheetFooter className="mt-4">
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
