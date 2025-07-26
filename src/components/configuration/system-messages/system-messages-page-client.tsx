'use client';

import { useState, useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { Permission } from '@/types';
import type { SystemMessage } from '@/types/configuration';
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
import { MoreHorizontal, PlusCircle, MessageSquare, Eye, FilePenLine, Trash2, PauseCircle, PlayCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { LayoutDashboard } from 'lucide-react';
import { DeleteSystemMessageDialog } from './delete-system-message-dialog';
import { SystemMessageDetailsSheet } from './system-message-details-sheet';


const statusColors: { [key: string]: string } = {
  Active: 'bg-green-500/20 text-green-700 border-green-500/30',
  Inactive: 'bg-gray-500/20 text-gray-700 border-gray-500/30',
};

interface SystemMessagesPageClientProps {
  messages: SystemMessage[];
  onDeleteMessage: (messageId: string) => Promise<boolean>;
  onToggleStatus: (messageId: string) => Promise<boolean>;
  permissions: {
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
}

export function SystemMessagesPageClient({ messages, onDeleteMessage, onToggleStatus, permissions }: SystemMessagesPageClientProps) {
  const t = useTranslations('Configuration.SystemMessages');
  const tNav = useTranslations('Navigation');
  const [messageToView, setMessageToView] = useState<SystemMessage | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<SystemMessage | null>(null);

  const handleConfirmDelete = async () => {
    if (!messageToDelete) return;
    const success = await onDeleteMessage(messageToDelete.id);
    if (success) {
      setMessageToDelete(null);
    }
  };

  const columns: ColumnDef<SystemMessage>[] = [
    { accessorKey: 'name', header: t('table.name') },
    { accessorKey: 'category', header: t('table.category') },
    { accessorKey: 'status', header: t('table.status'), cell: ({ row }) => <Badge variant="outline" className={cn(statusColors[row.original.status])}>{row.original.status}</Badge> },
    { accessorKey: 'lastModified', header: t('table.lastModified') },
    { id: 'actions', cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setMessageToView(row.original)}><Eye className="mr-2 h-4 w-4" />{t('actions.view')}</DropdownMenuItem>
            {permissions.canEdit && <DropdownMenuItem asChild><Link href={`/configuration/system-messages/edit/${row.original.id}`}><FilePenLine className="mr-2 h-4 w-4" />{t('actions.edit')}</Link></DropdownMenuItem>}
            {permissions.canEdit && <DropdownMenuItem onClick={() => onToggleStatus(row.original.id)}>{row.original.status === 'Active' ? <><PauseCircle className="mr-2 h-4 w-4" />{t('actions.deactivate')}</> : <><PlayCircle className="mr-2 h-4 w-4" />{t('actions.activate')}</>}</DropdownMenuItem>}
            {permissions.canDelete && <DropdownMenuSeparator />}
            {permissions.canDelete && <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setMessageToDelete(row.original)}><Trash2 className="mr-2 h-4 w-4" />{t('actions.delete')}</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/configuration/dashboard" icon={LayoutDashboard}>{tNav('dashboard')}</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage icon={MessageSquare}>{t('pageTitle')}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <GradientPageHeader title={t('pageTitle')} description={t('pageDescription')} icon={MessageSquare}>
        {permissions.canCreate && (
          <Button asChild className="bg-white font-semibold text-primary hover:bg-white/90">
            <Link href="/configuration/system-messages/add"><PlusCircle className="mr-2 h-4 w-4" />{t('addMessage')}</Link>
          </Button>
        )}
      </GradientPageHeader>
      <Card>
        <CardHeader><CardTitle>{t('table.title')}</CardTitle><CardDescription>{t('table.description')}</CardDescription></CardHeader>
        <CardContent><DataTable columns={columns} data={messages} filterColumnId="name" /></CardContent>
      </Card>
      <SystemMessageDetailsSheet message={messageToView} isOpen={!!messageToView} onOpenChange={(isOpen) => !isOpen && setMessageToView(null)} />
      <DeleteSystemMessageDialog message={messageToDelete} isOpen={!!messageToDelete} onOpenChange={(isOpen) => !isOpen && setMessageToDelete(null)} onConfirm={handleConfirmDelete} />
    </div>
  );
}
