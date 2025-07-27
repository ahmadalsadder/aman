
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { GateLogEntry } from '@/types/live-processing';
import { DataTable } from '@/components/shared/data-table';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { Button } from '@/components/ui/button';
import { FileText, Filter, ChevronDown, X, Search, AlertTriangle, LayoutDashboard, RadioTower, ListOrdered } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, isValid } from 'date-fns';
import { api } from '@/lib/api';
import type { Module, Permission } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useTranslations } from 'next-intl';
import CalendarIcon from '@/components/icons/calendar-icon';


const eventTypeColors: { [key: string]: string } = {
    StatusChange: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
    Transaction: 'bg-green-500/20 text-green-700 border-green-500/30',
    Error: 'bg-red-500/20 text-red-700 border-red-500/30',
    Maintenance: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
};

const initialFilters = {
  gateName: '',
  eventType: '',
  dateFrom: null as Date | null,
  dateTo: null as Date | null,
};

export default function GateLogPage() {
    const t = useTranslations('ControlRoom.gateLog');
    const { hasPermission } = useAuth();
    const canViewPage = hasPermission(['control-room:gate-log:view' as Permission]);

    const [logs, setLogs] = useState<GateLogEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState(initialFilters);
    const [appliedFilters, setAppliedFilters] = useState(initialFilters);

    useEffect(() => {
        if (canViewPage) {
            api.get<GateLogEntry[]>('/data/gate-logs').then(result => {
                if (result.isSuccess) {
                    setLogs(result.data || []);
                }
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [canViewPage]);

    const filteredData = useMemo(() => {
        return logs.filter(log => {
            if (appliedFilters.gateName && !log.gateName.toLowerCase().includes(appliedFilters.gateName.toLowerCase())) return false;
            if (appliedFilters.eventType && log.eventType !== appliedFilters.eventType) return false;
            if (appliedFilters.dateFrom && new Date(log.timestamp) < appliedFilters.dateFrom) return false;
            if (appliedFilters.dateTo && new Date(log.timestamp) > appliedFilters.dateTo) return false;
            return true;
        });
    }, [logs, appliedFilters]);

    const columns: ColumnDef<GateLogEntry>[] = [
        { accessorKey: 'timestamp', header: t('table.timestamp') },
        { accessorKey: 'gateName', header: t('table.gate') },
        { accessorKey: 'eventType', header: t('table.eventType'), cell: ({ row }) => <Badge variant="outline" className={cn(eventTypeColors[row.original.eventType])}>{row.original.eventType}</Badge> },
        { accessorKey: 'status', header: t('table.status') },
        { accessorKey: 'description', header: t('table.description'), cell: ({row}) => <div className="max-w-xs truncate">{row.original.description}</div> },
        { accessorKey: 'actor', header: t('table.actor') },
    ];

    if (loading) {
        return <div className="space-y-6">
            <Skeleton className="h-24" />
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
                    <BreadcrumbItem><BreadcrumbLink href="/control-room/dashboard" icon={LayoutDashboard}>{t('nav.dashboard')}</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbPage icon={ListOrdered}>{t('nav.gateLog')}</BreadcrumbPage></BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <GradientPageHeader title={t('title')} description={t('description')} icon={ListOrdered} />
            <Card>
                <Collapsible>
                    <CollapsibleTrigger asChild>
                        <div className="flex w-full cursor-pointer items-center justify-between p-4">
                            <div className="flex items-center gap-3"><Filter className="h-5 w-5" /><h2 className="text-lg font-semibold">{t('filters.title')}</h2></div>
                            <ChevronDown className="h-5 w-5 transition-transform duration-300 [&[data-state=open]]:rotate-180" />
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="p-6 pt-0">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <Input placeholder={t('filters.gateNamePlaceholder')} value={filters.gateName} onChange={(e) => setFilters({...filters, gateName: e.target.value})} />
                                <Select value={filters.eventType} onValueChange={(v) => setFilters({...filters, eventType: v})}>
                                    <SelectTrigger><SelectValue placeholder={t('filters.eventTypePlaceholder')} /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Types</SelectItem>
                                        {Object.keys(eventTypeColors).map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn("justify-start text-left font-normal", !filters.dateFrom && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />{filters.dateFrom ? format(filters.dateFrom, "PPP") : <span>{t('filters.fromDate')}</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={filters.dateFrom || undefined} onSelect={(d) => setFilters({...filters, dateFrom: d || null})} initialFocus /></PopoverContent>
                                </Popover>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn("justify-start text-left font-normal", !filters.dateTo && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />{filters.dateTo ? format(filters.dateTo, "PPP") : <span>{t('filters.toDate')}</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={filters.dateTo || undefined} onSelect={(d) => setFilters({...filters, dateTo: d || null})} initialFocus /></PopoverContent>
                                </Popover>
                            </div>
                            <div className="mt-6 flex justify-end gap-2">
                                <Button onClick={() => { setFilters(initialFilters); setAppliedFilters(initialFilters); }} variant="outline"><X className="mr-2 h-4 w-4"/>{t('filters.reset')}</Button>
                                <Button onClick={() => setAppliedFilters(filters)}><Search className="mr-2 h-4 w-4"/>{t('filters.search')}</Button>
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>{t('records.title')}</CardTitle>
                    <CardDescription>{t('records.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable columns={columns} data={filteredData} filterColumnId="gateName" />
                </CardContent>
            </Card>
        </div>
    );
}
