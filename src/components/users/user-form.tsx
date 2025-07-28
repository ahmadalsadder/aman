

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { User, Role, Port } from '@/types';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { modulePermissions } from '@/lib/permissions';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Skeleton } from '../ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { MultiSelect } from '../ui/multi-select-combobox';

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  role: z.enum(['admin', 'auditor', 'viewer', 'shiftsupervisor', 'control-room', 'analyst', 'officer']),
  modules: z.array(z.string()).refine(value => value.some(item => item), {
    message: "You have to select at least one module.",
  }),
  permissions: z.array(z.string()).refine(value => value.some(item => item), {
    message: "You have to select at least one permission.",
  }),
});

export type UserFormValues = z.infer<typeof formSchema>;

interface UserFormProps {
  userToEdit?: User;
  onSave: (data: UserFormValues) => void;
  isLoading: boolean;
}

export function UserForm({ userToEdit, onSave, isLoading }: UserFormProps) {
  const router = useRouter();
  const [ports, setPorts] = useState<Port[]>([]);
  const [loadingPorts, setLoadingPorts] = useState(true);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: userToEdit || {
      name: '',
      email: '',
      role: 'viewer',
      modules: [],
      permissions: [],
    },
  });

  const selectedModules = form.watch('modules');

  useEffect(() => {
    if (!userToEdit) { // Only run this logic for new users or when modules change
        const currentPermissions = new Set(form.getValues('permissions'));
        const permissionsForSelectedModules = new Set<string>();

        selectedModules.forEach(moduleId => {
            const moduleInfo = modulePermissions.find(m => m.id === moduleId);
            if (moduleInfo) {
                moduleInfo.permissions.forEach(p => permissionsForSelectedModules.add(p));
            }
        });

        // Add permissions for newly selected modules
        permissionsForSelectedModules.forEach(p => currentPermissions.add(p));
        
        // Remove permissions for deselected modules
        const allPossibleModulePermissions = new Set(modulePermissions.flatMap(m => m.permissions));
        allPossibleModulePermissions.forEach(p => {
             const moduleOfPermission = p.split(':')[0];
             if(!selectedModules.includes(moduleOfPermission) && !['users:manage', 'duty-manager:view'].includes(p)) {
                 currentPermissions.delete(p);
             }
        });

        form.setValue('permissions', Array.from(currentPermissions), { shouldValidate: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModules, userToEdit]);

  useEffect(() => {
    const fetchPorts = async () => {
      setLoadingPorts(true);
      const result = await api.get<Port[]>('/data/ports/all');
      if (result.isSuccess && result.data) {
        setPorts(result.data);
      }
      setLoadingPorts(false);
    };
    fetchPorts();
  }, []);
  
  const portOptions = modulePermissions.map(mod => ({
      value: mod.id,
      label: mod.label
  }));


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
                <CardHeader>
                    <CardTitle>User Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="role" render={({ field }) => ( <FormItem><FormLabel>Role</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="admin">Admin</SelectItem><SelectItem value="auditor">Auditor</SelectItem><SelectItem value="viewer">Viewer</SelectItem><SelectItem value="shiftsupervisor">Shift Supervisor</SelectItem><SelectItem value="control-room">Control Room</SelectItem><SelectItem value="analyst">Analyst</SelectItem><SelectItem value="officer">Officer</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                     <FormField
                        control={form.control}
                        name="modules"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Port & Module Access</FormLabel>
                                <FormControl>
                                    <MultiSelect
                                        options={portOptions}
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Select modules..."
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Permissions</CardTitle>
                    <CardDescription>Select the modules and specific permissions this user can access.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <h4 className="font-semibold">Granular Permissions</h4>
                        <p className="text-sm text-muted-foreground">Expand a module to assign specific actions.</p>
                        <FormField
                            control={form.control} name="permissions"
                            render={() => (
                                <FormItem>
                                <ScrollArea className="h-96 rounded-md border">
                                    <Accordion type="multiple" className="w-full">
                                    {modulePermissions.map((mod) => (
                                        <AccordionItem value={mod.id} key={mod.id}>
                                            <AccordionTrigger className="px-4 py-2 text-sm font-medium">{mod.label}</AccordionTrigger>
                                            <AccordionContent className="p-4 pt-0">
                                                <div className="space-y-2">
                                                    {mod.permissions.map((item) => (
                                                    <FormField
                                                        key={item} control={form.control} name="permissions"
                                                        render={({ field }) => {
                                                        return (
                                                            <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0">
                                                            <FormControl>
                                                                <Checkbox
                                                                checked={field.value?.includes(item)}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                    ? field.onChange([...field.value, item])
                                                                    : field.onChange(field.value?.filter((value) => value !== item))
                                                                }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="font-normal text-xs">{item}</FormLabel>
                                                            </FormItem>
                                                        )
                                                        }}
                                                    />
                                                    ))}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                    </Accordion>
                                </ScrollArea>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {userToEdit ? 'Save Changes' : 'Create User'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
