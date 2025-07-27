
'use client';

import { UserForm, type UserFormValues } from '@/components/users/user-form';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { User } from '@/types';
import { FilePenLine } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
        if(!params.id) return;
        const result = await api.get<User>(`/data/users/${params.id}`);
        if(result.isSuccess && result.data) {
            setUser(result.data);
        } else {
            toast({ title: 'Error', description: 'User not found.', variant: 'destructive'});
            router.push('/users');
        }
    }
    fetchUser();
  }, [params.id, router, toast]);

  const handleSave = async (data: UserFormValues) => {
    setIsLoading(true);
    const result = await api.post<User>('/data/users/save', { id: params.id, ...data });
    if (result.isSuccess) {
      toast({
        title: 'User Updated',
        description: `The user account for ${result.data?.name} has been updated.`,
        variant: 'success'
      });
      router.push('/users');
    } else {
      toast({
        title: 'Error',
        description: result.errors?.[0]?.message || 'Failed to update user.',
        variant: 'destructive'
      });
      setIsLoading(false);
    }
  };
  
  if (!user) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-6">
      <GradientPageHeader
        title="Edit User"
        description={`Editing account for ${user.name}`}
        icon={FilePenLine}
      />
      <UserForm onSave={handleSave} isLoading={isLoading} userToEdit={user} />
    </div>
  );
}
