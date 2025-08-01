

'use client';

import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import type { Gate, Port, Terminal, Zone, Workflow, RiskProfile } from '@/types/live-processing';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { MachineType } from '@/lib/enums';
import { AttachmentUploader } from '@/components/shared/attachment-uploader';
import { nanoid } from 'nanoid';

const gateFormSchema = z.object({
  name: z.string().min(3, { message: "Gate name must be at least 3 characters." }),
  code: z.string().min(1, "Gate code is required."),
  portId: z.string().min(1, "You must select a port."),
  terminalId: z.string().min(1, "You must select a terminal."),
  zoneId: z.string().min(1, "You must select a zone."),
  ipAddress: z.string().ip({ version: "v4", message: "Invalid IP address format." }),
  macAddress: z.string().regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, { message: "Invalid MAC address format." }),
  type: z.enum(['Entry', 'Exit', 'Bidirectional', 'VIP', 'Crew']),
  status: z.enum(['Active', 'Maintenance', 'Offline', 'Limited']),
  warrantyStartDate: z.date().optional(),
  warrantyEndDate: z.date().optional(),
  connectedMachines: z.array(z.object({
    type: z.nativeEnum(MachineType),
    name: z.string().min(1, 'Machine name is required.'),
  })).optional(),
  entryConfig: z.object({
    workflowId: z.string().min(1, "Required"),
    riskProfileId: z.string().min(1, "Required"),
    capacity: z.coerce.number().min(0, "Must be non-negative"),
    configurationFile: z.string().optional(),
  }).optional(),
  exitConfig: z.object({
    workflowId: z.string().min(1, "Required"),
    riskProfileId: z.string().min(1, "Required"),
    capacity: z.coerce.number().min(0, "Must be non-negative"),
    configurationFile: z.string().optional(),
  }).optional(),
}).refine(data => {
    if (data.type === 'Entry' || data.type === 'Bidirectional') {
        return !!data.entryConfig;
    }
    return true;
}, { message: "Entry configuration is required for this gate type.", path: ["entryConfig"] })
.refine(data => {
    if (data.type === 'Exit' || data.type === 'Bidirectional') {
        return !!data.exitConfig;
    }
    return true;
}, { message: "Exit configuration is required for this gate type.", path: ["exitConfig"] })
.refine(data => {
    if(data.connectedMachines) {
        const types = data.connectedMachines.map(m => m.type);
        return new Set(types).size === types.length;
    }
    return true;
}, {
    message: "Machine types must be unique.",
    path: ["connectedMachines"],
});

export type GateFormValues = z.infer<typeof gateFormSchema>;

interface GateFormProps {
  gateToEdit?: Gate;
  onSave: (data: GateFormValues) => void;
  isLoading: boolean;
  ports: Port[];
  terminals: Terminal[];
  zones: Zone[];
  workflows: Workflow[];
  riskProfiles: RiskProfile[];
}

