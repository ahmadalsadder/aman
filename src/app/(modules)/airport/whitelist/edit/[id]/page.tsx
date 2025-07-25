
'use client';

import { WhitelistForm, type WhitelistFormValues } from '@/components/passengers/whitelist/whitelist-form';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import type { WhitelistEntry } from '@/types/live-processing';
import { useState, useEffect } from 'react';
import { FilePenLine, AlertTriangle, ListChecks, LayoutDashboard } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export default function EditWhitelistPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const { toast } = useToast();
    const t = useTranslations('WhitelistPage.form');
    const tNav = useTranslations('Navigation');
    const { hasPermission } = useAuth();
    
    const [entry, setEntry] = useState<WhitelistEntry | null>(null);
    const [loading, setLoading] = useState(true);
    const id = params.id;
    const module = 'airport';
    const canEdit = hasPermission([`${module}:whitelist:edit`]);

    useEffect(() => {
        if (!id || !canEdit) {
            setLoading(false);
            return;
        }
        const fetchEntry = async () => {
            setLoading(true);
            const result = await api.get<{ entry: WhitelistEntry }>(`/data/whitelist/${id}`);
            if (result.isSuccess && result.data) {
                setEntry(result.data.entry);
            } else {
                toast({ title: t('toast.loadError'), variant: 'destructive' });
                setEntry(null);
            }
            setLoading(false);
        };
        fetchEntry();
    }, [id, t, toast, canEdit]);

    const handleSave = async (formData: WhitelistFormValues) => {
        if (!entry) return;
        setLoading(true);

        const result = await api.post<WhitelistEntry>('/data/whitelist/save', { id: entry.id, ...formData });

        if (result.isSuccess) {
            toast({ title: t('toast.updateSuccessTitle'), description: t('toast.updateSuccessDesc', { name: result.data!.name }), variant: 'success' });
            router.push(`/${module}/whitelist`);
        } else {
            toast({ title: t('toast.errorTitle'), description: result.errors?.[0]?.message || t('toast.errorDesc'), variant: 'destructive' });
            setIsLoading(false);
        }
    };

    if (loading) {
        return <Skeleton className="h-96 w-full" />;
    }
    
    if (!canEdit) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                <AlertTriangle className="h-16 w-16 text-destructive" />
                <h1 className="text-2xl font-bold">{t('accessDenied.title')}</h1>
                <p className="max-w-md text-muted-foreground">{t('accessDenied.editDescription')}</p>
            </div>
        );
    }
    
    if (!entry) {
        return (
             <div className="flex h-full w-full items-center justify-center">
                 <div className="flex flex-col items-center gap-4 text-destructive">
                    <p>{t('toast.loadError')}</p>
                </div>
            </div>
        )
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
                        <BreadcrumbLink href={`/${module}/whitelist`} icon={ListChecks}>{tNav('whitelist')}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage icon={FilePenLine}>{t('editTitle')}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <GradientPageHeader title={t('editTitle')} description={t('editDescription', { name: entry.name })} icon={FilePenLine} />
            <WhitelistForm onSave={handleSave} isLoading={loading} entryToEdit={entry} />
        </div>
    );
}
