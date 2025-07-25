
'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import type { Media } from '@/types/live-processing';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from 'next-intl';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const statusColors: { [key: string]: string } = {
  Active: 'bg-green-500/20 text-green-700 border-green-500/30',
  Inactive: 'bg-gray-500/20 text-gray-700 border-gray-500/30',
};

const typeColors: { [key: string]: string } = {
  Audio: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  Image: 'bg-purple-500/20 text-purple-700 border-purple-500/30',
  Video: 'bg-orange-500/20 text-orange-700 border-orange-500/30',
};

const DetailItem = ({ label, value, children }: { label: string; value?: string | number | null; children?: React.ReactNode }) => (
    <div className="flex flex-col gap-1 py-2 text-sm">
      <p className="font-semibold text-muted-foreground">{label}</p>
      {value != null && <p className="font-medium">{String(value)}</p>}
      {children}
    </div>
);

interface MediaDetailsSheetProps {
    media: Media | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function MediaDetailsSheet({ media, isOpen, onOpenChange }: MediaDetailsSheetProps) {
    const t = useTranslations('MediaManagement.detailsSheet');
    if (!media) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{t('title')}</SheetTitle>
                    <SheetDescription>{media.name}</SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-2">
                    <Separator />
                    <DetailItem label={t('name')} value={media.name} />
                    <DetailItem label={t('localizedName')} value={media.localizedName} />
                    <DetailItem label={t('description')} value={media.description} />
                    <Separator />
                    <DetailItem label={t('status')}><Badge variant="outline" className={cn(statusColors[media.status])}>{media.status}</Badge></DetailItem>
                    <DetailItem label={t('type')}><Badge variant="outline" className={cn(typeColors[media.type])}>{media.type}</Badge></DetailItem>
                    <Separator />
                    <DetailItem label={t('url')}>
                        <Link href={media.url} target="_blank" className="text-primary hover:underline break-all">{media.url}</Link>
                    </DetailItem>
                    <Separator />
                    <DetailItem label={t('createdBy')} value={media.createdBy} />
                    <DetailItem label={t('lastModified')} value={new Date(media.lastModified).toLocaleString()} />
                </div>
                <SheetFooter className="mt-4">
                    <Button onClick={() => onOpenChange(false)}>{t('close')}</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
