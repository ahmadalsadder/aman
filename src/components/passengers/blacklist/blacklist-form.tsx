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
import type { BlacklistEntry } from '@/types/live-processing';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  passengerId: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  nationality: z.string().min(1, 'Nationality is required'),
  category: z.enum(['No-Fly', 'Wanted', 'Financial', 'Other']),
  reason: z.string().min(1, 'Reason for blacklisting is required'),
  addedBy: z.string().min(1, 'Added by information is required'),
  notes: z.string().optional(),
  attachmentUrl: z.string().optional(),
});

export type BlacklistFormValues = z.infer<typeof formSchema>;

interface BlacklistFormProps {
  entryToEdit?: BlacklistEntry;
  onSave: (data: BlacklistFormValues) => void;
  isLoading?: boolean;
}

export function BlacklistForm({ entryToEdit, onSave, isLoading }: BlacklistFormProps) {
  const router = useRouter();

  const form = useForm<BlacklistFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: entryToEdit || {
      passengerId: '',
      name: '',
      nationality: '',
      category: 'Other',
      reason: '',
      addedBy: '',
      notes: '',
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
                    <CardTitle>Blacklist Entry Details</CardTitle>
                    <CardDescription>Enter the information for the individual to be blacklisted.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel required>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="passengerId" render={({ field }) => ( <FormItem><FormLabel>Passenger ID (Optional)</FormLabel><FormControl><Input {...field} placeholder='Enter if known' /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="nationality" render={({ field }) => ( <FormItem><FormLabel required>Nationality</FormLabel><Combobox options={countries} {...field} /><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="reason" render={({ field }) => ( <FormItem><FormLabel required>Reason for Blacklisting</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="notes" render={({ field }) => ( <FormItem><FormLabel>Notes (Optional)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
                </CardContent>
            </Card>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Category & Source</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="category" render={({ field }) => ( <FormItem><FormLabel required>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="No-Fly">No-Fly</SelectItem><SelectItem value="Wanted">Wanted</SelectItem><SelectItem value="Financial">Financial</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="addedBy" render={({ field }) => ( <FormItem><FormLabel required>Added By / Source</FormLabel><FormControl><Input {...field} placeholder="e.g., Interpol, Local Police" /></FormControl><FormMessage /></FormItem> )} />
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
