
'use client';

import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { PortForm, type PortFormValues } from '@/components/configuration/ports/port-form';
import { PlusCircle, AlertTriangle, Ship } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Port, Permission } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import { useState } from 'react';
import { format } from 'date-fns';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export default function AddPortPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, hasPermission } = useAuth();
    const t = useTranslations('Configuration.Ports.form');
    const tPorts = useTranslations('Configuration.Ports');
    const [isLoading, setIsLoading] = useState(false);

    const canCreate = hasPermission(['configuration:ports:create' as Permission]);

    const handleSave = async (formData: PortFormValues) => {
        setIsLoading(true);
        const newPortData: Partial<Port> = {
            ...formData,
            createdBy: user?.name || 'System',
            lastModified: format(new Date(), 'yyyy-MM-dd'),
        };

        const result = await api.post<Port>('/data/ports/save', newPortData);
        
        if (result.isSuccess) {
            toast({
                title: t('toast.addSuccessTitle'),
                description: t('toast.addSuccessDesc', { name: result.data!.name }),
                variant: 'success',
            });
            router.push('/configuration/ports');
        } else {
            toast({
                title: t('toast.errorTitle'),
                description: result.errors?.[0]?.message || t('toast.errorDesc'),
                variant: 'destructive',
            });
            setIsLoading(false);
        }
    };

    if (!canCreate) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                <AlertTriangle className="h-16 w-16 text-destructive" />
                <h1 className="text-2xl font-bold">{t('accessDenied.title')}</h1>
                <p className="max-w-md text-muted-foreground">{t('accessDenied.createDescription')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/configuration/ports" icon={Ship}>{tPorts('pageTitle')}</BreadcrumbLink>
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
            <PortForm onSave={handleSave} isLoading={isLoading} />
        </div>
    );
}
