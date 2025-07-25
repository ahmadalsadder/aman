
'use client';

import { useState } from 'react';
import { BlacklistForm, type BlacklistFormValues } from '@/components/passengers/blacklist/blacklist-form';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Passenger, BlacklistEntry } from '@/types/live-processing';
import { PlusCircle, ShieldOff, AlertTriangle, Search, Loader2, ListChecks, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export default function AddAirportBlacklistPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, hasPermission } = useAuth();
    const t = useTranslations('BlacklistPage.form');
    const tNav = useTranslations('Navigation');
    
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchedPassenger, setSearchedPassenger] = useState<Passenger | null>(null);
    const [passportSearch, setPassportSearch] = useState('');
    
    const module = 'airport';
    const canCreate = hasPermission([`${module}:blacklist:create`]);

    const handleSearch = async () => {
        if (!passportSearch) return;
        setIsSearching(true);
        const result = await api.get<Passenger>(`/data/passenger-by-passport?passportNumber=${passportSearch}`);
        if (result.isSuccess && result.data) {
            setSearchedPassenger(result.data);
            toast({ title: t('toast.passengerFoundTitle') });
        } else {
            setSearchedPassenger(null);
            toast({ title: t('toast.passengerNotFoundTitle'), description: t('toast.passengerNotFoundDesc'), variant: 'default' });
        }
        setIsSearching(false);
    };

    const handleSave = async (formData: BlacklistFormValues) => {
        setIsLoading(true);
        const newEntryData = {
            ...formData,
            addedBy: user?.name || 'System',
            dateAdded: new Date().toISOString().split('T')[0],
        };
        
        const result = await api.post<BlacklistEntry>('/data/blacklist/save', newEntryData);
        
        if (result.isSuccess) {
            toast({ title: t('toast.addSuccessTitle'), description: t('toast.addSuccessDesc', { name: result.data!.name }), variant: 'success' });
            router.push(`/${module}/blacklist`);
        } else {
            toast({ title: t('toast.errorTitle'), description: result.errors?.[0]?.message || t('toast.errorDesc'), variant: 'destructive' });
            setIsLoading(false);
        }
    };

    if (!canCreate) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                <AlertTriangle className="h-16 w-16 text-destructive" />
                <h1 className="text-2xl font-bold">{t('accessDenied.title')}</h1>
                <p className="max-w-md text-muted-foreground">{t('accessDenied.createDescription')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
             <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`/${module}/dashboard`} icon={LayoutDashboard}>{tNav('dashboard')}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`/${module}/blacklist`} icon={ShieldOff}>{tNav('blacklist')}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage icon={PlusCircle}>{t('addTitle')}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <GradientPageHeader title={t('addTitle')} description={t('addDescription')} icon={PlusCircle} />
            <Card>
                <CardHeader>
                    <CardTitle>{t('search.title')}</CardTitle>
                    <CardDescription>{t('search.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Input placeholder={t('search.placeholder')} value={passportSearch} onChange={(e) => setPassportSearch(e.target.value)} />
                        <Button onClick={handleSearch} disabled={isSearching || !passportSearch}>
                            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <BlacklistForm onSave={handleSave} isLoading={isLoading} passenger={searchedPassenger} />
        </div>
    );
}
