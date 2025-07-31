

'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Shift, Break } from '@/types';
import { useRouter } from 'next/navigation';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslations } from 'next-intl';
import { DayOfWeek, Status } from '@/lib/enums';
import { nanoid } from 'nanoid';

const breakSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Break name is required."),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute."),
});

const formSchema = z.object({
  name: z.string().min(2, "Shift name must be at least 2 characters."),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  days: z.array(z.nativeEnum(DayOfWeek)).refine((value) => value.some((item) => item), {
    message: "You have to select at least one day.",
  }),
  status: z.nativeEnum(Status),
  breaks: z.array(breakSchema).optional(),
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
  const tEnum = useTranslations('Enums');

  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: shiftToEdit || {
      name: '',
      startTime: '08:00',
      endTime: '16:00',
      days: [DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday],
      status: Status.Active,
      breaks: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'breaks',
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
                <FormField control={form.control} name="status" render={({ field }) => ( <FormItem><FormLabel required>{t('details.status')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>{Object.values(Status).map(s => <SelectItem key={s} value={s}>{tEnum(`Status.${s}`)}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
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
                            {Object.values(DayOfWeek).map((dayValue) => (
                            <FormField
                                key={dayValue}
                                control={form.control}
                                name="days"
                                render={({ field }) => {
                                return (
                                    <FormItem
                                    key={dayValue}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                    <FormControl>
                                        <Checkbox
                                        checked={field.value?.includes(dayValue)}
                                        onCheckedChange={(checked) => {
                                            return checked
                                            ? field.onChange([...(field.value || []), dayValue])
                                            : field.onChange(
                                                field.value?.filter(
                                                (value) => value !== dayValue
                                                )
                                            )
                                        }}
                                        />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                        {tEnum(`DayOfWeek.${dayValue}`)}
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
        <Card>
            <CardHeader>
                <CardTitle>Breaks</CardTitle>
                <CardDescription>Define breaks within this shift.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-2 p-4 border rounded-md">
                        <FormField
                            control={form.control}
                            name={`breaks.${index}.name`}
                            render={({ field }) => (
                                <FormItem className="flex-grow"><FormLabel>Break Name</FormLabel><FormControl><Input {...field} placeholder="e.g., Lunch" /></FormControl><FormMessage /></FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name={`breaks.${index}.startTime`}
                            render={({ field }) => (
                                <FormItem><FormLabel>Start Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name={`breaks.${index}.duration`}
                            render={({ field }) => (
                                <FormItem><FormLabel>Duration (min)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )}
                        />
                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ id: nanoid(), name: '', startTime: '12:00', duration: 30 })}
                >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Break
                </Button>
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
