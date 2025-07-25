
'use client';

import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { MediaForm, type MediaFormValues } from '@/components/media/media-form';
import { PlusCircle, AlertTriangle, Music, ClipboardList, LayoutDashboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Media } from '@/types/live-processing';
import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import { useState } from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export default function AddMediaPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, hasPermission } = useAuth();
    const t = useTranslations('MediaManagement');
    const tForm = useTranslations('MediaManagement.form');
    const tNav = useTranslations('Navigation');
    const [isLoading, setIsLoading] = useState(false);

    const canCreate = hasPermission(['egate:media:create']);

    const handleSave = async (formData: MediaFormValues) => {
        setIsLoading(true);
        const newMediaData: Omit<Media, 'id'> = {
            ...formData,
            status: 'Active',
            lastModified: new Date().toISOString(),
            createdBy: user?.fullName || 'System',
        };

        const result = await api.post<Media>('/data/media/save', newMediaData);
        
        if (result.isSuccess) {
            toast({
                title: tForm('toast.addSuccessTitle'),
                description: tForm('toast.addSuccessDesc', { name: result.data!.name }),
                variant: 'success',
            });
            router.push('/egate/media-management');
        } else {
             toast({
                title: tForm('toast.errorTitle'),
                description: result.errors?.[0]?.message || tForm('toast.errorDesc'),
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
                <p className="max-w-md text-muted-foreground">
                    {t('accessDenied.createDescription')}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
             <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/egate/dashboard" icon={LayoutDashboard}>{tNav('dashboard')}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/egate/media-management" icon={Music}>{tNav('mediaManagement')}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage icon={PlusCircle}>{tForm('addTitle')}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <GradientPageHeader
                title={tForm('addTitle')}
                description={tForm('addDescription')}
                icon={PlusCircle}
            />
            <MediaForm onSave={handleSave} isLoading={isLoading} />
        </div>
    );
}
