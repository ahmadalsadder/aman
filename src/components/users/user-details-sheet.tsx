
'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';

const DetailItem = ({ label, value, children }: { label: string; value?: string | number | null; children?: React.ReactNode }) => (
    <div className="py-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      {value != null && <p className="text-base font-medium">{String(value)}</p>}
      {children}
    </div>
);

interface UserDetailsSheetProps {
    user: User | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UserDetailsSheet({ user, isOpen, onOpenChange }: UserDetailsSheetProps) {
    if (!user) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-lg">
                <ScrollArea className="h-full pr-6">
                    <SheetHeader>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={`https://i.pravatar.cc/150?u=${user.email}`} alt={user.name} />
                                <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                                <SheetTitle>{user.name}</SheetTitle>
                                <SheetDescription>{user.email}</SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>
                    <div className="py-4 space-y-2">
                        <Separator />
                        <DetailItem label="Role" value={user.role} />
                        <Separator />
                        <DetailItem label="Modules">
                            <div className="flex flex-wrap gap-2 mt-1">
                                {user.modules.map(m => <Badge key={m} variant="secondary">{m}</Badge>)}
                            </div>
                        </DetailItem>
                        <Separator />
                        <DetailItem label="Permissions">
                             <div className="flex flex-wrap gap-2 mt-1">
                                {user.permissions.map(p => <Badge key={p} variant="outline">{p}</Badge>)}
                            </div>
                        </DetailItem>
                    </div>
                    <SheetFooter className="mt-4">
                        <Button onClick={() => onOpenChange(false)}>Close</Button>
                    </SheetFooter>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
