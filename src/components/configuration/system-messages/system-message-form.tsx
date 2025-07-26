
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { SystemMessage } from '@/types/configuration';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  name: z.string().min(3, { message: "Message name must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  localizedName: z.string().optional(),
  localizedDescription: z.string().optional(),
  category: z.enum(['Passenger Issue', 'Machine Issue', 'General Alert', 'System Info']),
  status: z.enum(['Active', 'Inactive']),
});

export type SystemMessageFormValues = z.infer<typeof formSchema>;

interface SystemMessageFormProps {
  messageToEdit?: SystemMessage;
  onSave: (data: SystemMessageFormValues) => void;
  isLoading: boolean;
}

export function SystemMessageForm({ messageToEdit, onSave, isLoading }: SystemMessageFormProps) {
  const router = useRouter();
  const t = useTranslations('Configuration.SystemMessages.form');
  
  const form = useForm<SystemMessageFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: messageToEdit || {
      name: '',
      description: '',
      localizedName: '',
      localizedDescription: '',
      category: 'General Alert',
      status: 'Active',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
        <Card>
            <CardHeader><CardTitle>{t('details.title')}</CardTitle><CardDescription>{t('details.description')}</CardDescription></CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel required>{t('details.name')}</FormLabel><FormControl><Input placeholder={t('details.namePlaceholder')} {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="localizedName" render={({ field }) => ( <FormItem><FormLabel>{t('details.localizedName')}</FormLabel><FormControl><Input placeholder={t('details.localizedNamePlaceholder')} {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
                 <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel required>{t('details.descriptionField')}</FormLabel><FormControl><Textarea placeholder={t('details.descriptionPlaceholder')} {...field} /></FormControl><FormMessage /></FormItem> )} />
                 <FormField control={form.control} name="localizedDescription" render={({ field }) => ( <FormItem><FormLabel>{t('details.localizedDescription')}</FormLabel><FormControl><Textarea placeholder={t('details.localizedDescriptionPlaceholder')} {...field} /></FormControl><FormMessage /></FormItem> )} />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="category" render={({ field }) => ( <FormItem><FormLabel required>{t('details.category')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Passenger Issue">Passenger Issue</SelectItem><SelectItem value="Machine Issue">Machine Issue</SelectItem><SelectItem value="General Alert">General Alert</SelectItem><SelectItem value="System Info">System Info</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="status" render={({ field }) => ( <FormItem><FormLabel required>{t('details.status')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                </div>
            </CardContent>
        </Card>
        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {messageToEdit ? t('common.save') : t('common.add')}
            </Button>
        </div>
      </form>
    </Form>
  );
}
