
'use client';

import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { OfficerDeskForm, type OfficerDeskFormValues } from '@/components/configuration/officer-desks/officer-desk-form';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { OfficerDesk, Port, Terminal, Zone } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { mockPorts, mockTerminals, mockZones } from '@/lib/mock-data';

const OFFICER_DESKS_STORAGE_KEY = 'guardian-gate-officer-desks';
const PORTS_STORAGE_KEY = 'guardian-gate-ports';
const TERMINALS_STORAGE_KEY = 'guardian-gate-terminals';
const ZONES_STORAGE_KEY = 'guardian-gate-zones';

export default function AddOfficerDeskPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useAuth();

    const handleSave = (formData: OfficerDeskFormValues) => {
        try {
            const storedDesks = localStorage.getItem(OFFICER_DESKS_STORAGE_KEY);
            const desks: OfficerDesk[] = storedDesks ? JSON.parse(storedDesks) : [];
            
            const storedTerminals = localStorage.getItem(TERMINALS_STORAGE_KEY);
            const terminals: Terminal[] = storedTerminals ? JSON.parse(storedTerminals) : mockTerminals;

            const storedZones = localStorage.getItem(ZONES_STORAGE_KEY);
            const zones: Zone[] = storedZones ? JSON.parse(storedZones) : mockZones;

            const storedPorts = localStorage.getItem(PORTS_STORAGE_KEY);
            const ports: Port[] = storedPorts ? JSON.parse(storedPorts) : mockPorts;
            
            const selectedTerminal = terminals.find(t => t.id === formData.terminalId);
            const selectedZone = zones.find(z => z.id === formData.zoneId);
            const selectedPort = ports.find(p => p.id === formData.portId);

            const newDesk: OfficerDesk = {
                ...formData,
                id: `DESK-${Date.now().toString().slice(-4)}`,
                portName: selectedPort?.name || 'N/A',
                terminalName: selectedTerminal?.name || 'N/A',
                zoneName: selectedZone?.name || 'N/A',
                status: 'Active',
                lastUpdatedAt: new Date().toISOString(),
                createdBy: user?.fullName || 'System',
                createdAt: new Date().toISOString(),
                lastUpdatedBy: user?.fullName || 'System',
                connectedMachines: [],
            };

            const updatedDesks = [...desks, newDesk];
            localStorage.setItem(OFFICER_DESKS_STORAGE_KEY, JSON.stringify(updatedDesks));
            
            toast({
                title: 'Desk Added',
                description: `New desk "${newDesk.name}" has been added.`,
                variant: 'success',
            });
            
            router.push('/officer-desks');
        } catch (error) {
            console.error('Failed to save desk to localStorage', error);
            toast({
                title: 'Save Failed',
                description: 'There was an error saving the desk data.',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="space-y-6">
            <GradientPageHeader
                title="Add New Officer Desk"
                description="Define a new officer desk in the system."
                icon={PlusCircle}
            />
            <OfficerDeskForm onSave={handleSave} />
        </div>
    );
}
