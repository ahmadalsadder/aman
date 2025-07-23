'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useMemo } from 'react';

type OfficerData = {
  id: string;
  name: string;
  avgProcessingTime: number;
};

interface OfficerProcessingTimeChartProps {
    data: OfficerData[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'];

export function OfficerProcessingTimeChart({ data }: OfficerProcessingTimeChartProps) {
  const chartData = useMemo(() => 
    data
      .filter(d => d.avgProcessingTime > 0)
      .sort((a,b) => a.avgProcessingTime - b.avgProcessingTime) // Sort fastest to slowest
      .slice(0, 10) // Show top 10 fastest
      .map(officer => ({
        name: officer.name.split(' ')[0], // Use first name for brevity
        "Avg Time (m)": officer.avgProcessingTime,
      }))
    , [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Average Processing Time</CardTitle>
        <CardDescription>Top 10 fastest officers by average time (in minutes).</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            layout="vertical" 
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis 
                dataKey="name" 
                type="category"
                width={60}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
              }}
            />
            <Bar dataKey="Avg Time (m)" barSize={20} radius={[0, 4, 4, 0]}>
                 {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
