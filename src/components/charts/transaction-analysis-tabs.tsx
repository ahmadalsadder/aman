
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SimplePieChart } from '@/components/charts/simple-pie-chart';

interface PieChartData {
    name: string;
    value: number;
    fill: string;
}

interface TransactionAnalysisTabsProps {
    listsData: {
        whitelisted: PieChartData[];
        blacklisted: PieChartData[];
        risky: PieChartData[];
    };
    breakdownData: {
        gate: PieChartData[];
        counter: PieChartData[];
        total: PieChartData[];
    };
}

export function TransactionAnalysisTabs({ listsData, breakdownData }: TransactionAnalysisTabsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Analysis</CardTitle>
        <CardDescription>
          Detailed breakdown of transactions by lists and processing points.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="lists">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lists">By Lists</TabsTrigger>
            <TabsTrigger value="breakdown">By Breakdown</TabsTrigger>
          </TabsList>
          <TabsContent value="lists">
            <div className="mt-4 grid gap-8 md:grid-cols-3">
              <SimplePieChart data={listsData.whitelisted} title="Whitelisted Transactions" description="Whitelisted vs. non-whitelisted." />
              <SimplePieChart data={listsData.blacklisted} title="Blacklisted Transactions" description="Blacklisted vs. non-blacklisted." />
              <SimplePieChart data={listsData.risky} title="Risky Transactions" description="Risky vs. non-risky." />
            </div>
          </TabsContent>
          <TabsContent value="breakdown">
            <div className="mt-4 grid gap-8 md:grid-cols-3">
              <SimplePieChart data={breakdownData.gate} title="Gate Transactions" description="Success, rejected, cancelled." />
              <SimplePieChart data={breakdownData.counter} title="Counter Transactions" description="Success, rejected, cancelled." />
              <SimplePieChart data={breakdownData.total} title="Total Transactions" description="Success, rejected, cancelled." />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
