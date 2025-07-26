
'use client';

import { useState, useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { OfficerAssignment, Port, Terminal, Zone, Shift, User, Module, Permission } from '@/types';
import { DataTable } from '@/components/shared/data-table';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, UserPlus, Eye, FilePenLine, Trash2, Filter, ChevronDown, X, Search, ListTodo, CheckCircle, UserCheck, CalendarDays, LayoutDashboard, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TransactionStatsCard } from '@/components/transactions/transaction-stats-card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Combobox } from '@/components/ui/combobox';
import { DeleteAssignmentDialog } from '@/components/workloads/assign-officer/delete-assignment-dialog';
import { AssignmentDetailsSheet } from '@/components/workloads/assign-officer/AssignmentDetailsSheet';
import CalendarIcon from '@/components/icons/calendar-icon';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';


const statusColors: { [key: string]: string } = {
  Confirmed: 'bg-green-500/20 text-green-700 border-green-500/30',
  Pending: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
  Cancelled: 'bg-red-500/20 text-red-700 border-red-500/30',
};

const initialFilters = {
    officerId: '',
    portId: '',
    terminalId: '',
    zoneId: '',
    shiftId: '',
    assignmentDate: null as Date | null,
    status: '',
};

interface AssignOfficerPageComponentProps {
    module: Module;
    assignments: OfficerAssignment[];
    pageData: {
        officers: User[];
        shifts: Shift[];
        ports: Port[];
        terminals: Terminal[];
        zones: Zone[];
    } | null;
    loading: boolean;
    onDeleteAssignment: (assignmentId: string) => Promise<boolean>;
}

