import * as React from 'react';
import { cn } from 'cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex w-full rounded-xl bg-neutral-950 px-4 py-2 text-md text-neutral-25 placeholder:text-neutral-600 border border-neutral-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-200 transition-colors resize-none no-scrollbar',
          error && 'border-accent-red focus-visible:ring-accent-red',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
