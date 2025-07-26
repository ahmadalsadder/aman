
'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import type { SystemMessage } from '@/types/configuration';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from 'next-intl';

const DetailItem = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div className="flex flex-col space-y-1 py-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      {value != null && <p className="text-sm font-medium">{value}</p>}
    </div>
);

interface SystemMessageDetailsSheetProps {
    message: SystemMessage | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SystemMessageDetailsSheet({ message, isOpen, onOpenChange }: SystemMessageDetailsSheetProps) {
    const t = useTranslations('Configuration.SystemMessages.detailsSheet');
    if (!message) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>{message.name}</SheetTitle>
                    <SheetDescription>{t('description', { category: message.category })}</SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-2">
                    <Separator />
                    <DetailItem label={t('status')} value={message.status} />
                    <DetailItem label={t('category')} value={message.category} />
                    <Separator />
                    <DetailItem label={t('englishDescription')} value={message.description} />
                    <DetailItem label={t('localizedName')} value={message.localizedName} />
                    <DetailItem label={t('localizedDescription')} value={message.localizedDescription} />
                    <Separator />
                    <DetailItem label={t('lastModified')} value={new Date(message.lastModified).toLocaleString()} />
                    <DetailItem label={t('createdBy')} value={message.createdBy} />
                </div>
                <SheetFooter>
                    <Button onClick={() => onOpenChange(false)}>{t('close')}</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
