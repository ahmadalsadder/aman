
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText, ArrowRightLeft, X, Search, Filter, ChevronDown, Eye, User, Clock, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, isValid, parse, isToday, subYears, addYears } from 'date-fns';
import { DeleteTransactionDialog } from '@/components/transactions/delete-transaction-dialog';
import { useToast } from '@/hooks/use-toast';
import { Combobox } from '@/components/ui/combobox';
import type { Transaction, OfficerDesk } from '@/types/live-processing';
import { api } from '@/lib/api';
import CalendarIcon from '@/components/icons/calendar-icon';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { LayoutDashboard } from 'lucide-react';
import type { Module } from '@/types';
import { TransactionStatsCards } from './transaction-stats-cards';
import { Skeleton } from '../ui/skeleton';

const statusColors: { [key: string]: string } = {
  Completed: 'bg-green-500/20 text-green-700 border-green-500/30',
  'In Progress': 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  Failed: 'bg-red-500/20 text-red-700 border-red-500/30',
  Pending: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
};

const typeColors: { [key: string]: 'text-blue-500' | 'text-purple-500' | 'text-orange-500' } = {
    Entry: 'text-blue-500',
    Exit: 'text-purple-500',
    Transit: 'text-orange-500',
};

const initialFilters = {
  id: '',
  passengerName: '',
  passportNumber: '',
  type: '',
  gate: '',
  deskId: '',
  status: '',
  entranceType: '',
  dateFrom: null as Date | null,
  dateTo: null as Date | null,
};

interface TransactionsPageProps {
    module: Module;
    title: string;
    description: string;
}

