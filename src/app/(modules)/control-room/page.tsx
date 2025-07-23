
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ControlRoomPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/control-room/dashboard');
  }, [router]);
  return null;
}