export function GateForm({
  gateToEdit,
  onSave,
  isLoading,
  ports,
  terminals,
  zones,
  workflows,
  riskProfiles,
}: GateFormProps) {
  const router = useRouter();
  const t = useTranslations('GatesPage.form');
  
  const form = useForm<GateFormValues>({
    resolver: zodResolver(gateFormSchema),
    defaultValues: gateToEdit ? {
        ...gateToEdit,
        connectedMachines: gateToEdit.connectedMachines || []
    } : {
      name: '',
      code: '',
      portId: '',
      terminalId: '',
      zoneId: '',
      ipAddress: '',
      macAddress: '',
      type: 'Bidirectional',
      status: 'Active',
      connectedMachines: [],
      entryConfig: { workflowId: '', riskProfileId: '', capacity: 20, configurationFile: '' },
      exitConfig: { workflowId: '', riskProfileId: '', capacity: 20, configurationFile: '' },
    },
  });

  const { control, watch, resetField, setValue } = form;
  const gateType = watch('type');
  const portId = watch('portId');
  const terminalId = watch('terminalId');
  const warrantyStart = watch('warrantyStartDate');
  const warrantyEnd = watch('warrantyEndDate');

  const { fields: machineFields, append: appendMachine, remove: removeMachine } = useFieldArray({
    control,
    name: "connectedMachines",
  });

  useEffect(() => { if (portId) resetField('terminalId', { defaultValue: '' }); }, [portId, resetField]);
  useEffect(() => { if (terminalId) resetField('zoneId', { defaultValue: '' }); }, [terminalId, resetField]);

  const portOptions = useMemo(() => ports.map(p => ({ value: p.id, label: p.name })), [ports]);
  const terminalOptions = useMemo(() => terminals.filter(t => t.portId === portId).map(t => ({ value: t.id, label: t.name })), [terminals, portId]);
  const zoneOptions = useMemo(() => zones.filter(z => z.terminalId === terminalId).map(z => ({ value: z.id, label: z.name })), [zones, terminalId]);
  const workflowOptions = useMemo(() => workflows.map(w => ({ value: w.id, label: w.name })), [workflows]);
  const riskProfileOptions = useMemo(() => riskProfiles.map(r => ({ value: r.id, label: r.name })), [riskProfiles]);

  const showEntryConfig = gateType === 'Entry' || gateType === 'Bidirectional';
  const showExitConfig = gateType === 'Exit' || gateType === 'Bidirectional';

  const entryAttachmentConfig = useMemo(() => ([{
    name: 'entryConfig.configurationFile',
    label: 'Configuration File',
    allowedMimeTypes: ['application/json', 'application/xml'],
    maxSize: 3 * 1024 * 1024
  }]), []);

  const exitAttachmentConfig = useMemo(() => ([{
    name: 'exitConfig.configurationFile',
    label: 'Configuration File',
    allowedMimeTypes: ['application/json', 'application/xml'],
    maxSize: 3 * 1024 * 1024
  }]), []);

  const handleEntryFileChange = (files: Record<string, any>) => setValue('entryConfig.configurationFile', files['entryConfig.configurationFile']?.content || '');
  const handleExitFileChange = (files: Record<string, any>) => setValue('exitConfig.configurationFile', files['exitConfig.configurationFile']?.content || '');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader><CardTitle>{t('basicInfo.title')}</CardTitle><CardDescription>{t('basicInfo.description')}</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <FormField control={control} name="name" render={({ field }) => ( <FormItem><FormLabel required>{t('basicInfo.name')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={control} name="code" render={({ field }) => ( <FormItem><FormLabel required>{t('basicInfo.code')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={control} name="portId" render={({ field }) => ( <FormItem><FormLabel required>{t('basicInfo.port')}</FormLabel><Combobox options={portOptions} {...field} placeholder={t('basicInfo.selectPort')} /><FormMessage /></FormItem> )} />
                <FormField control={control} name="terminalId" render={({ field }) => ( <FormItem><FormLabel required>{t('basicInfo.terminal')}</FormLabel><Combobox options={terminalOptions} {...field} placeholder={t('basicInfo.selectTerminal')} disabled={!portId} /><FormMessage /></FormItem> )} />
                <FormField control={control} name="zoneId" render={({ field }) => ( <FormItem><FormLabel required>{t('basicInfo.zone')}</FormLabel><Combobox options={zoneOptions} {...field} placeholder={t('basicInfo.selectZone')} disabled={!terminalId} /><FormMessage /></FormItem> )} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>{t('technicalInfo.title')}</CardTitle><CardDescription>{t('technicalInfo.description')}</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <FormField control={control} name="ipAddress" render={({ field }) => ( <FormItem><FormLabel required>{t('technicalInfo.ipAddress')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={control} name="macAddress" render={({ field }) => ( <FormItem><FormLabel required>{t('technicalInfo.macAddress')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>{t('config.title')}</CardTitle><CardDescription>{t('config.description')}</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={control} name="status" render={({ field }) => ( <FormItem><FormLabel required>{t('config.status')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Maintenance">Maintenance</SelectItem><SelectItem value="Offline">Offline</SelectItem><SelectItem value="Limited">Limited</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                    <FormField control={control} name="type" render={({ field }) => ( <FormItem><FormLabel required>{t('config.type')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Entry">Entry</SelectItem><SelectItem value="Exit">Exit</SelectItem><SelectItem value="Bidirectional">Bidirectional</SelectItem><SelectItem value="VIP">VIP</SelectItem><SelectItem value="Crew">Crew</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={control} name="warrantyStartDate" render={({ field }) => ( <FormItem><FormLabel>{t('config.warrantyStart')}</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, 'PPP') : <span>{t('config.pickDate')}</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => (warrantyEnd ? date > warrantyEnd : false)} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem> )} />
                    <FormField control={control} name="warrantyEndDate" render={({ field }) => ( <FormItem><FormLabel>{t('config.warrantyEnd')}</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, 'PPP') : <span>{t('config.pickDate')}</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date() || (warrantyStart ? date < warrantyStart : false)} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem> )} />
                </div>
              </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>{t('machines.title')}</CardTitle><CardDescription>{t('machines.description')}</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    {machineFields.map((field, index) => (
                        <div key={field.id} className="flex items-end gap-2 p-4 border rounded-md">
                             <FormField control={control} name={`connectedMachines.${index}.type`} render={({ field }) => ( <FormItem className="flex-grow"><FormLabel required>{t('machines.type')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{Object.values(MachineType).map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                             <FormField control={control} name={`connectedMachines.${index}.name`} render={({ field }) => ( <FormItem className="flex-grow"><FormLabel required>{t('machines.name')}</FormLabel><FormControl><Input {...field} placeholder={t('machines.namePlaceholder')} /></FormControl><FormMessage /></FormItem> )} />
                            <Button type="button" variant="destructive" size="icon" onClick={() => removeMachine(index)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" onClick={() => appendMachine({ type: MachineType.Scanner, name: '' })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> {t('machines.add')}
                    </Button>
                    <FormField control={form.control} name="connectedMachines" render={() => (<FormMessage/>)} />
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6" style={{ gridTemplateColumns: showEntryConfig && showExitConfig ? '1fr 1fr' : '1fr' }}>
                {showEntryConfig && <Card><CardHeader><CardTitle>{t('entryConfig.title')}</CardTitle></CardHeader><CardContent className="space-y-4">
                    <FormField control={control} name="entryConfig.workflowId" render={({ field }) => ( <FormItem><FormLabel required>{t('entryConfig.workflow')}</FormLabel><Combobox options={workflowOptions} {...field} placeholder={t('entryConfig.selectWorkflow')} /><FormMessage /></FormItem> )} />
                    <FormField control={control} name="entryConfig.riskProfileId" render={({ field }) => ( <FormItem><FormLabel required>{t('entryConfig.riskProfile')}</FormLabel><Combobox options={riskProfileOptions} {...field} placeholder={t('entryConfig.selectRiskProfile')} /><FormMessage /></FormItem> )} />
                    <FormField control={control} name="entryConfig.capacity" render={({ field }) => ( <FormItem><FormLabel required>{t('entryConfig.capacity')}</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={control} name="entryConfig.configurationFile" render={() => ( <FormItem><FormLabel>{t('entryConfig.configFile')}</FormLabel><AttachmentUploader configs={entryAttachmentConfig} onFilesChange={handleEntryFileChange} outputType="base64" initialFiles={{'entryConfig.configurationFile': gateToEdit?.entryConfig?.configurationFile || null}} /><FormMessage /></FormItem> )} />
                </CardContent></Card>}

                {showExitConfig && <Card><CardHeader><CardTitle>{t('exitConfig.title')}</CardTitle></CardHeader><CardContent className="space-y-4">
                    <FormField control={control} name="exitConfig.workflowId" render={({ field }) => ( <FormItem><FormLabel required>{t('exitConfig.workflow')}</FormLabel><Combobox options={workflowOptions} {...field} placeholder={t('exitConfig.selectWorkflow')} /><FormMessage /></FormItem> )} />
                    <FormField control={control} name="exitConfig.riskProfileId" render={({ field }) => ( <FormItem><FormLabel required>{t('exitConfig.riskProfile')}</FormLabel><Combobox options={riskProfileOptions} {...field} placeholder={t('exitConfig.selectRiskProfile')} /><FormMessage /></FormItem> )} />
                    <FormField control={control} name="exitConfig.capacity" render={({ field }) => ( <FormItem><FormLabel required>{t('exitConfig.capacity')}</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                     <FormField control={control} name="exitConfig.configurationFile" render={() => ( <FormItem><FormLabel>{t('exitConfig.configFile')}</FormLabel><AttachmentUploader configs={exitAttachmentConfig} onFilesChange={handleExitFileChange} outputType="base64" initialFiles={{'exitConfig.configurationFile': gateToEdit?.exitConfig?.configurationFile || null}} /><FormMessage /></FormItem> )} />
                </CardContent></Card>}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {gateToEdit ? t('common.save') : t('common.add')}
            </Button>
        </div>
      </form>
    </Form>
  );
}
