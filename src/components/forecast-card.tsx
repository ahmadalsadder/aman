
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserCheck } from 'lucide-react';
import CalendarIcon from '@/components/icons/calendar-icon';

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
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
                <CalendarIcon className="h-8 w-8 text-primary" />
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
                {metrics.map((metric, index) => (
                    <Card key={index} className="relative flex flex-col justify-between p-4 bg-background/50">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold">{metric.title}</h4>
                                <metric.icon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-3xl font-bold">{metric.value}</p>
                            <p className="text-sm text-muted-foreground">{metric.description}</p>
                        </div>
                        <div className="flex justify-end mt-4">
                            <Badge variant="default" className="flex items-center gap-1">
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
