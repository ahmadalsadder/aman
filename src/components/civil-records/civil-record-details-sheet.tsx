
'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import type { CivilRecord } from '@/types/live-processing';

const riskColors: { [key: string]: string } = {
    High: 'bg-red-500/20 text-red-700 border-red-500/30',
    Medium: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
    Low: 'bg-green-500/20 text-green-700 border-green-500/30',
};

const DetailItem = ({ label, value, children }: { label: string; value?: string | number | null; children?: React.ReactNode }) => (
    <div className="flex justify-between py-2 text-sm">
      <p className="text-muted-foreground">{label}</p>
      {value != null && <p className="font-medium text-right">{String(value)}</p>}
      {children}
    </div>
);

interface CivilRecordDetailsSheetProps {
    record: CivilRecord | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CivilRecordDetailsSheet({ record, isOpen, onOpenChange }: CivilRecordDetailsSheetProps) {
    const t = useTranslations('CivilRecords.details');
    if (!record) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={record.profilePicture} alt={`${record.firstName} ${record.lastName}`} />
                            <AvatarFallback>{record.firstName?.charAt(0)}{record.lastName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <SheetTitle>{record.firstName} {record.lastName}</SheetTitle>
                            <SheetDescription>{record.localizedName}</SheetDescription>
                        </div>
                    </div>
                </SheetHeader>
                <div className="py-4 space-y-2">
                    <Separator />
                    <h4 className="font-semibold text-base pt-2">{t('personalInfo')}</h4>
                    <DetailItem label={t('status')}><Badge variant="outline">{record.status}</Badge></DetailItem>
                    <DetailItem label={t('riskLevel')}><Badge variant="outline" className={cn(riskColors[record.riskLevel])}>{record.riskLevel}</Badge></DetailItem>
                    <DetailItem label={t('gender')} value={record.gender} />
                    <DetailItem label={t('dob')} value={record.dateOfBirth} />

                    <Separator />
                    <h4 className="font-semibold text-base pt-2">{t('documentInfo')}</h4>
                    <DetailItem label={t('passportNo')} value={record.passportNumber} />
                    <DetailItem label={t('passportCountry')} value={record.passportCountry} />
                    <DetailItem label={t('passportIssue')} value={record.passportIssueDate} />
                    <DetailItem label={t('passportExpiry')} value={record.passportExpiryDate} />
                    <DetailItem label={t('nationalId')} value={record.nationalId} />

                    <Separator />
                    <h4 className="font-semibold text-base pt-2">{t('visaInfo')}</h4>
                    <DetailItem label={t('visaNo')} value={record.visaNumber || 'N/A'} />
                    <DetailItem label={t('visaType')} value={record.visaType || 'N/A'} />
                    <DetailItem label={t('visaExpiry')} value={record.visaExpiryDate || 'N/A'} />
                    <DetailItem label={t('residencyNo')} value={record.residencyFileNumber || 'N/A'} />
                </div>
                <SheetFooter className="mt-4">
                    <Button onClick={() => onOpenChange(false)}>{t('close')}</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
