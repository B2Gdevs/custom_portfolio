'use client';

import React from 'react';
import { Info, Lightbulb, FileText, AlertTriangle } from 'lucide-react';

type CalloutType = 'info' | 'tip' | 'note' | 'warning';

const calloutConfig: Record<
  CalloutType,
  { icon: React.ComponentType<{ className?: string; size?: number }>; label: string; borderClass: string; bgClass: string }
> = {
  info: {
    icon: Info,
    label: 'Info',
    borderClass: 'border-blue-500/50',
    bgClass: 'bg-blue-500/5',
  },
  tip: {
    icon: Lightbulb,
    label: 'Tip',
    borderClass: 'border-amber-500/50',
    bgClass: 'bg-amber-500/5',
  },
  note: {
    icon: FileText,
    label: 'Note',
    borderClass: 'border-accent/50',
    bgClass: 'bg-accent/5',
  },
  warning: {
    icon: AlertTriangle,
    label: 'Warning',
    borderClass: 'border-orange-500/50',
    bgClass: 'bg-orange-500/5',
  },
};

export default function Callout({
  type = 'note',
  title,
  children,
}: {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}) {
  const config = calloutConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`my-6 rounded-lg border-l-4 ${config.borderClass} ${config.bgClass} p-4 pl-5 shadow-sm`}
      role="note"
    >
      <div className="flex gap-3">
        <Icon className="mt-0.5 shrink-0 text-current opacity-80" size={20} />
        <div className="min-w-0 flex-1">
          <p className="mb-1 font-semibold text-primary">
            {title ?? config.label}
          </p>
          <div className="prose prose-sm max-w-none text-text-muted prose-p:my-2 prose-ul:my-2 prose-li:my-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
