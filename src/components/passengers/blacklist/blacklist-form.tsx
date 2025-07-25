

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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import CalendarIcon from '@/components/icons/calendar-icon';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const formSchema = z.object({
  id: z.string().optional(),
  passengerId: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  localizedName: z.string().optional(),
  passportNumber: z.string().min(1, 'Passport number is required'),
  nationality: z.string().min(1, 'Nationality is required'),
  passportIssueDate: z.date({ required_error: 'Passport issue date is required.' }),
  passportExpiryDate: z.date({ required_error: 'Passport expiry date is required.' }),
  passportCountry: z.string().min(1, 'Passport issue country is required.'),
  
  status: z.enum(['Active', 'Expired', 'Revoked']),
  validFrom: z.date({ required_error: "A 'valid from' date is required." }),
  validUntil: z.date().optional(),

  category: z.enum(['No-Fly', 'Wanted', 'Financial', 'Other']),
  reason: z.string().min(1, 'Reason for blacklisting is required'),
  notes: z.string().optional(),
  attachmentUrl: z.string().optional(),
}).refine(data => !data.validUntil || data.validUntil >= data.validFrom, {
    message: "End date cannot be earlier than start date.",
    path: ["validUntil"],
}).refine(data => data.passportExpiryDate >= data.passportIssueDate, {
    message: "Expiry date cannot be earlier than issue date.",
    path: ["passportExpiryDate"],
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
    defaultValues: {
      id: entryToEdit?.id,
      passengerId: entryToEdit?.passengerId || passenger?.id,
      name: entryToEdit?.name || (passenger ? `${passenger.firstName} ${passenger.lastName}` : ''),
      localizedName: entryToEdit?.localizedName || passenger?.localizedName || '',
      passportNumber: entryToEdit?.passportNumber || passenger?.passportNumber || '',
      nationality: entryToEdit?.nationality || passenger?.nationality || '',
      passportIssueDate: entryToEdit?.passportIssueDate ? new Date(entryToEdit.passportIssueDate) : (passenger?.passportIssueDate ? new Date(passenger.passportIssueDate) : undefined),
      passportExpiryDate: entryToEdit?.passportExpiryDate ? new Date(entryToEdit.passportExpiryDate) : (passenger?.passportExpiryDate ? new Date(passenger.passportExpiryDate) : undefined),
      passportCountry: entryToEdit?.passportCountry || passenger?.passportCountry || '',
      status: entryToEdit?.status || 'Active',
      validFrom: entryToEdit?.validFrom ? new Date(entryToEdit.validFrom) : new Date(),
      validUntil: entryToEdit?.validUntil ? new Date(entryToEdit.validUntil) : undefined,
      category: entryToEdit?.category || 'Other',
      reason: entryToEdit?.reason || '',
      notes: entryToEdit?.notes || '',
      attachmentUrl: entryToEdit?.attachmentUrl || '',
    },
  });

  useEffect(() => {
    if (passenger) {
        form.reset({
            ...form.getValues(),
            passengerId: passenger.id,
            name: `${passenger.firstName} ${passenger.lastName}`,
            nationality: passenger.nationality,
            passportNumber: passenger.passportNumber,
            passportIssueDate: passenger.passportIssueDate ? new Date(passenger.passportIssueDate) : undefined,
            passportExpiryDate: passenger.passportExpiryDate ? new Date(passenger.passportExpiryDate) : undefined,
            passportCountry: passenger.passportCountry
        });
    }
  }, [passenger, form]);

  const attachmentConfigs = useMemo(() => [
    { name: 'attachmentUrl', label: 'Supporting Evidence', allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'], maxSize: 5 * 1024 * 1024 },
  ], []);

  const handleAttachmentsChange = (files: Record<string, any>) => {
    form.setValue('attachmentUrl', files.attachmentUrl?.content || '');
  };

  const countryValue = (fieldName: 'nationality' | 'passportCountry') => {
      const countryLabel = form.getValues(fieldName);
      const foundCountry = countries.find(c => c.label === countryLabel || c.value === countryLabel);
      return foundCountry?.value || countryLabel;
  }

  const handleSubmit = (data: BlacklistFormValues) => {
    const payload = {
        ...data,
        nationality: countries.find(c => c.value === data.nationality)?.label || data.nationality,
        passportCountry: countries.find(c => c.value === data.passportCountry)?.label || data.passportCountry,
    };
    onSave(payload as any);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Passenger & Document Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {passenger && (
                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertTitle>{t('details.linkedTitle')}</AlertTitle>
                                <AlertDescription>{t('details.linkedDesc', { name: `${passenger.firstName} ${passenger.lastName}` })}</AlertDescription>
                            </Alert>
                        )}
                        <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel required>Full Name (English)</FormLabel><FormControl><Input {...field} disabled={!!passenger} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="localizedName" render={({ field }) => ( <FormItem><FormLabel>Full Name (Localized)</FormLabel><FormControl><Input {...field} disabled={!!passenger} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="passportNumber" render={({ field }) => ( <FormItem><FormLabel required>Passport Number</FormLabel><FormControl><Input {...field} disabled={!!passenger} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="nationality" render={({ field }) => ( <FormItem><FormLabel required>Nationality</FormLabel><Combobox options={countries} value={countryValue('nationality')} onChange={field.onChange} placeholder="Select nationality..." disabled={!!passenger} /><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="passportCountry" render={({ field }) => ( <FormItem><FormLabel required>Passport Issuing Country</FormLabel><Combobox options={countries} value={countryValue('passportCountry')} onChange={field.onChange} placeholder="Select issuing country..." disabled={!!passenger} /><FormMessage /></FormItem> )} />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="passportIssueDate" render={({ field }) => ( <FormItem><FormLabel required>Passport Issue Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")} disabled={!!passenger}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem> )} />
                            <FormField control={form.control} name="passportExpiryDate" render={({ field }) => ( <FormItem><FormLabel required>Passport Expiry Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")} disabled={!!passenger}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem> )} />
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Supporting Evidence</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AttachmentUploader 
                            configs={attachmentConfigs}
                            onFilesChange={handleAttachmentsChange}
                            initialFiles={{ attachmentUrl: entryToEdit?.attachmentUrl || '' }}
                        />
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Blacklist Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="category" render={({ field }) => ( <FormItem><FormLabel required>Blacklist Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="No-Fly">No-Fly</SelectItem><SelectItem value="Wanted">Wanted</SelectItem><SelectItem value="Financial">Financial</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="reason" render={({ field }) => ( <FormItem><FormLabel required>Reason for Blacklisting</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="notes" render={({ field }) => ( <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
                    </CardContent>
                </Card>
                <Card>
                     <CardHeader><CardTitle>Validity and Status</CardTitle></CardHeader>
                     <CardContent className="space-y-4">
                        <FormField control={form.control} name="status" render={({ field }) => ( <FormItem><FormLabel required>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Expired">Expired</SelectItem><SelectItem value="Revoked">Revoked</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                         <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="validFrom" render={({ field }) => ( <FormItem><FormLabel required>Valid From</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem> )} />
                            <FormField control={form.control} name="validUntil" render={({ field }) => ( <FormItem><FormLabel>Valid Until</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < (form.getValues('validFrom') || new Date())} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem> )} />
                         </div>
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

