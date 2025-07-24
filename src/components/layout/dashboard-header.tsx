
'use client';

import { LayoutGrid } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  description: string;
  icon?: LucideIcon;
}

export function DashboardHeader({ title, description, icon: Icon = LayoutGrid }: DashboardHeaderProps) {
  return (
    <div className="relative rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white shadow-lg">
      <div className="flex items-center gap-4">
        <div className="rounded-full bg-white/20 p-3">
          <Icon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-blue-100">{description}</p>
        </div>
      </div>
    </div>
  );
}
