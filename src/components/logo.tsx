import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground',
        className
      )}
    >
      <Shield className="h-6 w-6" />
    </div>
  );
}
