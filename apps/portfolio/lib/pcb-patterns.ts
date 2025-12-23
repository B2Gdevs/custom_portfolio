/**
 * PCB Pattern Utilities
 * Server-safe utility functions for PCB background patterns
 */

export type PCBPattern = 'grid' | 'curves' | 'chip' | 'dense';

const PCB_PATTERNS: PCBPattern[] = ['grid', 'curves', 'chip', 'dense'];

export function getPCBPattern(index: number): PCBPattern {
  return PCB_PATTERNS[index % PCB_PATTERNS.length];
}

export function getPCBPatternPath(pattern: PCBPattern): string {
  return `/images/decorative/pcb-${pattern}.svg`;
}





