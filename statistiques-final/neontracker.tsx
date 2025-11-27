
import React, { useEffect, useRef, useState } from 'react';
import { TrackerProps } from '../types';
import { Zap, Flame, Target, TrendingUp, Award, Shield, Repeat, Layers, Crosshair, Info, X } from 'lucide-react';

export const NeonTrackerV7: React.FC<TrackerProps> = ({ score, sessions, sets, status }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showInfo, setShowInfo] = useState(false);
  
  const animState = useRef({
    sessions: 0,
    sets: 0,
    score: 0,
    rotation: 0,
    pulse: 0,
  });

  const particles = useRef<Array<{x: number, y: number, r: number, speed: number, angle: number, dist: number}>>([]);

  // Mock Data for the Grid (Photo 1 replication)
  const statsGrid = [
      { label: 'HRV', value: '72ms', icon: Zap, color: 'cyan' },
      { label: 'KCAL', value: '3420', icon: Flame, color: 'orange' },
      { label: 'FOCUS', value: '94%', icon: Target, color: 'purple' },
      { label: 'LOAD', value: '68%', icon: TrendingUp, color: 'green' },
      { label: 'RANK', value: '#12', icon: Award, color: 'yellow' },
      { label: 'RECO', value: '88%', icon: Shield, color: 'blue' },
  ];

  // --- CANVAS INITIALIZATION ---
  useEffect(() => {
    if (particles.current.length === 0) {
        for(let i=0; i<40; i++) {
            particles.current.push({
                x: 0, y: 0,
                r: Math.random() * 1.5,
                speed: 0.005 + Math.random() * 0.01,
                angle: Math.random() * Math.PI * 2,
                dist: 0.4 + Math.random() * 0.5,
            });
        }
    }
  }, []);

  // --- CANVAS RENDER LOOP ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationId: number;

    const handleResize = () => {
      if (!containerRef.current || !canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = containerRef.current.getBoundingClientRect();
      const size = rect.width; 

      canvas.width = size * dpr;
      canvas.height = size * dpr; // Square aspect for the visualizer part
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize);
    setTimeout(handleResize, 0);

    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const draw = () => {
        if (!canvas) return;
        
        // Animation Physics
        const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;
        animState.current.sessions = lerp(animState.current.sessions, sessions.current / sessions.max, 0.05);
        animState.current.sets = lerp(animState.current.sets, sets.current / sets.max, 0.05);
        animState.current.score = lerp(animState.current.score, score / 100, 0.04);
        
        animState.current.rotation += 0.002;
        animState.current.pulse = (Math.sin(Date.now() / 500) + 1) * 0.5;

        const size = canvas.width / (window.devicePixelRatio || 1);
        const cx = size / 2;
        const cy = size / 2;
        const r = size * 0.40;

        ctx.clearRect(0, 0, size, size);
        // Use Screen blend mode for the "Neon/Laser" look
        ctx.globalCompositeOperation = 'screen';

        // 1. BACKGROUND GRID (Fighter Jet Style)
        ctx.save();
        ctx.strokeStyle = 'rgba(217, 70, 239, 0.1)'; // Pinkish grid
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Rotating geometric background
        for(let i=0; i<5; i++) {
            const rot = (i * Math.PI/2.5) + animState.current.rotation;
            ctx.ellipse(cx, cy, r*1.1, r*0.6, rot, 0, Math.PI * 2);
        }
        ctx.stroke();
        ctx.restore();

        // 2. RINGS (Distinct Gradients)
        const drawFighterRing = (radius: number, width: number, progress: number, hueStart: number, hueEnd: number) => {
            const startAngle = toRad(145);
            const totalAngle = toRad(250); // Slightly tighter arc
            const endAngle = startAngle + (totalAngle * progress);

            ctx.save();
            ctx.lineCap = 'round';
            
            // Define Gradients
            const gradient = ctx.createLinearGradient(cx - radius, cy, cx + radius, cy);
            gradient.addColorStop(0, `hsl(${hueStart}, 100%, 50%)`);
            gradient.addColorStop(1, `hsl(${hueEnd}, 100%, 60%)`);

            // Track (Darker background)
            ctx.beginPath();
            ctx.arc(cx, cy, radius, startAngle, startAngle + totalAngle);
            ctx.lineWidth = width;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.stroke();
            
            // Glowing Stroke
            ctx.shadowBlur = 20;
            ctx.shadowColor = `hsl(${hueEnd}, 100%, 50%)`;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, startAngle, endAngle);
            ctx.lineWidth = width;
            ctx.strokeStyle = gradient;
            ctx.stroke();
            
            // Inner White Core (The "Tube" effect)
            ctx.shadowBlur = 5;
            ctx.lineWidth = width * 0.3;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.stroke();

            ctx.restore();
        };

        // Outer Ring (Deep Indigo/Violet) -> Matches FREQ Badge (DISTINCT FROM PINK)
        drawFighterRing(r * 1.0, size * 0.035, animState.current.sessions, 240, 260); 
        
        // Middle Ring (Hot Pink/Fuchsia) -> Matches VOL Badge
        drawFighterRing(r * 0.85, size * 0.035, animState.current.sets, 310, 340); 
        
        // Inner Ring (Gold/Amber) -> Matches Score
        drawFighterRing(r * 0.70, size * 0.035, animState.current.score, 30, 50); 

        // 3. PARTICLES (Floating dust)
        ctx.save();
        particles.current.forEach(p => {
            p.angle += p.speed;
            const xRadius = r * 0.8 * p.dist;
            const yRadius = r * 0.8 * p.dist;
            
            const px = cx + Math.cos(p.angle) * xRadius;
            const py = cy + Math.sin(p.angle) * yRadius;
            
            const scale = 0.5 + (Math.sin(p.angle * 2) + 1) * 0.5;
            ctx.beginPath();
            ctx.arc(px, py, p.r * scale, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${scale * 0.8})`; 
            ctx.fill();
        });
        ctx.restore();

        animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationId);
    };
  }, [sessions, sets, score]);

  return (
    // SHELL: Black & Sleek (Photo 2 Style)
    <div className="relative w-full max-w-md bg-[#020202] border border-white/10 rounded-3xl flex flex-col overflow-hidden shadow-2xl transition-all hover:border-white/20 group">
      
      {/* --- PART 1: VISUALIZER (FIGHTER HUD - Photo 2) --- */}
      {/* Increased Height to 440px */}
      <div className="relative h-[440px] w-full bg-gradient-to-b from-[#050505] to-[#020202] border-b border-white/10">
         
         {/* Header Overlay */}
         <div className="absolute top-0 left-0 w-full p-5 flex justify-between items-center z-20">
             <div className="flex items-center gap-2">
                 <Crosshair className="text-cyan-400 animate-spin-slow" size={20} />
                 <h2 className="font-display font-bold text-white tracking-[0.2em] uppercase text-lg">FIGHTER.HUD</h2>
             </div>
             
             {/* INFO BUTTON */}
             <div className="flex gap-2">
                 <button 
                    onClick={() => setShowInfo(!showInfo)}
                    className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 hover:bg-white/10 transition-colors"
                 >
                    {showInfo ? <X size={14} /> : <Info size={14} />}
                 </button>
                 <div className="px-3 py-1 border border-green-500/50 bg-green-500/10 text-green-400 text-[10px] font-black tracking-widest rounded uppercase animate-pulse flex items-center">
                     READY
                 </div>
             </div>
         </div>
         <div className="absolute top-12 left-5 z-20 flex items-center gap-2">
             <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
             <span className="text-[10px] text-cyan-400 font-mono font-bold tracking-widest">LIVE TELEMETRY</span>
         </div>

         {/* Canvas Container - Added pt-12 */}
         <div className="absolute inset-0 flex items-center justify-center pt-12" ref={containerRef}>
             <canvas ref={canvasRef} className="w-full h-full relative z-10" style={{ mixBlendMode: 'screen' }} />
         </div>

         {/* Center Data (TARGET LOCKED) */}
         <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none pt-12">
            <div className="flex flex-col items-center justify-center mt-4">
                <div className="text-[10px] text-white font-black tracking-[0.4em] mb-1 uppercase drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] animate-pulse">
                    TARGET LOCKED
                </div>
                {/* BIG NUMBER (Gold/Yellow Gradient) */}
                <div className="text-8xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 to-yellow-500 drop-shadow-[0_0_25px_rgba(234,179,8,0.5)] tracking-tighter leading-none">
                    {Math.round(score)}
                </div>
                <div className="h-1 w-16 bg-cyan-500 rounded-full mt-4 shadow-[0_0_10px_#06b6d4]"></div>
            </div>
         </div>

         {/* Floating Badges */}
         {/* Left Badge - FREQ (Deep Indigo/Violet) */}
         <div className="absolute top-[55%] left-4 -translate-y-1/2 z-30">
             <div className="bg-[#0f0a1a] border border-indigo-500/40 p-3 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.2)] flex flex-col items-center w-20 backdrop-blur-sm">
                 <div className="text-[9px] font-bold text-indigo-400 mb-1 flex items-center gap-1"><Repeat size={10}/> FREQ</div>
                 <div className="text-2xl font-display font-bold text-white leading-none">
                     {sessions.current}<span className="text-[10px] text-gray-500 font-mono">/{sessions.max}</span>
                 </div>
             </div>
         </div>
         {/* Right Badge - VOL (Hot Pink/Fuchsia) */}
         <div className="absolute top-[55%] right-4 -translate-y-1/2 z-30">
             <div className="bg-[#1a0b1a] border border-fuchsia-500/40 p-3 rounded-xl shadow-[0_0_20px_rgba(217,70,239,0.2)] flex flex-col items-center w-20 backdrop-blur-sm">
                 <div className="text-[9px] font-bold text-fuchsia-400 mb-1 flex items-center gap-1"><Layers size={10}/> VOL</div>
                 <div className="text-2xl font-display font-bold text-white leading-none">
                     {sets.current}<span className="text-[10px] text-gray-500 font-mono">/{sets.max}</span>
                 </div>
             </div>
         </div>

         {/* --- INFO OVERLAY (Shows on button click) --- */}
         {showInfo && (
             <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex flex-col justify-center items-center p-8 animate-fade-in text-center">
                 <h3 className="text-xl font-display font-bold text-white mb-6 tracking-widest border-b border-white/20 pb-2">LEGEND</h3>
                 
                 <div className="space-y-6 w-full">
                     <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-full border-4 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] flex items-center justify-center">
                             <Repeat size={20} className="text-indigo-400"/>
                         </div>
                         <div className="text-left">
                             <div className="text-indigo-400 font-bold text-sm tracking-wider">FREQUENCY</div>
                             <div className="text-[10px] text-gray-400">Weekly Sessions / Goal</div>
                         </div>
                     </div>

                     <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-full border-4 border-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.5)] flex items-center justify-center">
                             <Layers size={20} className="text-fuchsia-400"/>
                         </div>
                         <div className="text-left">
                             <div className="text-fuchsia-400 font-bold text-sm tracking-wider">VOLUME</div>
                             <div className="text-[10px] text-gray-400">Total Sets / Capacity</div>
                         </div>
                     </div>

                     <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-full border-4 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)] flex items-center justify-center">
                             <Target size={20} className="text-yellow-400"/>
                         </div>
                         <div className="text-left">
                             <div className="text-yellow-400 font-bold text-sm tracking-wider">INTENSITY</div>
                             <div className="text-[10px] text-gray-400">Global Performance Score</div>
                         </div>
                     </div>
                 </div>
             </div>
         )}
      </div>

      {/* --- PART 2: DATA GRID (PHOTO 1) --- */}
      <div className="bg-[#080808] p-5 border-t border-white/5 relative z-10">
          {/* Grid 3x2 */}
          <div className="grid grid-cols-3 gap-3 mb-6">
              {statsGrid.map((stat, i) => (
                  <GridCard key={i} stat={stat} />
              ))}
          </div>

          {/* XP BAR (Photo 1 Style) */}
          <div className="relative pt-1">
              <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold text-cyan-400 tracking-widest uppercase">XP LEVEL 24</span>
                  <span className="text-[10px] font-mono text-gray-500">1850 / 2500</span>
              </div>
              <div className="h-2 w-full bg-[#1a1a1a] rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 w-[75%] shadow-[0_0_15px_rgba(6,182,212,0.6)]"></div>
              </div>
          </div>
      </div>

    </div>
  );
};

// --- SUB COMPONENT: GRID CARD ---
const GridCard = ({ stat }: any) => {
    // Colors mapped from Photo 1
    const styles: any = {
        cyan:   { border: 'border-cyan-500/40', text: 'text-cyan-400', shadow: 'shadow-[0_0_15px_rgba(6,182,212,0.1)]' },
        orange: { border: 'border-orange-500/40', text: 'text-orange-400', shadow: 'shadow-[0_0_15px_rgba(249,115,22,0.1)]' },
        purple: { border: 'border-purple-500/40', text: 'text-purple-400', shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.1)]' },
        green:  { border: 'border-green-500/40', text: 'text-green-400', shadow: 'shadow-[0_0_15px_rgba(34,197,94,0.1)]' },
        yellow: { border: 'border-yellow-500/40', text: 'text-yellow-400', shadow: 'shadow-[0_0_15px_rgba(234,179,8,0.1)]' },
        blue:   { border: 'border-blue-500/40', text: 'text-blue-400', shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.1)]' },
    };
    
    const s = styles[stat.color];

    return (
        <div className={`
            flex flex-col items-center justify-center p-3 rounded-xl border bg-[#0a0a0a] transition-all hover:-translate-y-1
            ${s.border} ${s.shadow}
        `}>
            <div className={`mb-2 ${s.text} opacity-90`}><stat.icon size={16} /></div>
            <div className="text-xl font-display font-bold text-white leading-none mb-1">{stat.value}</div>
            <div className={`text-[9px] font-black uppercase tracking-widest opacity-60 ${s.text}`}>{stat.label}</div>
        </div>
    );
};
