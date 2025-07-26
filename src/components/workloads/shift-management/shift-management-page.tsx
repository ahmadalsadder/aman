
'use client';

import { useState, useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { Shift, DayOfWeek, Module, Permission } from '@/types';
import { daysOfWeek } from '@/lib/mock-data';
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
import { MoreHorizontal, PlusCircle, CalendarDays, Eye, FilePenLine, Trash2, PlayCircle, PauseCircle, Filter, ChevronDown, X, Search, ListTodo, CheckCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TransactionStatsCard } from '@/components/transactions/transaction-stats-card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShiftDetailsSheet } from '@/components/workloads/shift-details-sheet';
import { DeleteShiftDialog } from '@/components/workloads/delete-shift-dialog';
import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';

const statusColors: { [key: string]: string } = {
  Active: 'bg-green-500/20 text-green-700 border-green-500/30',
  Inactive: 'bg-gray-500/20 text-gray-700 border-gray-500/30',
};

const initialFilters = {
  name: '',
  status: '',
  day: '',
};

interface ShiftManagementPageProps {
    module: Module;
    shifts: Shift[];
    onDeleteShift: (shiftId: string) => Promise<boolean>;
    onToggleStatus: (shiftId: string) => Promise<boolean>;
}

export function ShiftManagementPage({ module, shifts, onDeleteShift, onToggleStatus }: ShiftManagementPageProps) {
  const router = useRouter();
  const { hasPermission } = useAuth();
  const t = useTranslations('ShiftManagement');

  const canCreate = useMemo(() => hasPermission([`${module}:workload:view` as Permission]), [hasPermission, module]);
  const canEdit = useMemo(() => hasPermission([`${module}:workload:view` as Permission]), [hasPermission, module]);
  const canDelete = useMemo(() => hasPermission([`${module}:workload:view` as Permission]), [hasPermission, module]);

  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  const [shiftToView, setShiftToView] = useState<Shift | null>(null);
  const [shiftToDelete, setShiftToDelete] = useState<Shift | null>(null);

  const shiftStats = useMemo(() => ({
    total: shifts.length,
    active: shifts.filter(s => s.status === 'Active').length,
    inactive: shifts.filter(s => s.status === 'Inactive').length,
  }), [shifts]);

  const handleUpdateFilter = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => setAppliedFilters(filters);
  const clearFilters = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  };
  
  const handleConfirmDelete = async () => {
    if (!shiftToDelete) return;
    const success = await onDeleteShift(shiftToDelete.id);
    if (success) {
      setShiftToDelete(null);
    }
  };
  
  const filteredData = useMemo(() => {
    return shifts.filter(shift => {
      const nameLower = appliedFilters.name.toLowerCase();
      if (nameLower && !shift.name.toLowerCase().includes(nameLower)) return false;
      if (appliedFilters.status && shift.status !== appliedFilters.status) return false;
      if (appliedFilters.day && !shift.days.includes(appliedFilters.day as DayOfWeek['id'])) return false;
      
      return true;
    });
  }, [shifts, appliedFilters]);

  const columns: ColumnDef<Shift>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: 'Shift Name',
    },
    {
      accessorKey: 'startTime',
      header: 'Start Time',
    },
    {
      accessorKey: 'endTime',
      header: 'End Time',
    },
    {
        accessorKey: 'days',
        header: 'Days',
        cell: ({ row }) => (
            <div className="flex flex-wrap gap-1">
                {row.original.days.map(day => <Badge key={day} variant="secondary">{day.substring(0,3)}</Badge>)}
            </div>
        )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge variant="outline" className={cn(statusColors[row.original.status])}>{row.original.status}</Badge>,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const shift = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShiftToView(shift)}>
                  <Eye className="mr-2 h-4 w-4 text-primary" />
                  <span>View details</span>
              </DropdownMenuItem>
              {canEdit && (
                <DropdownMenuItem asChild>
                  <Link href={`/${module}/workloads/shift-management/edit/${shift.id}`}>
                    <FilePenLine className="mr-2 h-4 w-4 text-yellow-500" />
                    <span>Edit shift</span>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {canEdit && (
                shift.status === 'Active' ? (
                  <DropdownMenuItem onClick={() => onToggleStatus(shift.id)}>
                      <PauseCircle className="mr-2 h-4 w-4 text-orange-500" />
                      <span>Deactivate</span>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => onToggleStatus(shift.id)}>
                      <PlayCircle className="mr-2 h-4 w-4 text-green-500" />
                      <span>Activate</span>
                  </DropdownMenuItem>
                )
              )}
              {canDelete && (
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setShiftToDelete(shift)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <GradientPageHeader
        title={t('pageTitle')}
        description={t('pageDescription')}
        icon={CalendarDays}
      >
        {canCreate && (
          <Button asChild className="bg-white font-semibold text-primary hover:bg-white/90">
            <Link href={`/${module}/workloads/shift-management/add`}>
              <PlusCircle className="mr-2 h-4 w-4" /> {t('addShift')}
            </Link>
          </Button>
        )}
      </GradientPageHeader>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <TransactionStatsCard title={t('totalShifts')} value={shiftStats.total.toString()} description={t('totalShiftsDesc')} icon={ListTodo} iconColor="text-blue-500" />
        <TransactionStatsCard title={t('activeShifts')} value={shiftStats.active.toString()} description={t('activeShiftsDesc')} icon={CheckCircle} iconColor="text-green-500" />
        <TransactionStatsCard title={t('inactiveShifts')} value={shiftStats.inactive.toString()} description={t('inactiveShiftsDesc')} icon={PauseCircle} iconColor="text-gray-500" />
      </div>

      <Card>
        <Collapsible>
          <CollapsibleTrigger asChild>
            <div className="flex w-full cursor-pointer items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5" />
                <h2 className="text-lg font-semibold">{t('filterTitle')}</h2>
              </div>
              <ChevronDown className="h-5 w-5 transition-transform duration-300 [&[data-state=open]]:rotate-180" />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-6 pt-0">
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 md:grid-cols-3">
                <Input placeholder={t('filterNamePlaceholder')} value={filters.name} onChange={(e) => handleUpdateFilter('name', e.target.value)} />
                <Select value={filters.status} onValueChange={(value) => handleUpdateFilter('status', value === 'all' ? '' : value)}>
                  <SelectTrigger><SelectValue placeholder={t('filterStatusPlaceholder')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filterAllStatuses')}</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                 <Select value={filters.day} onValueChange={(value) => handleUpdateFilter('day', value === 'all' ? '' : value)}>
                  <SelectTrigger><SelectValue placeholder={t('filterDayPlaceholder')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Day</SelectItem>
                    {daysOfWeek.map(d => <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>)}
                  </SelectContent>
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

      <Card>
        <CardHeader>
            <CardTitle>{t('recordsTitle')}</CardTitle>
            <CardDescription>{t('recordsDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
            <DataTable
                columns={columns}
                data={filteredData}
                filterColumnId="name"
                hideDefaultFilter
            />
        </CardContent>
      </Card>
      <ShiftDetailsSheet
        shift={shiftToView}
        isOpen={!!shiftToView}
        onOpenChange={(isOpen) => !isOpen && setShiftToView(null)}
      />
      <DeleteShiftDialog
        shift={shiftToDelete}
        isOpen={!!shiftToDelete}
        onOpenChange={(isOpen) => !isOpen && setShiftToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
