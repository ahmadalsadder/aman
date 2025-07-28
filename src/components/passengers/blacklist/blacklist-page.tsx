
'use client';

import { useState, useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { BlacklistEntry } from '@/types/live-processing';
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
import { MoreHorizontal, Eye, Trash2, ShieldOff, Filter, ChevronDown, X, Search, User, PlusCircle, FilePenLine, LayoutDashboard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DeleteBlacklistDialog } from '@/components/passengers/blacklist/delete-blacklist-dialog';
import { BlacklistDetailsSheet } from '@/components/passengers/blacklist/blacklist-details-sheet';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Module, Permission } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useTranslations } from 'next-intl';

const categoryColors: { [key: string]: string } = {
  'No-Fly': 'bg-red-500/20 text-red-700 border-red-500/30',
  'Wanted': 'bg-orange-500/20 text-orange-700 border-orange-500/30',
  'Financial': 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
  'Other': 'bg-gray-500/20 text-gray-700 border-gray-500/30',
};

const initialFilters = {
  name: '',
  nationality: '',
  category: '',
};

interface BlacklistPageProps {
    module: Module;
    blacklist: BlacklistEntry[];
    loading: boolean;
    onDeleteEntry: (entryId: string) => Promise<boolean>;
}

export function BlacklistPage({ module, blacklist, loading, onDeleteEntry }: BlacklistPageProps) {
  const router = useRouter();
  const { hasPermission } = useAuth();
  const t = useTranslations('BlacklistPage');
  const tNav = useTranslations('Navigation');
  
  const canCreate = useMemo(() => hasPermission([`${module}:blacklist:create` as Permission]), [hasPermission, module]);
  const canEdit = useMemo(() => hasPermission([`${module}:blacklist:edit` as Permission]), [hasPermission, module]);
  const canDelete = useMemo(() => hasPermission([`${module}:blacklist:delete` as Permission]), [hasPermission, module]);
  
  const [entryToView, setEntryToView] = useState<BlacklistEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<BlacklistEntry | null>(null);
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  const handleConfirmDelete = async () => {
    if (!entryToDelete) return;
    const success = await onDeleteEntry(entryToDelete.id);
    if (success) {
      setEntryToDelete(null);
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
    return blacklist.filter(item => {
      const nameLower = appliedFilters.name.toLowerCase();
      if (nameLower && !item.name.toLowerCase().includes(nameLower)) return false;
      if (appliedFilters.nationality && item.nationality !== appliedFilters.nationality) return false;
      if (appliedFilters.category && item.category !== appliedFilters.category) return false;
      return true;
    });
  }, [blacklist, appliedFilters]);

  const uniqueNationalities = useMemo(() => {
    return Array.from(new Set(blacklist.map(item => item.nationality)));
  }, [blacklist]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(blacklist.map(item => item.category)));
  }, [blacklist]);

  const columns: ColumnDef<BlacklistEntry>[] = [
    { accessorKey: 'id', header: t('table.id') },
    { accessorKey: 'name', header: t('table.name') },
    { accessorKey: 'nationality', header: t('table.nationality') },
    { accessorKey: 'dateAdded', header: t('table.dateAdded') },
    { accessorKey: 'category', header: t('table.category'), cell: ({ row }) => <Badge variant="outline" className={cn(categoryColors[row.original.category])}>{row.original.category}</Badge> },
    { id: 'actions', cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">{t('actions.openMenu')}</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEntryToView(row.original)}><Eye className="mr-2 h-4 w-4 text-primary" /><span>{t('actions.viewDetails')}</span></DropdownMenuItem>
            {row.original.passengerId && (
                <DropdownMenuItem asChild>
                    <Link href={`/${module}/passengers/edit/${row.original.passengerId}`}>
                        <User className="mr-2 h-4 w-4 text-primary" />
                        <span>{t('actions.viewPassenger')}</span>
                    </Link>
                </DropdownMenuItem>
            )}
             {canEdit && (
                <DropdownMenuItem onClick={() => router.push(`/${module}/blacklist/edit/${row.original.id}`)}>
                    <FilePenLine className="mr-2 h-4 w-4 text-yellow-500" />
                    <span>{t('actions.editEntry')}</span>
                </DropdownMenuItem>
             )}
            {canDelete && <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setEntryToDelete(row.original)}><Trash2 className="mr-2 h-4 w-4" /><span>{t('actions.delete')}</span></DropdownMenuItem>
            </>}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
            <BreadcrumbItem>
                <BreadcrumbLink href={`/${module}/dashboard`} icon={LayoutDashboard}>{tNav('dashboard')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
                <BreadcrumbPage icon={ShieldOff}>{t('pageTitle')}</BreadcrumbPage>
            </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <GradientPageHeader title={t('pageTitle')} description={t('pageDescription')} icon={ShieldOff}>
        {canCreate && (
            <Button asChild className="bg-white font-semibold text-primary hover:bg-white/90">
                <Link href={`/${module}/blacklist/add`}>
                    <PlusCircle className="mr-2 h-4 w-4" /> {t('addEntry')}
                </Link>
            </Button>
        )}
      </GradientPageHeader>
      
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
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 md:grid-cols-3">
                <Input placeholder={t('filters.namePlaceholder')} value={filters.name} onChange={(e) => handleUpdateFilter('name', e.target.value)} />
                <Select value={filters.nationality} onValueChange={(value) => handleUpdateFilter('nationality', value === 'all' ? '' : value)}>
                  <SelectTrigger><SelectValue placeholder={t('filters.nationalityPlaceholder')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.allNationalities')}</SelectItem>
                    {uniqueNationalities.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filters.category} onValueChange={(value) => handleUpdateFilter('category', value === 'all' ? '' : value)}>
                  <SelectTrigger><SelectValue placeholder={t('filters.categoryPlaceholder')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.allCategories')}</SelectItem>
                    {uniqueCategories.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
        <CardHeader><CardTitle>{t('recordsTitle')}</CardTitle><CardDescription>{t('recordsDescription')}</CardDescription></CardHeader>
        <CardContent>
            <DataTable columns={columns} data={filteredData} filterColumnId="name" hideDefaultFilter />
        </CardContent>
      </Card>
      
      <BlacklistDetailsSheet
        entry={entryToView}
        isOpen={!!entryToView}
        onOpenChange={(isOpen) => !isOpen && setEntryToView(null)}
      />
      <DeleteBlacklistDialog entry={entryToDelete} isOpen={!!entryToDelete} onOpenChange={(isOpen) => !isOpen && setEntryToDelete(null)} onConfirm={handleConfirmDelete} />
    </div>
  );
}
