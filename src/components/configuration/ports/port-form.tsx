
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import type { Port, PortType } from '@/types/configuration';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Textarea } from '@/components/ui/textarea';
import { countries } from '@/lib/countries';

const formSchema = z.object({
  name: z.string().min(3, { message: "Port name must be at least 3 characters." }),
  shortName: z.string().optional(),
  localizedName: z.string().optional(),
  city: z.string().min(2, { message: "City is required." }),
  country: z.string().min(1, "Country is required."),
  type: z.enum(['Airport', 'Seaport', 'Landport']),
  status: z.enum(['Active', 'Inactive']),
  address: z.string().optional(),
  localizedAddress: z.string().optional(),
});

export type PortFormValues = z.infer<typeof formSchema>;

interface PortFormProps {
  portToEdit?: Port;
  onSave: (data: PortFormValues) => void;
  isLoading: boolean;
}

export function PortForm({ portToEdit, onSave, isLoading }: PortFormProps) {
  const router = useRouter();
  const t = useTranslations('Configuration.Ports.form');
  
  const form = useForm<PortFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: portToEdit || {
      name: '',
      shortName: '',
      localizedName: '',
      city: '',
      country: '',
      type: 'Airport',
      status: 'Active',
      address: '',
      localizedAddress: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
        <Card>
            <CardHeader><CardTitle>{t('details.title')}</CardTitle><CardDescription>{t('details.description')}</CardDescription></CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel required>{t('details.name')}</FormLabel><FormControl><Input placeholder={t('details.namePlaceholder')} {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="shortName" render={({ field }) => ( <FormItem><FormLabel>{t('details.shortName')}</FormLabel><FormControl><Input placeholder={t('details.shortNamePlaceholder')} {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="localizedName" render={({ field }) => ( <FormItem><FormLabel>{t('details.localizedName')}</FormLabel><FormControl><Input placeholder={t('details.localizedNamePlaceholder')} {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="city" render={({ field }) => ( <FormItem><FormLabel required>{t('details.city')}</FormLabel><FormControl><Input placeholder={t('details.cityPlaceholder')} {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="country" render={({ field }) => ( <FormItem><FormLabel required>{t('details.country')}</FormLabel><Combobox options={countries} {...field} placeholder={t('details.countryPlaceholder')} /><FormMessage /></FormItem> )} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="address" render={({ field }) => ( <FormItem><FormLabel>{t('details.address')}</FormLabel><FormControl><Textarea placeholder={t('details.addressPlaceholder')} {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="localizedAddress" render={({ field }) => ( <FormItem><FormLabel>{t('details.localizedAddress')}</FormLabel><FormControl><Textarea placeholder={t('details.localizedAddressPlaceholder')} {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="type" render={({ field }) => ( <FormItem><FormLabel required>{t('details.type')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Airport">Airport</SelectItem><SelectItem value="Seaport">Seaport</SelectItem><SelectItem value="Landport">Landport</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="status" render={({ field }) => ( <FormItem><FormLabel required>{t('details.status')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                </div>
            </CardContent>
        </Card>
        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {portToEdit ? t('common.save') : t('common.add')}
            </Button>
        </div>
      </form>
    </Form>
  );
}
