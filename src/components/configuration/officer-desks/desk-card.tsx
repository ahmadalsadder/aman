
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { OfficerDesk } from '@/types/configuration';
import { cn } from '@/lib/utils';
import { MoreHorizontal, Eye, FilePenLine, Trash2, PlayCircle, PauseCircle, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

const statusConfig: { [key: string]: { icon: React.ElementType, color: string, bgColor: string } } = {
  Active: { icon: Check, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  Inactive: { icon: PauseCircle, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  Closed: { icon: PauseCircle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
};

const movementTypeColors: { [key: string]: string } = {
  Entry: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  Exit: 'bg-purple-500/20 text-purple-700 border-purple-500/30',
  Bidirectional: 'bg-indigo-500/20 text-indigo-700 border-indigo-500/30',
};

interface DeskCardProps {
    desk: OfficerDesk; 
    onView: () => void; 
    onEdit: () => void; 
    onDelete: () => void; 
    onToggleStatus: (deskId: string, currentStatus: 'Active' | 'Inactive' | 'Closed') => void;
    canEdit: boolean;
    canDelete: boolean;
}

export function DeskCard({ desk, onView, onEdit, onDelete, onToggleStatus, canEdit, canDelete }: DeskCardProps) {
    const t = useTranslations('OfficerDesks.deskCard');
    const config = statusConfig[desk.status];
  
    return (
      <Card className="flex flex-col transition-all hover:shadow-lg hover:-translate-y-1">
        <CardHeader>
          <div className="flex justify-between items-start">
              <div>
                  <CardTitle>{desk.name}</CardTitle>
                  <CardDescription>{desk.terminalName}</CardDescription>
              </div>
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">{t('openMenu')}</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onView}>
                      <Eye className="mr-2 h-4 w-4 text-primary" />
                      <span>{t('viewDetails')}</span>
                  </DropdownMenuItem>
                  {canEdit && (
                    <DropdownMenuItem onClick={onEdit}>
                      <FilePenLine className="mr-2 h-4 w-4 text-yellow-500" />
                      <span>{t('editDesk')}</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  {canEdit && (
                    <>
                    {desk.status === 'Active' ? (
                        <DropdownMenuItem onClick={() => onToggleStatus(desk.id, desk.status)}>
                            <PauseCircle className="mr-2 h-4 w-4 text-orange-500" />
                            <span>{t('deactivate')}</span>
                        </DropdownMenuItem>
                        ) : (
                        <DropdownMenuItem onClick={() => onToggleStatus(desk.id, desk.status)}>
                            <PlayCircle className="mr-2 h-4 w-4 text-green-500" />
                            <span>{t('activate')}</span>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    </>
                  )}
                  {canDelete && (
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onDelete}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>{t('delete')}</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <div className="flex justify-between text-sm text-muted-foreground">
              <span className="flex items-center gap-2">{t('ipAddress')}</span>
              <span className="font-mono">{desk.ipAddress}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
              <span className="flex items-center gap-2">{t('macAddress')}</span>
              <span className="font-mono">{desk.macAddress}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
              <span>{t('lastUpdated')}</span>
              <span className="font-medium">{new Date(desk.lastUpdatedAt).toLocaleDateString()}</span>
          </div>
        </CardContent>
        <CardFooter className="flex-wrap gap-2 text-xs border-t pt-4">
            <Badge variant="outline" className={cn(config.bgColor, config.color, 'border-current/30')}>{desk.status}</Badge>
            <Badge variant="outline" className={cn(movementTypeColors[desk.movementType])}>{desk.movementType}</Badge>
            <Badge variant="secondary">{t('workflow')}: {desk.workflowId}</Badge>
            <Badge variant="secondary">{t('riskProfile')}: {desk.riskRuleId}</Badge>
        </CardFooter>
      </Card>
    );
}
