
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ForecastItem {
    icon: React.ElementType;
    label: string;
    value: string;
    trend: React.ReactNode;
}

interface ForecastCardProps {
    title: string;
    description: string;
    items: ForecastItem[];
}

export function ForecastCard({ title, description, items }: ForecastCardProps) {
    return (
        <Card>
            <CardHeader>
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
        </Card>
    );
}
