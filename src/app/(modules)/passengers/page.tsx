
'use client';

import { PassengersPage } from '@/components/passengers/passengers-page';

// This page will now be a general fallback or for a potential admin-level view
export default function AdminPassengersPage() {
  return <PassengersPage module="admin" />;
}
