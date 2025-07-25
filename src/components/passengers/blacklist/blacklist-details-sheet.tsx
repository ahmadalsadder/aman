
'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { BlacklistEntry } from '@/types/live-processing';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { User } from 'lucide-react';

const categoryColors: { [key: string]: string } = {
  'No-Fly': 'bg-red-500/20 text-red-700 border-red-500/30',
  'Wanted': 'bg-orange-500/20 text-orange-700 border-orange-500/30',
  'Financial': 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
  'Other': 'bg-gray-500/20 text-gray-700 border-gray-500/30',
};

const statusColors: { [key: string]: string } = {
  Active: 'bg-green-500/20 text-green-700 border-green-500/30',
  Expired: 'bg-gray-500/20 text-gray-700 border-gray-500/30',
  Revoked: 'bg-red-500/20 text-red-700 border-red-500/30',
};

const DetailItem = ({ label, value, children }: { label: string; value?: string | number | null; children?: React.ReactNode }) => (
    <div className="flex justify-between py-2 text-sm">
      <p className="text-muted-foreground">{label}</p>
      {value != null && <p className="font-medium text-right">{String(value)}</p>}
      {children}
    </div>
);

interface BlacklistDetailsSheetProps {
    entry: BlacklistEntry | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function BlacklistDetailsSheet({ entry, isOpen, onOpenChange }: BlacklistDetailsSheetProps) {
    if (!entry) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{entry.name}</SheetTitle>
                    <SheetDescription>Blacklist Entry ID: {entry.id}</SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-2">
                    <Separator />
                    <h4 className="font-semibold text-base pt-2">Blacklist Details</h4>
                    <DetailItem label="Status"><Badge variant="outline" className={cn(statusColors[entry.status])}>{entry.status}</Badge></DetailItem>
                    <DetailItem label="Category"><Badge variant="outline" className={cn(categoryColors[entry.category])}>{entry.category}</Badge></DetailItem>
                    <DetailItem label="Reason" value={entry.reason} />
                    <DetailItem label="Added By" value={entry.addedBy} />
                    <DetailItem label="Date Added" value={entry.dateAdded} />
                     <DetailItem label="Valid From" value={entry.validFrom} />
                    <DetailItem label="Valid Until" value={entry.validUntil || 'Indefinite'} />

                    <Separator />
                    <h4 className="font-semibold text-base pt-2">Passenger Information</h4>
                    <DetailItem label="Nationality" value={entry.nationality} />
                    <DetailItem label="Passport Number" value={entry.passportNumber} />
                    <DetailItem label="Passport Issue Country" value={entry.passportCountry} />
                    <DetailItem label="Passport Issue Date" value={entry.passportIssueDate} />
                    <DetailItem label="Passport Expiry Date" value={entry.passportExpiryDate} />
                    
                    <Separator />
                     <div className="py-2 space-y-1">
                        <p className="text-sm text-muted-foreground">Notes</p>
                        <p className="text-sm font-medium italic">"{entry.notes || 'No notes provided.'}"</p>
                    </div>

                </div>
                <SheetFooter className="mt-4">
                    {entry.passengerId && (
                        <Button asChild variant="outline">
                            <Link href={`/passengers/${entry.passengerId}/edit`}>
                                <User className="mr-2 h-4 w-4" />
                                View Full Profile
                            </Link>
                        </Button>
                    )}
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
