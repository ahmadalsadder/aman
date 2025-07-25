'use client';

import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { MediaForm, type MediaFormValues } from '@/components/media/media-form';
import { PlusCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Media } from '@/types/live-processing';
import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import { useState } from 'react';

export default function AddMediaPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, hasPermission } = useAuth();
    const t = useTranslations('MediaManagement.form');
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
                title: t('toast.addSuccessTitle'),
                description: t('toast.addSuccessDesc', { name: result.data!.name }),
                variant: 'success',
            });
            router.push('/egate/media-management');
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
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="max-w-md text-muted-foreground">
                    You do not have permission to create new media content.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <GradientPageHeader
                title={t('addTitle')}
                description={t('addDescription')}
                icon={PlusCircle}
            />
            <MediaForm onSave={handleSave} isLoading={isLoading} />
        </div>
    );
}
