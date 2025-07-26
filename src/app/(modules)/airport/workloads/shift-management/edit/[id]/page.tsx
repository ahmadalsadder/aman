
'use client';

import { ShiftForm, type ShiftFormValues } from '@/components/workloads/shift-form';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import type { Shift } from '@/types';
import { useState, useEffect } from 'react';
import { Loader2, FilePenLine, CalendarDays, LayoutDashboard, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export default function EditShiftPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const { toast } = useToast();
    const { hasPermission } = useAuth();
    const [shift, setShift] = useState<Shift | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const id = params.id;
    const module = 'airport';
    const t = useTranslations('ShiftManagement.form');
    const tNav = useTranslations('Navigation');
    
    const canEdit = hasPermission([`${module}:workload:view`]);

    useEffect(() => {
        if (!id || !canEdit) {
            setLoading(false);
            return;
        }

        const fetchShift = async () => {
            const result = await api.get<{ shift: Shift }>(`/data/shifts/${id}`);
            if (result.isSuccess && result.data) {
                setShift(result.data.shift);
            } else {
                toast({ title: 'Error', description: 'Could not load shift data.', variant: 'destructive' });
            }
            setLoading(false);
        };
        
        fetchShift();
    }, [id, canEdit, toast]);

    const handleSave = async (formData: ShiftFormValues) => {
        if (!shift) return;
        setIsLoading(true);

        const result = await api.post<Shift>('/data/shifts/save', { id: shift.id, ...formData, module });

        if (result.isSuccess && result.data) {
            toast({
                title: t('toast.updateSuccessTitle'),
                description: t('toast.updateSuccessDesc', { name: result.data.name }),
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
        setIsLoading(false);
    };

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                 <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Loading shift data...</p>
                </div>
            </div>
        );
    }
    
    if (!canEdit) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                <AlertTriangle className="h-16 w-16 text-destructive" />
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="max-w-md text-muted-foreground">
                    You do not have permission to edit shifts.
                </p>
            </div>
        );
    }
    
    if (!shift) {
        return (
             <div className="flex h-full w-full items-center justify-center">
                 <div className="flex flex-col items-center gap-4 text-destructive">
                    <p>Shift not found.</p>
                </div>
            </div>
        )
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
                        <BreadcrumbPage icon={FilePenLine}>{t('editTitle')}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <GradientPageHeader
                title={t('editTitle')}
                description={t('editDescription', { name: shift.name })}
                icon={FilePenLine}
            />
            <ShiftForm onSave={handleSave} shiftToEdit={shift} isLoading={isLoading} />
        </div>
    );
}
