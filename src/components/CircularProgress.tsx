
import React, { useEffect, useState } from 'react';

interface CircularProgressProps {
  size: number;
  radius: number;
  strokeWidth: number;
  progress: number;
  max: number;
  colorStart: string;
  colorEnd: string;
  variant?: 'solid' | 'dashed' | 'dots';
  trackColor?: string;
  glow?: boolean;
  rotate?: boolean;
  counterClockwise?: boolean;
  cut?: number; // Degrees to cut from the circle (e.g. 90 for 270deg arc)
  rotationOffset?: number; // Starting rotation in degrees
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  size,
  radius,
  strokeWidth,
  progress,
  max,
  colorStart,
  colorEnd,
  variant = 'solid',
  trackColor = "rgba(255,255,255,0.05)",
  glow = false,
  rotate = false,
  counterClockwise = false,
  cut = 0,
  rotationOffset = 0,
}) => {
  const normalizedRadius = radius - strokeWidth / 2;
  const fullCircumference = normalizedRadius * 2 * Math.PI;
  // Calculate the actual visible length based on the 'cut'
  const visibleCircumference = fullCircumference * ((360 - cut) / 360);
  
  const [offset, setOffset] = useState(visibleCircumference);
  const id = React.useId();
  const gradientId = `grad-${id}`;

  const percentage = Math.min(100, Math.max(0, (progress / max) * 100));

  useEffect(() => {
    // Determine how much of the VISIBLE portion is filled
    const strokeLength = (percentage / 100) * visibleCircumference;
    const progressOffset = visibleCircumference - strokeLength;
    setOffset(progressOffset);
  }, [percentage, visibleCircumference]);


  // Dash calculations
  const dashCount = variant === 'dots' ? 40 : 60;
  const dashLength = visibleCircumference / dashCount;
  const dashGap = variant === 'dots' ? dashLength * 2 : 3; 
  
  // Track Dash Array: [VisibleLength, CutLength]
  const cutLength = fullCircumference - visibleCircumference;
  
  const trackDashArray = variant === 'dashed' || variant === 'dots'
    ? `${dashLength - dashGap} ${dashGap}` 
    : `${visibleCircumference} ${cutLength}`;

  const progressDashArray = variant === 'dashed' || variant === 'dots'
    ? `${dashLength - dashGap} ${dashGap}`
    : `${visibleCircumference} ${cutLength}`;

  return (
    <div 
        className={`absolute inset-0 flex items-center justify-center pointer-events-none 
        ${rotate ? (counterClockwise ? 'animate-spin-reverse-slow' : 'animate-spin-slow') : ''}`}
        style={{ transform: rotate ? undefined : `rotate(${rotationOffset}deg)` }}
    >
      <svg
        width={size}
        height={size}
        className="overflow-visible"
        style={{ width: size, height: size, transform: `rotate(-90deg)` }} // Start at top
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colorStart} />
            <stop offset="100%" stopColor={colorEnd} />
          </linearGradient>
          
          <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* 1. Track Background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={normalizedRadius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={trackDashArray} 
          className="opacity-100 transition-all duration-1000"
        />

        {/* 2. Progress Fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={normalizedRadius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={progressDashArray}
          strokeDashoffset={offset}
          style={{ 
            transition: 'stroke-dashoffset 1.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
            filter: glow ? `url(#glow-${id})` : undefined
          }}
        />
        
        {/* 3. Glossy Tip (Only for solid, uncut circles) */}
        {variant === 'solid' && cut === 0 && (
             <circle
             cx={size / 2}
             cy={size / 2}
             r={normalizedRadius}
             stroke="white"
             strokeWidth={1}
             fill="none"
             strokeDasharray={fullCircumference}
             strokeDashoffset={offset}
             className="opacity-50 mix-blend-overlay blur-[0.5px]"
             style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.2, 0.8, 0.2, 1)' }}
           />
        )}
      </svg>
    </div>
  );
};
