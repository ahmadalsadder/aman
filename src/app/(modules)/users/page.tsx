
'use client';

import { UsersPage } from '@/components/users/users-page';
import { api } from '@/lib/api';
import type { User } from '@/types';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { hasPermission } = useAuth();
    const canView = hasPermission(['users:manage']);

    useEffect(() => {
        if (canView) {
            api.get<User[]>('/data/users').then(result => {
                if(result.isSuccess && result.data) {
                    setUsers(result.data);
                }
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [canView]);

    const handleDeleteUser = async (userId: string): Promise<boolean> => {
        // Mock deletion
        const result = await api.post('/data/users/delete', { id: userId });
        if(result.isSuccess) {
            setUsers(prev => prev.filter(u => u.id !== userId));
            return true;
        }
        return false;
    }
    
    if (loading) {
        return (
             <div className="space-y-6">
                <Skeleton className="h-24" />
                <Skeleton className="h-32" />
                <Skeleton className="h-96" />
            </div>
        );
    }

    if (!canView) {
         return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                <AlertTriangle className="h-16 w-16 text-destructive" />
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="max-w-md text-muted-foreground">
                    You do not have permission to manage users.
                </p>
            </div>
        );
    }

    return <UsersPage users={users} loading={loading} onDeleteUser={handleDeleteUser} />;
}
