
'use client';

import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { ShiftForm, type ShiftFormValues } from '@/components/workloads/shift-form';
import { PlusCircle, CalendarDays, LayoutDashboard, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Shift } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';
import { api } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export default function AddShiftPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, hasPermission } = useAuth();
    const t = useTranslations('ShiftManagement.form');
    const tNav = useTranslations('Navigation');
    const module = 'airport';

    const canCreate = hasPermission([`${module}:workload:view`]);

    const handleSave = async (formData: ShiftFormValues) => {
        const result = await api.post<Shift>('/data/shifts/save', {
            ...formData,
            module
        });
        
        if (result.isSuccess) {
            toast({
                title: t('toast.addSuccessTitle'),
                description: t('toast.addSuccessDesc', { name: result.data!.name }),
                variant: 'success',
            });
            router.push(`/${module}/workloads/shift-management`);
        } else {
            toast({
                title: t('toast.errorTitle'),
                description: result.errors?.[0]?.message || t('toast.errorDesc'),
                variant: 'destructive',
            });
        }
    };
    
    if (!canCreate) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                <AlertTriangle className="h-16 w-16 text-destructive" />
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="max-w-md text-muted-foreground">
                    You do not have permission to create new shifts.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`/${module}/dashboard`} icon={LayoutDashboard}>{tNav('dashboard')}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`/${module}/workloads/shift-management`} icon={CalendarDays}>{tNav('shiftManagement')}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage icon={PlusCircle}>{t('addTitle')}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <GradientPageHeader
                title={t('addTitle')}
                description={t('addDescription')}
                icon={PlusCircle}
            />
            <ShiftForm onSave={handleSave} />
        </div>
    );
}
