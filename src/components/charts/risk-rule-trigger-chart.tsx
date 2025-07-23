'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface RiskRuleTriggerChartProps {
    data: { name: string; value: number }[];
}

const COLORS = ['#FF8042', '#FFBB28', '#00C49F', '#0088FE', '#AF19FF', '#FF4560'];

export function RiskRuleTriggerChart({ data }: RiskRuleTriggerChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Triggered Risk Rules</CardTitle>
        <CardDescription>Frequency of each risk rule being triggered.</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis 
                dataKey="name" 
                type="category" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={150}
                // Truncate long rule names
                tickFormatter={(value) => (value.length > 20 ? `${value.substring(0, 20)}...` : value)}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
              }}
            />
            <Bar dataKey="value" name="Triggers" barSize={20} radius={[0, 4, 4, 0]}>
                 {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
