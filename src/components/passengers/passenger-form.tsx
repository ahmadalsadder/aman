

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, usePathname } from 'next/navigation';
import type { Passenger } from '@/types/live-processing';
import type { Module } from '@/types';
import { countries } from '@/lib/countries';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { AttachmentUploader } from '@/components/shared/attachment-uploader';
import { useTranslations } from 'next-intl';
import { Loader2, ArrowLeft, ArrowRight, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Stepper } from '@/components/shared/stepper';
import { AnimatePresence, motion } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { format, parse, isValid } from 'date-fns';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  localizedName: z.string().optional(),
  dateOfBirth: z.date({
    required_error: "A date of birth is required.",
  }),
  gender: z.enum(['Male', 'Female', 'Other']),
  
  passportNumber: z.string().min(1, 'Passport number is required'),
  nationality: z.string().min(1, 'Nationality is required'),
  passportCountry: z.string().optional(),
  passportIssueDate: z.date().optional(),
  passportExpiryDate: z.date().optional(),
  nationalId: z.string().optional(),

  passportPhotoUrl: z.string().optional(),
  personalPhotoUrl: z.string().optional(),
  
  visaNumber: z.string().optional(),
  visaType: z.enum(['Tourism', 'Work', 'Residency']).optional(),
  visaExpiryDate: z.date().optional(),
  residencyFileNumber: z.string().optional(),

  status: z.enum(['Active', 'Inactive', 'Flagged', 'Blocked']),
  riskLevel: z.enum(['Low', 'Medium', 'High']),
});

export type PassengerFormValues = z.infer<typeof formSchema>;

interface PassengerFormProps {
  passengerToEdit?: Passenger;
}

const steps = [
    { id: 'personal', label: 'Personal', fields: ['firstName', 'lastName', 'dateOfBirth', 'gender'] },
    { id: 'passport', label: 'Passport', fields: ['passportNumber', 'nationality'] },
    { id: 'visa', label: 'Visa/Residency', fields: [] },
    { id: 'photos', label: 'Photos', fields: [] },
    { id: 'status', label: 'Status & Review', fields: ['status', 'riskLevel'] },
];

const parseDateString = (dateString?: string): Date | undefined => {
    if (!dateString) return undefined;
    const date = parse(dateString, 'yyyy-MM-dd', new Date());
    return isValid(date) ? date : undefined;
};


