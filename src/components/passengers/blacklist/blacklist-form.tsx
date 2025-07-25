'use client';

import React, { useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { countries } from '@/lib/countries';
import { AttachmentUploader } from '@/components/shared/attachment-uploader';
import type { BlacklistEntry, Passenger } from '@/types/live-processing';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from 'next-intl';
import { Loader2, Info } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  passengerId: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  nationality: z.string().min(1, 'Nationality is required'),
  category: z.enum(['No-Fly', 'Wanted', 'Financial', 'Other']),
  reason: z.string().min(1, 'Reason for blacklisting is required'),
  notes: z.string().optional(),
  attachmentUrl: z.string().optional(),
});

export type BlacklistFormValues = z.infer<typeof formSchema>;

interface BlacklistFormProps {
  entryToEdit?: BlacklistEntry;
  passenger?: Passenger | null;
  onSave: (data: BlacklistFormValues) => void;
  isLoading?: boolean;
}

export function BlacklistForm({ entryToEdit, passenger, onSave, isLoading }: BlacklistFormProps) {
  const router = useRouter();
  const t = useTranslations('BlacklistPage.form');

  const form = useForm<BlacklistFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: entryToEdit || {
      passengerId: '',
      name: '',
      nationality: '',
      category: 'Other',
      reason: '',
      notes: '',
      attachmentUrl: '',
    },
  });

  useEffect(() => {
    if (passenger) {
        form.reset({
            ...form.getValues(),
            passengerId: passenger.id,
            name: `${passenger.firstName} ${passenger.lastName}`,
            nationality: passenger.nationality,
        });
    }
  }, [passenger, form]);

  const attachmentConfigs = useMemo(() => [
    { name: 'attachmentUrl', label: t('attachments.documentLabel'), allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'], maxSize: 5 * 1024 * 1024 },
  ], [t]);

  const handleAttachmentsChange = (files: Record<string, any>) => {
    form.setValue('attachmentUrl', files.attachmentUrl?.content || '');
  };

  const handleSubmit = (data: BlacklistFormValues) => {
    const payload = {
        ...data,
        nationality: countries.find(c => c.value === data.nationality)?.label || data.nationality,
    };
    onSave(payload as any);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>{t('details.title')}</CardTitle>
                    <CardDescription>{t('details.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     {passenger && (
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>{t('details.linkedTitle')}</AlertTitle>
                            <AlertDescription>{t('details.linkedDesc', { name: `${passenger.firstName} ${passenger.lastName}` })}</AlertDescription>
                        </Alert>
                    )}
                    <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel required>{t('details.name')}</FormLabel><FormControl><Input {...field} disabled={!!passenger} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="nationality" render={({ field }) => ( <FormItem><FormLabel required>{t('details.nationality')}</FormLabel><Combobox options={countries} {...field} placeholder={t('details.selectNationality')} disabled={!!passenger} /><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="reason" render={({ field }) => ( <FormItem><FormLabel required>{t('details.reason')}</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="notes" render={({ field }) => ( <FormItem><FormLabel>{t('details.notes')}</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
                </CardContent>
            </Card>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('category.title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="category" render={({ field }) => ( <FormItem><FormLabel required>{t('category.category')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="No-Fly">{t('category.noFly')}</SelectItem><SelectItem value="Wanted">{t('category.wanted')}</SelectItem><SelectItem value="Financial">{t('category.financial')}</SelectItem><SelectItem value="Other">{t('category.other')}</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>{t('attachments.title')}</CardTitle></CardHeader>
                    <CardContent>
                        <AttachmentUploader 
                            configs={attachmentConfigs}
                            onFilesChange={handleAttachmentsChange}
                            initialFiles={{ attachmentUrl: entryToEdit?.attachmentUrl || '' }}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('common.save')}
            </Button>
        </div>
      </form>
    </Form>
  );
}
