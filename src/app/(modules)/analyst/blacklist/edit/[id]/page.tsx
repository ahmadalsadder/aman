'use client';

import { BlacklistForm, type BlacklistFormValues } from '@/components/passengers/blacklist/blacklist-form';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams, usePathname } from 'next/navigation';
import type { BlacklistEntry } from '@/types/live-processing';
import { useState, useEffect } from 'react';
import { Loader2, FilePenLine, ShieldOff, AlertTriangle, LayoutDashboard } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import type { Module, Permission } from '@/types';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';


export default function EditBlacklistPage() {
    const router = useRouter();
    const pathname = usePathname();
    const module = pathname.split('/')[1] as Module || 'analyst';
    const params = useParams<{ id: string }>();
    const { toast } = useToast();
    const { hasPermission } = useAuth();
    const t = useTranslations('BlacklistPage.form');
    const tNav = useTranslations('Navigation');
    
    const [entry, setEntry] = useState<BlacklistEntry | null>(null);
    const [loading, setLoading] = useState(true);
    const id = params.id;

    const canEdit = hasPermission([`${module}:records:edit` as Permission]);

    useEffect(() => {
        if (!id || !canEdit) {
            setLoading(false);
            return;
        }

        const fetchEntry = async () => {
            setLoading(true);
            const result = await api.get<{ entry: BlacklistEntry }>(`/data/blacklist/${id}`);
            if (result.isSuccess && result.data) {
                setEntry(result.data.entry);
            } else {
                toast({
                    title: t('toast.loadError'),
                    variant: "destructive",
                });
            }
            setLoading(false);
        };
        fetchEntry();
    }, [id, toast, canEdit, t]);

    const handleSave = async (formData: BlacklistFormValues) => {
        if (!entry) return;
        setLoading(true);

        const result = await api.post<BlacklistEntry>('/data/blacklist/save', { ...formData, id: entry.id });

        if (result.isSuccess) {
            toast({
                title: t('toast.updateSuccessTitle'),
                description: t('toast.updateSuccessDesc', { name: result.data!.name }),
                variant: 'success',
            });
            router.push(`/${module}/blacklist`);
        } catch (error) {
            toast({
                title: t('toast.errorTitle'),
                description: t('toast.errorDesc'),
                variant: 'destructive',
            });
            setLoading(false);
        }
    };

     if (loading) {
        return <Skeleton className="h-96 w-full" />;
    }

    if (!canEdit) {
         return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                <AlertTriangle className="h-16 w-16 text-destructive" />
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="max-w-md text-muted-foreground">
                    You do not have permission to edit blacklist entries.
                </p>
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
                        <BreadcrumbLink href={`/${module}/blacklist`} icon={ShieldOff}>{tNav('blacklist')}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage icon={FilePenLine}>{t('editTitle')}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <GradientPageHeader
                title={t('editTitle')}
                description={t('editDescription', { name: entry.name })}
                icon={FilePenLine}
            />
            <BlacklistForm onSave={handleSave} entryToEdit={entry} isLoading={loading} />
        </div>
    );
}
