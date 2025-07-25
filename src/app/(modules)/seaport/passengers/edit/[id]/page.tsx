
'use client';

import { PassengerForm, type PassengerFormValues } from '@/components/passengers/passenger-form';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import type { Passenger } from '@/types/live-processing';
import { useState, useEffect, useMemo } from 'react';
import { Loader2, FilePenLine, User, LayoutDashboard, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useAuth } from '@/hooks/use-auth';
import type { Permission, Module } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditPassengerPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const { toast } = useToast();
    const { hasPermission } = useAuth();
    const t = useTranslations('PassengerForm');
    const tNav = useTranslations('Navigation');
    
    const module: Module = 'seaport';
    const [passenger, setPassenger] = useState<Passenger | null>(null);
    const [loading, setLoading] = useState(true);
    const id = params.id;
    
    const canEdit = hasPermission([`${module}:passengers:edit` as Permission]);

    useEffect(() => {
        if (!id || !canEdit) {
            setLoading(false);
            return;
        };

        const fetchPassenger = async () => {
            setLoading(true);
            const result = await api.get<Passenger>(`/data/passengers/${id}`);
            if (result.isSuccess && result.data) {
                setPassenger(result.data);
            } else {
                toast({
                    title: t('toast.loadErrorTitle'),
                    description: t('toast.loadErrorDesc'),
                    variant: "destructive",
                });
            }
            setLoading(false);
        };
        fetchPassenger();
    }, [id, toast, t, canEdit]);

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <div className="space-y-6 w-full">
                    <Skeleton className="h-24" />
                    <Skeleton className="h-96" />
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
                    You do not have permission to edit passenger records.
                </p>
            </div>
        );
    }

    if (!passenger) {
        return (
             <div className="flex h-full w-full items-center justify-center">
                 <div className="flex flex-col items-center gap-4 text-destructive">
                    <p>{t('notFound')}</p>
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
                        <BreadcrumbLink href={`/${module}/passengers`} icon={User}>{tNav('passengers')}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage icon={FilePenLine}>{t('editTitle')}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <GradientPageHeader
                title={t('editTitle')}
                description={t('editDescription', { name: `${passenger.firstName} ${passenger.lastName}` })}
                icon={FilePenLine}
            />
            <PassengerForm passengerToEdit={passenger} />
        </div>
    );
}
