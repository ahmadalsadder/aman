
'use client';

import { BlacklistForm, type BlacklistFormValues } from '@/components/passengers/blacklist/blacklist-form';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { useToast } from '@/hooks/use-toast';
import { useRouter, usePathname } from 'next/navigation';
import { PlusCircle } from 'lucide-react';
import type { BlacklistEntry } from '@/types/live-processing';

const BLACKLIST_STORAGE_KEY = 'guardian-gate-blacklist';

export default function AddBlacklistPage() {
    const router = useRouter();
    const pathname = usePathname();
    const module = pathname.split('/')[1] || 'analyst';
    const { toast } = useToast();

    const handleSave = (formData: BlacklistFormValues) => {
        try {
            const storedBlacklist = localStorage.getItem(BLACKLIST_STORAGE_KEY);
            const blacklist: BlacklistEntry[] = storedBlacklist ? JSON.parse(storedBlacklist) : [];
            
            const newEntry: BlacklistEntry = {
                ...formData,
                id: `BL-${Date.now()}`,
                dateAdded: new Date().toISOString().split('T')[0],
            };

            const updatedBlacklist = [...blacklist, newEntry];
            localStorage.setItem(BLACKLIST_STORAGE_KEY, JSON.stringify(updatedBlacklist));
            
            toast({
                title: 'Entry Added',
                description: `"${newEntry.name}" has been successfully added to the blacklist.`,
                variant: 'success',
            });
            
            router.push(`/${module}/blacklist`);
        } catch (error) {
            toast({
                title: 'Save Failed',
                description: 'There was an error saving the blacklist entry.',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="space-y-6">
            <GradientPageHeader
                title="Add to Blacklist"
                description="Add a new individual to the security blacklist."
                icon={PlusCircle}
            />
            <BlacklistForm onSave={handleSave} />
        </div>
    );
}
