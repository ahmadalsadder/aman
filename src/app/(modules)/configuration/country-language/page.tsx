'use client';

import { useState, useEffect } from 'react';
import { CountryLanguagePageClient } from '@/components/configuration/country-language/country-language-page-client';
import { useAuth } from '@/hooks/use-auth';
import type { Permission } from '@/types';
import { AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import type { CountryLanguageMapping } from '@/types/configuration';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';

export default function CountryLanguagePage() {
    const { hasPermission } = useAuth();
    const { toast } = useToast();
    const t = useTranslations('Configuration.CountryLanguage');

    const [mappings, setMappings] = useState<CountryLanguageMapping[]>([]);
    const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const canView = hasPermission(['configuration:country-language:view' as Permission]);
    const canEdit = hasPermission(['configuration:country-language:edit' as Permission]);

    useEffect(() => {
        if (canView) {
            const fetchData = async () => {
                setLoading(true);
                const [mappingsResult, languagesResult] = await Promise.all([
                    api.get<CountryLanguageMapping[]>('/data/country-language-mappings'),
                    api.get<string[]>('/data/available-languages'),
                ]);

                if (mappingsResult.isSuccess) {
                    setMappings(mappingsResult.data || []);
                }
                if (languagesResult.isSuccess) {
                    setAvailableLanguages(languagesResult.data || []);
                }
                setLoading(false);
            };
            fetchData();
        } else {
            setLoading(false);
        }
    }, [canView]);

    const handleSave = async (updatedMappings: CountryLanguageMapping[]) => {
        if (!canEdit) {
            toast({
                title: t('toast.accessDeniedTitle'),
                description: t('toast.accessDeniedDesc'),
                variant: 'destructive',
            });
            return;
        }

        const result = await api.post('/data/country-language-mappings/save', updatedMappings);
        if (result.isSuccess) {
            toast({
                title: t('toast.saveSuccessTitle'),
                description: t('toast.saveSuccessDesc'),
                variant: 'success',
            });
            setMappings(result.data || []);
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
        <CountryLanguagePageClient
            mappings={mappings}
            availableLanguages={availableLanguages}
            onSave={handleSave}
            canEdit={canEdit}
        />
    );
}
