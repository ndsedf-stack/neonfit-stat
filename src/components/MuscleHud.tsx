

import React, { useMemo, useState, useEffect } from 'react';
import { Dumbbell, Activity, TrendingUp, Maximize2, Zap, RefreshCw, Cpu } from 'lucide-react';

interface MuscleData {
  id: string;
  name: string;
  sets: number;
  volume: number;
  type: 'primary' | 'secondary';
  normalized: number; // 0 to 1 for the chart
  intensity: number; // 0-10
  recovery: number; // 0-100%
}

// Données enrichies pour le mode Cockpit
const MUSCLES: MuscleData[] = [
  { id: '1', name: 'PECS', sets: 12, volume: 2101, type: 'primary', normalized: 0.9, intensity: 8.5, recovery: 45 },
  { id: '2', name: 'DOS', sets: 16, volume: 2341, type: 'primary', normalized: 1.0, intensity: 9.2, recovery: 80 },
  { id: '3', name: 'JAMBES', sets: 14, volume: 2333, type: 'primary', normalized: 0.95, intensity: 9.5, recovery: 30 },
  { id: '4', name: 'EPAULES', sets: 10, volume: 3151, type: 'primary', normalized: 0.85, intensity: 7.8, recovery: 90 },
  { id: '5', name: 'BRAS', sets: 8, volume: 3015, type: 'primary', normalized: 0.8, intensity: 8.0, recovery: 95 },
  { id: '6', name: 'ABS', sets: 6, volume: 800, type: 'secondary', normalized: 0.6, intensity: 6.0, recovery: 100 },
];

