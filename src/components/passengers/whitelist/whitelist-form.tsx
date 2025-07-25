'use client';

import React, { useMemo } from 'react';
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
import type { WhitelistEntry } from '@/types/live-processing';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

const formSchema = z.object({
  passengerId: z.string().min(1, 'Passenger ID is required. Use "N/A" if not applicable.'),
  name: z.string().min(1, 'Name is required'),
  nationality: z.string().min(1, 'Nationality is required'),
  status: z.enum(['Active', 'Expired', 'Revoked']),
  validUntil: z.string().min(1, 'Valid until date is required'),
  addedBy: z.string().min(1, 'Added by information is required'),
  reason: z.string().min(1, 'Reason for whitelisting is required'),
  attachmentUrl: z.string().optional(),
});

export type WhitelistFormValues = z.infer<typeof formSchema>;

interface WhitelistFormProps {
  entryToEdit?: WhitelistEntry;
  onSave: (data: WhitelistFormValues) => void;
  isLoading?: boolean;
}

export function WhitelistForm({ entryToEdit, onSave, isLoading }: WhitelistFormProps) {
  const router = useRouter();

  const form = useForm<WhitelistFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: entryToEdit || {
      passengerId: '',
      name: '',
      nationality: '',
      status: 'Active',
      validUntil: '',
      addedBy: '',
      reason: '',
      attachmentUrl: '',
    },
  });

  const attachmentConfigs = useMemo(() => [
    { name: 'attachmentUrl', label: 'Supporting Document', allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'], maxSize: 5 * 1024 * 1024 },
  ], []);

  const handleAttachmentsChange = (files: Record<string, any>) => {
    form.setValue('attachmentUrl', files.attachmentUrl?.content || '');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Whitelist Entry Details</CardTitle>
                    <CardDescription>Enter the information for the individual to be whitelisted.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel required>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="passengerId" render={({ field }) => ( <FormItem><FormLabel required>Passenger ID</FormLabel><FormControl><Input {...field} placeholder='Enter "N/A" if not applicable' /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="nationality" render={({ field }) => ( <FormItem><FormLabel required>Nationality</FormLabel><Combobox options={countries} {...field} /><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="reason" render={({ field }) => ( <FormItem><FormLabel required>Reason for Whitelisting</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
                </CardContent>
            </Card>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Status & Validity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="status" render={({ field }) => ( <FormItem><FormLabel required>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Expired">Expired</SelectItem><SelectItem value="Revoked">Revoked</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="validUntil" render={({ field }) => ( <FormItem><FormLabel required>Valid Until</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="addedBy" render={({ field }) => ( <FormItem><FormLabel required>Added By</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Attachment</CardTitle></CardHeader>
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
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>Save Entry</Button>
        </div>
      </form>
    </Form>
  );
}
