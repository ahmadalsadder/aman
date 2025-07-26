
'use client';

import { useState, useEffect } from 'react';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { AssignmentForm, type AssignmentFormValues } from '@/components/workloads/assign-officer/assignment-form';
import { PlusCircle, AlertTriangle, UserPlus, LayoutDashboard, CalendarDays } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import type { Port, Terminal, Zone, Shift, User, OfficerAssignment } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { format } from 'date-fns';

export default function AddAirportAssignOfficerPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, hasPermission } = useAuth();
    const t = useTranslations('AssignOfficer.form');
    const tNav = useTranslations('Navigation');
    const module = 'airport';

    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [pageData, setPageData] = useState<{
        officers: User[];
        shifts: Shift[];
        ports: Port[],
        terminals: Terminal[];
        zones: Zone[];
    } | null>(null);
    
    const canCreate = hasPermission([`${module}:workload:view`]);

    useEffect(() => {
        if (!canCreate) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const [officersRes, shiftsRes, portsRes, terminalsRes, zonesRes] = await Promise.all([
                    api.get<User[]>('/data/users?role=officer'),
                    api.get<Shift[]>(`/data/shifts?module=${module}`),
                    api.get<Port[]>(`/data/ports?moduleType=${module}`),
                    api.get<Terminal[]>('/data/terminals'),
                    api.get<Zone[]>('/data/zones'),
                ]);

                if (officersRes.isSuccess && shiftsRes.isSuccess && portsRes.isSuccess && terminalsRes.isSuccess && zonesRes.isSuccess) {
                    setPageData({
                        officers: officersRes.data!,
                        shifts: shiftsRes.data!,
                        ports: portsRes.data!,
                        terminals: terminalsRes.data!,
                        zones: zonesRes.data!,
                    });
                } else {
                    throw new Error('Failed to load required configuration data.');
                }
            } catch (error) {
                 toast({
                    title: t('toast.loadErrorTitle'),
                    description: (error as Error).message || t('toast.loadErrorDesc'),
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [canCreate, module, t, toast]);

    const handleSave = async (formData: AssignmentFormValues) => {
        setIsSaving(true);
        const assignmentData = {
            ...formData,
            assignmentDate: format(formData.assignmentDate, 'yyyy-MM-dd'),
            module,
            createdBy: user?.name,
        };
        const result = await api.post<OfficerAssignment>('/data/officer-assignments/save', assignmentData);
        
        if (result.isSuccess) {
            toast({
                title: t('toast.addSuccessTitle'),
                description: t('toast.addSuccessDesc'),
                variant: 'success',
            });
            router.push(`/${module}/workloads/assign-officer`);
        } else {
            toast({
                title: t('toast.errorTitle'),
                description: result.errors?.[0]?.message || t('toast.errorDesc'),
                variant: 'destructive',
            });
            setIsSaving(false);
        }
    };
    
    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-24" />
                <Skeleton className="h-96" />
            </div>
        );
    }

    if (!canCreate) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                <AlertTriangle className="h-16 w-16 text-destructive" />
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="max-w-md text-muted-foreground">
                    You do not have permission to create new assignments for this module.
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
                        <BreadcrumbLink href={`/${module}/workloads/assign-officer`} icon={UserPlus}>{tNav('assignOfficer')}</BreadcrumbLink>
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
            {pageData && (
                <AssignmentForm 
                    onSave={handleSave}
                    isLoading={isSaving}
                    pageData={pageData}
                />
            )}
        </div>
    );
}
