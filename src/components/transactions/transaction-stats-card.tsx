
'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface TransactionStatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  badge?: React.ReactNode;
}

export function TransactionStatsCard({ title, value, description, icon: Icon, iconColor, badge }: TransactionStatsCardProps) {
  return (
    <Card className="relative">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">{title}</h3>
          <Icon className={cn("h-4 w-4 text-muted-foreground", iconColor)} />
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
      {badge && (
        <div className="absolute bottom-2 right-2">
          <Badge variant="secondary">{badge}</Badge>
        </div>
      )}
    </Card>
  );
}
