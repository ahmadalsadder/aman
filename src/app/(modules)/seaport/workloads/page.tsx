
'use client';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CalendarDays, UserCog } from 'lucide-react';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';

const featureCards = [
    {
        title: "Shift Management",
        description: "Define and manage officer work shifts, schedules, and rotations.",
        href: "/seaport/workloads/shift-management",
        icon: CalendarDays,
    },
    {
        title: "Assign Officer",
        description: "Assign specific officers to shifts and manage their workload.",
        href: "/seaport/workloads/assign-officer",
        icon: UserCog,
    }
];

export default function SeaportWorkloadsPage() {
  return (
    <div className="space-y-6">
       <GradientPageHeader
        title="Workload Management"
        description="Plan and manage officer shifts and assignments."
        icon={CalendarDays}
      />
      <div className="grid gap-6 md:grid-cols-2">
        {featureCards.map(card => (
          <Link href={card.href} key={card.title}>
            <Card className="flex flex-col h-full hover:border-primary transition-colors">
              <CardHeader className="flex flex-row items-center gap-4">
                <card.icon className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-grow"></CardContent>
              <div className="flex justify-end p-4">
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
