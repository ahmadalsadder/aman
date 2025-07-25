
'use client';

import { OfficerDesksPage } from '@/components/configuration/officer-desks/officer-desks-page';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import type { OfficerDesk, Port, Terminal } from '@/types/configuration';
import { useState, useEffect, useMemo } from 'react';

export default function LandportOfficerDesksPage() {
    const [loading, setLoading] = useState(true);
    const [desks, setDesks] = useState<OfficerDesk[]>([]);
    const [ports, setPorts] = useState<Port[]>([]);
    const [terminals, setTerminals] = useState<Terminal[]>([]);
    const { hasPermission } = useAuth();

    const canView = useMemo(() => hasPermission(['landport:desks:view']), [hasPermission]);

    useEffect(() => {
        if (!canView) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            const [desksResult, portsResult, terminalsResult] = await Promise.all([
                api.get<OfficerDesk[]>(`/data/desks?moduleType=landport`),
                api.get<Port[]>(`/data/ports?moduleType=landport`),
                api.get<Terminal[]>('/data/terminals'),
            ]);

            if (desksResult.isSuccess) setDesks(desksResult.data || []);
            if (portsResult.isSuccess) setPorts(portsResult.data || []);
            if (terminalsResult.isSuccess) setTerminals(terminalsResult.data || []);
            
            setLoading(false);
        };

        fetchData();
    }, [canView]);

    return (
        <OfficerDesksPage 
            module="landport" 
            moduleName="Landport"
            desks={desks}
            ports={ports}
            terminals={terminals}
            loading={loading}
        />
    );
}
