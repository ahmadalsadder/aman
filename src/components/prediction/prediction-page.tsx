
'use client';

import { useState, useMemo, useEffect } from 'react';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { BrainCircuit, Filter, ChevronDown, Search, X, LayoutDashboard, AlertTriangle } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { PassengerFlowChart } from '@/components/prediction/passenger-flow-chart';
import { ProcessingVelocityChart } from '@/components/prediction/processing-velocity-chart';
import { QueueDynamicsChart } from '@/components/prediction/queue-dynamics-chart';
import { FlightScheduleTable } from '@/components/prediction/flight-schedule-table';
import { VesselScheduleTable } from '@/components/prediction/vessel-schedule-table';
import { PredictionStatsCards } from '@/components/prediction/prediction-stats-cards';
import { api } from '@/lib/api';
import type { Module, Permission } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useTranslations } from 'next-intl';
import CalendarIcon from '@/components/icons/calendar-icon';

interface PredictionPageProps {
    module: Module;
}

const initialFilters = {
    dateFrom: new Date(),
    dateTo: addDays(new Date(), 1),
};

export function PredictionPage({ module }: PredictionPageProps) {
    const t = useTranslations('Prediction');
    const { hasPermission } = useAuth();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState(initialFilters);
    const [appliedFilters, setAppliedFilters] = useState(initialFilters);

    const canViewPage = useMemo(() => hasPermission([`${module}:prediction:view` as Permission]), [hasPermission, module]);

    useEffect(() => {
        if (!canViewPage) {
            setLoading(false);
            return;
        }
        const fetchData = async () => {
            setLoading(true);
            const result = await api.get(`/dashboard/prediction?module=${module}`);
            if (result.isSuccess) {
                setData(result.data);
            }
            setLoading(false);
        };
        fetchData();
    }, [canViewPage, module, appliedFilters]);


    const handleUpdateFilter = (key: keyof typeof filters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSearch = () => setAppliedFilters(filters);
    const clearFilters = () => {
        setFilters(initialFilters);
        setAppliedFilters(initialFilters);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-24" />
                <Skeleton className="h-32" />
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Skeleton className="h-96" />
                    <Skeleton className="h-96" />
                </div>
            </div>
        )
    }

    if (!canViewPage) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                <AlertTriangle className="h-16 w-16 text-destructive" />
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="max-w-md text-muted-foreground">
                    You do not have permission to view predictive analytics for this module.
                </p>
            </div>
        );
    }
    
    if (!data) {
        return (
             <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                <AlertTriangle className="h-16 w-16 text-destructive" />
                <h1 className="text-2xl font-bold">Error</h1>
                <p className="max-w-md text-muted-foreground">
                    Could not load prediction data. Please try again later.
                </p>
            </div>
        )
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
                        <BreadcrumbPage icon={BrainCircuit}>{t('title')}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <GradientPageHeader
                title={t('title')}
                description={t('description')}
                icon={BrainCircuit}
            />

            <Card>
                <Collapsible>
                    <CollapsibleTrigger asChild>
                        <div className="flex w-full cursor-pointer items-center justify-between p-4">
                            <div className="flex items-center gap-3"><Filter className="h-5 w-5" /><h2 className="text-lg font-semibold">{t('searchAndFilter')}</h2></div>
                            <ChevronDown className="h-5 w-5 transition-transform duration-300 [&[data-state=open]]:rotate-180" />
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="p-6 pt-0">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant={"outline"} className={cn("justify-start text-left font-normal", !filters.dateFrom && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />{filters.dateFrom ? format(filters.dateFrom, "PPP") : <span>{t('fromDate')}</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={filters.dateFrom} onSelect={d => d && handleUpdateFilter('dateFrom', d)} disabled={(date) => filters.dateTo ? date > filters.dateTo : false} initialFocus /></PopoverContent>
                                </Popover>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant={"outline"} className={cn("justify-start text-left font-normal", !filters.dateTo && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />{filters.dateTo ? format(filters.dateTo, "PPP") : <span>{t('toDate')}</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={filters.dateTo} onSelect={d => d && handleUpdateFilter('dateTo', d)} disabled={(date) => filters.dateFrom ? date < filters.dateFrom : false} initialFocus /></PopoverContent>
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

            <PredictionStatsCards stats={data.stats} module={module} />
            
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <PassengerFlowChart data={data.passengerFlow} module={module} />
                <ProcessingVelocityChart data={data.processingVelocity} />
            </div>
            
            <QueueDynamicsChart data={data.queueDynamics} />
            {module === 'airport' && (
                <>
                    <FlightScheduleTable title={t('schedule.arrivals')} data={data.flightSchedule.arrivals} />
                    <FlightScheduleTable title={t('schedule.departures')} data={data.flightSchedule.departures} />
                </>
            )}
            {module === 'seaport' && (
                 <>
                    <VesselScheduleTable title={t('schedule.arrivals')} data={data.vesselSchedule.arrivals} />
                    <VesselScheduleTable title={t('schedule.departures')} data={data.vesselSchedule.departures} />
                </>
            )}

        </div>
    );
}
