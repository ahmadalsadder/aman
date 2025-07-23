'use client';
import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';

interface PassengerData {
    type: string;
    count: number;
}

interface PassengerTypeChartProps {
    data: PassengerData[];
}

const chartConfig = {
  count: {
    label: 'Passengers',
    color: 'hsl(var(--chart-1))',
  },
};

export default function PassengerTypeChart({ data }: PassengerTypeChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Passenger Demographics</CardTitle>
        <CardDescription>Distribution of passenger types processed.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart data={data} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="type"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend content={<ChartLegendContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={4} />
            </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