export function TransactionsPage({ module, title, description }: TransactionsPageProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [officerDesks, setOfficerDesks] = useState<OfficerDesk[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        const [transactionsResult, desksResult] = await Promise.all([
            api.get<Transaction[]>('/data/transactions'),
            api.get<OfficerDesk[]>('/data/officer-desks')
        ]);
        if (transactionsResult.isSuccess) {
            setTransactions(transactionsResult.data || []);
        }
        if (desksResult.isSuccess) {
            setOfficerDesks(desksResult.data || []);
        }
        setLoading(false);
    };
    fetchData();
  }, []);
  
  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return;

    const result = await api.post(`/data/transactions/delete`, { id: transactionToDelete.id });

    if(result.isSuccess) {
        setTransactions(prev => prev.filter(t => t.id !== transactionToDelete.id));
        toast({
            title: 'Transaction Deleted',
            description: `Transaction ${transactionToDelete.id} has been deleted.`,
            variant: 'success',
        });
        setTransactionToDelete(null);
    } else {
        toast({
            title: 'Delete Failed',
            description: result.errors?.[0]?.message || 'There was an error deleting the transaction data.',
            variant: 'destructive',
        });
    }
  }

  const columns: ColumnDef<Transaction>[] = [
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
      accessorKey: 'id',
      header: 'Transaction ID',
      cell: ({row}) => <div className="font-mono text-xs">{row.original.id}</div>
    },
    {
      accessorKey: 'passengerName',
      header: 'Passenger',
       cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.passengerName}</span>
          <span className="text-xs text-muted-foreground">{row.original.passportNumber}</span>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({row}) => <div className={cn("font-medium", typeColors[row.original.type])}>{row.original.type}</div>
    },
    {
      accessorKey: 'entranceType',
      header: 'Entrance',
    },
     {
      accessorKey: 'gate',
      header: 'Gate/Desk',
    },
    {
      accessorKey: 'dateTime',
      header: 'Date/Time',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge variant="outline" className={cn(statusColors[row.original.status as keyof typeof statusColors])}>{row.original.status}</Badge>,
    },
    {
      accessorKey: 'riskScore',
      header: 'Risk Score',
      cell: ({row}) => (
          <div className="flex items-center gap-2">
              <Progress value={row.original.riskScore} className="h-2 w-20" />
              <span>{row.original.riskScore}</span>
          </div>
      )
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const transaction = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon" className="text-primary hover:text-primary/80">
              <Link href={`/${module}/transactions/${transaction.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon" className="text-primary hover:text-primary/80">
                <Link href={`/${module}/passengers/${transaction.passengerId}/edit`}>
                    <User className="h-4 w-4" />
                </Link>
            </Button>
            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => setTransactionToDelete(transaction)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const handleUpdateFilter = (key: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    setAppliedFilters(filters);
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  };

  const uniqueGates = useMemo(() => {
    const gates = new Set(transactions.map(t => t.gate));
    return Array.from(gates).sort().map(g => ({ value: g, label: g }));
  }, [transactions]);

  const uniqueDesks = useMemo(() => {
    return officerDesks.map(d => ({ value: d.id, label: d.name }));
  }, [officerDesks]);
  
  const uniqueEntranceTypes = useMemo(() => {
    const entranceTypes = new Set(transactions.map(t => t.entranceType).filter(Boolean));
    return Array.from(entranceTypes) as ('Officer Desk' | 'E-Gate')[];
  }, [transactions]);

  const filteredData = useMemo(() => {
    return transactions.filter(t => {
      const idLower = appliedFilters.id.toLowerCase();
      const nameLower = appliedFilters.passengerName.toLowerCase();
      const passportLower = appliedFilters.passportNumber.toLowerCase();

      if (idLower && !t.id.toLowerCase().includes(idLower)) return false;
      if (nameLower && !t.passengerName.toLowerCase().includes(nameLower)) return false;
      if (passportLower && !t.passportNumber.toLowerCase().includes(passportLower)) return false;
      
      if (appliedFilters.type && t.type !== appliedFilters.type) return false;
      if (appliedFilters.entranceType && t.entranceType !== appliedFilters.entranceType) return false;
      
      if (appliedFilters.entranceType === 'E-Gate' && appliedFilters.gate && t.gate !== appliedFilters.gate) return false;
      if (appliedFilters.entranceType === 'Officer Desk' && appliedFilters.deskId) {
        const desk = officerDesks.find(d => d.id === appliedFilters.deskId);
        if (desk && t.gate !== desk.name) return false;
      }
      
      if (appliedFilters.status && t.status !== appliedFilters.status) return false;
      
      try {
        const transactionDate = parse(t.dateTime, 'yyyy-MM-dd HH:mm', new Date());
        if (appliedFilters.dateFrom && isValid(transactionDate) && transactionDate < appliedFilters.dateFrom) return false;
        if (appliedFilters.dateTo && isValid(transactionDate) && transactionDate > appliedFilters.dateTo) return false;
      } catch (e) {
        // Ignore if date is invalid for filtering
      }

      return true;
    });
  }, [transactions, appliedFilters, officerDesks]);

  const fromDate = subYears(new Date(), 10);
  const toDate = addYears(new Date(), 10);

  return (
    <div className="space-y-6">
       <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/${module}/dashboard`} icon={LayoutDashboard}>Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage icon={ArrowRightLeft}>Transactions</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <GradientPageHeader
        title={title}
        description={description}
        icon={ArrowRightLeft}
      >
        <div className="flex gap-2">
          <Button asChild className="bg-white font-semibold text-primary hover:bg-white/90">
              <Link href={`/${module}/transactions/live-processing`}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Process Transaction
              </Link>
          </Button>
        </div>
      </GradientPageHeader>
      
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : <TransactionStatsCards transactions={transactions} />}

      <Card>
        <Collapsible>
          <CollapsibleTrigger asChild>
            <div className="flex w-full cursor-pointer items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Search & Filter Transactions</h2>
              </div>
              <ChevronDown className="h-5 w-5 transition-transform duration-300 [&[data-state=open]]:rotate-180" />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-6 pt-0">
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                <Input placeholder="Transaction ID..." value={filters.id} onChange={(e) => handleUpdateFilter('id', e.target.value)} />
                <Input placeholder="Passenger Name..." value={filters.passengerName} onChange={(e) => handleUpdateFilter('passengerName', e.target.value)} />
                <Input placeholder="Passport Number..." value={filters.passportNumber} onChange={(e) => handleUpdateFilter('passportNumber', e.target.value)} />

                <Select value={filters.type} onValueChange={(value) => handleUpdateFilter('type', value === 'all' ? '' : value)}>
                  <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {Object.keys(typeColors).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={filters.entranceType} onValueChange={(value) => handleUpdateFilter('entranceType', value === 'all' ? '' : value)}>
                  <SelectTrigger><SelectValue placeholder="Entrance Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Entrance Types</SelectItem>
                    {uniqueEntranceTypes.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                  </SelectContent>
                </Select>

                {filters.entranceType === 'E-Gate' && (
                  <Combobox 
                    options={uniqueGates} 
                    value={filters.gate} 
                    onChange={(v) => handleUpdateFilter('gate', v)} 
                    placeholder="Select E-Gate..."
                  />
                )}
                
                {filters.entranceType === 'Officer Desk' && (
                  <Combobox 
                    options={uniqueDesks} 
                    value={filters.deskId} 
                    onChange={(v) => handleUpdateFilter('deskId', v)} 
                    placeholder="Select Officer Desk..."
                  />
                )}

                <Select value={filters.status} onValueChange={(value) => handleUpdateFilter('status', value === 'all' ? '' : value)}>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {Object.keys(statusColors).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("justify-start text-left font-normal", !filters.dateFrom && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateFrom ? format(filters.dateFrom, "PPP") : <span>From Date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={filters.dateFrom ?? undefined} onSelect={(date) => handleUpdateFilter('dateFrom', date || null)} disabled={(date) => date > new Date() || (filters.dateTo ? date > filters.dateTo : false)} initialFocus captionLayout="dropdown-nav" fromYear={fromDate.getFullYear()} toYear={toDate.getFullYear()} /></PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("justify-start text-left font-normal", !filters.dateTo && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateTo ? format(filters.dateTo, "PPP") : <span>To Date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={filters.dateTo ?? undefined} onSelect={(date) => handleUpdateFilter('dateTo', date || null)} disabled={(date) => date > new Date() || (filters.dateFrom ? date < filters.dateFrom : false)} initialFocus captionLayout="dropdown-nav" fromYear={fromDate.getFullYear()} toYear={toDate.getFullYear()} /></PopoverContent>
                </Popover>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button onClick={clearFilters} variant="outline">
                    <X className="mr-2 h-4 w-4"/>
                    Reset
                </Button>
                 <Button onClick={handleSearch}>
                    <Search className="mr-2 h-4 w-4"/>
                    Search
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <Card>
        <CardHeader>
           <CardTitle>Transaction Records</CardTitle>
        </CardHeader>
        <CardContent>
           <DataTable
            columns={columns}
            data={filteredData}
            filterColumnId="passengerName"
            hideDefaultFilter
          />
        </CardContent>
      </Card>

      <DeleteTransactionDialog
        transaction={transactionToDelete}
        isOpen={!!transactionToDelete}
        onOpenChange={(isOpen) => !isOpen && setTransactionToDelete(null)}
        onConfirm={handleDeleteTransaction}
      />
    </div>
  );
}
