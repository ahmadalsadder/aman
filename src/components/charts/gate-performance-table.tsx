
'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type GatePerformanceData = {
  id: string;
  name: string;
  type: string;
  status: 'Active' | 'Maintenance' | 'Offline' | 'Limited';
  totalTransactions: number;
  avgProcessingTime: string;
};

const statusColors: { [key: string]: string } = {
  Active: 'bg-green-500/20 text-green-700 border-green-500/30',
  Maintenance: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
  Offline: 'bg-red-500/20 text-red-700 border-red-500/30',
  Limited: 'bg-orange-500/20 text-orange-700 border-orange-500/30',
};

const columns: ColumnDef<GatePerformanceData>[] = [
  { accessorKey: 'name', header: 'Gate Name' },
  { accessorKey: 'type', header: 'Type' },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge variant="outline" className={cn(statusColors[row.original.status])}>{row.original.status}</Badge> },
  { accessorKey: 'totalTransactions', header: 'Total Transactions' },
  { accessorKey: 'avgProcessingTime', header: 'Avg. Processing Time (s)' },
];

export function GatePerformanceTable({ data }: { data: GatePerformanceData[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gate &amp; Desk Performance</CardTitle>
        <CardDescription>Breakdown of key performance indicators for each gate and officer desk.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No data available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
