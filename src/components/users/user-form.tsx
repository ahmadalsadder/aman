

'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { User, Role, Module, Permission } from '@/types';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { allModules, allPermissions } from '@/lib/permissions';

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
                </CardContent>
            </Card>

            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Permissions</CardTitle>
                    <CardDescription>Select the modules and specific permissions this user can access.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <h4 className="font-semibold">Port & Module Access</h4>
                        <p className="text-sm text-muted-foreground">Select all ports and functional modules the user can access.</p>
                        <FormField
                            control={form.control} name="modules"
                            render={() => (
                            <FormItem>
                                <ScrollArea className="h-64 rounded-md border p-4">
                                    {allModules.map((item) => (
                                    <FormField
                                        key={item.id} control={form.control} name="modules"
                                        render={({ field }) => {
                                        return (
                                            <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                                            <FormControl>
                                                <Checkbox
                                                checked={field.value?.includes(item.id)}
                                                onCheckedChange={(checked) => {
                                                    return checked
                                                    ? field.onChange([...field.value, item.id])
                                                    : field.onChange(
                                                        field.value?.filter((value) => value !== item.id)
                                                    )
                                                }}
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal">{item.label}</FormLabel>
                                            </FormItem>
                                        )
                                        }}
                                    />
                                    ))}
                                </ScrollArea>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-semibold">Granular Permissions</h4>
                        <p className="text-sm text-muted-foreground">Select all specific actions the user can perform.</p>
                        <FormField
                            control={form.control} name="permissions"
                            render={() => (
                                <FormItem>
                                <ScrollArea className="h-64 rounded-md border p-4">
                                    {allPermissions.map((item) => (
                                    <FormField
                                        key={item} control={form.control} name="permissions"
                                        render={({ field }) => {
                                        return (
                                            <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0 mb-4">
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
