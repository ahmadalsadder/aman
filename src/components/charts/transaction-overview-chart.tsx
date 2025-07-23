'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface TransactionOverviewChartProps {
  data: { name: string; entry: number; exit: number }[];
}

export function TransactionOverviewChart({ data }: TransactionOverviewChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Overview</CardTitle>
        <CardDescription>Entry and exit counts for the last 7 days.</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] w-full">
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
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="entry" name="Entries" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="exit" name="Exits" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
