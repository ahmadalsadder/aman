
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import type { Passenger } from '@/types/live-processing';
import { countries } from '@/lib/countries';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { AttachmentUploader } from '@/components/shared/attachment-uploader';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('PassengerForm');

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
    { name: 'passportPhotoUrl', label: t('photos.passportLabel'), allowedMimeTypes: ['image/jpeg', 'image/png'], maxSize: 2 * 1024 * 1024, required: true },
    { name: 'personalPhotoUrl', label: t('photos.personalLabel'), allowedMimeTypes: ['image/jpeg', 'image/png'], maxSize: 2 * 1024 * 1024, required: true },
  ], [t]);

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
                    <CardTitle>{t('details.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="firstName" render={({ field }) => ( <FormItem><FormLabel required>{t('details.firstName')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="lastName" render={({ field }) => ( <FormItem><FormLabel required>{t('details.lastName')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="localizedName" render={({ field }) => ( <FormItem><FormLabel>{t('details.localizedName')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="dateOfBirth" render={({ field }) => ( <FormItem><FormLabel required>{t('details.dob')}</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="gender" render={({ field }) => ( <FormItem><FormLabel required>{t('details.gender')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Male">{t('details.male')}</SelectItem><SelectItem value="Female">{t('details.female')}</SelectItem><SelectItem value="Other">{t('details.other')}</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                </CardContent>
             </Card>
             <Card>
                <CardHeader><CardTitle>{t('status.title')}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="status" render={({ field }) => ( <FormItem><FormLabel required>{t('status.status')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Active">{t('status.active')}</SelectItem><SelectItem value="Inactive">{t('status.inactive')}</SelectItem><SelectItem value="Flagged">{t('status.flagged')}</SelectItem><SelectItem value="Blocked">{t('status.blocked')}</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="riskLevel" render={({ field }) => ( <FormItem><FormLabel required>{t('status.riskLevel')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Low">{t('status.low')}</SelectItem><SelectItem value="Medium">{t('status.medium')}</SelectItem><SelectItem value="High">{t('status.high')}</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                </CardContent>
             </Card>
          </div>
           <div className="space-y-6 lg:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle>{t('passport.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="passportNumber" render={({ field }) => ( <FormItem><FormLabel required>{t('passport.passportNo')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="nationality" render={({ field }) => ( <FormItem><FormLabel required>{t('passport.nationality')}</FormLabel><Combobox options={countries} {...field} placeholder={t('passport.selectNationality')} /><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="passportCountry" render={({ field }) => ( <FormItem><FormLabel>{t('passport.issuingCountry')}</FormLabel><Combobox options={countries} {...field} placeholder={t('passport.selectIssuingCountry')} /><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="passportIssueDate" render={({ field }) => ( <FormItem><FormLabel>{t('passport.issueDate')}</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="passportExpiryDate" render={({ field }) => ( <FormItem><FormLabel>{t('passport.expiryDate')}</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="nationalId" render={({ field }) => ( <FormItem><FormLabel>{t('passport.nationalId')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                </CardContent>
             </Card>
             <Card>
                <CardHeader>
                    <CardTitle>{t('visa.title')}</CardTitle>
                </CardHeader>
                 <CardContent className="space-y-4">
                    <FormField control={form.control} name="visaNumber" render={({ field }) => ( <FormItem><FormLabel>{t('visa.visaNo')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="visaType" render={({ field }) => ( <FormItem><FormLabel>{t('visa.visaType')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder={t('visa.selectVisaType')}/></SelectTrigger></FormControl><SelectContent><SelectItem value="Tourism">{t('visa.tourism')}</SelectItem><SelectItem value="Work">{t('visa.work')}</SelectItem><SelectItem value="Residency">{t('visa.residency')}</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="visaExpiryDate" render={({ field }) => ( <FormItem><FormLabel>{t('visa.visaExpiry')}</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="residencyFileNumber" render={({ field }) => ( <FormItem><FormLabel>{t('visa.residencyNo')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                 </CardContent>
             </Card>
          </div>
           <div className="space-y-6 lg:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle>{t('photos.title')}</CardTitle>
                    <CardDescription>{t('photos.description')}</CardDescription>
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
            <Button type="button" variant="outline" onClick={() => router.back()}>{t('common.cancel')}</Button>
            <Button type="submit">{passengerToEdit ? t('common.save') : t('common.add')}</Button>
        </div>
      </form>
    </Form>
  );
}
