
'use client';
import * as React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface TravelerData {
    name: string;
    value: number;
}

interface TravelerCategoryChartProps {
    data: TravelerData[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function TravelerCategoryChart({ data }: TravelerCategoryChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Traveler Categories</CardTitle>
        <CardDescription>Breakdown of travelers by category.</CardDescription>
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
