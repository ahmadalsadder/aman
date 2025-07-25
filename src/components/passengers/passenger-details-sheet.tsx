
'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import type { Passenger } from '@/types/live-processing';

const riskLevelColors = {
  Low: 'bg-green-500/20 text-green-700 border-green-500/30',
  Medium: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
  High: 'bg-red-500/20 text-red-700 border-red-500/30',
};

const statusColors = {
  Active: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  Inactive: 'bg-gray-500/20 text-gray-700 border-gray-500/30',
  Flagged: 'bg-purple-500/20 text-purple-700 border-purple-500/30',
  Blocked: 'bg-zinc-500/20 text-zinc-700 border-zinc-500/30',
};

const DetailItem = ({ label, value, children }: { label: string; value?: string | number | null; children?: React.ReactNode }) => (
    <div className="flex justify-between py-2 text-sm">
      <p className="text-muted-foreground">{label}</p>
      {value != null && <p className="font-medium text-right">{String(value)}</p>}
      {children}
    </div>
);

interface PassengerDetailsSheetProps {
    passenger: Passenger | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PassengerDetailsSheet({ passenger, isOpen, onOpenChange }: PassengerDetailsSheetProps) {
    const t = useTranslations('PassengerDetails');
    if (!passenger) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={passenger.profilePicture} alt={`${passenger.firstName} ${passenger.lastName}`} />
                            <AvatarFallback>{passenger.firstName?.charAt(0)}{passenger.lastName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <SheetTitle>{passenger.firstName} {passenger.lastName}</SheetTitle>
                            <SheetDescription>{passenger.localizedName}</SheetDescription>
                        </div>
                    </div>
                </SheetHeader>
                <div className="py-4 space-y-2">
                    <Separator />
                    <h4 className="font-semibold text-base pt-2">{t('personalInfo')}</h4>
                    <DetailItem label={t('status')}><Badge variant="outline" className={cn(statusColors[passenger.status])}>{passenger.status}</Badge></DetailItem>
                    <DetailItem label={t('riskLevel')}><Badge variant="outline" className={cn(riskLevelColors[passenger.riskLevel])}>{passenger.riskLevel}</Badge></DetailItem>
                    <DetailItem label={t('gender')} value={passenger.gender} />
                    <DetailItem label={t('dob')} value={passenger.dateOfBirth} />

                    <Separator />
                    <h4 className="font-semibold text-base pt-2">{t('documentInfo')}</h4>
                    <DetailItem label={t('passportNo')} value={passenger.passportNumber} />
                    <DetailItem label={t('nationality')} value={passenger.nationality} />
                    <DetailItem label={t('issuingCountry')} value={passenger.passportCountry} />
                    <DetailItem label={t('issueDate')} value={passenger.passportIssueDate} />
                    <DetailItem label={t('expiryDate')} value={passenger.passportExpiryDate} />
                    <DetailItem label={t('nationalId')} value={passenger.nationalId} />

                    <Separator />
                    <h4 className="font-semibold text-base pt-2">{t('visaInfo')}</h4>
                    <DetailItem label={t('visaNo')} value={passenger.visaNumber || 'N/A'} />
                    <DetailItem label={t('visaType')} value={passenger.visaType || 'N/A'} />
                    <DetailItem label={t('visaExpiry')} value={passenger.visaExpiryDate || 'N/A'} />
                    <DetailItem label={t('residencyNo')} value={passenger.residencyFileNumber || 'N/A'} />
                </div>
                <SheetFooter className="mt-4">
                    <Button onClick={() => onOpenChange(false)}>{t('close')}</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
