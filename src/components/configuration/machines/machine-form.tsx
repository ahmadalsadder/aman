


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
import type { Machine, Port, Terminal, Zone } from '@/types/configuration';
import { useRouter } from 'next/navigation';
import { useMemo, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { MachineStatus, MachineType } from '@/lib/enums';

const formSchema = z.object({
  name: z.string().min(3, { message: "Machine name must be at least 3 characters." }),
  portId: z.string().min(1, "You must select a port."),
  terminalId: z.string().min(1, "You must select a terminal."),
  zoneId: z.string().min(1, "You must select a zone."),
  ipAddress: z.string().ip({ version: "v4", message: "Invalid IP address format." }),
  macAddress: z.string().regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, { message: "Invalid MAC address format." }),
  type: z.nativeEnum(MachineType),
  status: z.nativeEnum(MachineStatus),
});

export type MachineFormValues = z.infer<typeof formSchema>;

interface MachineFormProps {
  machineToEdit?: Machine;
  onSave: (data: MachineFormValues) => void;
  isLoading: boolean;
  ports: Port[];
  terminals: Terminal[];
  zones: Zone[];
}

export function MachineForm({
  machineToEdit,
  onSave,
  isLoading,
  ports,
  terminals,
  zones,
}: MachineFormProps) {
  const router = useRouter();
  const t = useTranslations('Configuration.Machines.form');
  
  const form = useForm<MachineFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: machineToEdit || {
      name: '',
      portId: '',
      terminalId: '',
      zoneId: '',
      ipAddress: '',
      macAddress: '',
      type: MachineType.Scanner,
      status: MachineStatus.Active,
    },
  });

  const portId = form.watch('portId');
  const terminalId = form.watch('terminalId');

  useEffect(() => {
    if (portId && !machineToEdit) {
        form.resetField('terminalId', { defaultValue: '' });
        form.resetField('zoneId', { defaultValue: '' });
    }
  }, [portId, form, machineToEdit]);

  useEffect(() => {
    if (terminalId && !machineToEdit) {
        form.resetField('zoneId', { defaultValue: '' });
    }
  }, [terminalId, form, machineToEdit]);

  const portOptions = useMemo(() => ports.map(p => ({ value: p.id, label: p.name })), [ports]);
  const terminalOptions = useMemo(() => 
    terminals
        .filter(t => t.portId === portId)
        .map(t => ({ value: t.id, label: t.name }))
  , [terminals, portId]);
  const zoneOptions = useMemo(() => 
    zones
        .filter(z => z.terminalId === terminalId)
        .map(z => ({ value: z.id, label: z.name }))
  , [zones, terminalId]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('details.title')}</CardTitle>
            <CardDescription>{t('details.description')}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel required>{t('details.name')}</FormLabel><FormControl><Input placeholder={t('details.namePlaceholder')} {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="type" render={({ field }) => ( <FormItem><FormLabel required>{t('details.type')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{Object.values(MachineType).map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="status" render={({ field }) => ( <FormItem><FormLabel required>{t('details.status')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{Object.values(MachineStatus).map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="ipAddress" render={({ field }) => ( <FormItem><FormLabel required>{t('details.ipAddress')}</FormLabel><FormControl><Input placeholder="192.168.1.1" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="macAddress" render={({ field }) => ( <FormItem><FormLabel required>{t('details.macAddress')}</FormLabel><FormControl><Input placeholder="00:1A:2B:3C:4D:5E" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <div />
            <FormField control={form.control} name="portId" render={({ field }) => ( <FormItem><FormLabel required>{t('details.port')}</FormLabel><Combobox options={portOptions} {...field} placeholder={t('details.selectPort')} /><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="terminalId" render={({ field }) => ( <FormItem><FormLabel required>{t('details.terminal')}</FormLabel><Combobox options={terminalOptions} {...field} placeholder={t('details.selectTerminal')} disabled={!portId} /><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="zoneId" render={({ field }) => ( <FormItem><FormLabel required>{t('details.zone')}</FormLabel><Combobox options={zoneOptions} {...field} placeholder={t('details.selectZone')} disabled={!terminalId} /><FormMessage /></FormItem> )} />
          </CardContent>
        </Card>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>{t('common.cancel')}</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {machineToEdit ? t('common.save') : t('common.add')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
