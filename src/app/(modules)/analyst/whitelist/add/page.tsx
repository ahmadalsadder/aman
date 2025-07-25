
'use client';

import { WhitelistForm, type WhitelistFormValues } from '@/components/passengers/whitelist/whitelist-form';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { useToast } from '@/hooks/use-toast';
import { useRouter, usePathname } from 'next/navigation';
import { PlusCircle } from 'lucide-react';
import type { WhitelistEntry } from '@/types/live-processing';

const WHITELIST_STORAGE_KEY = 'guardian-gate-whitelist';

export default function AddWhitelistPage() {
    const router = useRouter();
    const pathname = usePathname();
    const module = pathname.split('/')[1] || 'analyst';
    const { toast } = useToast();

    const handleSave = (formData: WhitelistFormValues) => {
        try {
            const storedWhitelist = localStorage.getItem(WHITELIST_STORAGE_KEY);
            const whitelist: WhitelistEntry[] = storedWhitelist ? JSON.parse(storedWhitelist) : [];
            
            const newEntry: WhitelistEntry = {
                ...formData,
                id: `WL-${Date.now()}`,
                dateAdded: new Date().toISOString().split('T')[0],
            };

            const updatedWhitelist = [...whitelist, newEntry];
            localStorage.setItem(WHITELIST_STORAGE_KEY, JSON.stringify(updatedWhitelist));
            
            toast({
                title: 'Entry Added',
                description: `"${newEntry.name}" has been successfully added to the whitelist.`,
                variant: 'success',
            });
            
            router.push(`/${module}/whitelist`);
        } catch (error) {
            toast({
                title: 'Save Failed',
                description: 'There was an error saving the whitelist entry.',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="space-y-6">
            <GradientPageHeader
                title="Add to Whitelist"
                description="Add a new individual to the passenger whitelist."
                icon={PlusCircle}
            />
            <WhitelistForm onSave={handleSave} />
        </div>
    );
}