export function PassengerForm({ passengerToEdit }: PassengerFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const module = useMemo(() => (pathname.split('/')[1] || 'airport') as Module, [pathname]);
  const { toast } = useToast();
  const t = useTranslations('PassengerForm');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<PassengerFormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: passengerToEdit
      ? { 
          ...passengerToEdit, 
          dateOfBirth: parseDateString(passengerToEdit.dateOfBirth),
          passportIssueDate: parseDateString(passengerToEdit.passportIssueDate),
          passportExpiryDate: parseDateString(passengerToEdit.passportExpiryDate),
          visaExpiryDate: parseDateString(passengerToEdit.visaExpiryDate),
          personalPhotoUrl: passengerToEdit.profilePicture, 
          passportPhotoUrl: passengerToEdit.passportPhotoUrl 
        }
      : {
          firstName: '', lastName: '', localizedName: '', passportNumber: '',
          nationality: '', dateOfBirth: undefined, gender: 'Male', status: 'Active',
          riskLevel: 'Low', passportIssueDate: undefined, passportExpiryDate: undefined,
          passportCountry: '', visaNumber: '', visaType: undefined,
          visaExpiryDate: undefined, residencyFileNumber: '', nationalId: '',
          passportPhotoUrl: '', personalPhotoUrl: '',
        },
  });

  const photoAttachmentConfigs = useMemo(() => [
    { name: 'passportPhotoUrl', label: t('photos.passportLabel'), allowedMimeTypes: ['image/jpeg', 'image/png'], maxSize: 2 * 1024 * 1024 },
    { name: 'personalPhotoUrl', label: t('photos.personalLabel'), allowedMimeTypes: ['image/jpeg', 'image/png'], maxSize: 2 * 1024 * 1024 },
  ], [t]);

  const handleAttachmentsChange = (files: Record<string, any>) => {
    if (files.passportPhotoUrl) form.setValue('passportPhotoUrl', files.passportPhotoUrl?.content || '');
    if (files.personalPhotoUrl) form.setValue('personalPhotoUrl', files.personalPhotoUrl?.content || '');
  };

  const onSave = async (data: PassengerFormValues) => {
    setIsLoading(true);
    const payload = {
      ...data,
      profilePicture: data.personalPhotoUrl,
      dateOfBirth: format(data.dateOfBirth, 'yyyy-MM-dd'),
      passportIssueDate: data.passportIssueDate ? format(data.passportIssueDate, 'yyyy-MM-dd') : undefined,
      passportExpiryDate: data.passportExpiryDate ? format(data.passportExpiryDate, 'yyyy-MM-dd') : undefined,
      visaExpiryDate: data.visaExpiryDate ? format(data.visaExpiryDate, 'yyyy-MM-dd') : undefined,
    };
    
    const result = await api.post<Passenger>('/data/passengers/save', payload);

    if (result.isSuccess && result.data) {
        const isEditing = !!data.id;
        toast({
            title: isEditing ? t('toast.updateSuccessTitle') : t('toast.addSuccessTitle'),
            description: isEditing 
              ? t('toast.updateSuccessDesc', { name: `${result.data.firstName} ${result.data.lastName}` })
              : t('toast.addSuccessDesc', { name: `${result.data.firstName} ${result.data.lastName}` }),
            variant: 'success',
        });
        router.push(`/${module === 'passengers' ? 'airport' : module}/passengers`);
    } else {
        toast({
            title: t('toast.errorTitle'),
            description: result.errors?.[0]?.message || t('toast.errorDesc'),
            variant: 'destructive',
        });
    }
    setIsLoading(false);
  };
  
  const nextStep = async () => {
    const currentStepFields = steps[currentStep].fields as (keyof PassengerFormValues)[];
    const isValid = await form.trigger(currentStepFields);
    if (isValid && currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
        setCurrentStep(prev => prev - 1);
    }
  };
  
  const motionVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <>
      <Stepper steps={steps} currentStep={currentStep} />
       <Form {...form}>
        <form onSubmit={form.handleSubmit(onSave)} className="mt-8 space-y-8">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    variants={motionVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                >
                    {currentStep === 0 && (
                        <Card>
                            <CardHeader><CardTitle>{t('details.title')}</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <FormField control={form.control} name="firstName" render={({ field }) => ( <FormItem><FormLabel required>{t('details.firstName')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                <FormField control={form.control} name="lastName" render={({ field }) => ( <FormItem><FormLabel required>{t('details.lastName')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                <FormField control={form.control} name="localizedName" render={({ field }) => ( <FormItem><FormLabel>{t('details.localizedName')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                <FormField control={form.control} name="dateOfBirth" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel required>{t('details.dob')}</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? (format(field.value, "PPP")) : (<span>Pick a date</span>)}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem> )} />
                                <FormField control={form.control} name="gender" render={({ field }) => ( <FormItem><FormLabel required>{t('details.gender')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Male">{t('details.male')}</SelectItem><SelectItem value="Female">{t('details.female')}</SelectItem><SelectItem value="Other">{t('details.other')}</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                            </CardContent>
                        </Card>
                    )}
                    {currentStep === 1 && (
                        <Card>
                            <CardHeader><CardTitle>{t('passport.title')}</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <FormField control={form.control} name="passportNumber" render={({ field }) => ( <FormItem><FormLabel required>{t('passport.passportNo')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                <FormField control={form.control} name="nationality" render={({ field }) => ( <FormItem><FormLabel required>{t('passport.nationality')}</FormLabel><Combobox options={countries} {...field} placeholder={t('passport.selectNationality')} /><FormMessage /></FormItem> )} />
                                <FormField control={form.control} name="passportCountry" render={({ field }) => ( <FormItem><FormLabel>{t('passport.issuingCountry')}</FormLabel><Combobox options={countries} {...field} placeholder={t('passport.selectIssuingCountry')} /><FormMessage /></FormItem> )} />
                                <FormField control={form.control} name="passportIssueDate" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>{t('passport.issueDate')}</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? (format(field.value, "PPP")) : (<span>Pick a date</span>)}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem> )} />
                                <FormField control={form.control} name="passportExpiryDate" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>{t('passport.expiryDate')}</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? (format(field.value, "PPP")) : (<span>Pick a date</span>)}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem> )} />
                                <FormField control={form.control} name="nationalId" render={({ field }) => ( <FormItem><FormLabel>{t('passport.nationalId')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                            </CardContent>
                        </Card>
                    )}
                    {currentStep === 2 && (
                         <Card>
                            <CardHeader><CardTitle>{t('visa.title')}</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <FormField control={form.control} name="visaNumber" render={({ field }) => ( <FormItem><FormLabel>{t('visa.visaNo')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                <FormField control={form.control} name="visaType" render={({ field }) => ( <FormItem><FormLabel>{t('visa.visaType')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder={t('visa.selectVisaType')}/></SelectTrigger></FormControl><SelectContent><SelectItem value="Tourism">{t('visa.tourism')}</SelectItem><SelectItem value="Work">{t('visa.work')}</SelectItem><SelectItem value="Residency">{t('visa.residency')}</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                                <FormField control={form.control} name="visaExpiryDate" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>{t('visa.visaExpiry')}</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? (format(field.value, "PPP")) : (<span>Pick a date</span>)}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem> )} />
                                <FormField control={form.control} name="residencyFileNumber" render={({ field }) => ( <FormItem><FormLabel>{t('visa.residencyNo')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                            </CardContent>
                        </Card>
                    )}
                    {currentStep === 3 && (
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
                                        passportPhotoUrl: passengerToEdit?.passportPhotoUrl || null,
                                        personalPhotoUrl: passengerToEdit?.profilePicture || null,
                                    }}
                                    outputType='base64'
                                />
                            </CardContent>
                        </Card>
                    )}
                    {currentStep === 4 && (
                        <Card>
                            <CardHeader><CardTitle>{t('status.title')}</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <FormField control={form.control} name="status" render={({ field }) => ( <FormItem><FormLabel required>{t('status.status')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Active">{t('status.active')}</SelectItem><SelectItem value="Inactive">{t('status.inactive')}</SelectItem><SelectItem value="Flagged">{t('status.flagged')}</SelectItem><SelectItem value="Blocked">{t('status.blocked')}</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                                <FormField control={form.control} name="riskLevel" render={({ field }) => ( <FormItem><FormLabel required>{t('status.riskLevel')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Low">{t('status.low')}</SelectItem><SelectItem value="Medium">{t('status.medium')}</SelectItem><SelectItem value="High">{t('status.high')}</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                            </CardContent>
                        </Card>
                    )}
                </motion.div>
            </AnimatePresence>

            <div className="flex justify-between items-center gap-4 pt-8 border-t">
                <div className="flex gap-2">
                    <Button type="button" variant="destructive" onClick={() => router.back()}>
                        <XCircle className="mr-2 h-4 w-4" />
                        {t('common.cancel')}
                    </Button>
                    <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t('common.back')}
                    </Button>
                </div>
                <div>
                    {currentStep < steps.length - 1 ? (
                        <Button type="button" onClick={nextStep}>
                            {t('common.next')}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {passengerToEdit ? t('common.save') : t('common.add')}
                        </Button>
                    )}
                </div>
            </div>
        </form>
       </Form>
    </>
  );
}
