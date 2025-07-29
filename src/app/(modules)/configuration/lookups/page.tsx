
'use client';

import { useState, useMemo, useEffect } from 'react';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Library, Eye, FilePenLine, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import type { Permission, Lookup } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { DataTable } from '@/components/shared/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';

export default function LookupsPage() {
    const { hasPermission } = useAuth();
    const t = useTranslations('Configuration.Lookups');

    const [lookups, setLookups] = useState<Lookup[]>([]);
    const [loading, setLoading] = useState(true);

    const canView = hasPermission(['configuration:lookups:view' as Permission]);
    const canCreate = hasPermission(['configuration:lookups:create' as Permission]);
    const canEdit = hasPermission(['configuration:lookups:edit' as Permission]);
    const canDelete = hasPermission(['configuration:lookups:delete' as Permission]);

    useEffect(() => {
        if (canView) {
            api.get<Lookup[]>('/data/lookups').then(result => {
                if (result.isSuccess) {
                    setLookups(result.data || []);
                }
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [canView]);

    const columns: ColumnDef<Lookup>[] = [
        {
            accessorKey: 'name',
            header: t('table.name'),
        },
        {
            accessorKey: 'description',
            header: t('table.description'),
            cell: ({ row }) => <p className="text-muted-foreground">{row.original.description}</p>
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                         <DropdownMenuItem asChild>
                            <Link href={`/configuration/lookups/${row.original.id}`}>
                                <Eye className="mr-2 h-4 w-4 text-primary" />
                                <span>{t('actions.manageItems')}</span>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        }
    ];

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-24" />
                <Skeleton className="h-96" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <GradientPageHeader
                title={t('pageTitle')}
                description={t('pageDescription')}
                icon={Library}
            />
            <Card>
                <CardHeader>
                    <CardTitle>{t('table.title')}</CardTitle>
                    <CardDescription>{t('table.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={lookups}
                        filterColumnId="name"
                    />
                </CardContent>
            </Card>
        </div>
    );
}

