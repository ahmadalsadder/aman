
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
import type { Terminal, Port } from '@/types/configuration';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

const formSchema = z.object({
  name: z.string().min(2, "Terminal name must be at least 2 characters."),
  portId: z.string().min(1, "You must select a port."),
  status: z.enum(['Active', 'Inactive']),
});

export type TerminalFormValues = z.infer<typeof formSchema>;

interface TerminalFormProps {
  terminalToEdit?: Terminal;
  onSave: (data: TerminalFormValues) => void;
  isLoading: boolean;
  ports: Port[];
}

export function TerminalForm({ terminalToEdit, onSave, isLoading, ports }: TerminalFormProps) {
  const router = useRouter();
  const t = useTranslations('Configuration.Terminals.form');
  
  const form = useForm<TerminalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: terminalToEdit || {
      name: '',
      portId: '',
      status: 'Active',
    },
  });

  const portOptions = useMemo(() => ports.map(p => ({ value: p.id, label: p.name })), [ports]);

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
                    name="portId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel required>{t('details.port')}</FormLabel>
                            <Combobox 
                                options={portOptions} 
                                {...field} 
                                placeholder={t('details.selectPort')}
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
                {terminalToEdit ? t('common.save') : t('common.add')}
            </Button>
        </div>
      </form>
    </Form>
  );
}

