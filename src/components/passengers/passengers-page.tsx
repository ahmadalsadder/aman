
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { Passenger } from '@/types/live-processing';
import { DataTable } from '@/components/shared/data-table';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, Download, X, Search, Filter, ChevronDown, Eye, FilePenLine, Trash2, Users, UserCheck, Flag, ShieldAlert } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { PassengerDetailsSheet } from '@/components/passengers/passenger-details-sheet';
import { DeletePassengerDialog } from '@/components/passengers/delete-passenger-dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, isValid, subYears, addYears } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Combobox } from '@/components/ui/combobox';
import { TransactionStatsCard } from '@/components/transactions/transaction-stats-card';
import { countries } from '@/lib/countries';
import type { Module } from '@/types';
import CalendarIcon from '../icons/calendar-icon';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

const riskLevelColors = {
  Low: 'bg-green-500/20 text-green-700 border-green-500/30',
  Medium: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
  High: 'bg-red-500/20 text-red-700 border-red-500/30',
};

const statusColors = {
  Active: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  Inactive: 'bg-gray-500/20 text-gray-700 border-gray-500/30',
  Flagged: 'bg-purple-500/20 text-purple-700 border-purple-500/30',
  Blocked: 'bg-zinc-500/20 text-zinc-700 border-zinc-500/30',
};

type PassengerTableData = Passenger & { fullName: string };

const initialFilters = {
  name: '',
  localizedName: '',
  passportNumber: '',
  nationality: '',
  status: '',
  riskLevel: '',
  gender: '',
  visaNumber: '',
  entryDateFrom: null as Date | null,
  entryDateTo: null as Date | null,
};

interface PassengersPageProps {
  module: Module | 'admin';
}

