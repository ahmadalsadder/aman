'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ThroughputChartProps {
  data: { name: string; transactions: number }[];
  className?: string;
}

export function ThroughputChart({ data, className }: ThroughputChartProps) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <CardTitle>Hourly Passenger Throughput</CardTitle>
        <CardDescription>Total transactions processed per hour across all gates and desks.</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] w-full flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
            />
            <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
            />
            <Tooltip 
                cursor={{ fill: 'hsl(var(--muted))' }} 
                contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                }}
            />
            <Bar dataKey="transactions" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
