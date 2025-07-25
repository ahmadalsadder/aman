
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { Module, Permission } from '@/types';
import type { CivilRecord } from '@/types/live-processing';
import { DataTable } from '@/components/shared/data-table';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { Button } from '@/components/ui/button';
import { IdCard, Eye, Filter, ChevronDown, X, Search, AlertTriangle, LayoutDashboard } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, isValid } from 'date-fns';
import { CivilRecordDetailsSheet } from '@/components/civil-records/civil-record-details-sheet';
import { Combobox } from '@/components/ui/combobox';
import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import CalendarIcon from '../icons/calendar-icon';

const documentTypeColors = {
  Citizen: 'bg-green-500/20 text-green-700 border-green-500/30',
  Resident: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  Visitor: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
};

const initialFilters = {
  name: '',
  localizedName: '',
  documentNumber: '',
  documentType: '',
  nationality: '',
  dateFrom: null as Date | null,
  dateTo: null as Date | null,
};

interface CivilRecordsPageProps {
    module: Module;
}

export function CivilRecordsPage({ module }: CivilRecordsPageProps) {
    const t = useTranslations('CivilRecords');
    const { hasPermission } = useAuth();
    const [civilRecords, setCivilRecords] = useState<CivilRecord[]>([]);
    const [recordToView, setRecordToView] = useState<CivilRecord | null>(null);
    const [filters, setFilters] = useState(initialFilters);
    const [appliedFilters, setAppliedFilters] = useState(initialFilters);
    const [loading, setLoading] = useState(true);

    const canViewPage = useMemo(() => hasPermission([`${module}:civil-records:view` as Permission]), [hasPermission, module]);

    useEffect(() => {
        if (!canViewPage) {
            setLoading(false);
            return;
        }
        const fetchData = async () => {
            setLoading(true);
            const result = await api.get<CivilRecord[]>('/data/civil-records');
            if (result.isSuccess) {
                setCivilRecords(result.data || []);
            }
            setLoading(false);
        };
        fetchData();
    }, [canViewPage]);

    const nationalityOptions = useMemo(() => {
        const unique = new Set(civilRecords.map(p => p.nationality).filter(Boolean));
        return Array.from(unique).sort().map(n => ({ value: n, label: n }));
    }, [civilRecords]);
    
    const handleUpdateFilter = (key: keyof typeof filters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSearch = () => setAppliedFilters(filters);
    const clearFilters = () => {
        setFilters(initialFilters);
        setAppliedFilters(initialFilters);
    };

    const filteredData = useMemo(() => {
        return civilRecords.filter(record => {
            const nameLower = appliedFilters.name.toLowerCase();
            const localizedNameLower = appliedFilters.localizedName.toLowerCase();
            const docNumLower = appliedFilters.documentNumber.toLowerCase();

            if (nameLower && !`${record.firstName} ${record.lastName}`.toLowerCase().includes(nameLower)) return false;
            if (localizedNameLower && !record.localizedName?.toLowerCase().includes(localizedNameLower)) return false;
            if (docNumLower && !record.documentNumber.toLowerCase().includes(docNumLower)) return false;
            if (appliedFilters.documentType && record.documentType !== appliedFilters.documentType) return false;
            if (appliedFilters.nationality && record.nationality !== appliedFilters.nationality) return false;
            
            if (appliedFilters.dateFrom && record.lastEntry && isValid(new Date(record.lastEntry)) && new Date(record.lastEntry) < appliedFilters.dateFrom) return false;
            if (appliedFilters.dateTo && record.lastEntry && isValid(new Date(record.lastEntry)) && new Date(record.lastEntry) > appliedFilters.dateTo) return false;
            
            return true;
        });
    }, [civilRecords, appliedFilters]);

    const columns: ColumnDef<CivilRecord>[] = [
        {
            accessorKey: 'fullName',
            header: t('columnName'),
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                <Avatar>
                    <AvatarImage src={row.original.profilePicture} alt={`${row.original.firstName} ${row.original.lastName}`} data-ai-hint="portrait professional" />
                    <AvatarFallback>{row.original.firstName?.charAt(0)}{row.original.lastName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.firstName} {row.original.lastName}</span>
                    <span className="text-xs text-muted-foreground">{row.original.localizedName}</span>
                </div>
                </div>
            ),
        },
        {
            accessorKey: 'documentType',
            header: t('columnPersonType'),
            cell: ({ row }) => <Badge variant="outline" className={cn(documentTypeColors[row.original.documentType])}>{t(row.original.documentType.toLowerCase() as any)}</Badge>,
        },
        {
            accessorKey: 'documentNumber',
            header: t('columnDocumentNumber'),
        },
        {
            accessorKey: 'nationality',
            header: t('columnNationality'),
        },
        {
            accessorKey: 'lastEntry',
            header: t('columnLastEntry'),
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80" onClick={() => setRecordToView(row.original)}>
                <Eye className="h-4 w-4" />
                </Button>
            ),
        },
    ];
    
    if (loading) {
        return <div className="space-y-6">
            <Skeleton className="h-24" />
            <Skeleton className="h-48" />
            <Skeleton className="h-96" />
        </div>;
    }

    if (!canViewPage) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                <AlertTriangle className="h-16 w-16 text-destructive" />
                <h1 className="text-2xl font-bold">{t('accessDenied.title')}</h1>
                <p className="max-w-md text-muted-foreground">{t('accessDenied.description')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`/${module}/dashboard`} icon={LayoutDashboard}>Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage icon={IdCard}>{t('title')}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <GradientPageHeader
                title={t('title')}
                description={t('description')}
                icon={IdCard}
            />

            <Card>
                <Collapsible>
                    <CollapsibleTrigger asChild>
                        <div className="flex w-full cursor-pointer items-center justify-between p-4">
                        <div className="flex items-center gap-3"><Filter className="h-5 w-5" /><h2 className="text-lg font-semibold">{t('filterTitle')}</h2></div>
                        <ChevronDown className="h-5 w-5 transition-transform duration-300 [&[data-state=open]]:rotate-180" />
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="p-6 pt-0">
                        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            <Input placeholder={t('filterEnglishName')} value={filters.name} onChange={(e) => handleUpdateFilter('name', e.target.value)} />
                            <Input placeholder={t('filterLocalizedName')} value={filters.localizedName} onChange={(e) => handleUpdateFilter('localizedName', e.target.value)} />
                            <Input placeholder={t('filterDocumentNumber')} value={filters.documentNumber} onChange={(e) => handleUpdateFilter('documentNumber', e.target.value)} />
                            
                            <Combobox
                                options={nationalityOptions}
                                value={filters.nationality}
                                onChange={(value) => handleUpdateFilter('nationality', value)}
                                placeholder={t('filterNationality')}
                                searchPlaceholder={t('searchNationality')}
                                noResultsText={t('noNationality')}
                            />

                            <Select value={filters.documentType} onValueChange={(value) => handleUpdateFilter('documentType', value === 'all' ? '' : value)}>
                                <SelectTrigger><SelectValue placeholder={t('filterPersonType')} /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('allTypes')}</SelectItem>
                                    <SelectItem value="Citizen">{t('citizen')}</SelectItem>
                                    <SelectItem value="Resident">{t('resident')}</SelectItem>
                                    <SelectItem value="Visitor">{t('visitor')}</SelectItem>
                                </SelectContent>
                            </Select>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("justify-start text-left font-normal", !filters.dateFrom && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />{filters.dateFrom ? format(filters.dateFrom, "PPP") : <span>{t('fromDate')}</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={filters.dateFrom || undefined} onSelect={(d) => handleUpdateFilter('dateFrom', d)} disabled={(date) => date > new Date() || (filters.dateTo ? date > filters.dateTo : false)} initialFocus /></PopoverContent>
                            </Popover>
                            
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("justify-start text-left font-normal", !filters.dateTo && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />{filters.dateTo ? format(filters.dateTo, "PPP") : <span>{t('toDate')}</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={filters.dateTo || undefined} onSelect={(d) => handleUpdateFilter('dateTo', d)} disabled={(date) => date > new Date() || (filters.dateFrom ? date < filters.dateFrom : false)} initialFocus /></PopoverContent>
                            </Popover>

                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <Button onClick={clearFilters} variant="outline"><X className="mr-2 h-4 w-4"/>{t('reset')}</Button>
                            <Button onClick={handleSearch}><Search className="mr-2 h-4 w-4"/>{t('search')}</Button>
                        </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </Card>
      
            <Card>
                <CardHeader><CardTitle>{t('recordsTitle')}</CardHeader></CardHeader>
                <CardContent>
                <DataTable
                    columns={columns}
                    data={filteredData}
                    hideDefaultFilter
                />
                </CardContent>
            </Card>

            <CivilRecordDetailsSheet
                record={recordToView}
                isOpen={!!recordToView}
                onOpenChange={(isOpen) => !isOpen && setRecordToView(null)}
            />
        </div>
    );
}
