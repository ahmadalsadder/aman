'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function CreateRecordButton() {
    const { hasPermission } = useAuth();

    if (!hasPermission(['records:create'])) {
        return null;
    }

    const handleClick = () => {
        alert('Create new record functionality would be here!');
    };

    return (
        <Button onClick={handleClick}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Record
        </Button>
    );
}
