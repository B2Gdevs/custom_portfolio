'use client';

export function PCBBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Background grid pattern */}
        <defs>
          <pattern
            id="pcb-grid"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="20" cy="20" r="0.5" fill="#3b82f6" opacity="0.1" />
          </pattern>
          
          {/* Glow filter for animated traces */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* Pulsing glow filter */}
          <filter id="pulse-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
            <animate
              attributeName="stdDeviation"
              values="2;4;2"
              dur="2s"
              repeatCount="indefinite"
            />
          </filter>
        </defs>
        
        {/* Grid background */}
        <rect width="100%" height="100%" fill="url(#pcb-grid)" />
        
        {/* Main circuit traces - horizontal */}
        <g opacity="0.4">
          <path
            d="M0 150 Q300 140, 600 150 T1200 150"
            stroke="#3b82f6"
            strokeWidth="2"
            fill="none"
            strokeDasharray="8 4"
            className="pcb-trace-animate"
            style={{ animationDelay: '0s' }}
          >
            <animate
              attributeName="stroke-dashoffset"
              values="0;-12"
              dur="3s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M0 250 Q400 240, 800 250 T1200 250"
            stroke="#06b6d4"
            strokeWidth="2"
            fill="none"
            strokeDasharray="6 6"
            className="pcb-trace-animate"
            style={{ animationDelay: '1s' }}
          >
            <animate
              attributeName="stroke-dashoffset"
              values="0;-12"
              dur="4s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M0 350 Q350 360, 700 350 T1200 350"
            stroke="#00DC82"
            strokeWidth="2"
            fill="none"
            strokeDasharray="10 5"
            className="pcb-trace-animate"
            style={{ animationDelay: '0.5s' }}
          >
            <animate
              attributeName="stroke-dashoffset"
              values="0;-15"
              dur="3.5s"
              repeatCount="indefinite"
            />
          </path>
        </g>
        
        {/* Vertical traces */}
        <g opacity="0.3">
          <path
            d="M200 0 Q200 200, 200 400 T200 600"
            stroke="#3b82f6"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="5 5"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="0;-10"
              dur="4s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M500 0 Q500 150, 500 300 T500 600"
            stroke="#06b6d4"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="7 7"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="0;-14"
              dur="5s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M800 0 Q800 250, 800 500 T800 600"
            stroke="#00DC82"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="6 6"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="0;-12"
              dur="3.5s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M1000 0 Q1000 180, 1000 360 T1000 600"
            stroke="#8b5cf6"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="8 4"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="0;-12"
              dur="4.5s"
              repeatCount="indefinite"
            />
          </path>
        </g>
        
        {/* Circuit nodes/vias */}
        <g opacity="0.6">
          <circle cx="200" cy="150" r="4" fill="#3b82f6" filter="url(#pulse-glow)">
            <animate
              attributeName="r"
              values="4;6;4"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;0.9;0.6"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="500" cy="250" r="4" fill="#06b6d4" filter="url(#pulse-glow)">
            <animate
              attributeName="r"
              values="4;6;4"
              dur="2.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;0.9;0.6"
              dur="2.5s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="800" cy="350" r="4" fill="#00DC82" filter="url(#pulse-glow)">
            <animate
              attributeName="r"
              values="4;6;4"
              dur="2.2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;0.9;0.6"
              dur="2.2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="1000" cy="150" r="4" fill="#8b5cf6" filter="url(#pulse-glow)">
            <animate
              attributeName="r"
              values="4;6;4"
              dur="2.8s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;0.9;0.6"
              dur="2.8s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="300" cy="300" r="3" fill="#3b82f6" filter="url(#pulse-glow)">
            <animate
              attributeName="r"
              values="3;5;3"
              dur="2.3s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;0.8;0.6"
              dur="2.3s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="700" cy="200" r="3" fill="#06b6d4" filter="url(#pulse-glow)">
            <animate
              attributeName="r"
              values="3;5;3"
              dur="2.7s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;0.8;0.6"
              dur="2.7s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="900" cy="400" r="3" fill="#00DC82" filter="url(#pulse-glow)">
            <animate
              attributeName="r"
              values="3;5;3"
              dur="2.4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;0.8;0.6"
              dur="2.4s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
        
        {/* Component pads */}
        <g opacity="0.2">
          <rect x="150" y="100" width="30" height="20" rx="2" fill="#3b82f6" />
          <rect x="450" y="220" width="30" height="20" rx="2" fill="#06b6d4" />
          <rect x="750" y="320" width="30" height="20" rx="2" fill="#00DC82" />
          <rect x="950" y="120" width="30" height="20" rx="2" fill="#8b5cf6" />
        </g>
        
        {/* Diagonal traces for more complexity */}
        <g opacity="0.25">
          <line
            x1="100"
            y1="100"
            x2="400"
            y2="200"
            stroke="#3b82f6"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="0;-8"
              dur="3s"
              repeatCount="indefinite"
            />
          </line>
          <line
            x1="600"
            y1="180"
            x2="900"
            y2="280"
            stroke="#06b6d4"
            strokeWidth="1.5"
            strokeDasharray="5 5"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="0;-10"
              dur="3.5s"
              repeatCount="indefinite"
            />
          </line>
          <line
            x1="300"
            y1="400"
            x2="600"
            y2="300"
            stroke="#00DC82"
            strokeWidth="1.5"
            strokeDasharray="6 3"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="0;-9"
              dur="4s"
              repeatCount="indefinite"
            />
          </line>
        </g>
      </svg>
      
      {/* Animated gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-accent/5 pcb-gradient-float" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-accent-3/5 pcb-gradient-float" style={{ animationDelay: '1s' }} />
    </div>
  );
}

