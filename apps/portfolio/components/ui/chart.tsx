import * as React from 'react';
import { cn } from '@/lib/utils';

export type ChartConfig = Record<string, { label?: string; color?: string }>;

const ChartContext = React.createContext<ChartConfig | null>(null);

export function ChartContainer({
  children,
  className,
  config,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { config?: ChartConfig }) {
  return (
    <ChartContext.Provider value={config ?? null}>
      <div className={cn('w-full text-sm', className)} {...props}>
        {children}
      </div>
    </ChartContext.Provider>
  );
}

export function ChartTooltip({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-lg border bg-popover px-3 py-2 text-popover-foreground shadow-md', className)} {...props} />;
}

export function ChartTooltipContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('space-y-1 text-xs', className)} {...props} />;
}

export function ChartLegend({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-wrap items-center gap-3 text-xs', className)} {...props} />;
}

export function ChartLegendContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-wrap items-center gap-2', className)} {...props} />;
}

export function useChartConfig() {
  return React.useContext(ChartContext);
}
