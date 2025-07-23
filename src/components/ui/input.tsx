import * as React from "react"
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      status: {
        default: "border-input",
        error: "border-destructive focus-visible:ring-destructive",
        success: "border-success focus-visible:ring-success",
      },
    },
    defaultVariants: {
      status: "default",
    },
  }
)

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, VariantProps<typeof inputVariants> {}


const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, status, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ status, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
