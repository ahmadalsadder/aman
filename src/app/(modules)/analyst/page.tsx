'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AnalystPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/analyst/dashboard');
    }, [router]);
    return null;
}
