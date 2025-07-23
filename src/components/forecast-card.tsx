
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeftRight, UserCheck } from 'lucide-react';

interface ForecastMetric {
    title: string;
    value: string;
    description: string;
    icon: React.ElementType;
}

interface Forecast {
    title: string;
    description: string;
    metrics: ForecastMetric[];
    recommendedStaff: number;
}

interface ForecastCardProps {
    forecast: Forecast;
}

export function ForecastCard({ forecast }: ForecastCardProps) {
    if (!forecast || !forecast.metrics || forecast.metrics.length === 0) {
        return null;
    }

    const { title, description, metrics, recommendedStaff } = forecast;

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
                {metrics.map((metric, index) => (
                    <Card key={index} className="relative flex flex-col justify-between p-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold">{metric.title}</h4>
                                <metric.icon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-3xl font-bold">{metric.value}</p>
                            <p className="text-sm text-muted-foreground">{metric.description}</p>
                        </div>
                        <div className="flex justify-end mt-4">
                            <Badge variant="secondary" className="flex items-center gap-1">
                                <UserCheck className="h-3 w-3" />
                                {recommendedStaff} Officers
                            </Badge>
                        </div>
                    </Card>
                ))}
            </CardContent>
        </Card>
    );
}
