'use client';

import { PlanningPackLaunchButton } from '@/components/planning/PlanningPackLaunchButton';

export function PlanningPackInlineButton({
  label = 'Open the planning pack modal',
}: {
  label?: string;
}) {
  return <PlanningPackLaunchButton label={label} variant="default" />;
}