export function PassengersPage({ module }: PassengersPageProps) {
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [passengerToView, setPassengerToView] = useState<Passenger | null>(null);
  const [passengerToDelete, setPassengerToDelete] = useState<Passenger | null>(null);

  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  useEffect(() => {
    setLoading(true);
    // In a real app, you'd fetch based on the module
    const endpoint = module === 'admin' ? '/data/passengers' : `/data/passengers?module=${module}`;
    api.get<Passenger[]>(endpoint).then(result => {
        if(result.isSuccess && result.data) {
            setPassengers(result.data);
        }
        setLoading(false);
    });
  }, [module]);

  const passengerStats = useMemo(() => {
    const total = passengers.length;
    const active = passengers.filter(p => p.status === 'Active').length;
    const flagged = passengers.filter(p => p.status === 'Flagged').length;
    const highRisk = passengers.filter(p => p.riskLevel === 'High').length;
    return { total, active, flagged, highRisk };
  }, [passengers]);

  const fromDate = subYears(new Date(), 100);
  const toDate = addYears(new Date(), 10);

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
  
  const uniqueNationalities = useMemo(() => {
    const nationalities = new Set(passengers.map(p => p.nationality));
    return Array.from(nationalities).sort().map(n => ({ value: n, label: n }));
  }, [passengers]);

  const filteredData = useMemo<PassengerTableData[]>(() => {
    return passengers
      .map(p => ({ ...p, fullName: `${p.firstName} ${p.lastName}` }))
      .filter(p => {
        const nameLower = appliedFilters.name.toLowerCase();
        const localizedNameLower = p.localizedName?.toLowerCase() || '';
        const passportLower = appliedFilters.passportNumber.toLowerCase();
        const visaLower = p.visaNumber?.toLowerCase() || '';

        if (nameLower && !p.fullName.toLowerCase().includes(nameLower)) return false;
        if (localizedNameLower && !p.localizedName?.toLowerCase().includes(localizedNameLower)) return false;
        if (passportLower && !p.passportNumber.toLowerCase().includes(passportLower)) return false;
        if (visaLower && !p.visaNumber?.toLowerCase().includes(visaLower)) return false;

        if (appliedFilters.nationality && p.nationality !== appliedFilters.nationality) return false;
        if (appliedFilters.status && p.status !== appliedFilters.status) return false;
        if (appliedFilters.riskLevel && p.riskLevel !== appliedFilters.riskLevel) return false;
        if (appliedFilters.gender && p.gender !== appliedFilters.gender) return false;

        if (appliedFilters.entryDateFrom && p.lastEntry && isValid(new Date(p.lastEntry)) && new Date(p.lastEntry) < appliedFilters.entryDateFrom) return false;
        if (appliedFilters.entryDateTo && p.lastEntry && isValid(new Date(p.lastEntry)) && new Date(p.lastEntry) > appliedFilters.entryDateTo) return false;

        return true;
      });
  }, [passengers, appliedFilters]);
  
  const handleDeletePassenger = async () => {
    if (!passengerToDelete) return;

    const result = await api.post('/data/passengers/delete', { id: passengerToDelete.id });

    if(result.isSuccess) {
        setPassengers(prev => prev.filter(p => p.id !== passengerToDelete.id));
        toast({
            title: 'Passenger Deleted',
            description: `${passengerToDelete.firstName} ${passengerToDelete.lastName}'s record has been deleted.`,
            variant: 'info',
        });
    } else {
        toast({
            title: 'Delete Failed',
            description: result.errors?.[0]?.message || 'There was an error deleting the passenger data.',
            variant: 'destructive',
        });
    }
    setPassengerToDelete(null);
  }

  const columns: ColumnDef<PassengerTableData>[] = [
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
      accessorKey: 'fullName',
      header: 'Passenger',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={row.original.profilePicture} alt={row.original.fullName} data-ai-hint="portrait professional" />
            <AvatarFallback>{row.original.firstName?.charAt(0)}{row.original.lastName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{row.original.fullName}</span>
            <span className="text-xs text-muted-foreground">{row.original.passportNumber}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'nationality',
      header: 'Nationality',
    },
    {
      accessorKey: 'lastEntry',
      header: 'Last Entry',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge variant="outline" className={cn(statusColors[row.original.status])}>{row.original.status}</Badge>,
    },
    {
      accessorKey: 'riskLevel',
      header: 'Risk Level',
      cell: ({ row }) => <Badge variant="outline" className={cn(riskLevelColors[row.original.riskLevel])}>{row.original.riskLevel}</Badge>,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const passenger = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80" onClick={() => setPassengerToView(passenger)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button asChild variant="ghost" size="icon" className="text-yellow-500 hover:text-yellow-500/80">
              <Link href={`/passengers/${passenger.id}/edit`}>
                <FilePenLine className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => setPassengerToDelete(passenger)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  if(loading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-24" />
            <Skeleton className="h-32" />
            <Skeleton className="h-96" />
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <GradientPageHeader
        title="Passenger Management"
        description="View, search, and manage all passenger records."
        icon={Users}
      >
        <Button asChild className="bg-white font-semibold text-primary hover:bg-white/90">
            <Link href="/passengers/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Passenger
            </Link>
        </Button>
      </GradientPageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <TransactionStatsCard
          title="Total Passengers"
          value={passengerStats.total.toLocaleString()}
          description="Total passenger records"
          icon={Users}
          iconColor="text-blue-500"
        />
        <TransactionStatsCard
          title="Active Passengers"
          value={passengerStats.active.toLocaleString()}
          description="Passengers with an active status"
          icon={UserCheck}
          iconColor="text-green-500"
        />
        <TransactionStatsCard
          title="Flagged for Review"
          value={passengerStats.flagged.toLocaleString()}
          description="Passengers flagged for review"
          icon={Flag}
          iconColor="text-yellow-500"
        />
        <TransactionStatsCard
          title="High-Risk Individuals"
          value={passengerStats.highRisk.toLocaleString()}
          description="Passengers with high-risk level"
          icon={ShieldAlert}
          iconColor="text-red-500"
        />
      </div>

      <Card>
        <Collapsible>
          <CollapsibleTrigger asChild>
            <div className="flex w-full cursor-pointer items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Search & Filter Passengers</h2>
              </div>
              <ChevronDown className="h-5 w-5 transition-transform duration-300 [&[data-state=open]]:rotate-180" />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-6 pt-0">
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                <Input placeholder="Name..." value={filters.name} onChange={(e) => handleUpdateFilter('name', e.target.value)} />
                <Input placeholder="Localized Name..." value={filters.localizedName} onChange={(e) => handleUpdateFilter('localizedName', e.target.value)} />
                <Input placeholder="Passport Number..." value={filters.passportNumber} onChange={(e) => handleUpdateFilter('passportNumber', e.target.value)} />
                <Input placeholder="Visa Number..." value={filters.visaNumber} onChange={(e) => handleUpdateFilter('visaNumber', e.target.value)} />
                
                <Combobox
                    options={uniqueNationalities}
                    value={filters.nationality}
                    onChange={(value) => handleUpdateFilter('nationality', value)}
                    placeholder="Nationality"
                    searchPlaceholder="Search nationality..."
                    noResultsText="No nationality found."
                />

                <Select value={filters.gender} onValueChange={(value) => handleUpdateFilter('gender', value === 'all' ? '' : value)}>
                  <SelectTrigger><SelectValue placeholder="Gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filters.status} onValueChange={(value) => handleUpdateFilter('status', value === 'all' ? '' : value)}>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {Object.keys(statusColors).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                
                <Select value={filters.riskLevel} onValueChange={(value) => handleUpdateFilter('riskLevel', value === 'all' ? '' : value)}>
                  <SelectTrigger><SelectValue placeholder="Risk Level" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    {Object.keys(riskLevelColors).map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("justify-start text-left font-normal", !filters.entryDateFrom && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.entryDateFrom ? format(filters.entryDateFrom, "PPP") : <span>From Date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={filters.entryDateFrom || undefined} onSelect={(date) => handleUpdateFilter('entryDateFrom', date || null)} disabled={(date) => date > new Date() || (filters.entryDateTo ? date > filters.entryDateTo : false)} initialFocus captionLayout="dropdown-nav" fromYear={fromDate.getFullYear()} toYear={toDate.getFullYear()} /></PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("justify-start text-left font-normal", !filters.entryDateTo && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.entryDateTo ? format(filters.entryDateTo, "PPP") : <span>To Date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={filters.entryDateTo || undefined} onSelect={(date) => handleUpdateFilter('entryDateTo', date || null)} disabled={(date) => date > new Date() || (filters.entryDateFrom ? date < filters.entryDateFrom : false)} initialFocus captionLayout="dropdown-nav" fromYear={fromDate.getFullYear()} toYear={toDate.getFullYear()} /></PopoverContent>
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
          <CardTitle>Passenger Records</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredData}
            filterColumnId="fullName"
            hideDefaultFilter
          />
        </CardContent>
      </Card>

      <PassengerDetailsSheet 
        passenger={passengerToView}
        isOpen={!!passengerToView}
        onOpenChange={(isOpen) => !isOpen && setPassengerToView(null)}
      />
      <DeletePassengerDialog
        passenger={passengerToDelete}
        isOpen={!!passengerToDelete}
        onOpenChange={(isOpen) => !isOpen && setPassengerToDelete(null)}
        onConfirm={handleDeletePassenger}
      />
    </div>
  );
}
