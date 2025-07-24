
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

const statusColors: { [key: string]: string } = {
  'On Time': 'bg-green-500/20 text-green-700',
  'Delayed': 'bg-yellow-500/20 text-yellow-700',
  'Boarding': 'bg-blue-500/20 text-blue-700',
};

export function FlightScheduleTable({ title, data }: { title: string, data: any[] }) {
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
                            <TableHead>{t('flight')}</TableHead>
                            <TableHead>{data[0]?.from ? t('from') : t('to')}</TableHead>
                            <TableHead>{t('time')}</TableHead>
                            <TableHead>{t('gate')}</TableHead>
                            <TableHead>{t('status')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((flight) => (
                            <TableRow key={flight.id}>
                                <TableCell className="font-medium">{flight.id}</TableCell>
                                <TableCell>{flight.from || flight.to}</TableCell>
                                <TableCell>{flight.time}</TableCell>
                                <TableCell>{flight.gate}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={cn(statusColors[flight.status])}>{flight.status}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
