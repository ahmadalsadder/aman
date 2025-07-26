
'use client';

import { SystemMessageForm, type SystemMessageFormValues } from '@/components/configuration/system-messages/system-message-form';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import type { SystemMessage, Permission } from '@/types';
import { useState, useEffect } from 'react';
import { FilePenLine, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditSystemMessagePage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const { toast } = useToast();
    const t = useTranslations('Configuration.SystemMessages.form');
    const { hasPermission } = useAuth();
    
    const [message, setMessage] = useState<SystemMessage | null>(null);
    const [loading, setLoading] = useState(true);
    const id = params.id;

    const canEdit = hasPermission(['configuration:system-messages:edit' as Permission]);

    useEffect(() => {
        if (!id || !canEdit) {
            setLoading(false);
            return;
        }

        const fetchMessage = async () => {
            setLoading(true);
            const result = await api.get<{ message: SystemMessage }>(`/data/system-messages/${id}`);
            if (result.isSuccess && result.data) {
                setMessage(result.data.message);
            } else {
                toast({ title: t('toast.loadErrorTitle'), variant: 'destructive' });
            }
            setLoading(false);
        };
        fetchMessage();
    }, [id, canEdit, t, toast]);

    const handleSave = async (formData: SystemMessageFormValues) => {
        if (!message) return;
        setLoading(true);

        const result = await api.post<SystemMessage>('/data/system-messages/save', { id, ...formData });

        if (result.isSuccess) {
            toast({
                title: t('toast.updateSuccessTitle'),
                description: t('toast.updateSuccessDesc', { name: result.data!.name }),
                variant: 'success',
            });
            router.push('/configuration/system-messages');
        } else {
            toast({
                title: t('toast.errorTitle'),
                description: result.errors?.[0]?.message || t('toast.errorDesc'),
                variant: 'destructive',
            });
            setLoading(false);
        }
    };

    if (loading) {
        return <Skeleton className="h-96 w-full" />;
    }

    if (!canEdit) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                <AlertTriangle className="h-16 w-16 text-destructive" />
                <h1 className="text-2xl font-bold">{t('accessDenied.title')}</h1>
                <p className="max-w-md text-muted-foreground">{t('accessDenied.editDescription')}</p>
            </div>
        );
    }
    
    if (!message) {
        return (
             <div className="flex h-full w-full items-center justify-center">
                 <div className="flex flex-col items-center gap-4 text-destructive">
                    <p>{t('toast.loadErrorTitle')}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <GradientPageHeader
                title={t('editTitle')}
                description={t('editDescription', { name: message.name })}
                icon={FilePenLine}
            />
            <SystemMessageForm onSave={handleSave} messageToEdit={message} isLoading={loading} />
        </div>
    );
}
