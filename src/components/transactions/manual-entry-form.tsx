
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import type { Passenger } from '@/types/live-processing';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, User, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { countries } from '@/lib/countries';
import { useTranslations } from 'next-intl';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const manualTransactionSchema = z.object({
  // Search and passenger data
  passportNumberSearch: z.string(),
  passengerId: z.string().optional(),
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  passportNumber: z.string().min(1, "Passport number is required."),
  nationality: z.string().min(1, "Nationality is required."),
  dateOfBirth: z.string().min(1, "Date of birth is required."),
  gender: z.enum(['Male', 'Female', 'Other']),
  
  // Transaction data
  transactionType: z.enum(['Entry', 'Exit']),
  passportVerified: z.boolean().refine(val => val === true, {
    message: "You must verify the passport."
  }),
  visaVerified: z.boolean(),
  biometricsVerified: z.boolean().refine(val => val === true, {
    message: "You must verify the biometrics."
  }),
  officerNotes: z.string().optional(),
  finalDecision: z.enum(['Approved', 'Rejected', 'Manual Review'], {
    required_error: "A final decision is required."
  }),
});

type FormValues = z.infer<typeof manualTransactionSchema>;

const DetailItem = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-sm font-medium">{value || 'N/A'}</p>
  </div>
);

export function ManualEntryForm() {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('ManualEntry');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchedPassenger, setSearchedPassenger] = useState<Passenger | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(manualTransactionSchema),
    defaultValues: {
        passportNumberSearch: '',
        firstName: '',
        lastName: '',
        passportNumber: '',
        nationality: '',
        dateOfBirth: '',
        gender: 'Male',
        transactionType: 'Entry',
        passportVerified: false,
        visaVerified: false,
        biometricsVerified: false,
        officerNotes: '',
    },
  });

  const handleSearch = async () => {
    const passportNumber = form.getValues('passportNumberSearch');
    if (!passportNumber) return;

    setIsSearching(true);
    const result = await api.get<Passenger>(`/data/passenger-by-passport?passportNumber=${passportNumber}`);
    
    if (result.isSuccess && result.data) {
        const passenger = result.data;
        setSearchedPassenger(passenger);
        form.reset({
            ...form.getValues(),
            passengerId: passenger.id,
            firstName: passenger.firstName,
            lastName: passenger.lastName,
            passportNumber: passenger.passportNumber,
            nationality: countries.find(c => c.label === passenger.nationality)?.value || '',
            dateOfBirth: passenger.dateOfBirth,
            gender: passenger.gender,
        });
        toast({ title: t('toast.passengerFoundTitle'), description: t('toast.passengerFoundDesc') });
    } else {
        setSearchedPassenger(null);
        form.reset({
            ...form.getValues(),
            passengerId: undefined,
            firstName: '',
            lastName: '',
            passportNumber: passportNumber, // Pre-fill the passport number
            nationality: '',
            dateOfBirth: '',
        });
        toast({ title: t('toast.passengerNotFoundTitle'), description: t('toast.passengerNotFoundDesc'), variant: 'default' });
    }
    setIsSearching(false);
  };
  
  const needsVisaCheck = useMemo(() => {
    if (!searchedPassenger) return true; // Assume check needed for new entries
    return searchedPassenger.nationality !== 'United Arab Emirates';
  }, [searchedPassenger]);


  const onSubmit = (data: FormValues) => {
    setIsLoading(true);
    console.log("Manual Transaction Data:", data);

    // In a real app, you would submit this to a backend.
    setTimeout(() => {
      toast({
        title: t('toast.transactionRecordedTitle'),
        description: t('toast.transactionRecordedDesc', { passengerName: `${data.firstName} ${data.lastName}`, decision: data.finalDecision }),
        variant: 'success',
      });
      setIsLoading(false);
      router.back();
    }, 1000);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column: Passenger Selection & Details */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('passengerSearch.title')}</CardTitle>
                <CardDescription>{t('passengerSearch.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                 <FormField
                    control={form.control}
                    name="passportNumberSearch"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('passengerSearch.passportLabel')}</FormLabel>
                        <div className="flex gap-2">
                            <FormControl>
                                <Input placeholder={t('passengerSearch.passportPlaceholder')} {...field} />
                            </FormControl>
                            <Button type="button" onClick={handleSearch} disabled={isSearching || !field.value}>
                                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            </Button>
                        </div>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('passengerDetails.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <FormField control={form.control} name="firstName" render={({ field }) => ( <FormItem><FormLabel required>{t('passengerDetails.firstName')}</FormLabel><FormControl><Input {...field} disabled={!!searchedPassenger} /></FormControl><FormMessage /></FormItem> )} />
                     <FormField control={form.control} name="lastName" render={({ field }) => ( <FormItem><FormLabel required>{t('passengerDetails.lastName')}</FormLabel><FormControl><Input {...field} disabled={!!searchedPassenger} /></FormControl><FormMessage /></FormItem> )} />
                     <FormField control={form.control} name="passportNumber" render={({ field }) => ( <FormItem><FormLabel required>{t('passengerDetails.passportNumber')}</FormLabel><FormControl><Input {...field} disabled={!!searchedPassenger} /></FormControl><FormMessage /></FormItem> )} />
                     <FormField control={form.control} name="dateOfBirth" render={({ field }) => ( <FormItem><FormLabel required>{t('passengerDetails.dob')}</FormLabel><FormControl><Input type="date" {...field} disabled={!!searchedPassenger} /></FormControl><FormMessage /></FormItem> )} />
                     <FormField control={form.control} name="nationality" render={({ field }) => ( <FormItem><FormLabel required>{t('passengerDetails.nationality')}</FormLabel><Combobox options={countries} value={field.value} onChange={field.onChange} placeholder={t('passengerDetails.selectNationality')} disabled={!!searchedPassenger} /><FormMessage /></FormItem> )} />
                     <FormField control={form.control} name="gender" render={({ field }) => ( <FormItem><FormLabel required>{t('passengerDetails.gender')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!searchedPassenger}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                </CardContent>
            </Card>
          </div>

          {/* Right column: Verification & Decision */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('verification.title')}</CardTitle>
                <CardDescription>{t('verification.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <FormField control={form.control} name="transactionType" render={({ field }) => ( <FormItem><FormLabel required>{t('verification.transactionType')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Entry">{t('verification.entry')}</SelectItem><SelectItem value="Exit">{t('verification.exit')}</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                 <FormField
                    control={form.control}
                    name="passportVerified"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>{t('verification.passportVerified')}</FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  {needsVisaCheck && (
                    <FormField
                      control={form.control}
                      name="visaVerified"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>{t('verification.visaVerified')}</FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={form.control}
                    name="biometricsVerified"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>{t('verification.biometricsVerified')}</FormLabel>
                           <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('decision.title')}</CardTitle>
                <CardDescription>{t('decision.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="officerNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('decision.notesLabel')}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t('decision.notesPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="finalDecision"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel required>{t('decision.decisionLabel')}</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value="Approved" /></FormControl>
                            <FormLabel className="font-normal">{t('decision.approve')}</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value="Rejected" /></FormControl>
                            <FormLabel className="font-normal">{t('decision.reject')}</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value="Manual Review" /></FormControl>
                            <FormLabel className="font-normal">{t('decision.refer')}</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 {searchedPassenger?.riskLevel === 'High' && (
                    <Alert variant="destructive">
                        <AlertTitle>{t('decision.highRiskTitle')}</AlertTitle>
                        <AlertDescription>{t('decision.highRiskDesc')}</AlertDescription>
                    </Alert>
                 )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('common.completeTransaction')}
            </Button>
        </div>
      </form>
    </Form>
  );
}


