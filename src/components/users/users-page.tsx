
'use client';

import { useState, useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Eye, FilePenLine, Trash2, Users, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { User, Permission } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { DeleteUserDialog } from './delete-user-dialog';
import { UserDetailsSheet } from './user-details-sheet';
import { useToast } from '@/hooks/use-toast';

interface UsersPageProps {
    users: User[];
    loading: boolean;
    onDeleteUser: (userId: string) => Promise<boolean>;
}

export function UsersPage({ users, loading, onDeleteUser }: UsersPageProps) {
  const router = useRouter();
  const { hasPermission } = useAuth();
  const canManage = hasPermission(['users:manage']);
  const { toast } = useToast();

  const [userToView, setUserToView] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    const success = await onDeleteUser(userToDelete.id);
    if (success) {
      toast({
        title: 'User Deleted',
        description: `The user ${userToDelete.name} has been deleted.`,
        variant: 'info'
      });
      setUserToDelete(null);
    } else {
        toast({
            title: 'Delete Failed',
            description: 'There was an error deleting the user.',
            variant: 'destructive'
        });
    }
  };

  const columns: ColumnDef<User>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'role', header: 'Role', cell: ({ row }) => <Badge variant="secondary">{row.original.role}</Badge> },
    { accessorKey: 'modules', header: 'Modules', cell: ({ row }) => <div className="flex flex-wrap gap-1">{row.original.modules.map(m => <Badge key={m} variant="outline">{m}</Badge>)}</div> },
    { id: 'actions', cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setUserToView(row.original)}><Eye className="mr-2 h-4 w-4 text-primary" /><span>View details</span></DropdownMenuItem>
              {canManage && <DropdownMenuItem asChild><Link href={`/users/edit/${row.original.id}`}><FilePenLine className="mr-2 h-4 w-4 text-yellow-500" /><span>Edit User</span></Link></DropdownMenuItem>}
              {canManage && <DropdownMenuSeparator />}
              {canManage && <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setUserToDelete(row.original)}><Trash2 className="mr-2 h-4 w-4" /><span>Delete User</span></DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <GradientPageHeader title="User Management" description="Administer user accounts and permissions." icon={Shield}>
        {canManage && (
            <Button asChild className="bg-white font-semibold text-primary hover:bg-white/90">
                <Link href="/users/add">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add User
                </Link>
            </Button>
        )}
      </GradientPageHeader>
      
      <Card>
        <CardHeader>
            <CardTitle>User Records</CardTitle>
            <CardDescription>A list of all user accounts in the system.</CardDescription>
        </CardHeader>
        <CardContent>
            <DataTable columns={columns} data={users} filterColumnId="name" />
        </CardContent>
      </Card>
      
      <UserDetailsSheet
        user={userToView}
        isOpen={!!userToView}
        onOpenChange={(isOpen) => !isOpen && setUserToView(null)}
      />
      <DeleteUserDialog 
        user={userToDelete}
        isOpen={!!userToDelete}
        onOpenChange={(isOpen) => !isOpen && setUserToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
