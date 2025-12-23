'use client';

interface PCBLinesProps {
  className?: string;
  color?: 'accent' | 'accent-3' | 'accent-4';
}

const colorMap = {
  accent: '#3b82f6',
  'accent-3': '#06b6d4',
  'accent-4': '#00DC82',
};

export function PCBLines({ className = '', color = 'accent-4' }: PCBLinesProps) {
  const strokeColor = colorMap[color];
  
  return (
    <svg 
      width="100%" 
      height="100%" 
      viewBox="0 0 200 4" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      preserveAspectRatio="none"
      className={className}
    >
      <line 
        x1="0" 
        y1="2" 
        x2="180" 
        y2="2" 
        stroke={strokeColor} 
        strokeWidth="2" 
        strokeDasharray="4 4" 
        opacity="0.3"
      />
      <circle 
        cx="190" 
        cy="2" 
        r="6" 
        fill={strokeColor} 
        opacity="0.6"
      />
    </svg>
  );
}

