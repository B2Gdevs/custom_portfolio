import * as React from 'react';
import { cn } from '@/lib/utils';

export const ScrollArea = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('relative overflow-hidden', className)} {...props}>
      <div className="h-full w-full overflow-auto">{children}</div>
    </div>
  ),
);
ScrollArea.displayName = 'ScrollArea';

export const ScrollBar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex touch-none select-none border-transparent', className)} {...props} />
  ),
);
ScrollBar.displayName = 'ScrollBar';
