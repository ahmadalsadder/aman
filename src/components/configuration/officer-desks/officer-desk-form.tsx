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
import type { OfficerDesk, Port, Terminal, Zone, Workflow, RiskProfile } from '@/types/configuration';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

const formSchema = z.object({
  name: z.string().min(3, { message: "Desk name must be at least 3 characters." }),
  portId: z.string().min(1, "You must select a port."),
  terminalId: z.string().min(1, "You must select a terminal."),
  zoneId: z.string().min(1, "You must select a zone."),
  ipAddress: z.string().ip({ version: "v4", message: "Invalid IP address format." }),
  macAddress: z.string().regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, { message: "Invalid MAC address format." }),
  movementType: z.enum(['Entry', 'Exit', 'Bidirectional']),
  workflowId: z.string().min(1, "You must select a workflow."),
  riskRuleId: z.string().min(1, "You must select a risk profile."),
  status: z.enum(['Active', 'Inactive', 'Closed']),
});

export type OfficerDeskFormValues = z.infer<typeof formSchema>;

interface OfficerDeskFormProps {
  desk?: OfficerDesk;
  onSave: (data: OfficerDeskFormValues) => void;
  isLoading: boolean;
  ports: Port[];
  terminals: Terminal[];
  zones: Zone[];
  workflows: Workflow[];
  riskProfiles: RiskProfile[];
}

export function OfficerDeskForm({
  desk,
  onSave,
  isLoading,
  ports,
  terminals,
  zones,
  workflows,
  riskProfiles,
}: OfficerDeskFormProps) {
  const router = useRouter();
  const t = useTranslations('OfficerDesks.form');
  
  const form = useForm<OfficerDeskFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: desk || {
      name: '',
      portId: '',
      terminalId: '',
      zoneId: '',
      ipAddress: '',
      macAddress: '',
      movementType: 'Bidirectional',
      workflowId: '',
      riskRuleId: '',
      status: 'Active',
    },
  });

  const portId = form.watch('portId');
  const terminalId = form.watch('terminalId');

  useEffect(() => {
    if (portId) {
        form.resetField('terminalId', { defaultValue: '' });
        form.resetField('zoneId', { defaultValue: '' });
    }
  }, [portId, form]);

  useEffect(() => {
    if (terminalId) {
        form.resetField('zoneId', { defaultValue: '' });
    }
  }, [terminalId, form]);

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
  const workflowOptions = useMemo(() => workflows.map(w => ({ value: w.id, label: w.name })), [workflows]);
  const riskProfileOptions = useMemo(() => riskProfiles.map(r => ({ value: r.id, label: r.name })), [riskProfiles]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <Card>
                <CardHeader>
                    <CardTitle>{t('deskInfo')}</CardTitle>
                    <CardDescription>{t('deskInfoDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel required>{t('deskName')}</FormLabel><FormControl><Input placeholder={t('deskNamePlaceholder')} {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="portId" render={({ field }) => ( <FormItem><FormLabel required>{t('port')}</FormLabel><Combobox options={portOptions} value={field.value} onChange={field.onChange} placeholder={t('selectPort')} /><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="terminalId" render={({ field }) => ( <FormItem><FormLabel required>{t('terminal')}</FormLabel><Combobox options={terminalOptions} value={field.value} onChange={field.onChange} placeholder={t('selectTerminal')} disabled={!portId} /><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="zoneId" render={({ field }) => ( <FormItem><FormLabel required>{t('zone')}</FormLabel><Combobox options={zoneOptions} value={field.value} onChange={field.onChange} placeholder={t('selectZone')} disabled={!terminalId} /><FormMessage /></FormItem> )} />
                </CardContent>
              </Card>
            </div>
            <div>
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>{t('technicalInfo')}</CardTitle>
                        <CardDescription>{t('technicalInfoDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="ipAddress" render={({ field }) => ( <FormItem><FormLabel required>{t('ipAddress')}</FormLabel><FormControl><Input placeholder={t('ipAddressPlaceholder')} {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="macAddress" render={({ field }) => ( <FormItem><FormLabel required>{t('macAddress')}</FormLabel><FormControl><Input placeholder={t('macAddressPlaceholder')} {...field} /></FormControl><FormMessage /></FormItem> )} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>{t('configInfo')}</CardTitle>
                        <CardDescription>{t('configInfoDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="status" render={({ field }) => ( <FormItem><FormLabel required>{t('status')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem><SelectItem value="Closed">Closed</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="movementType" render={({ field }) => ( <FormItem><FormLabel required>{t('movementType')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Entry">Entry</SelectItem><SelectItem value="Exit">Exit</SelectItem><SelectItem value="Bidirectional">Bidirectional</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="workflowId" render={({ field }) => ( <FormItem><FormLabel required>{t('workflow')}</FormLabel><Combobox options={workflowOptions} value={field.value} onChange={field.onChange} placeholder={t('selectWorkflow')} /><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="riskRuleId" render={({ field }) => ( <FormItem><FormLabel required>{t('riskProfile')}</FormLabel><Combobox options={riskProfileOptions} value={field.value} onChange={field.onChange} placeholder={t('selectRiskProfile')} /><FormMessage /></FormItem> )} />
                    </CardContent>
                </Card>
            </div>
        </div>
        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>{t('cancel')}</Button>
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {desk ? t('save') : t('add')}
            </Button>
        </div>
      </form>
    </Form>
  );
}
