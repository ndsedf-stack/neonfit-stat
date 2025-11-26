

import React, { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';

interface WeekData {
  id: string;
  label: string;
  volume: number;
  intensity: number;
  status: 'completed' | 'current' | 'upcoming';
  x: number; // Position X en % (0-100)
  y: number; // Position Y en % (0-100)
}

// Configuration des positions pour créer la SPIRALE visible sur votre image
// Centre (Score) est à 50, 50.
const WEEKS_DATA: WeekData[] = [
  { id: 'w1', label: 'S1', volume: 28000, intensity: 75, status: 'completed', x: 60, y: 38 }, // Haut Droite (Intérieur)
  { id: 'w2', label: 'S2', volume: 29500, intensity: 78, status: 'completed', x: 75, y: 55 }, // Droite (Milieu)
  { id: 'w3', label: 'S3', volume: 27800, intensity: 72, status: 'current', x: 60, y: 75 }, // Bas Droite (Extérieur)
  { id: 'w4', label: 'S4', volume: 31200, intensity: 80, status: 'upcoming', x: 35, y: 65 }, // Bas Gauche (Fin spirale)
];

export const WeeklyProgress: React.FC = () => {
  const [hoveredWeek, setHoveredWeek] = useState<string | null>(null);
  const [animReady, setAnimReady] = useState(false);

  useEffect(() => {
    // Petit délai pour lancer l'animation du trait après le montage
    setTimeout(() => setAnimReady(true), 100);
  }, []);

  // Génération du chemin SVG (Path)
  // On part du centre (50,50) -> S1 -> S2 -> S3 -> S4
  const points = WEEKS_DATA.map(w => `${w.x},${w.y}`);
  const pathData = `M 50,50 L ${points.join(' L ')}`;

  return (
    <div className="relative w-full max-w-md bg-black border-[2px] border-white/10 rounded-3xl flex flex-col h-full min-h-[550px] transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_50px_rgba(0,0,0,0.5)] z-20 overflow-hidden group">
      
      {/* 1. HEADER STANDARDISÉ */}
      <div className="bg-[#050505] px-6 py-4 border-b border-white/10 flex justify-between items-center z-10 shrink-0">
         <div>
            <h2 className="font-display font-bold text-white tracking-widest flex items-center gap-2 uppercase">
                <TrendingUp className="text-cyan-400" size={20} />
                PROGRESSION
            </h2>
            <p className="text-[10px] text-gray-400 font-mono font-bold mt-1">HEBDOMADAIRE</p>
         </div>
         <div className="flex gap-2">
             <div className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border border-white/10 bg-white/5 text-gray-400">
                CYCLE 1
             </div>
         </div>
      </div>

      {/* 2. BODY (VISUALISATION) */}
      <div className="flex-1 bg-[#020202] relative flex items-center justify-center p-4">
         
         {/* Background Grid & Rings */}
         <div className="absolute inset-0 pointer-events-none">
            {/* Radial Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-cyan-900/10 blur-[60px] rounded-full"></div>
            {/* Concentric Rings (Cible) */}
            {[25, 45, 65, 85].map((size, i) => (
                <div key={i} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" 
                     style={{ width: `${size}%`, height: `${size}%` }}></div>
            ))}
            {/* Crosshairs */}
            <div className="absolute top-1/2 left-0 w-full h-px bg-white/5"></div>
            <div className="absolute left-1/2 top-0 h-full w-px bg-white/5"></div>
         </div>

         {/* --- SVG LAYER (LIGNE) --- */}
         <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="#22d3ee" stopOpacity="1" />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.2" />
                </linearGradient>
                <filter id="glowLine">
                    <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            
            {/* Ligne fantôme (Track) */}
            <path d={pathData} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

            {/* Ligne Active (Animée) */}
            <path 
                d={pathData} 
                fill="none" 
                stroke="url(#lineGrad)" 
                strokeWidth="1"
                filter="url(#glowLine)"
                strokeDasharray="200"
                strokeDashoffset={animReady ? "0" : "200"}
                className="transition-all duration-[2000ms] ease-out"
            />
         </svg>

         {/* --- HTML LAYER (BADGES & NOEUDS) --- */}
         <div className="absolute inset-0 z-20 w-full h-full">
            
            {/* CENTRE : SCORE */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-20 h-20 rounded-full bg-[#050505] border-2 border-cyan-500/30 shadow-[0_0_30px_rgba(34,211,238,0.15)] z-10">
                 <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-0.5">SCORE</div>
                 <div className="text-3xl font-display font-black text-white leading-none drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                    35
                 </div>
                 <div className="text-[7px] text-cyan-400 font-mono mt-0.5">/ 100</div>
            </div>

            {/* NOEUDS S1-S4 */}
            {WEEKS_DATA.map((week) => {
                const isHovered = hoveredWeek === week.id;
                const isCurrent = week.status === 'current';
                
                // Positionnement des badges pour éviter qu'ils ne se chevauchent avec le centre
                // Si x > 50 (droite), on met le badge à droite. Si y > 50 (bas), on met le badge en bas.
                let translateClass = '';
                if (week.x > 50 && week.y < 50) translateClass = 'translate-x-2 -translate-y-full'; // Haut Droite
                else if (week.x > 50 && week.y >= 50) translateClass = 'translate-x-2 translate-y-2'; // Bas Droite
                else if (week.x <= 50 && week.y >= 50) translateClass = '-translate-x-full translate-y-2'; // Bas Gauche
                else translateClass = '-translate-x-full -translate-y-full'; // Haut Gauche

                const badgeBorder = isCurrent ? 'border-red-500' : 'border-cyan-500/30';
                const badgeText = isCurrent ? 'text-red-400' : 'text-cyan-400';
                const dotColor = isCurrent ? 'bg-red-500' : 'bg-cyan-400';

                return (
                    <div 
                        key={week.id}
                        className="absolute"
                        style={{ left: `${week.x}%`, top: `${week.y}%` }}
                        onMouseEnter={() => setHoveredWeek(week.id)}
                        onMouseLeave={() => setHoveredWeek(null)}
                    >
                        {/* Point sur la spirale */}
                        <div className="absolute -translate-x-1/2 -translate-y-1/2 group/node cursor-pointer">
                            <div className={`w-2.5 h-2.5 rounded-full ${dotColor} shadow-[0_0_10px_currentColor] relative z-10 transition-transform duration-300 group-hover/node:scale-150`}></div>
                            {isCurrent && <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-50"></div>}
                        </div>

                        {/* Badge Flottant */}
                        <div className={`absolute ${translateClass} transition-all duration-300 z-30 pointer-events-none ${isHovered ? 'scale-110' : 'scale-100'}`}>
                            <div className={`
                                bg-black/80 backdrop-blur-md border px-2 py-1.5 rounded-lg shadow-xl
                                flex flex-col min-w-[70px]
                                ${badgeBorder}
                            `}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className={`text-[8px] font-black uppercase px-1 rounded-sm ${isCurrent ? 'bg-red-500 text-black' : 'bg-white/10 text-white'}`}>
                                        {week.label}
                                    </span>
                                </div>
                                <div className="text-sm font-display font-bold text-white leading-none">
                                    {(week.volume / 1000).toFixed(1)}k
                                </div>
                                <div className={`text-[8px] font-mono mt-0.5 font-bold ${badgeText}`}>
                                    {week.intensity}% INT
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
         </div>
      </div>

      {/* 3. FOOTER GRID (IDENTIQUE AUX AUTRES MODULES) */}
      <div className="bg-[#080808] border-t border-white/10 shrink-0">
          <div className="grid grid-cols-4 divide-x divide-white/10">
              {WEEKS_DATA.map((week, i) => {
                  const isHovered = hoveredWeek === week.id;
                  const isCurrent = week.status === 'current';
                  
                  return (
                    <div 
                        key={i} 
                        className={`
                            p-2 py-3 flex flex-col items-center justify-center transition-colors cursor-pointer h-20
                            ${isHovered ? 'bg-white/10' : 'hover:bg-white/5'}
                            ${isCurrent ? 'bg-gradient-to-t from-red-500/10 to-transparent' : ''}
                        `}
                        onMouseEnter={() => setHoveredWeek(week.id)}
                        onMouseLeave={() => setHoveredWeek(null)}
                    >
                        <div className="text-[8px] font-black text-gray-500 uppercase tracking-wider mb-1">
                            SEM {i + 1}
                        </div>
                        <div className={`text-base font-display font-bold text-white leading-none mb-0.5`}>
                            {(week.volume / 1000).toFixed(1)}k
                        </div>
                        <div className={`text-[7px] font-mono font-bold ${isCurrent ? 'text-red-400' : 'text-cyan-400'}`}>
                            {week.intensity}% INT
                        </div>
                    </div>
                  )
              })}
          </div>
      </div>

    </div>
  );
};
