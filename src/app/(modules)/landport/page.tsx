
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LandportPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/landport/dashboard');
  }, [router]);
  return null;
}
