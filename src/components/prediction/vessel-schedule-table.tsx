
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

const statusColors: { [key: string]: string } = {
  'On Time': 'bg-green-500/20 text-green-700',
  'Expected': 'bg-blue-500/20 text-blue-700',
  'Delayed': 'bg-yellow-500/20 text-yellow-700',
};

export function VesselScheduleTable({ title, data }: { title: string, data: any[] }) {
    const t = useTranslations('Prediction.schedule');
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('vessel')}</TableHead>
                            <TableHead>{data[0]?.from ? t('from') : t('to')}</TableHead>
                            <TableHead>{t('time')}</TableHead>
                            <TableHead>{t('berth')}</TableHead>
                            <TableHead>{t('status')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((vessel) => (
                            <TableRow key={vessel.id}>
                                <TableCell className="font-medium">{vessel.id}</TableCell>
                                <TableCell>{vessel.from || vessel.to}</TableCell>
                                <TableCell>{vessel.time}</TableCell>
                                <TableCell>{vessel.berth}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={cn(statusColors[vessel.status])}>{vessel.status}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
