
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { Permission, SystemMessage } from '@/types';
import { AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { SystemMessagesPageClient } from '@/components/configuration/system-messages/system-messages-page-client';
import { useTranslations } from 'next-intl';

export default function SystemMessagesPage() {
    const { hasPermission } = useAuth();
    const { toast } = useToast();
    const t = useTranslations('Configuration.SystemMessages');

    const [messages, setMessages] = useState<SystemMessage[]>([]);
    const [loading, setLoading] = useState(true);

    const canView = hasPermission(['configuration:system-messages:view' as Permission]);
    const canCreate = hasPermission(['configuration:system-messages:create' as Permission]);
    const canEdit = hasPermission(['configuration:system-messages:edit' as Permission]);
    const canDelete = hasPermission(['configuration:system-messages:delete' as Permission]);

    useEffect(() => {
        if (canView) {
            const fetchData = async () => {
                setLoading(true);
                const result = await api.get<SystemMessage[]>('/data/system-messages');
                if (result.isSuccess) {
                    setMessages(result.data || []);
                }
                setLoading(false);
            };
            fetchData();
        } else {
            setLoading(false);
        }
    }, [canView]);

    const handleDeleteMessage = async (messageId: string): Promise<boolean> => {
        const result = await api.post('/data/system-messages/delete', { id: messageId });
        if (result.isSuccess) {
            toast({
                title: t('toast.deleteSuccessTitle'),
                description: t('toast.deleteSuccessDesc'),
                variant: 'info',
            });
            setMessages(prev => prev.filter(m => m.id !== messageId));
            return true;
        } else {
            toast({
                title: t('toast.deleteErrorTitle'),
                description: result.errors?.[0]?.message || t('toast.deleteErrorDesc'),
                variant: 'destructive',
            });
            return false;
        }
    };

    const handleToggleStatus = async (messageId: string): Promise<boolean> => {
        const result = await api.post<SystemMessage>('/data/system-messages/toggle-status', { id: messageId });
        if (result.isSuccess && result.data) {
            toast({
                title: t('toast.statusUpdateTitle'),
                description: t('toast.statusUpdateDesc', { name: result.data.name, status: result.data.status }),
            });
            setMessages(prev => prev.map(m => m.id === messageId ? result.data! : m));
            return true;
        } else {
            toast({
                title: t('toast.statusUpdateErrorTitle'),
                description: result.errors?.[0]?.message || 'An error occurred.',
                variant: 'destructive',
            });
            return false;
        }
    };


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
                <h1 className="text-2xl font-bold">{t('accessDenied.title')}</h1>
                <p className="max-w-md text-muted-foreground">{t('accessDenied.description')}</p>
            </div>
        );
    }

    return (
        <SystemMessagesPageClient
            messages={messages}
            onDeleteMessage={handleDeleteMessage}
            onToggleStatus={handleToggleStatus}
            permissions={{ canCreate, canEdit, canDelete }}
        />
    );
}
