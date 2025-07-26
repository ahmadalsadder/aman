

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Shift } from '@/types';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { daysOfWeek } from '@/lib/mock-data';
import { useTranslations } from 'next-intl';

const formSchema = z.object({
  name: z.string().min(2, "Shift name must be at least 2 characters."),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  days: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one day.",
  }),
  status: z.enum(['Active', 'Inactive']),
});

export type ShiftFormValues = z.infer<typeof formSchema>;

interface ShiftFormProps {
  shiftToEdit?: Shift;
  onSave: (data: ShiftFormValues) => void;
  isLoading: boolean;
}

export function ShiftForm({ shiftToEdit, onSave, isLoading }: ShiftFormProps) {
  const router = useRouter();
  const t = useTranslations('ShiftManagement.form');

  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: shiftToEdit || {
      name: '',
      startTime: '08:00',
      endTime: '16:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      status: 'Active',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>{t('details.title')}</CardTitle>
                <CardDescription>{t('details.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel required>{t('details.name')}</FormLabel><FormControl><Input placeholder={t('details.namePlaceholder')} {...field} /></FormControl><FormMessage /></FormItem> )} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="startTime" render={({ field }) => ( <FormItem><FormLabel required>{t('details.startTime')}</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="endTime" render={({ field }) => ( <FormItem><FormLabel required>{t('details.endTime')}</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
                <FormField control={form.control} name="status" render={({ field }) => ( <FormItem><FormLabel required>{t('details.status')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Active">{t('details.active')}</SelectItem><SelectItem value="Inactive">{t('details.inactive')}</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>{t('operatingDays.title')}</CardTitle>
                <CardDescription>{t('operatingDays.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                 <FormField
                    control={form.control}
                    name="days"
                    render={() => (
                        <FormItem>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {daysOfWeek.map((item) => (
                            <FormField
                                key={item.id}
                                control={form.control}
                                name="days"
                                render={({ field }) => {
                                return (
                                    <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                    <FormControl>
                                        <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                            return checked
                                            ? field.onChange([...(field.value || []), item.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                (value) => value !== item.id
                                                )
                                            )
                                        }}
                                        />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                        {item.label}
                                    </FormLabel>
                                    </FormItem>
                                )
                                }}
                            />
                            ))}
                        </div>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
            </CardContent>
        </Card>
        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {shiftToEdit ? t('common.save') : t('common.add')}
            </Button>
        </div>
      </form>
    </Form>
  );
}
