
'use client';

import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { MachineForm, type MachineFormValues } from '@/components/configuration/machines/machine-form';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Machine, Port, Terminal, Zone } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { mockPorts, mockTerminals, mockZones } from '@/lib/mock-data';
import { format } from 'date-fns';

const MACHINES_STORAGE_KEY = 'guardian-gate-machines';
const PORTS_STORAGE_KEY = 'guardian-gate-ports';
const TERMINALS_STORAGE_KEY = 'guardian-gate-terminals';
const ZONES_STORAGE_KEY = 'guardian-gate-zones';

export default function AddMachinePage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useAuth();

    const handleSave = (formData: MachineFormValues) => {
        try {
            const storedMachines = localStorage.getItem(MACHINES_STORAGE_KEY);
            const machines: Machine[] = storedMachines ? JSON.parse(storedMachines) : [];
            
            const storedPorts = localStorage.getItem(PORTS_STORAGE_KEY);
            const ports: Port[] = storedPorts ? JSON.parse(storedPorts) : mockPorts;
            
            const storedTerminals = localStorage.getItem(TERMINALS_STORAGE_KEY);
            const terminals: Terminal[] = storedTerminals ? JSON.parse(storedTerminals) : mockTerminals;

            const storedZones = localStorage.getItem(ZONES_STORAGE_KEY);
            const zones: Zone[] = storedZones ? JSON.parse(storedZones) : mockZones;
            
            const selectedPort = ports.find(p => p.id === formData.portId);
            const selectedTerminal = terminals.find(t => t.id === formData.terminalId);
            const selectedZone = zones.find(z => z.id === formData.zoneId);

            const newMachine: Machine = {
                ...formData,
                id: `MACHINE-${Date.now().toString().slice(-4)}`,
                status: 'Online',
                portName: selectedPort?.name,
                terminalName: selectedTerminal?.name,
                zoneName: selectedZone?.name,
                lastModified: format(new Date(), 'yyyy-MM-dd'),
                createdBy: user?.fullName || 'System',
            };

            const updatedMachines = [...machines, newMachine];
            localStorage.setItem(MACHINES_STORAGE_KEY, JSON.stringify(updatedMachines));
            
            toast({
                title: 'Machine Added',
                description: `New machine "${newMachine.name}" has been added.`,
                variant: 'success',
            });
            
            router.push('/configuration/machines');
        } catch (error) {
            console.error('Failed to save machine to localStorage', error);
            toast({
                title: 'Save Failed',
                description: 'There was an error saving the machine data.',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="space-y-6">
            <GradientPageHeader
                title="Add New Machine"
                description="Define a new hardware device in the system."
                icon={PlusCircle}
            />
            <MachineForm onSave={handleSave} />
        </div>
    );
}
