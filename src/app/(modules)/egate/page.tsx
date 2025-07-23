'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EgatePage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/egate/dashboard');
    }, [router]);
    return null;
}
