'use client';

import { useState, useMemo, useEffect } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { Media, Permission } from '@/types/live-processing';
import { DataTable } from '@/components/shared/data-table';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Eye, FilePenLine, Trash2, Music, Filter, ChevronDown, X, Search, AlertTriangle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DeleteMediaDialog } from '@/components/media/delete-media-dialog';
import { MediaDetailsSheet } from '@/components/media/media-details-sheet';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';

const statusColors: { [key: string]: string } = {
  Active: 'bg-green-500/20 text-green-700 border-green-500/30',
  Inactive: 'bg-gray-500/20 text-gray-700 border-gray-500/30',
};

const typeColors: { [key: string]: string } = {
  Audio: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  Image: 'bg-purple-500/20 text-purple-700 border-purple-500/30',
  Video: 'bg-orange-500/20 text-orange-700 border-orange-500/30',
};

const mediaTypes: Media['type'][] = ['Audio', 'Image', 'Video'];
const mediaStatuses: Media['status'][] = ['Active', 'Inactive'];

const initialFilters = {
  name: '',
  type: '',
  status: '',
};

export default function MediaManagementPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const t = useTranslations('MediaManagement');
  const { hasPermission } = useAuth();
  
  const [mediaToView, setMediaToView] = useState<Media | null>(null);
  const [mediaToDelete, setMediaToDelete] = useState<Media | null>(null);
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  const canView = useMemo(() => hasPermission(['egate:media:view']), [hasPermission]);

  useEffect(() => {
    if (canView) {
      const fetchMedia = async () => {
        setLoading(true);
        const result = await api.get<Media[]>('/data/media');
        if (result.isSuccess) {
          setMedia(result.data || []);
        }
        setLoading(false);
      }
      fetchMedia();
    } else {
      setLoading(false);
    }
  }, [canView]);

  const handleDeleteMedia = async () => {
    if (!mediaToDelete) return;
    const result = await api.post('/data/media/delete', { id: mediaToDelete.id });
    if(result.isSuccess) {
        setMedia(prev => prev.filter(m => m.id !== mediaToDelete.id));
        toast({
            title: t('deleteDialog.successTitle'),
            description: t('deleteDialog.successDesc', { name: mediaToDelete.name }),
            variant: 'info',
        });
    } else {
        toast({
            title: t('deleteDialog.errorTitle'),
            description: result.errors?.[0]?.message || 'An error occurred',
            variant: 'destructive',
        });
    }
    setMediaToDelete(null);
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
    return media.filter(item => {
      const nameLower = appliedFilters.name.toLowerCase();
      if (nameLower && !item.name.toLowerCase().includes(nameLower) && !item.localizedName?.toLowerCase().includes(nameLower)) return false;
      if (appliedFilters.type && item.type !== appliedFilters.type) return false;
      if (appliedFilters.status && item.status !== appliedFilters.status) return false;
      return true;
    });
  }, [media, appliedFilters]);

  const columns: ColumnDef<Media>[] = [
    {
      id: 'select',
      header: ({ table }) => ( <Checkbox checked={table.getIsAllPageRowsSelected()} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" /> ),
      cell: ({ row }) => ( <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" /> ),
      enableSorting: false,
      enableHiding: false,
    },
    { accessorKey: 'name', header: t('table.name') },
    { accessorKey: 'type', header: t('table.type'), cell: ({ row }) => <Badge variant="outline" className={cn(typeColors[row.original.type])}>{row.original.type}</Badge> },
    { accessorKey: 'status', header: t('table.status'), cell: ({ row }) => <Badge variant="outline" className={cn(statusColors[row.original.status])}>{row.original.status}</Badge> },
    { accessorKey: 'lastModified', header: t('table.lastModified') },
    { id: 'actions', cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setMediaToView(row.original)}><Eye className="mr-2 h-4 w-4 text-primary" /><span>{t('table.actions.view')}</span></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href={`/egate/media-management/edit/${row.original.id}`}><FilePenLine className="mr-2 h-4 w-4 text-yellow-500" /><span>{t('table.actions.edit')}</span></Link></DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setMediaToDelete(row.original)}><Trash2 className="mr-2 h-4 w-4" /><span>{t('table.actions.delete')}</span></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (loading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-24" />
            <Skeleton className="h-48" />
            <Skeleton className="h-96" />
        </div>
    );
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
      <GradientPageHeader title={t('pageTitle')} description={t('pageDescription')} icon={Music}>
        <Button asChild className="bg-white font-semibold text-primary hover:bg-white/90">
          <Link href="/egate/media-management/add"><PlusCircle className="mr-2 h-4 w-4" /> {t('addMedia')}</Link>
        </Button>
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
                <Select value={filters.type} onValueChange={(value) => handleUpdateFilter('type', value === 'all' ? '' : value)}>
                  <SelectTrigger><SelectValue placeholder={t('filters.typePlaceholder')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.allTypes')}</SelectItem>
                    {mediaTypes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filters.status} onValueChange={(value) => handleUpdateFilter('status', value === 'all' ? '' : value)}>
                  <SelectTrigger><SelectValue placeholder={t('filters.statusPlaceholder')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
                    {mediaStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
      
      <MediaDetailsSheet
        media={mediaToView}
        isOpen={!!mediaToView}
        onOpenChange={(isOpen) => !isOpen && setMediaToView(null)}
      />
      <DeleteMediaDialog media={mediaToDelete} isOpen={!!mediaToDelete} onOpenChange={(isOpen) => !isOpen && setMediaToDelete(null)} onConfirm={handleDeleteMedia} />
    </div>
  );
}
