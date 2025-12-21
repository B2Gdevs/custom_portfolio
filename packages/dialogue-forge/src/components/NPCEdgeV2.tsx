import React, { useState } from 'react';
import { BaseEdge, EdgeProps, getBezierPath } from 'reactflow';

export function NPCEdgeV2({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  selected,
}: EdgeProps) {
  const [hovered, setHovered] = useState(false);
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const isSelected = selected || hovered;
  
  // Make edge more visible when hovered or selected
  // Grey base color, but brighter and thicker when selected/hovered
  const strokeColor = isSelected ? '#8a8aaa' : '#4a4a6a';
  const strokeWidth = isSelected ? 4 : 2;
  const opacity = isSelected ? 1 : 0.6;
  
  // Add glow effect when hovered
  const filter = hovered ? 'drop-shadow(0 0 4px rgba(138, 138, 170, 0.8))' : undefined;

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
          stroke: strokeColor, 
          strokeWidth, 
          opacity,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          filter,
        }}
        markerEnd="arrowclosed"
      />
    </>
  );
}

