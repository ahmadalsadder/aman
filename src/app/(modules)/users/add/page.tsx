
'use client';

import { UserForm, type UserFormValues } from '@/components/users/user-form';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';
import type { User } from '@/types';

export default function AddUserPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (data: UserFormValues) => {
    setIsLoading(true);
    const result = await api.post<User>('/data/users/save', data);
    if (result.isSuccess) {
      toast({
        title: 'User Created',
        description: `The user account for ${result.data?.name} has been created.`,
        variant: 'success'
      });
      router.push('/users');
    } else {
      toast({
        title: 'Error',
        description: result.errors?.[0]?.message || 'Failed to create user.',
        variant: 'destructive'
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <GradientPageHeader
        title="Add New User"
        description="Create a new user account and assign roles and permissions."
        icon={PlusCircle}
      />
      <UserForm onSave={handleSave} isLoading={isLoading} />
    </div>
  );
}
