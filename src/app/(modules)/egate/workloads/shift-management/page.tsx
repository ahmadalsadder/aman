
'use client';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { ShiftManagementPage } from '@/components/workloads/shift-management/shift-management-page';
import { useAuth } from '@/hooks/use-auth';
import type { Permission, Shift } from '@/types';
import { AlertTriangle, LayoutDashboard, CalendarDays } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useTranslations } from 'next-intl';

export default function EgateShiftManagementPage() {
    const { hasPermission } = useAuth();
    const { toast } = useToast();
    const t = useTranslations('Navigation');
    const module = 'egate';
    const canView = useMemo(() => hasPermission([`${module}:workload:view` as Permission]), [hasPermission, module]);

    const [shifts, setShifts] = useState<Shift[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchShifts = useCallback(async () => {
        setLoading(true);
        const result = await api.get<Shift[]>(`/data/shifts?module=${module}`);
        if (result.isSuccess) {
            setShifts(result.data || []);
        } else {
            toast({ title: 'Error', description: 'Failed to load shifts.', variant: 'destructive' });
        }
        setLoading(false);
    }, [toast, module]);

    useEffect(() => {
        if (canView) {
            fetchShifts();
        } else {
            setLoading(false);
        }
    }, [canView, fetchShifts]);

     const handleDeleteShift = async (shiftId: string): Promise<boolean> => {
        const result = await api.post('/data/shifts/delete', { id: shiftId });
        if (result.isSuccess) {
            toast({ title: 'Shift Deleted', description: `Shift has been permanently deleted.` });
            await fetchShifts();
            return true;
        } else {
            toast({ title: 'Delete Failed', description: result.errors?.[0]?.message || 'An error occurred.', variant: 'destructive' });
            return false;
        }
    };

    const handleToggleStatus = async (shiftId: string): Promise<boolean> => {
        const result = await api.post<Shift>('/data/shifts/toggle-status', { id: shiftId });
        if (result.isSuccess && result.data) {
             toast({
                title: `Shift ${result.data.status === 'Active' ? 'Activated' : 'Deactivated'}`,
                description: `Shift "${result.data.name}" has been set to ${result.data.status.toLowerCase()}.`,
             });
            await fetchShifts();
            return true;
        } else {
            toast({ title: 'Update Failed', description: result.errors?.[0]?.message || 'An error occurred.', variant: 'destructive' });
            return false;
        }
    }

    if (loading) {
        return (
             <div className="space-y-6">
                <Skeleton className="h-24" />
                <Skeleton className="h-32" />
                <Skeleton className="h-96" />
            </div>
        );
    }

    if (!canView) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                <AlertTriangle className="h-16 w-16 text-destructive" />
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="max-w-md text-muted-foreground">
                    You do not have permission to view workload management for this module.
                </p>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
             <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`/${module}/dashboard`} icon={LayoutDashboard}>{t('dashboard')}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage icon={CalendarDays}>{t('shiftManagement')}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <ShiftManagementPage 
                module={module} 
                shifts={shifts}
                loading={loading}
                onDeleteShift={handleDeleteShift}
                onToggleStatus={handleToggleStatus}
            />
        </div>
    );
}
