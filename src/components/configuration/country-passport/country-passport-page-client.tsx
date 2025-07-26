
'use client';

import { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { CountryPassportMapping } from '@/types/configuration';
import { DataTable } from '@/components/shared/data-table';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { Button } from '@/components/ui/button';
import { Fingerprint, Save, Ship } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslations } from 'next-intl';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

interface CountryPassportPageClientProps {
    mappings: CountryPassportMapping[];
    onSave: (updatedMappings: CountryPassportMapping[]) => Promise<void>;
    canEdit: boolean;
}

export function CountryPassportPageClient({ mappings, onSave, canEdit }: CountryPassportPageClientProps) {
    const [localMappings, setLocalMappings] = useState<CountryPassportMapping[]>(mappings);
    const [isSaving, setIsSaving] = useState(false);
    const t = useTranslations('Configuration.CountryPassport');

    const handlePassportTypeChange = (countryCode: string, newPassportType: 'Normal' | 'E-Passport') => {
        setLocalMappings(prevMappings =>
            prevMappings.map(m =>
                m.countryCode === countryCode ? { ...m, passportType: newPassportType } : m
            )
        );
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        await onSave(localMappings);
        setIsSaving(false);
    };

    const columns: ColumnDef<CountryPassportMapping>[] = [
        {
            accessorKey: 'countryName',
            header: t('table.country'),
        },
        {
            accessorKey: 'passportType',
            header: t('table.assignedType'),
            cell: ({ row }) => {
                const mapping = row.original;
                return (
                    <Select
                        value={mapping.passportType}
                        onValueChange={(value: 'Normal' | 'E-Passport') => handlePassportTypeChange(mapping.countryCode, value)}
                        disabled={!canEdit}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={t('table.selectType')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="E-Passport">{t('ePassport')}</SelectItem>
                            <SelectItem value="Normal">{t('normal')}</SelectItem>
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
                        <BreadcrumbPage icon={Fingerprint}>{t('pageTitle')}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <GradientPageHeader
                title={t('pageTitle')}
                description={t('pageDescription')}
                icon={Fingerprint}
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