export const MuscleHud: React.FC = () => {
  // --- STATE ---
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleData>(MUSCLES[1]); // Default to DOS
  const [hoveredMuscleId, setHoveredMuscleId] = useState<string | null>(null);
  const [buildFactor, setBuildFactor] = useState(0); // Animation progress 0 -> 1

  // --- ANIMATION ON MOUNT ---
  useEffect(() => {
    let start = 0;
    const animate = () => {
      start += 0.02; // Speed of deployment
      if (start >= 1) {
        setBuildFactor(1);
      } else {
        setBuildFactor(Math.pow(start, 0.5)); // Ease out effect
        requestAnimationFrame(animate);
      }
    };
    animate();
  }, []);

  // --- RADAR CHART MATH ---
  const size = 300;
  const center = size / 2;
  const radius = (size / 2) - 50; // More padding for complex labels
  const angleStep = (Math.PI * 2) / MUSCLES.length;

  // Helper to get coordinates
  const getCoordinates = (index: number, value: number) => {
    const angle = index * angleStep - Math.PI / 2;
    // Apply buildFactor to 'value' to animate growing from center
    const r = radius * value * buildFactor; 
    const x = center + Math.cos(angle) * r;
    const y = center + Math.sin(angle) * r;
    return { x, y, angle };
  };

  // Polygon Points (The Shape)
  const polygonPoints = useMemo(() => {
    return MUSCLES.map((m, i) => {
      const { x, y } = getCoordinates(i, m.normalized);
      return `${x},${y}`;
    }).join(' ');
  }, [buildFactor]);

  // Grid Points (The Web)
  const getWebPoints = (factor: number) => {
    return MUSCLES.map((_, i) => {
      // Static grid doesn't animate with buildFactor
      const angle = i * angleStep - Math.PI / 2;
      const r = radius * factor;
      const x = center + Math.cos(angle) * r;
      const y = center + Math.sin(angle) * r;
      return `${x},${y}`;
    }).join(' ');
  };

  return (
    // Note: Removed overflow-hidden from root to allow tooltips to pop out
    <div className="relative w-full max-w-md bg-black border-[2px] border-white/10 rounded-3xl shadow-2xl flex flex-col h-full min-h-[550px] transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_50px_rgba(0,0,0,0.5)] z-20">
      
      {/* HEADER */}
      <div className="bg-[#050505] p-5 border-b border-white/10 flex justify-between items-center z-10 shrink-0 rounded-t-3xl">
        <div>
          <h2 className="text-xl font-display font-black text-white tracking-widest uppercase flex items-center gap-2">
            <Cpu className="text-cyan-400" size={20} />
            BIO-METRICS
          </h2>
          <p className="text-[10px] text-gray-400 font-mono font-bold mt-1">VOLUME DISTRIBUTION ANALYSIS</p>
        </div>
        <div className="flex gap-2">
             <div className="px-2 py-1 bg-white/5 rounded border border-white/10 text-[10px] text-gray-400 font-mono">
                {MUSCLES.length} ZONES
             </div>
        </div>
      </div>

      {/* CHART CONTAINER */}
      {/* Note: overflow is VISIBLE here for labels, but background effects are masked inside absolute div */}
      <div className="relative flex-1 bg-[#020202] flex items-center justify-center p-4 group/chart">
        
        {/* Background FX (Masked) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-transparent to-transparent opacity-60"></div>
             <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
             {/* Scanline */}
             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-[10px] w-full animate-scan pointer-events-none"></div>
        </div>

        {/* --- SVG LAYER --- */}
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full max-h-[400px] overflow-visible relative z-10">
          <defs>
            <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* GRID: Concentric Polygons */}
          {[0.25, 0.5, 0.75, 1].map((factor, i) => (
            <polygon
              key={`grid-${i}`}
              points={getWebPoints(factor)}
              fill="none"
              stroke={i === 3 ? "rgba(255,255,255,0.2)" : "rgba(255, 255, 255, 0.05)"}
              strokeWidth={i === 3 ? "1.5" : "1"}
              strokeDasharray={i !== 3 ? "4 4" : ""}
            />
          ))}

          {/* AXIS LINES */}
          {MUSCLES.map((_, i) => {
            const { x, y } = getCoordinates(i, 1); // Get outer rim coord
            return (
              <line
                key={`axis-${i}`}
                x1={center} y1={center} x2={x} y2={y}
                stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1"
              />
            );
          })}

          {/* DATA POLYGON (Animated) */}
          <polygon
            points={polygonPoints}
            fill="url(#radarGradient)"
            stroke="#22d3ee"
            strokeWidth="3"
            filter="url(#glow)"
            className="drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all duration-300"
            // Adding a stroke dash array animation for the "drawing" effect
            strokeDasharray="1000"
            strokeDashoffset={1000 * (1 - buildFactor)}
          />

          {/* INTERACTIVE POINTS */}
          {MUSCLES.map((muscle, i) => {
            const { x, y } = getCoordinates(i, muscle.normalized);
            const isHovered = hoveredMuscleId === muscle.id;
            const isSelected = selectedMuscle.id === muscle.id;

            return (
              <g 
                key={`point-${i}`} 
                onMouseEnter={() => setHoveredMuscleId(muscle.id)}
                onMouseLeave={() => setHoveredMuscleId(null)}
                onClick={() => setSelectedMuscle(muscle)}
                className="cursor-pointer"
              >
                {/* Hitbox (invisible larger circle) */}
                <circle cx={x} cy={y} r="20" fill="transparent" />
                
                {/* Visible Point */}
                <circle
                  cx={x} cy={y}
                  r={isHovered || isSelected ? 6 : 3}
                  fill={muscle.type === 'primary' ? 'white' : '#94a3b8'}
                  stroke={isSelected ? '#facc15' : '#22d3ee'}
                  strokeWidth={isHovered || isSelected ? 3 : 2}
                  className="transition-all duration-300"
                />
                
                {/* Pulsing Ring on Selected */}
                {isSelected && (
                    <circle cx={x} cy={y} r="12" fill="none" stroke="#facc15" strokeWidth="1" opacity="0.5">
                        <animate attributeName="r" from="6" to="25" dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.8" to="0" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                )}
              </g>
            );
          })}
        </svg>

        {/* --- HTML LABELS LAYER (Overlay) --- */}
        {MUSCLES.map((muscle, i) => {
           // Calculate static position for labels
           const angle = i * angleStep - Math.PI / 2;
           // Push labels slightly further out
           const labelRadius = radius + 35; 
           const lx = center + Math.cos(angle) * labelRadius;
           const ly = center + Math.sin(angle) * labelRadius;
           
           const leftPct = (lx / size) * 100;
           const topPct = (ly / size) * 100;

           const isPrimary = muscle.type === 'primary';
           const isHovered = hoveredMuscleId === muscle.id;
           const isSelected = selectedMuscle.id === muscle.id;

           return (
             <div
                key={`label-${i}`}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-50 flex flex-col items-center group/label cursor-pointer`}
                style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                onMouseEnter={() => setHoveredMuscleId(muscle.id)}
                onMouseLeave={() => setHoveredMuscleId(null)}
                onClick={() => setSelectedMuscle(muscle)}
             >
                {/* LABEL BOX */}
                <div className={`
                    flex items-center gap-1.5 px-2 py-1 rounded border backdrop-blur-md transition-all duration-300
                    ${isSelected 
                        ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400 scale-110 shadow-[0_0_15px_rgba(234,179,8,0.4)]' 
                        : isHovered
                            ? 'bg-cyan-500/10 border-cyan-400 text-white scale-105'
                            : isPrimary 
                                ? 'bg-black/80 border-white/20 text-gray-200' 
                                : 'bg-black/60 border-transparent text-gray-500 hover:text-gray-300'}
                `}>
                    {isPrimary && <Zap size={10} className={isSelected ? 'text-yellow-400' : 'text-cyan-400'} fill={isSelected ? "currentColor" : "none"}/>}
                    <span className="text-[10px] md:text-xs font-black tracking-wider whitespace-nowrap">{muscle.name}</span>
                </div>

                {/* TOOLTIP (Visible on Hover) - Now won't be clipped */}
                <div className={`
                    absolute top-full mt-2 bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-2xl w-max z-[100]
                    pointer-events-none transition-all duration-200 origin-top
                    ${isHovered ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2'}
                `}>
                    <div className="flex gap-4 text-[10px] font-mono">
                        <div>
                            <div className="text-gray-500 mb-0.5">VOL</div>
                            <div className="text-white font-bold text-lg leading-none">{muscle.volume}</div>
                            <div className="text-[8px] text-gray-600">KG</div>
                        </div>
                        <div className="w-px bg-white/10"></div>
                        <div>
                            <div className="text-gray-500 mb-0.5">SETS</div>
                            <div className="text-white font-bold text-lg leading-none">{muscle.sets}</div>
                            <div className="text-[8px] text-gray-600">REPS</div>
                        </div>
                    </div>
                </div>
             </div>
           )
        })}
      </div>

      {/* FOOTER - DYNAMIC STATS */}
      <div className="bg-[#080808] border-t border-white/10 shrink-0 rounded-b-3xl">
        <div className="grid grid-cols-3 divide-x divide-white/10">
            
            {/* Stat 1: Intensity */}
            <div className="p-4 flex flex-col items-center justify-center hover:bg-white/5 transition-colors cursor-default">
                 <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Activity size={12} /> INTENSITÉ
                 </div>
                 <div className={`text-2xl font-display font-black leading-none ${selectedMuscle.intensity > 8 ? 'text-red-500' : 'text-white'}`}>
                    {selectedMuscle.intensity}<span className="text-sm text-gray-600">/10</span>
                 </div>
            </div>

            {/* Stat 2: Name & Volume (Center) */}
            <div className="p-4 flex flex-col items-center justify-center bg-white/5 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-cyan-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                 <div className="text-xs text-cyan-400 font-black uppercase tracking-[0.2em] mb-1 relative z-10">
                    {selectedMuscle.name}
                 </div>
                 <div className="text-xl font-display font-black text-white relative z-10">
                    {selectedMuscle.volume.toLocaleString()} <span className="text-sm font-sans text-gray-500 font-medium">KG</span>
                 </div>
            </div>

            {/* Stat 3: Recovery */}
            <div className="p-4 flex flex-col items-center justify-center hover:bg-white/5 transition-colors cursor-default">
                 <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                    <RefreshCw size={12} /> RECOVERY
                 </div>
                 <div className={`text-2xl font-display font-black leading-none ${selectedMuscle.recovery < 50 ? 'text-orange-500' : 'text-emerald-500'}`}>
                    {selectedMuscle.recovery}%
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};
