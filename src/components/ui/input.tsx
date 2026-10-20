import * as React from 'react';
import { cn } from 'cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-12 w-full rounded-xl bg-neutral-950 px-4 py-3 text-md text-neutral-25 placeholder:text-neutral-600 border border-neutral-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-200 transition-colors',
          error && 'border-accent-red focus-visible:ring-accent-red',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
