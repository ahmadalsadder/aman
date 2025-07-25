
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Monitor, Filter, ChevronDown, X, Search, PlusCircle, AlertTriangle } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Combobox } from '@/components/ui/combobox';
import type { OfficerDesk, Port, Terminal } from '@/types/configuration';
import type { Module, Permission } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import { DeskStatsCards } from './desk-stats-cards';
import { Skeleton } from '@/components/ui/skeleton';
import { OfficerDeskDetailsSheet } from './officer-desk-details-sheet';
import { DeleteOfficerDeskDialog } from './delete-officer-desk-dialog';
import { DeskCard } from './desk-card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { LayoutDashboard } from 'lucide-react';


const initialFilters = {
  name: '',
  portId: '',
  terminalId: '',
  movementType: '',
  status: '',
};

interface OfficerDesksPageProps {
    module: Module;
    moduleName: string;
    desks: OfficerDesk[];
    ports: Port[];
    terminals: Terminal[];
    loading: boolean;
}

export function OfficerDesksPage({ module, moduleName, desks, ports, terminals, loading }: OfficerDesksPageProps) {
    const { toast } = useToast();
    const router = useRouter();
    const { hasPermission } = useAuth();
    const t = useTranslations('OfficerDesks');
    
    const [currentDesks, setCurrentDesks] = useState<OfficerDesk[]>(desks);
    const [deskToView, setDeskToView] = useState<OfficerDesk | null>(null);
    const [deskToDelete, setDeskToDelete] = useState<OfficerDesk | null>(null);

    const [filters, setFilters] = useState(initialFilters);
    const [appliedFilters, setAppliedFilters] = useState(initialFilters);

    const canView = useMemo(() => hasPermission([`${module}:desks:view` as Permission]), [hasPermission, module]);
    const canCreate = useMemo(() => hasPermission([`${module}:desks:create` as Permission]), [hasPermission, module]);
    const canEdit = useMemo(() => hasPermission([`${module}:desks:edit` as Permission]), [hasPermission, module]);
    const canDelete = useMemo(() => hasPermission([`${module}:desks:delete` as Permission]), [hasPermission, module]);

    useEffect(() => {
        setCurrentDesks(desks);
    }, [desks]);

    const handleToggleStatus = async (deskId: string, currentStatus: 'Active' | 'Inactive' | 'Closed') => {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        const result = await api.post<OfficerDesk>('/data/desks/update-status', { deskId, status: newStatus });

        if (result.isSuccess && result.data) {
            setCurrentDesks(currentDesks.map(d => d.id === deskId ? result.data! : d));
            toast({
                title: t('deskCard.activate'),
                description: `Desk "${result.data.name}" has been set to ${result.data.status.toLowerCase()}.`,
                variant: 'success',
            });
        }
    };
    
    const handleDeleteDesk = async () => {
        if (!deskToDelete) return;
    
        const result = await api.post('/data/desks/delete', { id: deskToDelete.id });
    
        if (result.isSuccess) {
            setCurrentDesks(prev => prev.filter(d => d.id !== deskToDelete.id));
            toast({
                title: t('deleteDialog.title'),
                description: `Desk has been permanently deleted.`,
                variant: 'info',
            });
        } else {
             toast({
                title: 'Delete Failed',
                description: result.errors?.[0]?.message || 'There was an error deleting the desk data.',
                variant: 'destructive',
            });
        }
        setDeskToDelete(null);
    };

    const portOptions = useMemo(() => ports.map(p => ({ value: p.id, label: p.name })), [ports]);
    const terminalOptions = useMemo(() => terminals.filter(t => !filters.portId || t.portId === filters.portId).map(t => ({ value: t.id, label: t.name })), [terminals, filters.portId]);
    const uniqueMovementTypes = useMemo(() => Array.from(new Set(currentDesks.map(g => g.movementType))), [currentDesks]);
    const uniqueStatuses = useMemo(() => Array.from(new Set(currentDesks.map(g => g.status))), [currentDesks]);

    const handleUpdateFilter = (key: keyof typeof filters, value: any) => setFilters(prev => ({ ...prev, [key]: value }));
    const handleSearch = () => setAppliedFilters(filters);
    const clearFilters = () => {
        setFilters(initialFilters);
        setAppliedFilters(initialFilters);
    };

    const filteredDesks = useMemo(() => {
        return currentDesks.filter(desk => {
            const nameLower = appliedFilters.name.toLowerCase();
            if (nameLower && !desk.name.toLowerCase().includes(nameLower) && !desk.terminalName?.toLowerCase().includes(nameLower)) return false;
            if (appliedFilters.portId && desk.portId !== appliedFilters.portId) return false;
            if (appliedFilters.terminalId && desk.terminalId !== appliedFilters.terminalId) return false;
            if (appliedFilters.movementType && desk.movementType !== appliedFilters.movementType) return false;
            if (appliedFilters.status && desk.status !== appliedFilters.status) return false;
            return true;
        });
    }, [currentDesks, appliedFilters]);

    if (loading) {
        return <div className="space-y-6">
            <Skeleton className="h-24" />
            <Skeleton className="h-32" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
            </div>
        </div>;
    }

    if (!canView) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                <AlertTriangle className="h-16 w-16 text-destructive" />
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="max-w-md text-muted-foreground">
                    You do not have permission to view this page.
                </p>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
             <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`/${module}/dashboard`} icon={LayoutDashboard}>{t('dashboard', {ns: 'Navigation'})}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage icon={Monitor}>{t('pageTitle')}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            
            <GradientPageHeader title={t('pageTitle')} description={t('pageDescription')} icon={Monitor}>
                {canCreate && (
                    <Button asChild className="bg-white font-semibold text-primary hover:bg-white/90">
                        <Link href={`/${module}/officer-desks/add`}>
                            <PlusCircle className="mr-2 h-4 w-4" /> {t('addDesk')}
                        </Link>
                    </Button>
                )}
            </GradientPageHeader>
            
            <DeskStatsCards desks={currentDesks} />

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
                            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                                <Input placeholder={t('filterPlaceholder')} value={filters.name} onChange={(e) => handleUpdateFilter('name', e.target.value)} />
                                <Combobox options={portOptions} value={filters.portId} onChange={(value) => handleUpdateFilter('portId', value)} placeholder={t('port')} />
                                <Combobox options={terminalOptions} value={filters.terminalId} onChange={(value) => handleUpdateFilter('terminalId', value)} placeholder={t('terminal')} />
                                <Select value={filters.movementType} onValueChange={(value) => handleUpdateFilter('movementType', value === 'all' ? '' : value)}>
                                    <SelectTrigger><SelectValue placeholder={t('movementType')} /></SelectTrigger>
                                    <SelectContent><SelectItem value="all">{t('allTypes')}</SelectItem>{uniqueMovementTypes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                </Select>
                                <Select value={filters.status} onValueChange={(value) => handleUpdateFilter('status', value === 'all' ? '' : value)}>
                                    <SelectTrigger><SelectValue placeholder={t('status')} /></SelectTrigger>
                                    <SelectContent><SelectItem value="all">{t('allStatuses')}</SelectItem>{uniqueStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="mt-6 flex justify-end gap-2">
                                <Button onClick={clearFilters} variant="outline"><X className="mr-2 h-4 w-4"/>{t('reset')}</Button>
                                <Button onClick={handleSearch}><Search className="mr-2 h-4 w-4"/>{t('search')}</Button>
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </Card>
      
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredDesks.map((desk) => (
                <DeskCard 
                    key={desk.id} 
                    desk={desk} 
                    onView={() => setDeskToView(desk)}
                    onEdit={() => router.push(`/${module}/officer-desks/edit/${desk.id}`)}
                    onDelete={() => setDeskToDelete(desk)}
                    onToggleStatus={handleToggleStatus}
                    canEdit={canEdit}
                    canDelete={canDelete}
                />
                ))}
                {filteredDesks.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground p-8">{t('noDesks')}</div>
                )}
            </div>

            <OfficerDeskDetailsSheet 
                desk={deskToView}
                isOpen={!!deskToView}
                onOpenChange={(isOpen) => !isOpen && setDeskToView(null)}
            />

            <DeleteOfficerDeskDialog
                desk={deskToDelete}
                isOpen={!!deskToDelete}
                onOpenChange={(isOpen) => !isOpen && setDeskToDelete(null)}
                onConfirm={handleDeleteDesk}
            />
        </div>
    );
}
