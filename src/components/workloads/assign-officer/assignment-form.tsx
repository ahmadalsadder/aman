
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import type { OfficerAssignment, Port, Terminal, Zone, Shift, User } from '@/types';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import CalendarIcon from '@/components/icons/calendar-icon';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  officerId: z.string().min(1, "You must select an officer."),
  shiftId: z.string().min(1, "You must select a shift."),
  portId: z.string().min(1, "You must select a port."),
  terminalId: z.string().min(1, "You must select a terminal."),
  zoneId: z.string().min(1, "You must select a zone."),
  assignmentDate: z.date({ required_error: "An assignment date is required." }),
  status: z.enum(['Confirmed', 'Pending', 'Cancelled']),
  notes: z.string().optional(),
});

export type AssignmentFormValues = z.infer<typeof formSchema>;

interface AssignmentFormProps {
  assignment?: OfficerAssignment;
  onSave: (data: AssignmentFormValues) => void;
  isLoading: boolean;
  pageData: {
    officers: User[];
    shifts: Shift[];
    ports: Port[];
    terminals: Terminal[];
    zones: Zone[];
  };
}

export function AssignmentForm({
  assignment,
  onSave,
  isLoading,
  pageData,
}: AssignmentFormProps) {
  const router = useRouter();
  const t = useTranslations('AssignOfficer.form');

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: assignment
      ? { ...assignment, assignmentDate: new Date(assignment.assignmentDate) }
      : {
        officerId: '',
        shiftId: '',
        portId: '',
        terminalId: '',
        zoneId: '',
        assignmentDate: new Date(),
        status: 'Pending',
        notes: '',
      },
  });

  const portId = form.watch('portId');
  const terminalId = form.watch('terminalId');

  useEffect(() => {
    if (portId && !assignment) form.resetField('terminalId', { defaultValue: '' });
  }, [portId, form, assignment]);

  useEffect(() => {
    if (terminalId && !assignment) form.resetField('zoneId', { defaultValue: '' });
  }, [terminalId, form, assignment]);

  const officerOptions = useMemo(() => pageData.officers.map(o => ({ value: o.id, label: o.name })), [pageData.officers]);
  const shiftOptions = useMemo(() => pageData.shifts.map(s => ({ value: s.id, label: s.name })), [pageData.shifts]);
  const portOptions = useMemo(() => pageData.ports.map(p => ({ value: p.id, label: p.name })), [pageData.ports]);
  const terminalOptions = useMemo(() => pageData.terminals.filter(t => t.portId === portId).map(t => ({ value: t.id, label: t.name })), [pageData.terminals, portId]);
  const zoneOptions = useMemo(() => pageData.zones.filter(z => z.terminalId === terminalId).map(z => ({ value: z.id, label: z.name })), [pageData.zones, terminalId]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>{t('details.title')}</CardTitle>
                <CardDescription>{t('details.description')}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="officerId" render={({ field }) => ( <FormItem><FormLabel required>{t('details.officer')}</FormLabel><Combobox options={officerOptions} {...field} placeholder={t('details.selectOfficer')} /><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="assignmentDate" render={({ field }) => ( <FormItem><FormLabel required>{t('details.date')}</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, 'PPP') : <span>{t('details.pickDate')}</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="portId" render={({ field }) => ( <FormItem><FormLabel required>{t('details.port')}</FormLabel><Combobox options={portOptions} {...field} placeholder={t('details.selectPort')} /><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="terminalId" render={({ field }) => ( <FormItem><FormLabel required>{t('details.terminal')}</FormLabel><Combobox options={terminalOptions} {...field} placeholder={t('details.selectTerminal')} disabled={!portId} /><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="zoneId" render={({ field }) => ( <FormItem><FormLabel required>{t('details.zone')}</FormLabel><Combobox options={zoneOptions} {...field} placeholder={t('details.selectZone')} disabled={!terminalId} /><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="shiftId" render={({ field }) => ( <FormItem><FormLabel required>{t('details.shift')}</FormLabel><Combobox options={shiftOptions} {...field} placeholder={t('details.selectShift')} /><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="status" render={({ field }) => ( <FormItem><FormLabel required>{t('details.status')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Pending">{t('details.pending')}</SelectItem><SelectItem value="Confirmed">{t('details.confirmed')}</SelectItem><SelectItem value="Cancelled">{t('details.cancelled')}</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="notes" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>{t('details.notes')}</FormLabel><FormControl><Textarea placeholder={t('details.notesPlaceholder')} {...field} /></FormControl><FormMessage /></FormItem> )} />
            </CardContent>
        </Card>
        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {assignment ? t('common.save') : t('common.add')}
            </Button>
        </div>
      </form>
    </Form>
  );
}
