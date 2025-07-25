
'use client';

import { PassengerForm, type PassengerFormValues } from '@/components/passengers/passenger-form';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import type { Passenger } from '@/types/live-processing';
import { useState, useEffect } from 'react';
import { Loader2, FilePenLine } from 'lucide-react';
import { api } from '@/lib/api';

export default function EditPassengerPage() {
    const router = useRouter();
    const params = useParams<{ id: string, module: string }>();
    const { toast } = useToast();
    const [passenger, setPassenger] = useState<Passenger | null>(null);
    const [loading, setLoading] = useState(true);
    const id = params.id;
    const module = params.module || 'passengers';

    useEffect(() => {
        if (!id) return;

        const fetchPassenger = async () => {
            setLoading(true);
            const result = await api.get<Passenger>(`/data/passengers/${id}`);
            if (result.isSuccess && result.data) {
                setPassenger(result.data);
            } else {
                toast({
                    title: "Error",
                    description: "Could not load passenger data.",
                    variant: "destructive",
                });
            }
            setLoading(false);
        };
        fetchPassenger();
    }, [id, toast]);

    const handleSave = (formData: PassengerFormValues) => {
        if (!passenger) return;

        const updatedPassenger: Passenger = {
            ...passenger,
            ...formData,
            profilePicture: formData.personalPhotoUrl || passenger.profilePicture,
        };
        
        api.post('/data/passengers/update', updatedPassenger).then(result => {
            if (result.isSuccess) {
                toast({
                    title: 'Passenger Updated',
                    description: `${updatedPassenger.firstName} ${updatedPassenger.lastName}'s record has been successfully updated.`,
                    variant: 'success',
                });
                router.push(`/${module}`);
            } else {
                toast({
                    title: 'Update Failed',
                    description: result.errors?.[0]?.message || 'There was an error saving the passenger data.',
                    variant: 'destructive',
                });
            }
        });
    };

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                 <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Loading passenger data...</p>
                </div>
            </div>
        );
    }
    
    if (!passenger) {
        return (
             <div className="flex h-full w-full items-center justify-center">
                 <div className="flex flex-col items-center gap-4 text-destructive">
                    <p>Passenger not found.</p>
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
            <GradientPageHeader
                title="Edit Passenger"
                description={`Editing the record for ${passenger.firstName} ${passenger.lastName}.`}
                icon={FilePenLine}
            />
            <PassengerForm onSave={handleSave} passengerToEdit={passengerForForm} />
        </div>
    );
}
