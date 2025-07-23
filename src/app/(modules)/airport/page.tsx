
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AirportPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/airport/dashboard');
  }, [router]);
  return null;
}
