'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GateSupervisorPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/gate-supervisor/dashboard');
    }, [router]);
    return null;
}
