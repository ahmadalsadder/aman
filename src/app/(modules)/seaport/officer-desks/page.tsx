
'use client';

import { OfficerDesksPage } from '@/components/configuration/officer-desks/officer-desks-page';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import type { OfficerDesk, Port, Terminal } from '@/types/configuration';
import { useState, useEffect, useMemo } from 'react';

export default function SeaportOfficerDesksPage() {
    const [loading, setLoading] = useState(true);
    const [desks, setDesks] = useState<OfficerDesk[]>([]);
    const [ports, setPorts] = useState<Port[]>([]);
    const [terminals, setTerminals] = useState<Terminal[]>([]);
    const { hasPermission } = useAuth();

    const canView = useMemo(() => hasPermission(['seaport:desks:view']), [hasPermission]);

    useEffect(() => {
        if (!canView) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            const [desksResult, portsResult, terminalsResult] = await Promise.all([
                api.get<OfficerDesk[]>(`/data/desks?moduleType=seaport`),
                api.get<Port[]>(`/data/ports?moduleType=seaport`),
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
            module="seaport" 
            moduleName="Seaport"
            desks={desks}
            ports={ports}
            terminals={terminals}
            loading={loading}
        />
    );
}
