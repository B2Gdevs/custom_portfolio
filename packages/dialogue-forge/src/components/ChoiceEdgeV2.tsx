import React, { useState } from 'react';
import { BaseEdge, EdgeProps, getBezierPath, MarkerType } from 'reactflow';
import { CHOICE_COLORS } from '../utils/reactflow-converter';

export function ChoiceEdgeV2({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  selected,
}: EdgeProps) {
  const [hovered, setHovered] = useState(false);
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const choiceIndex = data?.choiceIndex ?? 0;
  const color = CHOICE_COLORS[choiceIndex % CHOICE_COLORS.length];
  const isSelected = selected || hovered;
  
  // Make edge thicker and more opaque when hovered or selected
  const strokeWidth = isSelected ? 4 : 2;
  const opacity = isSelected ? 1 : 0.7;
  
  // Add glow effect when hovered
  const filter = hovered ? `drop-shadow(0 0 4px ${color}80)` : undefined;

  return (
    <>
      {/* Invisible wider path for easier clicking and hover detection */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        style={{ cursor: 'pointer', pointerEvents: 'all' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
      <BaseEdge 
        id={id} 
        path={edgePath}
        style={{ 
          stroke: color, 
          strokeWidth, 
          opacity,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          pointerEvents: 'none', // Let the invisible path handle events
          filter,
        }}
        markerEnd={`url(#react-flow__arrowclosed-${color.replace('#', '')})`}
      />
      {/* Define marker for this color */}
      <defs>
        <marker
          id={`react-flow__arrowclosed-${color.replace('#', '')}`}
          markerWidth="12.5"
          markerHeight="12.5"
          viewBox="-10 -10 20 20"
          markerUnits="strokeWidth"
          orient="auto"
          refX="0"
          refY="0"
        >
          <polyline
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={color}
            points="-5,-4 0,0 -5,4 -5,-4"
          />
        </marker>
      </defs>
    </>
  );
}

