'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface NationalityDistributionChartProps {
    data: { name: string; value: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560', '#F6367E', '#775DD0', '#546E7A', '#26a69a'];

export function NationalityDistributionChart({ data }: NationalityDistributionChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Passenger Nationality Distribution</CardTitle>
        <CardDescription>Top 10 nationalities by passenger volume.</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
              }}
            />
             <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" 
                wrapperStyle={{
                    fontSize: '12px',
                    lineHeight: '20px'
                }}
             />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
