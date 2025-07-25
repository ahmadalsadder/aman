'use client';
import { useMemo } from 'react';
import { ShiftManagementPage } from '@/components/workloads/shift-management/shift-management-page';
import { useAuth } from '@/hooks/use-auth';
import type { Permission } from '@/types';
import { AlertTriangle } from 'lucide-react';

export default function SeaportShiftManagementPage() {
    const { hasPermission } = useAuth();
    const canView = useMemo(() => hasPermission(['seaport:workload:view' as Permission]), [hasPermission]);

    if (!canView) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                <AlertTriangle className="h-16 w-16 text-destructive" />
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="max-w-md text-muted-foreground">
                    You do not have permission to view workload management for this module.
                </p>
            </div>
        );
    }

    return <ShiftManagementPage module="seaport" />;
}
