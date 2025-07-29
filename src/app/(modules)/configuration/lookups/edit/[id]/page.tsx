

'use client';

import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import type { Permission, Lookup } from '@/types';
import { useState, useEffect } from 'react';
import { Library } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditLookupPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const { toast } = useToast();
    const t = useTranslations('Configuration.Lookups.form');
    
    const [lookup, setLookup] = useState<Lookup | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLookup = async () => {
            setLoading(true);
            const result = await api.get<{ lookup: Lookup }>(`/data/lookups/${params.id}`);
            if (result.isSuccess && result.data) {
                setLookup(result.data.lookup);
            } else {
                toast({
                    title: 'Error',
                    description: 'Failed to load lookup details.',
                    variant: 'destructive',
                });
                router.push('/configuration/lookups');
            }
            setLoading(false);
        };
        fetchLookup();
    }, [params.id, router, toast]);

    if (loading || !lookup) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-24" />
                <Skeleton className="h-96" />
            </div>
        );
    }
    
    // This is just a placeholder page. The actual item management happens on the [id] page.
    return (
        <div className="space-y-6">
            <GradientPageHeader
                title={t('editTitle')}
                description={t('editDescription', { name: lookup.name })}
                icon={Library}
            />
            <p>Editing the lookup definition itself is not supported. Manage items on the previous page.</p>
        </div>
    );
}
