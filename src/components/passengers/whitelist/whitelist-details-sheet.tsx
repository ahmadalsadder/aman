
'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { WhitelistEntry } from '@/types/live-processing';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { User } from 'lucide-react';

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

interface WhitelistDetailsSheetProps {
    entry: WhitelistEntry | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function WhitelistDetailsSheet({ entry, isOpen, onOpenChange }: WhitelistDetailsSheetProps) {
    if (!entry) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{entry.name}</SheetTitle>
                    <SheetDescription>Whitelist Entry ID: {entry.id}</SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-2">
                    <Separator />
                    <DetailItem label="Status"><Badge variant="outline" className={cn(statusColors[entry.status])}>{entry.status}</Badge></DetailItem>
                    <DetailItem label="Nationality" value={entry.nationality} />
                    <DetailItem label="Reason" value={entry.reason} />

                    <Separator />
                    <h4 className="font-semibold text-base pt-2">Timeline</h4>
                    <DetailItem label="Date Added" value={entry.dateAdded} />
                    <DetailItem label="Valid Until" value={entry.validUntil} />
                    <DetailItem label="Added By" value={entry.addedBy} />
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

