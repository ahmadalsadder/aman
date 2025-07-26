
'use client';

import { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { CountryLanguageMapping } from '@/types/configuration';
import { DataTable } from '@/components/shared/data-table';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { Button } from '@/components/ui/button';
import { Languages, Save, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslations } from 'next-intl';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Ship } from 'lucide-react';

interface CountryLanguagePageClientProps {
    mappings: CountryLanguageMapping[];
    availableLanguages: string[];
    onSave: (updatedMappings: CountryLanguageMapping[]) => Promise<void>;
    canEdit: boolean;
}

export function CountryLanguagePageClient({ mappings, availableLanguages, onSave, canEdit }: CountryLanguagePageClientProps) {
    const [localMappings, setLocalMappings] = useState<CountryLanguageMapping[]>(mappings);
    const [isSaving, setIsSaving] = useState(false);
    const t = useTranslations('Configuration.CountryLanguage');

    const handleLanguageChange = (countryCode: string, newLanguage: string) => {
        setLocalMappings(prevMappings =>
            prevMappings.map(m =>
                m.countryCode === countryCode ? { ...m, language: newLanguage } : m
            )
        );
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        await onSave(localMappings);
        setIsSaving(false);
    };

    const columns: ColumnDef<CountryLanguageMapping>[] = [
        {
            accessorKey: 'countryName',
            header: t('table.country'),
        },
        {
            accessorKey: 'language',
            header: t('table.assignedLanguage'),
            cell: ({ row }) => {
                const mapping = row.original;
                return (
                    <Select
                        value={mapping.language}
                        onValueChange={(value) => handleLanguageChange(mapping.countryCode, value)}
                        disabled={!canEdit}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={t('table.selectLanguage')} />
                        </SelectTrigger>
                        <SelectContent>
                            {availableLanguages.map(lang => (
                                <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            },
        },
    ];

    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/configuration/ports" icon={Ship}>{t('ports', {ns: 'Navigation'})}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage icon={Languages}>{t('pageTitle')}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <GradientPageHeader
                title={t('pageTitle')}
                description={t('pageDescription')}
                icon={Languages}
            >
                {canEdit && (
                    <Button onClick={handleSaveChanges} disabled={isSaving} className="bg-white font-semibold text-primary hover:bg-white/90">
                        {isSaving ? <Save className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {t('saveChanges')}
                    </Button>
                )}
            </GradientPageHeader>

            <Card>
                <CardHeader>
                    <CardTitle>{t('table.title')}</CardTitle>
                    <CardDescription>{t('table.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={localMappings}
                        filterColumnId="countryName"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
