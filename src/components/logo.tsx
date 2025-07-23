import { cn } from '@/lib/utils';

export default function Logo({ className, ...props }: React.HTMLAttributes<SVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-8 w-8', className)}
      {...props}
    >
      <title>Aman Logo</title>
      <path
        d="M12 2L4 6v6c0 4.4 3.6 8 8 8s8-3.6 8-8V6l-8-4z"
        className="stroke-primary"
        fill="hsl(var(--primary-rgb) / 0.1)"
      />
      {/* E-Passport Symbol */}
      <rect x="8" y="9" width="8" height="6" rx="1" className="stroke-primary" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="12" r="1.5" className="stroke-primary" strokeWidth="1.5" fill="none" />
    </svg>
  );
}
