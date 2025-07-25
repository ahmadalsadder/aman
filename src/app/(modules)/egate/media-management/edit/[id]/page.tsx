'use client';

import { MediaForm, type MediaFormValues } from '@/components/media/media-form';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import type { Media } from '@/types/live-processing';
import { useState, useEffect } from 'react';
import { Loader2, FilePenLine } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditMediaPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const { toast } = useToast();
    const t = useTranslations('MediaManagement.form');
    const [media, setMedia] = useState<Media | null>(null);
    const [loading, setLoading] = useState(true);
    const id = params.id;

    useEffect(() => {
        const fetchMedia = async () => {
            if (!id) return;
            setLoading(true);
            const result = await api.get<{ media: Media }>(`/data/media/${id}`);
            if (result.isSuccess && result.data) {
                setMedia(result.data.media);
            } else {
                toast({
                    title: t('toast.loadError'),
                    variant: 'destructive',
                });
                setMedia(null);
            }
            setLoading(false);
        };
        fetchMedia();
    }, [id, t, toast]);

    const handleSave = async (formData: MediaFormValues) => {
        if (!media) return;
        setLoading(true);

        const result = await api.post<Media>('/data/media/save', { id: media.id, ...formData });

        if (result.isSuccess) {
            toast({
                title: t('toast.updateSuccessTitle'),
                description: t('toast.updateSuccessDesc', { name: result.data!.name }),
                variant: 'success',
            });
            router.push('/egate/media-management');
        } else {
            toast({
                title: t('toast.errorTitle'),
                description: result.errors?.[0]?.message || t('toast.errorDesc'),
                variant: 'destructive',
            });
            setLoading(false);
        }
    };

    if (loading) {
        return <Skeleton className="h-96 w-full" />;
    }
    
    if (!media) {
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
            <GradientPageHeader
                title={t('editTitle')}
                description={t('editDescription', { name: media.name })}
                icon={FilePenLine}
            />
            <MediaForm onSave={handleSave} isLoading={loading} mediaToEdit={media} />
        </div>
    );
}
