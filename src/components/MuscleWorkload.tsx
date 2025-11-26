
import React, { useState, useEffect, useMemo } from 'react';
import { Fan, Disc, Zap, Activity } from 'lucide-react';

interface MuscleData {
  id: string;
  name: string;
  volume: number; // Taille de la pale
  color: string;
}

const MUSCLES: MuscleData[] = [
  { id: 'm1', name: 'PECTORAUX', volume: 2101, color: '#22d3ee' }, // Cyan
  { id: 'm2', name: 'DOS', volume: 2341, color: '#3b82f6' },       // Blue
  { id: 'm3', name: 'JAMBES', volume: 2333, color: '#8b5cf6' },    // Violet
  { id: 'm4', name: 'EPAULES', volume: 3151, color: '#d946ef' },   // Fuschia
  { id: 'm5', name: 'BRAS', volume: 3015, color: '#f43f5e' },      // Rose
  { id: 'm6', name: 'ABDOS', volume: 1200, color: '#10b981' },     // Emerald
];

export const MuscleWorkload: React.FC = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [buildFactor, setBuildFactor] = useState(0);

  // Animation d'entrée : les pales poussent
  useEffect(() => {
    let frame = 0;
    const animate = () => {
      frame += 0.015;
      if (frame >= 1) {
        setBuildFactor(1);
      } else {
        setBuildFactor(1 - Math.pow(1 - frame, 3)); // Ease out cubic
        requestAnimationFrame(animate);
      }
    };
    animate();
  }, []);

  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const innerRadius = 40;
  const maxRadius = (size / 2) - 20;
  const availableDepth = maxRadius - innerRadius;

  // Calcul du max volume pour la mise à l'échelle
  const maxVol = Math.max(...MUSCLES.map(m => m.volume));

  // Angles
  const totalAngle = 360;
  const gap = 4; // Espace entre les pales en degrés
  const sectorAngle = (totalAngle / MUSCLES.length);
  const bladeWidth = sectorAngle - gap;

  // Math Helpers pour dessiner un arc de cercle (une pale)
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const describeBlade = (startAngle: number, endAngle: number, innerR: number, outerR: number) => {
    const start = polarToCartesian(cx, cy, outerR, endAngle);
    const end = polarToCartesian(cx, cy, outerR, startAngle);
    const startInner = polarToCartesian(cx, cy, innerR, endAngle);
    const endInner = polarToCartesian(cx, cy, innerR, startAngle);

    return [
      "M", startInner.x, startInner.y,
      "L", endInner.x, endInner.y,
      "L", end.x, end.y,
      "A", outerR, outerR, 0, 0, 0, start.x, start.y,
      "Z"
    ].join(" ");
  };

  // Infos centrales (Active ou par défaut le Leader)
  const activeMuscle = useMemo(() => {
      return MUSCLES.find(m => m.id === hoveredId) || MUSCLES.reduce((prev, current) => (prev.volume > current.volume) ? prev : current);
  }, [hoveredId]);

  return (
    <div className="relative w-full max-w-md bg-black border-[2px] border-white/10 rounded-3xl flex flex-col h-full min-h-[550px] transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_50px_rgba(0,0,0,0.5)] z-20 overflow-hidden group">
      
      {/* 1. HEADER */}
      <div className="bg-[#050505] px-6 py-5 border-b border-white/10 flex justify-between items-center z-10 shrink-0">
         <div>
            <h2 className="font-display font-black text-white tracking-widest flex items-center gap-2 uppercase">
                <Fan className="text-cyan-400 animate-spin-slow" size={20} />
                KINETIC LOAD
            </h2>
            <p className="text-[10px] text-gray-400 font-mono font-bold mt-1">DISTRIBUTION DE PUISSANCE</p>
         </div>
         <div className="flex gap-1">
            <div className="px-2 py-1 bg-white/5 rounded border border-white/10 text-[10px] text-cyan-400 font-mono font-bold animate-pulse">
                LIVE
            </div>
         </div>
      </div>

      {/* 2. BODY - TURBINE VISUALIZATION */}
      <div className="flex-1 bg-[#020202] relative flex items-center justify-center p-4 overflow-hidden">
         
         {/* Background Effects */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black pointer-events-none"></div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] border border-white/5 rounded-full opacity-30"></div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] border border-white/5 rounded-full opacity-20 border-dashed animate-spin-reverse-slow"></div>

         <svg 
            viewBox={`0 0 ${size} ${size}`} 
            className="w-full h-full max-h-[380px] overflow-visible relative z-10"
         >
            <defs>
                {MUSCLES.map(m => (
                    <linearGradient key={m.id} id={`grad-${m.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={m.color} stopOpacity="0.4" />
                        <stop offset="100%" stopColor={m.color} stopOpacity="1" />
                    </linearGradient>
                ))}
                <filter id="glow-blade">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>

            {/* --- TURBINE BLADES --- */}
            {/* Group wrapper for global rotation animation */}
            <g className={`origin-center transition-all duration-700 ${hoveredId ? '' : 'animate-spin-slow'}`} style={{ transformBox: 'fill-box' }}>
                {MUSCLES.map((muscle, i) => {
                    const startAngle = i * sectorAngle;
                    const endAngle = startAngle + bladeWidth;
                    
                    // Radius calculation based on volume + animation
                    const normalizedVol = muscle.volume / maxVol;
                    const targetRadius = innerRadius + (availableDepth * normalizedVol);
                    const currentRadius = innerRadius + ((targetRadius - innerRadius) * buildFactor);
                    
                    const isHovered = hoveredId === muscle.id;

                    return (
                        <g 
                            key={muscle.id}
                            onMouseEnter={() => setHoveredId(muscle.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            className="cursor-pointer transition-opacity duration-300"
                            style={{ opacity: hoveredId && !isHovered ? 0.3 : 1 }}
                        >
                            {/* The Blade Path */}
                            <path
                                d={describeBlade(startAngle, endAngle, innerRadius + 5, currentRadius)}
                                fill={`url(#grad-${muscle.id})`}
                                stroke="white"
                                strokeWidth={isHovered ? 2 : 0}
                                filter={isHovered ? "url(#glow-blade)" : undefined}
                                className="transition-all duration-300 ease-out"
                                style={{
                                    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                                    transformOrigin: 'center',
                                }}
                            />
                            {/* Decorative Line inside blade */}
                            {buildFactor > 0.8 && (
                                <path
                                    d={describeBlade(startAngle + bladeWidth/2 - 0.5, startAngle + bladeWidth/2 + 0.5, innerRadius + 10, currentRadius - 10)}
                                    fill="rgba(255,255,255,0.3)"
                                />
                            )}
                        </g>
                    );
                })}
            </g>

            {/* --- CENTER HUB (Dynamic Info) --- */}
            <g>
                {/* Hub Circle */}
                <circle cx={cx} cy={cy} r={innerRadius - 2} fill="#050505" stroke="#333" strokeWidth="2" />
                <circle cx={cx} cy={cy} r={innerRadius - 8} fill="none" stroke={activeMuscle.color} strokeWidth="2" strokeDasharray="4 2" className="animate-spin-slow origin-center" style={{ transformBox: 'fill-box' }}/>
                
                {/* Text Overlay (HTML absolute positionné au dessus serait mieux, mais SVG text marche aussi ici pour la simplicité de centrage) */}
                <foreignObject x={cx - innerRadius} y={cy - innerRadius} width={innerRadius * 2} height={innerRadius * 2}>
                    <div className="w-full h-full flex flex-col items-center justify-center text-center">
                        <div className="text-[8px] font-mono text-gray-500 mb-0.5 tracking-tighter">TARGET</div>
                        <div className="text-[10px] font-black text-white leading-none uppercase tracking-wide truncate w-full px-1">
                            {activeMuscle.name.substring(0, 4)}
                        </div>
                    </div>
                </foreignObject>
            </g>
         </svg>

         {/* STATS OVERLAY BOTTOM */}
         <div className="absolute bottom-4 left-0 w-full px-6 flex justify-between items-end pointer-events-none">
             <div className="flex flex-col">
                 <span className="text-[9px] text-gray-500 font-mono mb-1">SELECTED ZONE</span>
                 <span className="text-2xl font-display font-black text-white leading-none drop-shadow-md">
                    {activeMuscle.name}
                 </span>
             </div>
             <div className="flex flex-col items-end">
                 <span className="text-[9px] text-gray-500 font-mono mb-1">VOLUME LOAD</span>
                 <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-display font-black leading-none" style={{ color: activeMuscle.color }}>
                        {(activeMuscle.volume / 1000).toFixed(1)}
                    </span>
                    <span className="text-xs font-bold text-gray-400">k</span>
                 </div>
             </div>
         </div>
      </div>

      {/* 3. FOOTER */}
      <div className="bg-[#080808] border-t border-white/10 shrink-0 p-1">
          {/* Mini Legend */}
          <div className="flex justify-center gap-4 py-3 flex-wrap">
              {MUSCLES.slice(0, 4).map(m => (
                  <div key={m.id} className="flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity cursor-default">
                      <div className="w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]" style={{ backgroundColor: m.color }}></div>
                      <span className="text-[9px] font-bold text-gray-300 uppercase tracking-wide">{m.name}</span>
                  </div>
              ))}
              <div className="flex items-center gap-1.5 opacity-50">
                  <span className="text-[9px] font-bold text-gray-500">+2 OTHERS</span>
              </div>
          </div>
      </div>

    </div>
  );
};
