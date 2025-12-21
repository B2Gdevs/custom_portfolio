import React from 'react';
import { BaseEdge, EdgeProps, getBezierPath, MarkerType } from 'reactflow';
import { CHOICE_COLORS } from '../utils/reactflow-converter';

export function ChoiceEdgeV2({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const choiceIndex = data?.choiceIndex ?? 0;
  const color = CHOICE_COLORS[choiceIndex % CHOICE_COLORS.length];

  return (
    <>
      <BaseEdge 
        id={id} 
        path={edgePath}
        style={{ 
          stroke: color, 
          strokeWidth: 2, 
          opacity: 0.7 
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

