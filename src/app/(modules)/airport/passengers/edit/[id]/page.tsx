
'use client';

import { OfficerDeskForm, type OfficerDeskFormValues } from '@/components/configuration/officer-desks/officer-desk-form';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import type { OfficerDesk, Port, Terminal, Zone } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Loader2, FilePenLine } from 'lucide-react';
import { mockOfficerDesks, mockPorts, mockTerminals, mockZones } from '@/lib/mock-data';
import { useAuth } from '@/hooks/use-auth';

const OFFICER_DESKS_STORAGE_KEY = 'guardian-gate-officer-desks';
const PORTS_STORAGE_KEY = 'guardian-gate-ports';
const TERMINALS_STORAGE_KEY = 'guardian-gate-terminals';
const ZONES_STORAGE_KEY = 'guardian-gate-zones';


export default function EditOfficerDeskPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const { toast } = useToast();
    const [desk, setDesk] = useState<OfficerDesk | null>(null);
    const [loading, setLoading] = useState(true);
    const id = params.id;
    const { user } = useAuth();

    useEffect(() => {
        try {
            let desks: OfficerDesk[] = [];
            const storedDesks = localStorage.getItem(OFFICER_DESKS_STORAGE_KEY);
            
            if (storedDesks) {
                desks = JSON.parse(storedDesks);
            } else {
                localStorage.setItem(OFFICER_DESKS_STORAGE_KEY, JSON.stringify(mockOfficerDesks));
                desks = mockOfficerDesks;
            }
            
            const foundDesk = desks.find(p => p.id === id);
            setDesk(foundDesk || null);

        } catch (error) {
            console.error('Failed to load desk from localStorage', error);
            const foundDesk = mockOfficerDesks.find(p => p.id === id);
            setDesk(foundDesk || null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    const handleSave = (formData: OfficerDeskFormValues) => {
        if (!desk) return;

        try {
            const storedDesks = localStorage.getItem(OFFICER_DESKS_STORAGE_KEY);
            const desks: OfficerDesk[] = storedDesks ? JSON.parse(storedDesks) : [];
            
            const storedPorts = localStorage.getItem(PORTS_STORAGE_KEY);
            const ports: Port[] = storedPorts ? JSON.parse(storedPorts) : mockPorts;

            const storedTerminals = localStorage.getItem(TERMINALS_STORAGE_KEY);
            const terminals: Terminal[] = storedTerminals ? JSON.parse(storedTerminals) : mockTerminals;

            const storedZones = localStorage.getItem(ZONES_STORAGE_KEY);
            const zones: Zone[] = storedZones ? JSON.parse(storedZones) : mockZones;
            
            const selectedPort = ports.find(p => p.id === formData.portId);
            const selectedTerminal = terminals.find(t => t.id === formData.terminalId);
            const selectedZone = zones.find(z => z.id === formData.zoneId);
            
            const updatedDesk: OfficerDesk = {
                ...desk,
                ...formData,
                portName: selectedPort?.name || 'N/A',
                terminalName: selectedTerminal?.name || 'N/A',
                zoneName: selectedZone?.name || 'N/A',
                lastUpdatedAt: new Date().toISOString(),
                lastUpdatedBy: user?.fullName || 'System',
            };

            const updatedDesks = desks.map((p: OfficerDesk) => 
                p.id === updatedDesk.id ? updatedDesk : p
            );
            localStorage.setItem(OFFICER_DESKS_STORAGE_KEY, JSON.stringify(updatedDesks));
            
            toast({
                title: 'Desk Updated',
                description: `Desk "${updatedDesk.name}" has been successfully updated.`,
                variant: 'success',
            });
            router.push('/officer-desks');
        } catch (error) {
            console.error('Failed to update desk in localStorage', error);
            toast({
                title: 'Update Failed',
                description: 'There was an error saving the desk data.',
                variant: 'destructive',
            });
        }
    };

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                 <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Loading desk data...</p>
                </div>
            </div>
        );
    }
    
    if (!desk) {
        return (
             <div className="flex h-full w-full items-center justify-center">
                 <div className="flex flex-col items-center gap-4 text-destructive">
                    <p>Desk not found.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <GradientPageHeader
                title="Edit Officer Desk"
                description={`Editing the desk: "${desk.name}".`}
                icon={FilePenLine}
            />
            <OfficerDeskForm onSave={handleSave} deskToEdit={desk} />
        </div>
    );
}
