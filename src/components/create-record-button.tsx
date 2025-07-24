
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Module, Permission } from '@/types';

export default function CreateRecordButton({ module }: { module: Module }) {
    const { hasPermission } = useAuth();
    const t = useTranslations('CreateRecordButton');
    
    const createPermission: Permission = `${module}:records:create`;

    if (!hasPermission([createPermission])) {
        return null;
    }

    const handleClick = () => {
        alert(t('alertMessage'));
    };

    return (
        <Button onClick={handleClick}>
            <PlusCircle className="me-2 h-4 w-4" />
            {t('buttonText')}
        </Button>
    );
}
