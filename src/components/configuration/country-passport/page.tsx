
'use client';

import { useState, useEffect } from 'react';
import { CountryPassportPageClient } from '@/components/configuration/country-passport/country-passport-page-client';
import { useAuth } from '@/hooks/use-auth';
import type { Permission } from '@/types';
import { AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import type { CountryPassportMapping } from '@/types/configuration';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';

export default function CountryPassportPage() {
    const { hasPermission } = useAuth();
    const { toast } = useToast();
    const t = useTranslations('Configuration.CountryPassport');

    const [mappings, setMappings] = useState<CountryPassportMapping[]>([]);
    const [loading, setLoading] = useState(true);

    const canView = hasPermission(['configuration:country-passport:view' as Permission]);
    const canEdit = hasPermission(['configuration:country-passport:edit' as Permission]);

    useEffect(() => {
        if (canView) {
            const fetchData = async () => {
                setLoading(true);
                const result = await api.get<CountryPassportMapping[]>('/data/country-passport-mappings');

                if (result.isSuccess) {
                    setMappings(result.data || []);
                }
                setLoading(false);
            };
            fetchData();
        } else {
            setLoading(false);
        }
    }, [canView]);

    const handleSave = async (updatedMappings: CountryPassportMapping[]) => {
        if (!canEdit) {
            toast({
                title: t('toast.accessDeniedTitle'),
                description: t('toast.accessDeniedDesc'),
                variant: 'destructive',
            });
            return;
        }

        const result = await api.post('/data/country-passport-mappings/save', updatedMappings);
        if (result.isSuccess) {
            toast({
                title: t('toast.saveSuccessTitle'),
                description: t('toast.saveSuccessDesc'),
                variant: 'success',
            });
            setMappings(updatedMappings);
        } else {
            toast({
                title: t('toast.saveErrorTitle'),
                description: result.errors?.[0]?.message || t('toast.saveErrorDesc'),
                variant: 'destructive',
            });
        }
    };

    if (loading) {
        return <Skeleton className="h-96 w-full" />;
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
        <CountryPassportPageClient
            mappings={mappings}
            onSave={handleSave}
            canEdit={canEdit}
        />
    );
}
