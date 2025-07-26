
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { DataTable } from '@/components/shared/data-table';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, HardDrive, Eye, FilePenLine, Trash2, Check, Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { LayoutDashboard } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import type { Machine, Port, Terminal, Zone } from '@/types/configuration';
import { DeleteMachineDialog } from './delete-machine-dialog';
import { MachineDetailsSheet } from './machine-details-sheet';

const statusColors: { [key: string]: string } = {
  Online: 'bg-green-500/20 text-green-700 border-green-500/30',
  Offline: 'bg-red-500/20 text-red-700 border-red-500/30',
  Maintenance: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
};

const typeColors: { [key: string]: string } = {
  Scanner: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  Biometric: 'bg-purple-500/20 text-purple-700 border-purple-500/30',
  Camera: 'bg-orange-500/20 text-orange-700 border-orange-500/30',
};

interface MachinePageClientProps {
  machines: Machine[];
  ports: Port[];
  terminals: Terminal[];
  zones: Zone[];
  onDeleteMachine: (machineId: string) => Promise<boolean>;
  onToggleStatus: (machineId: string, currentStatus: string) => Promise<boolean>;
  permissions: {
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
}

export function MachinePageClient({ machines, ports, terminals, zones, onDeleteMachine, onToggleStatus, permissions }: MachinePageClientProps) {
  const t = useTranslations('Configuration.Machines');
  const [machineToView, setMachineToView] = useState<Machine | null>(null);
  const [machineToDelete, setMachineToDelete] = useState<Machine | null>(null);

  const enrichedMachines = useMemo(() => {
    return machines.map(machine => {
      const terminal = terminals.find(t => t.id === machine.terminalId);
      const port = ports.find(p => p.id === terminal?.portId);
      const zone = zones.find(z => z.id === machine.zoneId);
      return {
        ...machine,
        portName: port?.name,
        terminalName: terminal?.name,
        zoneName: zone?.name,
      };
    });
  }, [machines, ports, terminals, zones]);

  const handleConfirmDelete = async () => {
    if (!machineToDelete) return;
    const success = await onDeleteMachine(machineToDelete.id);
    if (success) {
      setMachineToDelete(null);
    }
  };

  const columns: ColumnDef<Machine & { portName?: string; terminalName?: string; zoneName?: string }>[] = [
    { accessorKey: 'name', header: t('table.machineName') },
    { accessorKey: 'portName', header: t('table.port') },
    { accessorKey: 'terminalName', header: t('table.terminal') },
    { accessorKey: 'zoneName', header: t('table.zone') },
    { accessorKey: 'type', header: t('table.type'), cell: ({ row }) => <Badge variant="outline" className={cn(typeColors[row.original.type])}>{row.original.type}</Badge> },
    { accessorKey: 'status', header: t('table.status'), cell: ({ row }) => (
        <Badge variant="outline" className={cn(statusColors[row.original.status])}>
            {row.original.status === 'Online' ? <Wifi className="mr-2 h-3 w-3" /> : <WifiOff className="mr-2 h-3 w-3" />}
            {row.original.status}
        </Badge>
    )},
    { id: 'actions', cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setMachineToView(row.original)}><Eye className="mr-2 h-4 w-4" />{t('actions.view')}</DropdownMenuItem>
            {permissions.canEdit && <DropdownMenuItem asChild><Link href={`/configuration/machines/edit/${row.original.id}`}><FilePenLine className="mr-2 h-4 w-4" />{t('actions.edit')}</Link></DropdownMenuItem>}
            {permissions.canEdit && <DropdownMenuItem onClick={() => onToggleStatus(row.original.id, row.original.status)}><Check className="mr-2 h-4 w-4" />{t('actions.toggleStatus')}</DropdownMenuItem>}
            {permissions.canDelete && <DropdownMenuSeparator />}
            {permissions.canDelete && <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setMachineToDelete(row.original)}><Trash2 className="mr-2 h-4 w-4" />{t('actions.delete')}</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/configuration/dashboard" icon={LayoutDashboard}>{t('dashboard', {ns: 'Navigation'})}</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage icon={HardDrive}>{t('pageTitle')}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <GradientPageHeader title={t('pageTitle')} description={t('pageDescription')} icon={HardDrive}>
        {permissions.canCreate && (
          <Button asChild className="bg-white font-semibold text-primary hover:bg-white/90">
            <Link href="/configuration/machines/add"><PlusCircle className="mr-2 h-4 w-4" />{t('addMachine')}</Link>
          </Button>
        )}
      </GradientPageHeader>
      <Card>
        <CardHeader><CardTitle>{t('table.title')}</CardTitle><CardDescription>{t('table.description')}</CardDescription></CardHeader>
        <CardContent><DataTable columns={columns} data={enrichedMachines} filterColumnId="name" /></CardContent>
      </Card>
      <MachineDetailsSheet machine={machineToView} isOpen={!!machineToView} onOpenChange={(isOpen) => !isOpen && setMachineToView(null)} />
      <DeleteMachineDialog machine={machineToDelete} isOpen={!!machineToDelete} onOpenChange={(isOpen) => !isOpen && setMachineToDelete(null)} onConfirm={handleConfirmDelete} />
    </div>
  );
}
