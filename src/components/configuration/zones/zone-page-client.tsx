

'use client';

import { useState, useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { Permission, Module } from '@/types';
import type { Zone, Terminal, Port } from '@/types/configuration';
import { DataTable } from '@/components/shared/data-table';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Map, Eye, FilePenLine, Trash2, PauseCircle, PlayCircle, Filter, ChevronDown, X, Search, Building, Ship } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
import { DeleteZoneDialog } from './delete-zone-dialog';
import { ZoneDetailsSheet } from './zone-details-sheet';

const statusColors: { [key: string]: string } = {
  Active: 'bg-green-500/20 text-green-700 border-green-500/30',
  Inactive: 'bg-gray-500/20 text-gray-700 border-gray-500/30',
};

const initialFilters = {
  name: '',
  portId: '',
  terminalId: '',
  status: '',
};

interface ZonePageClientProps {
  zones: Zone[];
  terminals: Terminal[];
  ports: Port[];
  onDeleteZone: (zoneId: string) => Promise<boolean>;
  onToggleStatus: (zoneId: string) => Promise<void>;
  permissions: {
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
}

export function ZonePageClient({ zones, terminals, ports, onDeleteZone, onToggleStatus, permissions }: ZonePageClientProps) {
  const t = useTranslations('Configuration.Zones');
  const tNav = useTranslations('Navigation');
  const [zoneToView, setZoneToView] = useState<Zone | null>(null);
  const [zoneToDelete, setZoneToDelete] = useState<Zone | null>(null);
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  const enrichedZones = useMemo(() => {
    return zones.map(zone => {
        const terminal = terminals.find(t => t.id === zone.terminalId);
        const port = ports.find(p => p.id === terminal?.portId);
        return {
            ...zone,
            terminalName: terminal?.name,
            portName: port?.name,
            portId: port?.id
        };
    });
  }, [zones, terminals, ports]);

  const handleConfirmDelete = async () => {
    if (!zoneToDelete) return;
    const success = await onDeleteZone(zoneToDelete.id);
    if (success) {
      setZoneToDelete(null);
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
  
  const portOptions = useMemo(() => ports.map(p => ({ value: p.id, label: p.name })), [ports]);
  const terminalOptions = useMemo(() => terminals.filter(t => !filters.portId || t.portId === filters.portId).map(t => ({ value: t.id, label: t.name })), [terminals, filters.portId]);

  const filteredData = useMemo(() => {
    return enrichedZones.filter(zone => {
      const nameLower = appliedFilters.name.toLowerCase();
      if (nameLower && !zone.name.toLowerCase().includes(nameLower)) return false;
      if (appliedFilters.portId && zone.portId !== appliedFilters.portId) return false;
      if (appliedFilters.terminalId && zone.terminalId !== appliedFilters.terminalId) return false;
      if (appliedFilters.status && zone.status !== appliedFilters.status) return false;
      return true;
    });
  }, [enrichedZones, appliedFilters]);

  const columns: ColumnDef<(typeof enrichedZones)[0]>[] = [
    { accessorKey: 'name', header: t('table.zoneName') },
    { accessorKey: 'terminalName', header: t('table.terminal') },
    { accessorKey: 'portName', header: t('table.port') },
    { accessorKey: 'status', header: t('table.status'), cell: ({ row }) => <Badge variant="outline" className={cn(statusColors[row.original.status])}>{row.original.status}</Badge> },
    { id: 'actions', cell: ({ row }) => {
        const zone = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setZoneToView(zone)}><Eye className="mr-2 h-4 w-4" />{t('actions.view')}</DropdownMenuItem>
              {permissions.canEdit && <DropdownMenuItem asChild><Link href={`/configuration/zone/edit/${zone.id}`}><FilePenLine className="mr-2 h-4 w-4" />{t('actions.edit')}</Link></DropdownMenuItem>}
              {permissions.canEdit && <DropdownMenuItem onClick={() => onToggleStatus(zone.id)}>{zone.status === 'Active' ? <><PauseCircle className="mr-2 h-4 w-4" />{t('actions.deactivate')}</> : <><PlayCircle className="mr-2 h-4 w-4" />{t('actions.activate')}</>}</DropdownMenuItem>}
              {permissions.canDelete && <DropdownMenuSeparator />}
              {permissions.canDelete && <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setZoneToDelete(zone)}><Trash2 className="mr-2 h-4 w-4" />{t('actions.delete')}</DropdownMenuItem>}
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
          <BreadcrumbItem><BreadcrumbLink href="/configuration/ports" icon={Ship}>{tNav('ports')}</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink href="/configuration/terminals" icon={Building}>{tNav('terminals')}</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage icon={Map}>{t('pageTitle')}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <GradientPageHeader title={t('pageTitle')} description={t('pageDescription')} icon={Map}>
        {permissions.canCreate && (
          <Button asChild className="bg-white font-semibold text-primary hover:bg-white/90">
            <Link href="/configuration/zone/add"><PlusCircle className="mr-2 h-4 w-4" />{t('addZone')}</Link>
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
                <Combobox options={portOptions} value={filters.portId} onChange={(value) => handleUpdateFilter('portId', value)} placeholder={t('filters.portPlaceholder')} />
                <Combobox options={terminalOptions} value={filters.terminalId} onChange={(value) => handleUpdateFilter('terminalId', value)} placeholder={t('filters.terminalPlaceholder')} disabled={!filters.portId} />
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
        <CardHeader><CardTitle>{t('table.title')}</CardTitle><CardDescription>{t('table.description')}</CardDescription></CardHeader>
        <CardContent><DataTable columns={columns} data={filteredData} filterColumnId="name" /></CardContent>
      </Card>
      <ZoneDetailsSheet zone={zoneToView} isOpen={!!zoneToView} onOpenChange={(isOpen) => !isOpen && setZoneToView(null)} />
      <DeleteZoneDialog zone={zoneToDelete} isOpen={!!zoneToDelete} onOpenChange={(isOpen) => !isOpen && setZoneToDelete(null)} onConfirm={handleConfirmDelete} />
    </div>
  );
}
