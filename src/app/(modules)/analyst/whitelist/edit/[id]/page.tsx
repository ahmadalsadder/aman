
'use client';

import { WhitelistForm, type WhitelistFormValues } from '@/components/passengers/whitelist/whitelist-form';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams, usePathname } from 'next/navigation';
import type { WhitelistEntry } from '@/types/live-processing';
import { useState, useEffect } from 'react';
import { Loader2, FilePenLine } from 'lucide-react';

const WHITELIST_STORAGE_KEY = 'guardian-gate-whitelist';

export default function EditWhitelistPage() {
    const router = useRouter();
    const pathname = usePathname();
    const module = pathname.split('/')[1] || 'analyst';
    const params = useParams<{ id: string }>();
    const { toast } = useToast();
    const [entry, setEntry] = useState<WhitelistEntry | null>(null);
    const [loading, setLoading] = useState(true);
    const id = params.id;

    useEffect(() => {
        try {
            const storedWhitelist = localStorage.getItem(WHITELIST_STORAGE_KEY);
            if (storedWhitelist) {
                const whitelist: WhitelistEntry[] = JSON.parse(storedWhitelist);
                const foundEntry = whitelist.find(p => p.id === id);
                setEntry(foundEntry || null);
            }
        } catch (error) {
             toast({
                title: "Error",
                description: "Could not load whitelist data.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [id, toast]);

    const handleSave = (formData: WhitelistFormValues) => {
        if (!entry) return;

        try {
            const storedWhitelist = localStorage.getItem(WHITELIST_STORAGE_KEY);
            const whitelist: WhitelistEntry[] = storedWhitelist ? JSON.parse(storedWhitelist) : [];
            
            const updatedEntry: WhitelistEntry = { ...entry, ...formData };
            const updatedWhitelist = whitelist.map(p => p.id === updatedEntry.id ? updatedEntry : p);
            localStorage.setItem(WHITELIST_STORAGE_KEY, JSON.stringify(updatedWhitelist));
            
            toast({
                title: 'Entry Updated',
                description: `"${updatedEntry.name}"'s record has been successfully updated.`,
                variant: 'success',
            });
            router.push(`/${module}/whitelist`);
        } catch (error) {
            toast({
                title: 'Update Failed',
                description: 'There was an error saving the whitelist data.',
                variant: 'destructive',
            });
        }
    };

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                 <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Loading whitelist entry...</p>
                </div>
            </div>
        );
    }
    
    if (!entry) {
        return (
             <div className="flex h-full w-full items-center justify-center">
                 <div className="flex flex-col items-center gap-4 text-destructive">
                    <p>Entry not found.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <GradientPageHeader
                title="Edit Whitelist Entry"
                description={`Editing the record for ${entry.name}.`}
                icon={FilePenLine}
            />
            <WhitelistForm onSave={handleSave} entryToEdit={entry} />
        </div>
    );
}
