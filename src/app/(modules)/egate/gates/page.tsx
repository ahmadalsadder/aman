
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import type { Gate } from '@/types/live-processing';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  DoorOpen, Wrench, CircleOff, CircleSlash, Wifi, WifiOff, Users, Clock, 
  ClipboardList, Filter, ChevronDown, X, Search, MoreHorizontal, Eye, FilePenLine, Trash2, PlusCircle, PlayCircle, PauseCircle, AlertTriangle, LayoutDashboard
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TransactionStatsCard } from '@/components/transactions/transaction-stats-card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DeleteGateDialog } from '@/components/gates/delete-gate-dialog';
import { GateDetailsSheet } from '@/components/gates/gate-details-sheet';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';

const statusConfig = {
  Active: { icon: DoorOpen, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  Maintenance: { icon: Wrench, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  Offline: { icon: CircleOff, color: 'text-red-500', bgColor: 'bg-red-500/10' },
  Limited: { icon: CircleSlash, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
};

const typeColors: { [key: string]: string } = {
  Entry: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  Exit: 'bg-purple-500/20 text-purple-700 border-purple-500/30',
  Bidirectional: 'bg-indigo-500/20 text-indigo-700 border-indigo-500/30',
  VIP: 'bg-pink-500/20 text-pink-700 border-pink-500/30',
  Crew: 'bg-teal-500/20 text-teal-700 border-teal-500/30',
};


const initialFilters = {
  name: '',
  terminal: '',
  type: '',
  status: '',
};

function GateCard({ gate, onView, onEdit, onDelete, onToggleStatus, canEdit, canDelete }: { 
    gate: Gate; 
    onView: () => void; 
    onEdit: () => void; 
    onDelete: () => void; 
    onToggleStatus: (gateId: string) => void;
    canEdit: boolean;
    canDelete: boolean;
}) {
  const t = useTranslations('GatesPage.card');
  const config = statusConfig[gate.status];
  const capacity = gate.entryConfig?.capacity || gate.exitConfig?.capacity || 0;

  return (
    <Card className="flex flex-col transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>{gate.code}</CardTitle>
                <div className="flex items-center gap-2">
                    <CardDescription>{gate.name}</CardDescription>
                </div>
            </div>
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">{t('openMenu')}</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onView}>
                    <Eye className="mr-2 h-4 w-4 text-primary" />
                    <span>{t('viewDetails')}</span>
                </DropdownMenuItem>
                {canEdit && (
                    <DropdownMenuItem onClick={onEdit}>
                        <FilePenLine className="mr-2 h-4 w-4 text-yellow-500" />
                        <span>{t('editGate')}</span>
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {canEdit && (
                  <>
                    {gate.status === 'Active' ? (
                      <DropdownMenuItem onClick={() => onToggleStatus(gate.id)}>
                          <PauseCircle className="mr-2 h-4 w-4 text-orange-500" />
                          <span>{t('deactivate')}</span>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => onToggleStatus(gate.id)}>
                          <PlayCircle className="mr-2 h-4 w-4 text-green-500" />
                          <span>{t('activate')}</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                  </>
                )}
                {canDelete && (
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onDelete}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>{t('delete')}</span>
                    </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div>
          <div className="mb-1 flex justify-between text-xs font-medium text-muted-foreground">
            <span>{t('load')}</span>
            <span>{gate.currentLoad ?? 0}%</span>
          </div>
          <Progress value={gate.currentLoad ?? 0} className="h-2" />
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><Users className="h-4 w-4" /> {t('queue')}</span>
            <span className="font-medium">{gate.passengerCount ?? 0} / {capacity}</span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {t('avgTime')}</span>
            <span className="font-medium">{gate.avgProcessingTime ?? 'N/A'}</span>
        </div>
         <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('lastMaintenance')}</span>
            <span className="font-medium">{gate.lastMaintenance}</span>
        </div>
      </CardContent>
      <CardFooter className="flex-wrap gap-2 text-xs border-t pt-4">
          <Badge variant="outline" className={cn(config.bgColor, config.color, 'border-current/30')}>{gate.status}</Badge>
          <Badge variant="outline" className={cn('text-xs', typeColors[gate.type])}>{gate.type}</Badge>
          {gate.equipment?.map(eq => (
            <Badge key={eq.name} variant={eq.status === 'online' ? 'default' : 'destructive'} className="border">
                {eq.status === 'online' ? <Wifi className="mr-1 h-3 w-3" /> : <WifiOff className="mr-1 h-3 w-3" />}
                {eq.name}
            </Badge>
          ))}
      </CardFooter>
    </Card>
  );
}

export default function GatesPage() {
  const t = useTranslations('GatesPage');
  const [gates, setGates] = useState<Gate[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  const { hasPermission } = useAuth();
  const [loading, setLoading] = useState(true);

  const [gateToView, setGateToView] = useState<Gate | null>(null);
  const [gateToDelete, setGateToDelete] = useState<Gate | null>(null);

  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  const canView = hasPermission(['egate:records:view']);
  const canCreate = hasPermission(['egate:records:create']);
  const canEdit = hasPermission(['egate:records:edit']);
  const canDelete = hasPermission(['egate:records:delete']);

  useEffect(() => {
    if (!canView) {
        setLoading(false);
        return;
    }
    const fetchData = async () => {
        setLoading(true);
        const result = await api.get<Gate[]>('/data/gates');
        if (result.isSuccess) {
            setGates(result.data || []);
        }
        setLoading(false);
    }
    fetchData();
  }, [canView]);
  
  const handleToggleStatus = async (gateId: string) => {
    const gate = gates.find(g => g.id === gateId);
    if (!gate) return;

    const newStatus = gate.status === 'Active' ? 'Offline' : 'Active';
    const result = await api.post<Gate>('/data/gates/update-status', { gateId, status: newStatus });

    if (result.isSuccess && result.data) {
        setGates(gates.map(g => g.id === gateId ? result.data! : g));
        toast({
            title: t('toast.statusUpdated.title', { status: newStatus }),
            description: t('toast.statusUpdated.description', { name: gate.name, status: newStatus.toLowerCase() }),
            variant: 'success',
        });
    } else {
        toast({
            title: t('toast.error.title'),
            description: result.errors?.[0]?.message || t('toast.error.description'),
            variant: 'destructive',
        });
    }
  };

  const handleDeleteGate = async () => {
    if (!gateToDelete) return;

    const result = await api.post('/data/gates/delete', { id: gateToDelete.id });

    if(result.isSuccess) {
        setGates(prev => prev.filter(g => g.id !== gateToDelete.id));
        toast({
            title: t('toast.deleteSuccess.title'),
            description: t('toast.deleteSuccess.description'),
            variant: 'info',
        });
    } else {
        toast({
            title: t('toast.error.title'),
            description: result.errors?.[0]?.message || t('toast.error.description'),
            variant: 'destructive',
        });
    }
    setGateToDelete(null);
  };


  const gateStats = useMemo(() => ({
    total: gates.length,
    active: gates.filter(g => g.status === 'Active').length,
    maintenance: gates.filter(g => g.status === 'Maintenance').length,
    offline: gates.filter(g => g.status === 'Offline').length,
  }), [gates]);

  const uniqueTerminals = useMemo(() => Array.from(new Set(gates.map(g => g.terminalName).filter(Boolean))), [gates]);
  const uniqueTypes = useMemo(() => Array.from(new Set(gates.map(g => g.type))), [gates]);
  const uniqueStatuses = useMemo(() => Array.from(new Set(gates.map(g => g.status))), [gates]);

  const handleUpdateFilter = (key: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => setAppliedFilters(filters);
  const clearFilters = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  };

  const filteredGates = useMemo(() => {
    return gates.filter(gate => {
      const nameLower = appliedFilters.name.toLowerCase();

      if (nameLower && !gate.name.toLowerCase().includes(nameLower) && !gate.terminalName?.toLowerCase().includes(nameLower)) return false;
      if (appliedFilters.terminal && gate.terminalName !== appliedFilters.terminal) return false;
      if (appliedFilters.type && gate.type !== appliedFilters.type) return false;
      if (appliedFilters.status && gate.status !== appliedFilters.status) return false;

      return true;
    });
  }, [gates, appliedFilters]);

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
            <h1 className="text-2xl font-bold">{t('accessDenied.title')}</h1>
            <p className="max-w-md text-muted-foreground">
                {t('accessDenied.description')}
            </p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
          <BreadcrumbList>
              <BreadcrumbItem>
                  <BreadcrumbLink href="/egate/dashboard" icon={LayoutDashboard}>{t('dashboard', {ns: 'Navigation'})}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                  <BreadcrumbPage icon={ClipboardList}>{t('pageTitle')}</BreadcrumbPage>
              </BreadcrumbItem>
          </BreadcrumbList>
      </Breadcrumb>
      <GradientPageHeader
        title={t('pageTitle')}
        description={t('pageDescription')}
        icon={ClipboardList}
      >
        {canCreate && (
            <Button asChild className="bg-white font-semibold text-primary hover:bg-white/90">
                <Link href="/egate/gates/add">
                    <PlusCircle className="mr-2 h-4 w-4" /> {t('addGate')}
                </Link>
            </Button>
        )}
      </GradientPageHeader>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <TransactionStatsCard title={t('stats.total')} value={gateStats.total.toLocaleString()} description={t('stats.totalDesc')} icon={ClipboardList} iconColor="text-blue-500" />
        <TransactionStatsCard title={t('stats.active')} value={gateStats.active.toLocaleString()} description={t('stats.activeDesc')} icon={DoorOpen} iconColor="text-green-500" />
        <TransactionStatsCard title={t('stats.maintenance')} value={gateStats.maintenance.toLocaleString()} description={t('stats.maintenanceDesc')} icon={Wrench} iconColor="text-yellow-500" />
        <TransactionStatsCard title={t('stats.offline')} value={gateStats.offline.toLocaleString()} description={t('stats.offlineDesc')} icon={CircleOff} iconColor="text-red-500" />
      </div>

       <Card>
        <Collapsible>
          <CollapsibleTrigger asChild>
            <div className="flex w-full cursor-pointer items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5" />
                <h2 className="text-lg font-semibold">{t('filters.title')}</h2>
              </div>
              <ChevronDown className="h-5 w-5 transition-transform duration-300 [&[data-state=open]]:rotate-180" />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-6 pt-0">
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 md:grid-cols-4">
                <Input placeholder={t('filters.namePlaceholder')} value={filters.name} onChange={(e) => handleUpdateFilter('name', e.target.value)} />
                <Select value={filters.terminal} onValueChange={(value) => handleUpdateFilter('terminal', value === 'all' ? '' : value)}>
                  <SelectTrigger><SelectValue placeholder={t('filters.terminalPlaceholder')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.allTerminals')}</SelectItem>
                    {uniqueTerminals.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
                 <Select value={filters.type} onValueChange={(value) => handleUpdateFilter('type', value === 'all' ? '' : value)}>
                  <SelectTrigger><SelectValue placeholder={t('filters.typePlaceholder')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.allTypes')}</SelectItem>
                    {uniqueTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filters.status} onValueChange={(value) => handleUpdateFilter('status', value === 'all' ? '' : value)}>
                  <SelectTrigger><SelectValue placeholder={t('filters.statusPlaceholder')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
                    {uniqueStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button onClick={clearFilters} variant="outline"><X className="mr-2 h-4 w-4"/>{t('filters.reset')}</Button>
                <Button onClick={handleSearch}><Search className="mr-2 h-4 w-4"/>{t('filters.search')}</Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredGates.map((gate) => (
          <GateCard 
            key={gate.id} 
            gate={gate} 
            onView={() => setGateToView(gate)}
            onEdit={() => router.push(`/egate/gates/edit/${gate.id}`)}
            onDelete={() => setGateToDelete(gate)}
            onToggleStatus={handleToggleStatus}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        ))}
        {filteredGates.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground p-8">
            {t('noResults')}
          </div>
        )}
      </div>

       <GateDetailsSheet
        gate={gateToView}
        isOpen={!!gateToView}
        onOpenChange={(isOpen) => !isOpen && setGateToView(null)}
      />
      <DeleteGateDialog
        gate={gateToDelete}
        isOpen={!!gateToDelete}
        onOpenChange={(isOpen) => !isOpen && setGateToDelete(null)}
        onConfirm={handleDeleteGate}
      />
    </div>
  );
}
