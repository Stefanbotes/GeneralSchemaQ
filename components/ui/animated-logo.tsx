
// Animated logo component matching the original design
import { memo } from 'react';

interface AnimatedLogoProps {
  className?: string;
}

export const AnimatedLogo = memo(function AnimatedLogo({ className = "w-32 h-32" }: AnimatedLogoProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="-150 -150 300 300" 
      className={className}
    >
      <defs>
        <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#E85A5A', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#E85A5A', stopOpacity: 0 }} />
        </linearGradient>
        <linearGradient id="yellowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#FFE66D', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#FFE66D', stopOpacity: 0 }} />
        </linearGradient>
        <linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#45C1B8', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#45C1B8', stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      
      {/* First orbit */}
      <g transform="rotate(0)">
        <ellipse 
          rx="100" 
          ry="50" 
          stroke="url(#redGradient)" 
          fill="none" 
          strokeWidth="2"
        />
        <circle r="4" fill="#E85A5A">
          <animateMotion dur="3s" repeatCount="indefinite">
            <mpath href="#orbit1" />
          </animateMotion>
        </circle>
      </g>

      {/* Second orbit */}
      <g transform="rotate(120)">
        <ellipse 
          rx="100" 
          ry="50" 
          stroke="url(#yellowGradient)" 
          fill="none" 
          strokeWidth="2"
        />
        <circle r="4" fill="#FFE66D">
          <animateMotion dur="3s" repeatCount="indefinite">
            <mpath href="#orbit2" />
          </animateMotion>
        </circle>
      </g>

      {/* Third orbit */}
      <g transform="rotate(240)">
        <ellipse 
          rx="100" 
          ry="50" 
          stroke="url(#tealGradient)" 
          fill="none" 
          strokeWidth="2"
        />
        <circle r="4" fill="#45C1B8">
          <animateMotion dur="3s" repeatCount="indefinite">
            <mpath href="#orbit3" />
          </animateMotion>
        </circle>
      </g>

      {/* Animation paths */}
      <path 
        id="orbit1" 
        d="M-100,0 A100,50 0 1,1 100,0 A100,50 0 1,1 -100,0" 
        fill="none" 
        stroke="none" 
      />
      <path 
        id="orbit2" 
        d="M-100,0 A100,50 0 1,1 100,0 A100,50 0 1,1 -100,0" 
        fill="none" 
        stroke="none" 
      />
      <path 
        id="orbit3" 
        d="M-100,0 A100,50 0 1,1 100,0 A100,50 0 1,1 -100,0" 
        fill="none" 
        stroke="none" 
      />
    </svg>
  );
});
