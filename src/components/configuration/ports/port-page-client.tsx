
'use client';

import { useState, useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { Permission } from '@/types';
import type { Port, PortType } from '@/types/configuration';
import { DataTable } from '@/components/shared/data-table';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Globe, Eye, FilePenLine, Trash2, ListTodo, CheckCircle, Plane, Ship, Filter, ChevronDown, X, Search, PauseCircle, PlayCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { DeletePortDialog } from '@/components/configuration/ports/delete-port-dialog';
import { PortDetailsSheet } from '@/components/configuration/ports/port-details-sheet';
import { TransactionStatsCard } from '@/components/transactions/transaction-stats-card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { LayoutDashboard } from 'lucide-react';
import { useTranslations } from 'next-intl';

const statusColors: { [key: string]: string } = {
  Active: 'bg-green-500/20 text-green-700 border-green-500/30',
  Inactive: 'bg-gray-500/20 text-gray-700 border-gray-500/30',
};

const typeColors: { [key: string]: string } = {
    'Airport': 'bg-blue-500/20 text-blue-700 border-blue-500/30',
    'Seaport': 'bg-cyan-500/20 text-cyan-700 border-cyan-500/30',
    'Landport': 'bg-amber-500/20 text-amber-700 border-amber-500/30',
};

const portTypes: PortType[] = ['Airport', 'Seaport', 'Landport'];
const portStatuses: Port['status'][] = ['Active', 'Inactive'];

const initialFilters = {
  name: '',
  type: '',
  status: '',
};

interface PortPageClientProps {
    ports: Port[];
    onDeletePort: (portId: string) => Promise<boolean>;
    onToggleStatus: (portId: string) => Promise<void>;
    permissions: {
        canCreate: boolean;
        canEdit: boolean;
        canDelete: boolean;
    };
}

export function PortPageClient({ ports, onDeletePort, onToggleStatus, permissions }: PortPageClientProps) {
  const t = useTranslations('Configuration.Ports');
  const tNav = useTranslations('Navigation');
  
  const [portToView, setPortToView] = useState<Port | null>(null);
  const [portToDelete, setPortToDelete] = useState<Port | null>(null);
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  const portStats = useMemo(() => {
    const total = ports.length;
    const active = ports.filter(r => r.status === 'Active').length;
    const airports = ports.filter(r => r.type === 'Airport').length;
    const seaports = ports.filter(r => r.type === 'Seaport').length;
    return { total, active, airports, seaports };
  }, [ports]);

  const handleConfirmDelete = async () => {
    if (!portToDelete) return;
    const success = await onDeletePort(portToDelete.id);
    if (success) {
      setPortToDelete(null);
    }
  };

  const handleUpdateFilter = (key: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => setAppliedFilters(filters);
  const clearFilters = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  };
  
  const filteredData = useMemo(() => {
    return ports.filter(port => {
      const nameLower = appliedFilters.name.toLowerCase();

      if (nameLower && !port.name.toLowerCase().includes(nameLower)) return false;
      if (appliedFilters.type && port.type !== appliedFilters.type) return false;
      if (appliedFilters.status && port.status !== appliedFilters.status) return false;

      return true;
    });
  }, [ports, appliedFilters]);

  const columns: ColumnDef<Port>[] = [
    {
      id: 'select',
      header: ({ table }) => ( <Checkbox checked={table.getIsAllPageRowsSelected()} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" /> ),
      cell: ({ row }) => ( <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" /> ),
      enableSorting: false,
      enableHiding: false,
    },
    { accessorKey: 'name', header: t('table.portName'), cell: ({ row }) => ( <div className="flex flex-col"><span className="font-medium">{row.original.name}</span><span className="text-xs text-muted-foreground">{row.original.shortName}</span></div> ) },
    { accessorKey: 'city', header: t('table.city') },
    { accessorKey: 'type', header: t('table.type'), cell: ({ row }) => <Badge variant="outline" className={cn(typeColors[row.original.type])}>{row.original.type}</Badge> },
    { accessorKey: 'status', header: t('table.status'), cell: ({ row }) => <Badge variant="outline" className={cn(statusColors[row.original.status])}>{row.original.status}</Badge> },
    { id: 'actions', cell: ({ row }) => {
        const port = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setPortToView(port)}><Eye className="mr-2 h-4 w-4 text-primary" /><span>{t('actions.view')}</span></DropdownMenuItem>
              {permissions.canEdit && <DropdownMenuItem asChild><Link href={`/configuration/ports/edit/${port.id}`}><FilePenLine className="mr-2 h-4 w-4 text-yellow-500" /><span>{t('actions.edit')}</span></Link></DropdownMenuItem>}
              {permissions.canEdit && (port.status === 'Active' ? ( <DropdownMenuItem onClick={() => onToggleStatus(port.id)}><PauseCircle className="mr-2 h-4 w-4 text-orange-500" /><span>{t('actions.deactivate')}</span></DropdownMenuItem> ) : ( <DropdownMenuItem onClick={() => onToggleStatus(port.id)}><PlayCircle className="mr-2 h-4 w-4 text-green-500" /><span>{t('actions.activate')}</span></DropdownMenuItem> ))}
              {permissions.canDelete && <DropdownMenuSeparator />}
              {permissions.canDelete && <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setPortToDelete(port)}><Trash2 className="mr-2 h-4 w-4" /><span>{t('actions.delete')}</span></DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/configuration/dashboard" icon={LayoutDashboard}>{tNav('dashboard')}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage icon={Ship}>{t('pageTitle')}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
      <GradientPageHeader title={t('pageTitle')} description={t('pageDescription')} icon={Ship}>
        {permissions.canCreate && (
            <Button asChild className="bg-white font-semibold text-primary hover:bg-white/90">
                <Link href="/configuration/ports/add"> <PlusCircle className="mr-2 h-4 w-4" /> {t('addPort')} </Link>
            </Button>
        )}
      </GradientPageHeader>
      
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <TransactionStatsCard title={t('stats.total')} value={portStats.total.toLocaleString()} description={t('stats.totalDesc')} icon={ListTodo} iconColor="text-blue-500" />
        <TransactionStatsCard title={t('stats.active')} value={portStats.active.toLocaleString()} description={t('stats.activeDesc')} icon={CheckCircle} iconColor="text-green-500" />
        <TransactionStatsCard title={t('stats.airports')} value={portStats.airports.toLocaleString()} description={t('stats.airportsDesc')} icon={Plane} iconColor="text-purple-500" />
        <TransactionStatsCard title={t('stats.seaports')} value={portStats.seaports.toLocaleString()} description={t('stats.seaportsDesc')} icon={Ship} iconColor="text-cyan-500" />
      </div>

       <Card>
        <Collapsible>
          <CollapsibleTrigger asChild>
            <div className="flex w-full cursor-pointer items-center justify-between p-4">
              <div className="flex items-center gap-3"> <Filter className="h-5 w-5" /> <h2 className="text-lg font-semibold">{t('filters.title')}</h2> </div>
              <ChevronDown className="h-5 w-5 transition-transform duration-300 [&[data-state=open]]:rotate-180" />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-6 pt-0">
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 md:grid-cols-3">
                <Input placeholder={t('filters.namePlaceholder')} value={filters.name} onChange={(e) => handleUpdateFilter('name', e.target.value)} />
                <Select value={filters.type} onValueChange={(value) => handleUpdateFilter('type', value === 'all' ? '' : value)}>
                  <SelectTrigger><SelectValue placeholder={t('filters.typePlaceholder')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.allTypes')}</SelectItem>
                    {portTypes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filters.status} onValueChange={(value) => handleUpdateFilter('status', value === 'all' ? '' : value)}>
                  <SelectTrigger><SelectValue placeholder={t('filters.statusPlaceholder')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
                    {portStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
      
      <Card>
        <CardHeader> <CardTitle>{t('table.title')}</CardTitle> <CardDescription>{t('table.description')}</CardDescription> </CardHeader>
        <CardContent> <DataTable columns={columns} data={filteredData} filterColumnId="name" hideDefaultFilter /> </CardContent>
      </Card>
      <PortDetailsSheet port={portToView} isOpen={!!portToView} onOpenChange={(isOpen) => !isOpen && setPortToView(null)} />
      <DeletePortDialog port={portToDelete} isOpen={!!portToDelete} onOpenChange={(isOpen) => !isOpen && setPortToDelete(null)} onConfirm={handleConfirmDelete} />
    </div>
  );
}
