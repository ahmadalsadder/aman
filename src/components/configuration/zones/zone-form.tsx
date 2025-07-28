

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
import type { Zone, Terminal } from '@/types/configuration';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Status } from '@/lib/enums';

const formSchema = z.object({
  name: z.string().min(2, "Zone name must be at least 2 characters."),
  terminalId: z.string().min(1, "You must select a terminal."),
  status: z.nativeEnum(Status),
});

export type ZoneFormValues = z.infer<typeof formSchema>;

interface ZoneFormProps {
  zoneToEdit?: Zone;
  onSave: (data: ZoneFormValues) => void;
  isLoading: boolean;
  terminals: Terminal[];
}

export function ZoneForm({ zoneToEdit, onSave, isLoading, terminals }: ZoneFormProps) {
  const router = useRouter();
  const t = useTranslations('Configuration.Zones.form');
  
  const form = useForm<ZoneFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: zoneToEdit || {
      name: '',
      terminalId: '',
      status: Status.Active,
    },
  });

  const terminalOptions = useMemo(() => terminals.map(t => ({ value: t.id, label: `${t.name} (Port ID: ${t.portId})` })), [terminals]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>{t('details.title')}</CardTitle>
                <CardDescription>{t('details.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    control={form.control}
                    name="terminalId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel required>{t('details.terminal')}</FormLabel>
                            <Combobox 
                                options={terminalOptions} 
                                {...field} 
                                placeholder={t('details.selectTerminal')}
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel required>{t('details.name')}</FormLabel>
                            <FormControl>
                                <Input placeholder={t('details.namePlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel required>{t('details.status')}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Active">{t('details.active')}</SelectItem>
                                    <SelectItem value="Inactive">{t('details.inactive')}</SelectItem>
                                </SelectContent>
                            </Select>
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
                {zoneToEdit ? t('common.save') : t('common.add')}
            </Button>
        </div>
      </form>
    </Form>
  );
}
