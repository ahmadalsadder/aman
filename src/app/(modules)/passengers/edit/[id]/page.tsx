
'use client';

import { PassengerForm, type PassengerFormValues } from '@/components/passengers/passenger-form';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams, usePathname } from 'next/navigation';
import type { Passenger } from '@/types/live-processing';
import { useState, useEffect } from 'react';
import { Loader2, FilePenLine, User, LayoutDashboard } from 'lucide-react';
import { api } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export default function EditPassengerPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const pathname = usePathname();
    const module = pathname.split('/')[1] || 'passengers';
    const { toast } = useToast();
    const t = useTranslations('PassengerForm');
    const tNav = useTranslations('Navigation');
    const [passenger, setPassenger] = useState<Passenger | null>(null);
    const [loading, setLoading] = useState(true);
    const id = params.id;

    useEffect(() => {
        if (!id) return;

        const fetchPassenger = async () => {
            setLoading(true);
            const result = await api.get<Passenger>(`/data/passengers/${id}`);
            if (result.isSuccess && result.data) {
                setPassenger(result.data);
            } else {
                toast({
                    title: t('toast.loadErrorTitle'),
                    description: t('toast.loadErrorDesc'),
                    variant: "destructive",
                });
            }
            setLoading(false);
        };
        fetchPassenger();
    }, [id, toast, t]);

    const handleSave = async (formData: PassengerFormValues) => {
        if (!passenger) return;

        const updatedPassenger: Passenger = {
            ...passenger,
            ...formData,
            profilePicture: formData.personalPhotoUrl || passenger.profilePicture,
        };
        
        const result = await api.post('/data/passengers/save', updatedPassenger);
        if (result.isSuccess) {
            toast({
                title: t('toast.updateSuccessTitle'),
                description: t('toast.updateSuccessDesc', { name: `${updatedPassenger.firstName} ${updatedPassenger.lastName}` }),
                variant: 'success',
            });
            router.push(`/${module === 'passengers' ? 'airport' : module}/passengers`);
        } else {
            toast({
                title: t('toast.errorTitle'),
                description: result.errors?.[0]?.message || t('toast.errorDesc'),
                variant: 'destructive',
            });
        }
    };

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                 <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>{t('loading')}</p>
                </div>
            </div>
        );
    }
    
    if (!passenger) {
        return (
             <div className="flex h-full w-full items-center justify-center">
                 <div className="flex flex-col items-center gap-4 text-destructive">
                    <p>{t('notFound')}</p>
                </div>
            </div>
        )
    }

    const passengerForForm = {
        ...passenger,
        personalPhotoUrl: passenger.profilePicture,
    };

    return (
        <div className="space-y-6">
             <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`/${module}/dashboard`} icon={LayoutDashboard}>{tNav('dashboard')}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`/${module}/passengers`} icon={User}>{tNav('passengers')}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage icon={FilePenLine}>{t('editTitle')}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <GradientPageHeader
                title={t('editTitle')}
                description={t('editDescription', { name: `${passenger.firstName} ${passenger.lastName}` })}
                icon={FilePenLine}
            />
            <PassengerForm onSave={handleSave} passengerToEdit={passengerForForm} />
        </div>
    );
}
