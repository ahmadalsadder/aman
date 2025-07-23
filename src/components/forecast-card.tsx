
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserCheck } from 'lucide-react';

interface ForecastItem {
    icon: React.ElementType;
    label: string;
    value: string;
    trend: React.ReactNode;
}

interface Forecast {
    title: string;
    description: string;
    items: ForecastItem[];
    recommendedStaff: number;
}

interface ForecastCardProps {
    forecast: Forecast;
}

export function ForecastCard({ forecast }: ForecastCardProps) {
    if (!forecast) {
        return null;
    }

    const { title, description, items, recommendedStaff } = forecast;

    return (
        <Card className="relative overflow-hidden">
            <CardHeader className="pb-4">
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {items.map((item, index) => (
                        <li key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <item.icon className="h-5 w-5 text-muted-foreground" />
                                <span className="font-medium">{item.label}</span>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-lg">{item.value}</p>
                                <p className="text-xs text-muted-foreground">{item.trend}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
             <div className="absolute top-4 right-4">
                <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                    <UserCheck className="h-4 w-4" />
                    <span>{recommendedStaff} Officers</span>
                </div>
            </div>
        </Card>
    );
}
