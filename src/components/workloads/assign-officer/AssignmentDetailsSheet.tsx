
'use client';

import type { OfficerAssignment } from '@/types';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { User, Calendar, Clock, MapPin } from 'lucide-react';

const statusColors: { [key: string]: string } = {
  Confirmed: 'bg-green-500/20 text-green-700 border-green-500/30',
  Pending: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
  Cancelled: 'bg-red-500/20 text-red-700 border-red-500/30',
};

const DetailItem = ({ label, value, icon: Icon, children }: { label: string; value?: string | number | null; icon?: React.ElementType, children?: React.ReactNode }) => (
    <div className="flex items-start gap-3 py-2 text-sm">
        {Icon && <Icon className="h-4 w-4 mt-1 text-muted-foreground" />}
        <div className="flex-grow">
            <p className="text-muted-foreground">{label}</p>
            {value != null && <p className="font-medium">{String(value)}</p>}
            {children}
        </div>
    </div>
);

interface AssignmentDetailsSheetProps {
    assignment: OfficerAssignment | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AssignmentDetailsSheet({ assignment, isOpen, onOpenChange }: AssignmentDetailsSheetProps) {
    const t = useTranslations('AssignOfficer.detailsSheet');
    if (!assignment) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{t('title')}</SheetTitle>
                    <SheetDescription>
                        {t('description', { officerName: assignment.officerName, date: assignment.assignmentDate })}
                    </SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-2">
                    <Separator />
                    <DetailItem label={t('officer')} value={assignment.officerName} icon={User}/>
                    <DetailItem label={t('status')} icon={Clock}>
                        <Badge variant="outline" className={cn(statusColors[assignment.status])}>{assignment.status}</Badge>
                    </DetailItem>
                    <Separator />
                    <DetailItem label={t('date')} value={assignment.assignmentDate} icon={Calendar}/>
                    <DetailItem label={t('shift')} value={assignment.shiftName} icon={Clock}/>
                    <Separator />
                    <DetailItem label={t('port')} value={assignment.portName} icon={MapPin}/>
                    <DetailItem label={t('terminal')} value={assignment.terminalName} icon={MapPin}/>
                    <DetailItem label={t('zone')} value={assignment.zoneName} icon={MapPin}/>
                </div>
                <SheetFooter className="mt-4">
                    <Button onClick={() => onOpenChange(false)}>{t('close')}</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
