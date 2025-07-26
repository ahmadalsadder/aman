
'use client';

import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { SystemMessageForm, type SystemMessageFormValues } from '@/components/configuration/system-messages/system-message-form';
import { PlusCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { SystemMessage, Permission } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function AddSystemMessagePage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, hasPermission } = useAuth();
    const t = useTranslations('Configuration.SystemMessages.form');
    const [isLoading, setIsLoading] = useState(false);

    const canCreate = hasPermission(['configuration:system-messages:create' as Permission]);

    const handleSave = async (formData: SystemMessageFormValues) => {
        setIsLoading(true);
        const result = await api.post<SystemMessage>('/data/system-messages/save', {
            ...formData,
            createdBy: user?.name,
        });

        if (result.isSuccess) {
            toast({
                title: t('toast.addSuccessTitle'),
                description: t('toast.addSuccessDesc', { name: result.data!.name }),
                variant: 'success',
            });
            router.push('/configuration/system-messages');
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
            <GradientPageHeader
                title={t('addTitle')}
                description={t('addDescription')}
                icon={PlusCircle}
            />
            <SystemMessageForm onSave={handleSave} isLoading={isLoading} />
        </div>
    );
}
