'use client';

/**
 * PCB Background Pattern Component
 * Provides alternating PCB-style background patterns for section rows
 */

import { type PCBPattern, getPCBPatternPath } from '@/lib/pcb-patterns';

interface PCBBackgroundPatternProps {
  pattern: PCBPattern;
  position?: 'left' | 'right' | 'center';
  className?: string;
}

export function PCBBackgroundPattern({ 
  pattern, 
  position = 'left',
  className = '' 
}: PCBBackgroundPatternProps) {
  const patternPath = getPCBPatternPath(pattern);
  
  const positionClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  return (
    <div 
      className={`absolute top-0 bottom-0 w-full max-w-md ${positionClasses[position]} pointer-events-none ${className}`}
      style={{
        backgroundImage: `url("${patternPath}")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '320px 320px',
        opacity: 0.4,
      }}
    />
  );
}

