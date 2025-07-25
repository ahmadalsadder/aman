

'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { countries } from '@/lib/countries';
import type { WhitelistEntry, Passenger } from '@/types/live-processing';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from 'next-intl';
import { Loader2, Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import CalendarIcon from '@/components/icons/calendar-icon';
import { cn } from '@/lib/utils';
import { format, isValid } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AttachmentUploader } from '@/components/shared/attachment-uploader';

const formSchema = z.object({
  id: z.string().optional(),
  passengerId: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  localizedName: z.string().optional(),
  passportNumber: z.string().min(1, 'Passport number is required'),
  passportExpiryDate: z.date().optional(),
  nationality: z.string().min(1, 'Nationality is required'),
  status: z.enum(['Active', 'Expired', 'Revoked']),
  validFrom: z.date({ required_error: "A 'valid from' date is required." }),
  validUntil: z.date({ required_error: "A 'valid until' date is required." }),
  reason: z.string().min(1, 'Reason for whitelisting is required'),
  attachmentUrl: z.string().optional(),
}).refine(data => data.validUntil >= data.validFrom, {
    message: "End date cannot be earlier than start date.",
    path: ["validUntil"],
});


export type WhitelistFormValues = z.infer<typeof formSchema>;

interface WhitelistFormProps {
  entryToEdit?: WhitelistEntry;
  passenger?: Passenger | null;
  onSave: (data: WhitelistFormValues) => void;
  isLoading?: boolean;
}

export function WhitelistForm({ entryToEdit, passenger, onSave, isLoading }: WhitelistFormProps) {
  const router = useRouter();
  const t = useTranslations('WhitelistPage.form');
  const pathname = usePathname();
  const module = pathname.split('/')[1];

  const form = useForm<WhitelistFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: entryToEdit?.id || undefined,
      passengerId: entryToEdit?.passengerId || passenger?.id || undefined,
      name: entryToEdit?.name || (passenger ? `${passenger.firstName} ${passenger.lastName}` : ''),
      localizedName: passenger?.localizedName || '',
      passportNumber: entryToEdit?.passportNumber || passenger?.passportNumber || '',
      passportExpiryDate: entryToEdit?.passportExpiryDate ? new Date(entryToEdit.passportExpiryDate) : (passenger?.passportExpiryDate ? new Date(passenger.passportExpiryDate) : undefined),
      nationality: entryToEdit?.nationality || passenger?.nationality || '',
      status: entryToEdit?.status || 'Active',
      validFrom: entryToEdit?.dateAdded ? new Date(entryToEdit.dateAdded) : new Date(),
      validUntil: entryToEdit?.validUntil ? new Date(entryToEdit.validUntil) : undefined,
      reason: entryToEdit?.reason || '',
      attachmentUrl: entryToEdit?.attachmentUrl || '',
    },
  });
  
  React.useEffect(() => {
    if (passenger) {
        form.reset({
            ...form.getValues(),
            passengerId: passenger.id,
            name: `${passenger.firstName} ${passenger.lastName}`,
            localizedName: passenger.localizedName,
            passportNumber: passenger.passportNumber,
            passportExpiryDate: passenger.passportExpiryDate ? new Date(passenger.passportExpiryDate) : undefined,
            nationality: passenger.nationality,
        });
    }
  }, [passenger, form]);

  const countryValue = useMemo(() => {
    const nationalityLabel = form.getValues('nationality');
    const foundCountry = countries.find(c => c.label === nationalityLabel || c.value === nationalityLabel);
    return foundCountry?.value || nationalityLabel;
  }, [form]);

  const attachmentConfigs = useMemo(() => [
    { name: 'attachmentUrl', label: t('attachments.documentLabel'), allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'], maxSize: 5 * 1024 * 1024 },
  ], [t]);

  const handleAttachmentsChange = (files: Record<string, any>) => {
    form.setValue('attachmentUrl', files.attachmentUrl?.content || '');
  };

  const handleSubmit = (data: WhitelistFormValues) => {
    const payload = {
        ...data,
        nationality: countries.find(c => c.value === data.nationality)?.label || data.nationality,
        validFrom: format(data.validFrom, 'yyyy-MM-dd'),
        validUntil: format(data.validUntil, 'yyyy-MM-dd'),
        passportExpiryDate: data.passportExpiryDate ? format(data.passportExpiryDate, 'yyyy-MM-dd') : undefined,
    };
    onSave(payload as any);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel required>{t('details.name')}</FormLabel><FormControl><Input {...field} disabled={!!passenger} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="localizedName" render={({ field }) => ( <FormItem><FormLabel>{t('details.localizedName')}</FormLabel><FormControl><Input {...field} disabled={!!passenger} /></FormControl><FormMessage /></FormItem> )} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="passportNumber" render={({ field }) => ( <FormItem><FormLabel required>{t('details.passportNumber')}</FormLabel><FormControl><Input {...field} disabled={!!passenger} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="nationality" render={({ field }) => ( <FormItem><FormLabel required>{t('details.nationality')}</FormLabel><Combobox options={countries} value={countryValue} onChange={field.onChange} placeholder={t('details.selectNationality')} disabled={!!passenger} /><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="passportExpiryDate" render={({ field }) => ( <FormItem><FormLabel>{t('details.passportExpiry')}</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")} disabled={!!passenger}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, 'PPP') : <span>{t('details.pickDate')}</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem> )} />
                 </div>
                 <FormField control={form.control} name="reason" render={({ field }) => ( <FormItem><FormLabel required>{t('details.reason')}</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>{t('validity.title')}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="status" render={({ field }) => ( <FormItem><FormLabel required>{t('validity.status')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Active">{t('validity.active')}</SelectItem><SelectItem value="Expired">{t('validity.expired')}</SelectItem><SelectItem value="Revoked">{t('validity.revoked')}</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="validFrom" render={({ field }) => ( <FormItem><FormLabel required>{t('validity.validFrom')}</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, 'PPP') : <span>{t('details.pickDate')}</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="validUntil" render={({ field }) => ( <FormItem><FormLabel required>{t('validity.validUntil')}</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, 'PPP') : <span>{t('details.pickDate')}</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date() || (form.getValues('validFrom') && date < form.getValues('validFrom'))} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem> )} />
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>{t('attachments.title')}</CardTitle></CardHeader>
            <CardContent>
                <AttachmentUploader 
                    configs={attachmentConfigs}
                    onFilesChange={handleAttachmentsChange}
                    initialFiles={{ attachmentUrl: entryToEdit?.attachmentUrl || '' }}
                    outputType='base64'
                />
            </CardContent>
        </Card>
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




