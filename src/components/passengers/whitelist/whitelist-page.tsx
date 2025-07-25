
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { WhitelistEntry } from '@/types/live-processing';
import { DataTable } from '@/components/shared/data-table';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Trash2, ListChecks, Filter, ChevronDown, X, Search, User, PlusCircle, FilePenLine, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DeleteWhitelistDialog } from '@/components/passengers/whitelist/delete-whitelist-dialog';
import { WhitelistDetailsSheet } from '@/components/passengers/whitelist/whitelist-details-sheet';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Module, Permission } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

const statusColors: { [key: string]: string } = {
  Active: 'bg-green-500/20 text-green-700 border-green-500/30',
  Expired: 'bg-gray-500/20 text-gray-700 border-gray-500/30',
  Revoked: 'bg-red-500/20 text-red-700 border-red-500/30',
};

const initialFilters = {
  name: '',
  nationality: '',
  status: '',
};

interface WhitelistPageProps {
    module: Module;
    whitelist: WhitelistEntry[];
    loading: boolean;
}

export function WhitelistPage({ module, whitelist, loading }: WhitelistPageProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { hasPermission } = useAuth();
  
  const canView = hasPermission([`${module}:whitelist:view` as Permission]);
  const canCreate = hasPermission([`${module}:whitelist:create` as Permission]);
  const canEdit = hasPermission([`${module}:whitelist:edit` as Permission]);
  const canDelete = hasPermission([`${module}:whitelist:delete` as Permission]);

  const [currentWhitelist, setCurrentWhitelist] = useState<WhitelistEntry[]>(whitelist);
  const [entryToView, setEntryToView] = useState<WhitelistEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<WhitelistEntry | null>(null);
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  useEffect(() => {
    setCurrentWhitelist(whitelist);
  }, [whitelist]);

  const handleDeleteEntry = async () => {
    if (!entryToDelete) return;

    const result = await api.post<WhitelistEntry>('/data/whitelist/delete', { id: entryToDelete.id });
    
    if (result.isSuccess) {
      setCurrentWhitelist(prev => prev.filter(r => r.id !== entryToDelete.id));
      toast({
        title: 'Entry Deleted',
        description: `Whitelist entry for "${entryToDelete.name}" has been permanently deleted.`,
        variant: 'info',
      });
      setEntryToDelete(null);
    } else {
      toast({
        title: 'Delete Failed',
        description: 'There was an error deleting the whitelist entry.',
        variant: 'destructive',
      });
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
    return currentWhitelist.filter(item => {
      const nameLower = appliedFilters.name.toLowerCase();
      if (nameLower && !item.name.toLowerCase().includes(nameLower)) return false;
      if (appliedFilters.nationality && item.nationality !== appliedFilters.nationality) return false;
      if (appliedFilters.status && item.status !== appliedFilters.status) return false;
      return true;
    });
  }, [currentWhitelist, appliedFilters]);

  const uniqueNationalities = useMemo(() => {
    return Array.from(new Set(currentWhitelist.map(item => item.nationality)));
  }, [currentWhitelist]);

  const uniqueStatuses = useMemo(() => {
    return Array.from(new Set(currentWhitelist.map(item => item.status)));
  }, [currentWhitelist]);

  const columns: ColumnDef<WhitelistEntry>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'nationality', header: 'Nationality' },
    { accessorKey: 'dateAdded', header: 'Date Added' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge variant="outline" className={cn(statusColors[row.original.status])}>{row.original.status}</Badge> },
    { id: 'actions', cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEntryToView(row.original)}><Eye className="mr-2 h-4 w-4 text-primary" /><span>View details</span></DropdownMenuItem>
            {row.original.passengerId && (
                <DropdownMenuItem asChild>
                    <Link href={`/${module}/passengers/${row.original.passengerId}/edit`}>
                        <User className="mr-2 h-4 w-4 text-primary" />
                        <span>View Passenger</span>
                    </Link>
                </DropdownMenuItem>
            )}
             {canEdit && (
                <DropdownMenuItem onClick={() => router.push(`/${module}/whitelist/edit/${row.original.id}`)}>
                    <FilePenLine className="mr-2 h-4 w-4 text-yellow-500" />
                    <span>Edit Entry</span>
                </DropdownMenuItem>
             )}
            {canDelete && <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setEntryToDelete(row.original)}><Trash2 className="mr-2 h-4 w-4" /><span>Delete</span></DropdownMenuItem>
            </>}
          </DropdownMenuContent>
        </DropdownMenu>
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

  if (!canView) {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
            <AlertTriangle className="h-16 w-16 text-destructive" />
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="max-w-md text-muted-foreground">
                You do not have permission to view the whitelist for this module.
            </p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <GradientPageHeader title="Passenger Whitelist" description="Manage individuals with special clearance." icon={ListChecks}>
        {canCreate && (
            <Button asChild className="bg-white font-semibold text-primary hover:bg-white/90">
                <Link href={`/${module}/whitelist/add`}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add to Whitelist
                </Link>
            </Button>
        )}
      </GradientPageHeader>
      
       <Card>
        <Collapsible>
          <CollapsibleTrigger asChild>
            <div className="flex w-full cursor-pointer items-center justify-between p-4">
              <div className="flex items-center gap-3"><Filter className="h-5 w-5" /><h2 className="text-lg font-semibold">Search & Filter Whitelist</h2></div>
              <ChevronDown className="h-5 w-5 transition-transform duration-300 [&[data-state=open]]:rotate-180" />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-6 pt-0">
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 md:grid-cols-3">
                <Input placeholder="Passenger Name..." value={filters.name} onChange={(e) => handleUpdateFilter('name', e.target.value)} />
                <Select value={filters.nationality} onValueChange={(value) => handleUpdateFilter('nationality', value === 'all' ? '' : value)}>
                  <SelectTrigger><SelectValue placeholder="Nationality" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Nationalities</SelectItem>
                    {uniqueNationalities.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filters.status} onValueChange={(value) => handleUpdateFilter('status', value === 'all' ? '' : value)}>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {uniqueStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button onClick={clearFilters} variant="outline"><X className="mr-2 h-4 w-4"/>Reset</Button>
                <Button onClick={handleSearch}><Search className="mr-2 h-4 w-4"/>Search</Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>
      
      <Card>
        <CardHeader><CardTitle>Whitelist Records</CardTitle><CardDescription>A list of all whitelisted individuals in the system.</CardDescription></CardHeader>
        <CardContent>
            <DataTable columns={columns} data={filteredData} filterColumnId="name" hideDefaultFilter />
        </CardContent>
      </Card>
      
      <WhitelistDetailsSheet
        module={module}
        entry={entryToView}
        isOpen={!!entryToView}
        onOpenChange={(isOpen) => !isOpen && setEntryToView(null)}
      />
      <DeleteWhitelistDialog entry={entryToDelete} isOpen={!!entryToDelete} onOpenChange={(isOpen) => !isOpen && setEntryToDelete(null)} onConfirm={handleDeleteEntry} />
    </div>
  );
}
