
'use client';

import { BlacklistForm, type BlacklistFormValues } from '@/components/passengers/blacklist/blacklist-form';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams, usePathname } from 'next/navigation';
import type { BlacklistEntry } from '@/types/live-processing';
import { useState, useEffect } from 'react';
import { Loader2, FilePenLine } from 'lucide-react';

const BLACKLIST_STORAGE_KEY = 'guardian-gate-blacklist';

export default function EditBlacklistPage() {
    const router = useRouter();
    const pathname = usePathname();
    const module = pathname.split('/')[1] || 'analyst';
    const params = useParams<{ id: string }>();
    const { toast } = useToast();
    const [entry, setEntry] = useState<BlacklistEntry | null>(null);
    const [loading, setLoading] = useState(true);
    const id = params.id;

    useEffect(() => {
        try {
            const storedBlacklist = localStorage.getItem(BLACKLIST_STORAGE_KEY);
            if (storedBlacklist) {
                const blacklist: BlacklistEntry[] = JSON.parse(storedBlacklist);
                const foundEntry = blacklist.find(p => p.id === id);
                setEntry(foundEntry || null);
            }
        } catch (error) {
             toast({
                title: "Error",
                description: "Could not load blacklist data.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [id, toast]);

    const handleSave = (formData: BlacklistFormValues) => {
        if (!entry) return;

        try {
            const storedBlacklist = localStorage.getItem(BLACKLIST_STORAGE_KEY);
            const blacklist: BlacklistEntry[] = storedBlacklist ? JSON.parse(storedBlacklist) : [];
            
            const updatedEntry: BlacklistEntry = { ...entry, ...formData };
            const updatedBlacklist = blacklist.map(p => p.id === updatedEntry.id ? updatedEntry : p);
            localStorage.setItem(BLACKLIST_STORAGE_KEY, JSON.stringify(updatedBlacklist));
            
            toast({
                title: 'Entry Updated',
                description: `"${updatedEntry.name}"'s record has been successfully updated.`,
                variant: 'success',
            });
            router.push(`/${module}/blacklist`);
        } catch (error) {
            toast({
                title: 'Update Failed',
                description: 'There was an error saving the blacklist data.',
                variant: 'destructive',
            });
        }
    };

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                 <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Loading blacklist entry...</p>
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
                title="Edit Blacklist Entry"
                description={`Editing the record for ${entry.name}.`}
                icon={FilePenLine}
            />
            <BlacklistForm onSave={handleSave} entryToEdit={entry} />
        </div>
    );
}