export function AssignOfficerPageComponent({ module, assignments, pageData, loading, onDeleteAssignment }: AssignOfficerPageComponentProps) {
  const router = useRouter();
  const { hasPermission } = useAuth();
  const t = useTranslations('AssignOfficer');
  const tNav = useTranslations('Navigation');
  
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  
  const [assignmentToView, setAssignmentToView] = useState<OfficerAssignment | null>(null);
  const [assignmentToDelete, setAssignmentToDelete] = useState<OfficerAssignment | null>(null);
  
  const canCreate = useMemo(() => hasPermission([`${module}:workload:view` as Permission]), [hasPermission, module]);
  const canEdit = useMemo(() => hasPermission([`${module}:workload:view` as Permission]), [hasPermission, module]);
  const canDelete = useMemo(() => hasPermission([`${module}:workload:view` as Permission]), [hasPermission, module]);

  const officerOptions = useMemo(() => pageData?.officers.map(o => ({ value: o.id, label: o.name })) || [], [pageData]);
  const shiftOptions = useMemo(() => pageData?.shifts.map(s => ({ value: s.id, label: s.name })) || [], [pageData]);
  const portOptions = useMemo(() => pageData?.ports.map(p => ({ value: p.id, label: p.name })) || [], [pageData]);
  const terminalOptions = useMemo(() => pageData?.terminals.filter(t => !filters.portId || t.portId === filters.portId).map(t => ({ value: t.id, label: t.name })) || [], [pageData, filters.portId]);
  const zoneOptions = useMemo(() => pageData?.zones.filter(z => !filters.terminalId || z.terminalId === filters.terminalId).map(z => ({ value: z.id, label: z.name })) || [], [pageData, filters.terminalId]);

  const assignmentStats = useMemo(() => {
    const total = assignments.length;
    const confirmed = assignments.filter(a => a.status === 'Confirmed').length;
    const pending = assignments.filter(a => a.status === 'Pending').length;
    return { total, confirmed, pending };
  }, [assignments]);
  
  const handleUpdateFilter = (key: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => setAppliedFilters(filters);
  const clearFilters = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  };
  
  const handleConfirmDelete = async () => {
    if (!assignmentToDelete) return;
    const success = await onDeleteAssignment(assignmentToDelete.id);
    if (success) {
      setAssignmentToDelete(null);
    }
  };

  const filteredData = useMemo(() => {
    return assignments.filter(a => {
      if (appliedFilters.officerId && a.officerId !== appliedFilters.officerId) return false;
      if (appliedFilters.portId && a.portId !== appliedFilters.portId) return false;
      if (appliedFilters.terminalId && a.terminalId !== appliedFilters.terminalId) return false;
      if (appliedFilters.zoneId && a.zoneId !== appliedFilters.zoneId) return false;
      if (appliedFilters.shiftId && a.shiftId !== appliedFilters.shiftId) return false;
      if (appliedFilters.status && a.status !== appliedFilters.status) return false;
      if (appliedFilters.assignmentDate && format(new Date(a.assignmentDate), 'yyyy-MM-dd') !== format(appliedFilters.assignmentDate, 'yyyy-MM-dd')) return false;
      return true;
    });
  }, [assignments, appliedFilters]);

  const columns: ColumnDef<OfficerAssignment>[] = [
    {
      accessorKey: 'officerName',
      header: t('table.officer'),
    },
    {
      accessorKey: 'assignmentDate',
      header: t('table.date'),
    },
    {
      accessorKey: 'shiftName',
      header: t('table.shift'),
    },
    {
      accessorKey: 'portName',
      header: t('table.port'),
    },
    {
      accessorKey: 'terminalName',
      header: t('table.terminal'),
    },
    {
      accessorKey: 'zoneName',
      header: t('table.zone'),
    },
    {
      accessorKey: 'status',
      header: t('table.status'),
      cell: ({ row }) => <Badge variant="outline" className={cn(statusColors[row.original.status])}>{row.original.status}</Badge>,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const assignment = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setAssignmentToView(assignment)}>
                  <Eye className="mr-2 h-4 w-4 text-primary" />
                  <span>{t('actions.view')}</span>
              </DropdownMenuItem>
              {canEdit && (
                <DropdownMenuItem asChild>
                  <Link href={`/${module}/workloads/assign-officer/edit/${assignment.id}`}>
                    <FilePenLine className="mr-2 h-4 w-4 text-yellow-500" />
                    <span>{t('actions.edit')}</span>
                  </Link>
                </DropdownMenuItem>
              )}
               {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setAssignmentToDelete(assignment)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>{t('actions.delete')}</span>
                  </DropdownMenuItem>
                </>
               )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
  
    if (loading) {
        return (
             <div className="space-y-6">
                <Skeleton className="h-24" />
                <Skeleton className="h-32" />
                <Skeleton className="h-96" />
            </div>
        );
    }

  return (
    <div className="space-y-6">
       <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href={`/${module}/dashboard`} icon={LayoutDashboard}>{tNav('dashboard')}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbLink href={`/${module}/workloads/shift-management`} icon={CalendarDays}>{tNav('shiftManagement')}</BreadcrumbLink>
                </BreadcrumbItem>
                 <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage icon={UserPlus}>{t('title')}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
      <GradientPageHeader
        title={t('title')}
        description={t('description')}
        icon={UserPlus}
      >
        {canCreate && (
            <Button asChild className="bg-white font-semibold text-primary hover:bg-white/90">
                <Link href={`/${module}/workloads/assign-officer/add`}>
                    <PlusCircle className="mr-2 h-4 w-4" /> {t('addAssignment')}
                </Link>
            </Button>
        )}
      </GradientPageHeader>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <TransactionStatsCard title={t('stats.total')} value={assignmentStats.total.toString()} description={t('stats.totalDesc')} icon={ListTodo} iconColor="text-blue-500" />
        <TransactionStatsCard title={t('stats.confirmed')} value={assignmentStats.confirmed.toString()} description={t('stats.confirmedDesc')} icon={UserCheck} iconColor="text-green-500" />
        <TransactionStatsCard title={t('stats.pending')} value={assignmentStats.pending.toString()} description={t('stats.pendingDesc')} icon={CheckCircle} iconColor="text-yellow-500" />
      </div>

      <Card>
        <Collapsible>
          <CollapsibleTrigger asChild>
            <div className="flex w-full cursor-pointer items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5" />
                <h2 className="text-lg font-semibold">{t('filter.title')}</h2>
              </div>
              <ChevronDown className="h-5 w-5 transition-transform duration-300 [&[data-state=open]]:rotate-180" />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-6 pt-0">
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
                <Combobox options={officerOptions} value={filters.officerId} onChange={(v) => handleUpdateFilter('officerId', v)} placeholder={t('filter.officer')} />
                <Combobox options={portOptions} value={filters.portId} onChange={(v) => handleUpdateFilter('portId', v)} placeholder={t('filter.port')} />
                <Combobox options={terminalOptions} value={filters.terminalId} onChange={(v) => handleUpdateFilter('terminalId', v)} placeholder={t('filter.terminal')} />
                <Combobox options={zoneOptions} value={filters.zoneId} onChange={(v) => handleUpdateFilter('zoneId', v)} placeholder={t('filter.zone')} />
                <Combobox options={shiftOptions} value={filters.shiftId} onChange={(v) => handleUpdateFilter('shiftId', v)} placeholder={t('filter.shift')} />
                 <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("justify-start text-left font-normal", !filters.assignmentDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.assignmentDate ? format(filters.assignmentDate, "PPP") : <span>{t('filter.assignmentDate')}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={filters.assignmentDate ?? undefined} onSelect={(d) => handleUpdateFilter('assignmentDate', d)} initialFocus /></PopoverContent>
                </Popover>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button onClick={clearFilters} variant="outline"><X className="mr-2 h-4 w-4"/>{t('filter.reset')}</Button>
                <Button onClick={handleSearch}><Search className="mr-2 h-4 w-4"/>{t('filter.search')}</Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>{t('table.title')}</CardTitle>
            <CardDescription>{t('table.description')}</CardDescription>
        </CardHeader>
        <CardContent>
            <DataTable
                columns={columns}
                data={filteredData}
                filterColumnId="officerName"
                hideDefaultFilter
            />
        </CardContent>
      </Card>

      <AssignmentDetailsSheet
        assignment={assignmentToView}
        isOpen={!!assignmentToView}
        onOpenChange={(isOpen) => !isOpen && setAssignmentToView(null)}
      />
      <DeleteAssignmentDialog
        assignment={assignmentToDelete}
        isOpen={!!assignmentToDelete}
        onOpenChange={(isOpen) => !isOpen && setAssignmentToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
