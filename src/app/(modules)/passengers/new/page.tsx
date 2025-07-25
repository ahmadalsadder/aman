

'use client';

import { PassengerForm, type PassengerFormValues } from '@/components/passengers/passenger-form';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import type { Passenger } from '@/types/live-processing';
import { useToast } from '@/hooks/use-toast';
import { useRouter, usePathname } from 'next/navigation';
import { UserPlus, LayoutDashboard, User, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useAuth } from '@/hooks/use-auth';
import type { Permission } from '@/types';

export default function AddPassengerPage() {
    const router = useRouter();
    const pathname = usePathname();
    const module = pathname.split('/')[1] || 'passengers';
    const { toast } = useToast();
    const { hasPermission } = useAuth();
    const t = useTranslations('PassengerForm');
    const tNav = useTranslations('Navigation');
    
    const canCreate = hasPermission(['airport:passengers:create', 'landport:passengers:create', 'seaport:passengers:create', 'egate:passengers:create']);

    const handleSave = async (formData: PassengerFormValues) => {
        const newPassenger: Omit<Passenger, 'id'> = {
            ...formData,
            status: 'Active',
            riskLevel: 'Low',
            lastEntry: new Date().toISOString().split('T')[0],
            profilePicture: formData.personalPhotoUrl || 'https://placehold.co/100x100.png',
        };

        const result = await api.post<Passenger>('/data/passengers/save', newPassenger);

        if(result.isSuccess && result.data) {
            toast({
                title: t('toast.addSuccessTitle'),
                description: t('toast.addSuccessDesc', { name: `${result.data.firstName} ${result.data.lastName}` }),
                variant: 'success',
            });
            router.push(`/${module === 'passengers' ? 'airport' : module}/passengers`);
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
                    You do not have permission to create new passenger records.
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
                        <BreadcrumbLink href={`/${module}/passengers`} icon={User}>{tNav('passengers')}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage icon={UserPlus}>{t('addTitle')}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <GradientPageHeader
                title={t('addTitle')}
                description={t('addDescription')}
                icon={UserPlus}
            />
            <PassengerForm onSave={handleSave} />
        </div>
    );
}
