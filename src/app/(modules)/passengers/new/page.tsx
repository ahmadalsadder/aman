
'use client';

import { PassengerForm, type PassengerFormValues } from '@/components/passengers/passenger-form';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import type { Passenger } from '@/types/live-processing';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';
import { api } from '@/lib/api';

export default function AddPassengerPage() {
    const router = useRouter();
    const { toast } = useToast();

    const handleSave = async (formData: PassengerFormValues) => {
        const newPassenger: Omit<Passenger, 'id'> = {
            ...formData,
            status: 'Active',
            riskLevel: 'Low',
            lastEntry: new Date().toISOString().split('T')[0],
            profilePicture: formData.personalPhotoUrl || 'https://placehold.co/100x100.png',
        };

        const result = await api.post<Passenger>('/data/passengers', newPassenger);

        if(result.isSuccess && result.data) {
            toast({
                title: 'Passenger Added',
                description: `${result.data.firstName} ${result.data.lastName} has been successfully added.`,
                variant: 'success',
            });
            router.push('/passengers');
        } else {
             toast({
                title: 'Save Failed',
                description: result.errors?.[0]?.message || 'There was an error saving the passenger data.',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="space-y-6">
            <GradientPageHeader
                title="Add New Passenger"
                description="Fill out the form below to add a new passenger record to the system."
                icon={UserPlus}
            />
            <PassengerForm onSave={handleSave} />
        </div>
    );
}
