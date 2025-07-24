
'use client';

import type { LucideIcon } from "lucide-react";
import { ArrowRightLeft } from "lucide-react";

interface GradientPageHeaderProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  children?: React.ReactNode;
}

export function GradientPageHeader({ title, description, icon: Icon = ArrowRightLeft, children }: GradientPageHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
            <div className="rounded-full bg-white/20 p-3">
            <Icon className="h-8 w-8" />
            </div>
            <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-blue-100">{description}</p>
            </div>
        </div>
        <div className="mt-4 md:mt-0">
            {children}
        </div>
      </div>
    </div>
  );
}
