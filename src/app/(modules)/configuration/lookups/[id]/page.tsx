
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Library } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import type { Lookup } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { DataTable } from '@/components/shared/data-table';
import { columns } from '@/components/configuration/lookups/lookup-items-columns';

export default function LookupItemsPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { toast } = useToast();
    
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

    return (
        <div className="space-y-6">
            <GradientPageHeader
                title={`Manage: ${lookup.name}`}
                description={lookup.description}
                icon={Library}
            >
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                </Button>
            </GradientPageHeader>
            <Card>
                <CardHeader>
                    <CardTitle>Lookup Items</CardTitle>
                    <CardDescription>View, add, and manage items for the &quot;{lookup.name}&quot; lookup.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={lookup.items}
                        filterColumnId="value" // Assuming a 'value' field in item translations
                    />
                </CardContent>
            </Card>
        </div>
    );
}
