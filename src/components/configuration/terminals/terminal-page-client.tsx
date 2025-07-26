
'use client';

import { useState, useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { Permission } from '@/types';
import type { Terminal, Port } from '@/types/configuration';
import { DataTable } from '@/components/shared/data-table';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Building, Eye, FilePenLine, Trash2, Check, PauseCircle, PlayCircle, Filter, ChevronDown, X, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { LayoutDashboard, Ship } from 'lucide-react';
import { DeleteTerminalDialog } from './delete-terminal-dialog';
import { TerminalDetailsSheet } from './terminal-details-sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';

const statusColors: { [key: string]: string } = {
  Active: 'bg-green-500/20 text-green-700 border-green-500/30',
  Inactive: 'bg-gray-500/20 text-gray-700 border-gray-500/30',
};

const initialFilters = {
  name: '',
  portId: '',
  status: '',
};

interface TerminalPageClientProps {
  terminals: Terminal[];
  ports: Port[];
  onDeleteTerminal: (terminalId: string) => Promise<boolean>;
  onToggleStatus: (terminalId: string) => Promise<void>;
  permissions: {
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
}

export function TerminalPageClient({ terminals, ports, onDeleteTerminal, onToggleStatus, permissions }: TerminalPageClientProps) {
  const t = useTranslations('Configuration.Terminals');
  const tNav = useTranslations('Navigation');
  const [terminalToView, setTerminalToView] = useState<Terminal | null>(null);
  const [terminalToDelete, setTerminalToDelete] = useState<Terminal | null>(null);
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  const enrichedTerminals = useMemo(() => {
    return terminals.map(terminal => ({
      ...terminal,
      portName: ports.find(p => p.id === terminal.portId)?.name || 'N/A',
    }));
  }, [terminals, ports]);

  const handleConfirmDelete = async () => {
    if (!terminalToDelete) return;
    const success = await onDeleteTerminal(terminalToDelete.id);
    if (success) {
      setTerminalToDelete(null);
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

  const filteredData = useMemo(() => {
    return enrichedTerminals.filter(terminal => {
      const nameLower = appliedFilters.name.toLowerCase();
      if (nameLower && !terminal.name.toLowerCase().includes(nameLower)) return false;
      if (appliedFilters.portId && terminal.portId !== appliedFilters.portId) return false;
      if (appliedFilters.status && terminal.status !== appliedFilters.status) return false;
      return true;
    });
  }, [enrichedTerminals, appliedFilters]);

  const columns: ColumnDef<(typeof enrichedTerminals)[0]>[] = [
    { accessorKey: 'name', header: t('table.terminalName') },
    { accessorKey: 'portName', header: t('table.port') },
    { accessorKey: 'status', header: t('table.status'), cell: ({ row }) => <Badge variant="outline" className={cn(statusColors[row.original.status])}>{row.original.status}</Badge> },
    { accessorKey: 'lastModified', header: t('table.lastModified') },
    { id: 'actions', cell: ({ row }) => {
        const terminal = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTerminalToView(terminal)}><Eye className="mr-2 h-4 w-4" />{t('actions.view')}</DropdownMenuItem>
              {permissions.canEdit && <DropdownMenuItem asChild><Link href={`/configuration/terminals/edit/${terminal.id}`}><FilePenLine className="mr-2 h-4 w-4" />{t('actions.edit')}</Link></DropdownMenuItem>}
              {permissions.canEdit && <DropdownMenuItem onClick={() => onToggleStatus(terminal.id)}>{terminal.status === 'Active' ? <><PauseCircle className="mr-2 h-4 w-4" />{t('actions.deactivate')}</> : <><PlayCircle className="mr-2 h-4 w-4" />{t('actions.activate')}</>}</DropdownMenuItem>}
              {permissions.canDelete && <DropdownMenuSeparator />}
              {permissions.canDelete && <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setTerminalToDelete(terminal)}><Trash2 className="mr-2 h-4 w-4" />{t('actions.delete')}</DropdownMenuItem>}
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
          <BreadcrumbItem><BreadcrumbLink href="/configuration/dashboard" icon={LayoutDashboard}>{tNav('dashboard')}</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink href="/configuration/ports" icon={Ship}>{t('portsPageTitle')}</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage icon={Building}>{t('pageTitle')}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <GradientPageHeader title={t('pageTitle')} description={t('pageDescription')} icon={Building}>
        {permissions.canCreate && (
          <Button asChild className="bg-white font-semibold text-primary hover:bg-white/90">
            <Link href="/configuration/terminals/add"><PlusCircle className="mr-2 h-4 w-4" />{t('addTerminal')}</Link>
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
      <TerminalDetailsSheet terminal={terminalToView} isOpen={!!terminalToView} onOpenChange={(isOpen) => !isOpen && setTerminalToView(null)} />
      <DeleteTerminalDialog terminal={terminalToDelete} isOpen={!!terminalToDelete} onOpenChange={(isOpen) => !isOpen && setTerminalToDelete(null)} onConfirm={handleConfirmDelete} />
    </div>
  );
}
