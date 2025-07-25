
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { Passenger } from '@/types/live-processing';
import { countries } from '@/lib/countries';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { AttachmentUploader } from '@/components/shared/attachment-uploader';

const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  localizedName: z.string().optional(),
  passportNumber: z.string().min(1, 'Passport number is required'),
  nationality: z.string().min(1, 'Nationality is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['Male', 'Female', 'Other']),
  status: z.enum(['Active', 'Inactive', 'Flagged', 'Blocked']),
  riskLevel: z.enum(['Low', 'Medium', 'High']),
  passportIssueDate: z.string().optional(),
  passportExpiryDate: z.string().optional(),
  passportCountry: z.string().optional(),
  visaNumber: z.string().optional(),
  visaType: z.enum(['Tourism', 'Work', 'Residency']).optional(),
  visaExpiryDate: z.string().optional(),
  residencyFileNumber: z.string().optional(),
  nationalId: z.string().optional(),
  passportPhotoUrl: z.string().optional(),
  personalPhotoUrl: z.string().optional(),
});

export type PassengerFormValues = z.infer<typeof formSchema>;

interface PassengerFormProps {
  passengerToEdit?: Partial<PassengerFormValues>;
  onSave: (data: PassengerFormValues) => void;
  isLoading?: boolean;
}

export function PassengerForm({ passengerToEdit, onSave, isLoading }: PassengerFormProps) {
  const router = useRouter();

  const form = useForm<PassengerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: passengerToEdit || {
      firstName: '',
      lastName: '',
      localizedName: '',
      passportNumber: '',
      nationality: '',
      dateOfBirth: '',
      gender: 'Male',
      status: 'Active',
      riskLevel: 'Low',
      passportIssueDate: '',
      passportExpiryDate: '',
      passportCountry: '',
      visaNumber: '',
      visaType: undefined,
      visaExpiryDate: '',
      residencyFileNumber: '',
      nationalId: '',
      passportPhotoUrl: '',
      personalPhotoUrl: '',
    },
  });

  const photoAttachmentConfigs = useMemo(() => [
    { name: 'passportPhotoUrl', label: 'Passport Photo', allowedMimeTypes: ['image/jpeg', 'image/png'], maxSize: 2 * 1024 * 1024, required: true },
    { name: 'personalPhotoUrl', label: 'Personal Photo', allowedMimeTypes: ['image/jpeg', 'image/png'], maxSize: 2 * 1024 * 1024, required: true },
  ], []);

  const handleAttachmentsChange = (files: Record<string, any>) => {
    form.setValue('passportPhotoUrl', files.passportPhotoUrl?.content || '');
    form.setValue('personalPhotoUrl', files.personalPhotoUrl?.content || '');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle>Personal Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="firstName" render={({ field }) => ( <FormItem><FormLabel required>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="lastName" render={({ field }) => ( <FormItem><FormLabel required>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="localizedName" render={({ field }) => ( <FormItem><FormLabel>Localized Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="dateOfBirth" render={({ field }) => ( <FormItem><FormLabel required>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="gender" render={({ field }) => ( <FormItem><FormLabel required>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                </CardContent>
             </Card>
             <Card>
                <CardHeader><CardTitle>Status & Risk</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="status" render={({ field }) => ( <FormItem><FormLabel required>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem><SelectItem value="Flagged">Flagged</SelectItem><SelectItem value="Blocked">Blocked</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="riskLevel" render={({ field }) => ( <FormItem><FormLabel required>Risk Level</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Low">Low</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="High">High</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                </CardContent>
             </Card>
          </div>
           <div className="space-y-6 lg:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle>Passport & Nationality</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="passportNumber" render={({ field }) => ( <FormItem><FormLabel required>Passport Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="nationality" render={({ field }) => ( <FormItem><FormLabel required>Nationality</FormLabel><Combobox options={countries} {...field} /><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="passportCountry" render={({ field }) => ( <FormItem><FormLabel>Issuing Country</FormLabel><Combobox options={countries} {...field} /><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="passportIssueDate" render={({ field }) => ( <FormItem><FormLabel>Issue Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="passportExpiryDate" render={({ field }) => ( <FormItem><FormLabel>Expiry Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="nationalId" render={({ field }) => ( <FormItem><FormLabel>National ID</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                </CardContent>
             </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Visa & Residency</CardTitle>
                </CardHeader>
                 <CardContent className="space-y-4">
                    <FormField control={form.control} name="visaNumber" render={({ field }) => ( <FormItem><FormLabel>Visa Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="visaType" render={({ field }) => ( <FormItem><FormLabel>Visa Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select visa type..."/></SelectTrigger></FormControl><SelectContent><SelectItem value="Tourism">Tourism</SelectItem><SelectItem value="Work">Work</SelectItem><SelectItem value="Residency">Residency</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="visaExpiryDate" render={({ field }) => ( <FormItem><FormLabel>Visa Expiry Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="residencyFileNumber" render={({ field }) => ( <FormItem><FormLabel>Residency File No.</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                 </CardContent>
             </Card>
          </div>
           <div className="space-y-6 lg:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle>Photos & Attachments</CardTitle>
                    <CardDescription>Upload passenger photos.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AttachmentUploader 
                        configs={photoAttachmentConfigs}
                        onFilesChange={handleAttachmentsChange}
                        initialFiles={{
                            passportPhotoUrl: passengerToEdit?.passportPhotoUrl || '',
                            personalPhotoUrl: passengerToEdit?.personalPhotoUrl || '',
                        }}
                        outputType='base64'
                    />
                </CardContent>
             </Card>
           </div>
        </div>
        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Form>
  );
}
