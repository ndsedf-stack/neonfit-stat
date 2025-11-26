
import React, { useState, useEffect } from 'react';
import { Zap, Activity, Battery, ChevronRight } from 'lucide-react';

interface ZoneData {
  id: string;
  label: string;
  range: string; // e.g. "1-5 Reps"
  percent: number; // 0-100
  sets: number;
  color: string;
  shadow: string;
}

const ZONES: ZoneData[] = [
  { 
    id: 'force', 
    label: 'FORCE', 
    range: '1-5 RM', 
    percent: 15, 
    sets: 6,
    color: 'bg-amber-500', 
    shadow: 'shadow-amber-500/50'
  },
  { 
    id: 'hyper', 
    label: 'HYPERTROPHIE', 
    range: '6-12 RM', 
    percent: 65, 
    sets: 28,
    color: 'bg-violet-500', 
    shadow: 'shadow-violet-500/50'
  },
  { 
    id: 'endu', 
    label: 'ENDURANCE', 
    range: '15+ RM', 
    percent: 20, 
    sets: 11,
    color: 'bg-cyan-500', 
    shadow: 'shadow-cyan-500/50'
  },
];

export const IntensityZones: React.FC = () => {
  const [active, setActive] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setActive(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full max-w-md bg-black border-[2px] border-white/10 rounded-3xl flex flex-col transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_50px_rgba(0,0,0,0.5)] z-20 overflow-hidden group min-h-[400px]">
      
      {/* HEADER */}
      <div className="bg-[#050505] px-6 py-5 border-b border-white/10 flex justify-between items-center z-10 shrink-0">
         <div>
            <h2 className="font-display font-black text-white tracking-widest flex items-center gap-2 uppercase">
                <Battery className="text-cyan-400 -rotate-90" size={20} />
                POWER DIST.
            </h2>
            <p className="text-[10px] text-gray-400 font-mono font-bold mt-1">CAPACITEURS D'INTENSITÉ</p>
         </div>
         <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]"></div>
         </div>
      </div>

      {/* BODY */}
      <div className="flex-1 bg-[#020202] p-6 flex flex-col justify-center gap-6 relative">
         {/* Background Decoration */}
         <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
         
         {ZONES.map((zone, index) => {
            const isSelected = selectedZone === zone.id;
            
            return (
                <div 
                    key={zone.id} 
                    className="relative group/bar cursor-pointer"
                    onMouseEnter={() => setSelectedZone(zone.id)}
                    onMouseLeave={() => setSelectedZone(null)}
                >
                    {/* Top Labels */}
                    <div className="flex justify-between items-end mb-2">
                        <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-sm ${zone.color} ${zone.shadow} shadow-[0_0_8px_currentColor]`}></div>
                            <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                                {zone.label}
                            </span>
                        </div>
                        <span className="text-[10px] font-mono text-gray-400">{zone.range}</span>
                    </div>

                    {/* THE BAR CONTAINER */}
                    <div className="h-10 w-full bg-[#080808] border border-white/5 rounded flex p-1 relative overflow-hidden">
                        {/* Grid Pattern inside empty bar */}
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:10px_100%]"></div>
                        
                        {/* THE FILL BAR (Segmented look via CSS mask or just distinct div) */}
                        <div 
                            className={`h-full rounded-sm transition-all duration-1000 ease-out relative overflow-hidden flex items-center ${zone.color}`}
                            style={{ width: active ? `${zone.percent}%` : '0%' }}
                        >
                             {/* Scanline effect */}
                             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]"></div>
                             
                             {/* Segment Lines (Overlay) */}
                             <div className="absolute inset-0 w-full h-full bg-[repeating-linear-gradient(90deg,transparent,transparent_4px,rgba(0,0,0,0.8)_4px,rgba(0,0,0,0.8)_5px)]"></div>
                        </div>

                        {/* Value Text (Right aligned inside or outside) */}
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <span className={`text-xl font-display font-black z-10 drop-shadow-md ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                                {zone.percent}%
                            </span>
                        </div>
                    </div>
                </div>
            );
         })}
      </div>

      {/* FOOTER DETAILS */}
      <div className="bg-[#080808] border-t border-white/10 shrink-0 h-16 relative">
          {/* Animated Detail View */}
          <div className="absolute inset-0 flex items-center justify-between px-6">
              {selectedZone ? (
                  <>
                    <div className="flex flex-col animate-slideIn">
                        <span className="text-[9px] text-gray-500 uppercase font-bold">Volume Sets</span>
                        <span className="text-xl font-display font-bold text-white">
                            {ZONES.find(z => z.id === selectedZone)?.sets} <span className="text-sm text-gray-600">SÉRIES</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-cyan-400 animate-pulse">
                        <Activity size={14} />
                        <span className="text-[9px] font-bold">ANALYZING</span>
                    </div>
                  </>
              ) : (
                 <div className="w-full flex justify-center items-center text-[10px] text-gray-600 font-mono tracking-widest animate-pulse">
                     // SYSTEM READY //
                 </div>
              )}
          </div>
      </div>

    </div>
  );
};
