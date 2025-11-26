
import React, { useEffect, useRef } from 'react';
import { TrackerProps } from '../types';
import { Zap, Activity, Hexagon, BarChart3, Grip, Cpu } from 'lucide-react';

export const NeonTracker: React.FC<TrackerProps> = ({ score, sessions, sets, status }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Refs for animation values
  const progressRefs = useRef({
    sessions: 0,
    sets: 0,
    score: 0
  });

  const isOptimal = score > 80;

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
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize);
    setTimeout(handleResize, 0);

    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const createCarbonPattern = () => {
        const pCanvas = document.createElement('canvas');
        pCanvas.width = 8;
        pCanvas.height = 8;
        const pCtx = pCanvas.getContext('2d');
        if (pCtx) {
            pCtx.fillStyle = '#050505';
            pCtx.fillRect(0, 0, 8, 8);
            pCtx.fillStyle = '#111'; 
            pCtx.beginPath();
            pCtx.moveTo(0, 8);
            pCtx.lineTo(8, 0);
            pCtx.lineTo(8, 8);
            pCtx.fill();
        }
        return ctx.createPattern(pCanvas, 'repeat');
    };

    const draw = () => {
        if (!canvas) return;
        
        // Animation Lerp
        const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;
        progressRefs.current.sessions = lerp(progressRefs.current.sessions, sessions.current / sessions.max, 0.05);
        progressRefs.current.sets = lerp(progressRefs.current.sets, sets.current / sets.max, 0.05);
        progressRefs.current.score = lerp(progressRefs.current.score, score / 100, 0.05);

        const size = canvas.width / (window.devicePixelRatio || 1);
        const cx = size / 2;
        const cy = size / 2;
        const r = size * 0.42; 

        ctx.clearRect(0, 0, size, size);

        // 1. CHASSIS BACKGROUND
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetY = 20;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        const bezelGrad = ctx.createLinearGradient(0, 0, size, size);
        bezelGrad.addColorStop(0, '#1e293b');
        bezelGrad.addColorStop(0.5, '#0f172a');
        bezelGrad.addColorStop(1, '#020617');
        ctx.fillStyle = bezelGrad;
        ctx.fill();
        ctx.restore();

        // Carbon Face
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.95, 0, Math.PI * 2);
        const pattern = createCarbonPattern();
        if (pattern) ctx.fillStyle = pattern;
        ctx.fill();
        // Inner Vignette
        const vignette = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 0.95);
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.9)');
        ctx.fillStyle = vignette;
        ctx.fill();
        ctx.restore();

        // 2. RINGS
        // Speedometer style: 135deg to 405deg (270deg total span)
        const startAngle = toRad(135);
        const totalAngle = toRad(270);

        const drawRing = (radius: number, width: number, progress: number, color: string, glowColor: string, dashed = false) => {
            const endAngle = startAngle + (totalAngle * progress);
            ctx.lineCap = 'round';
            // Track
            ctx.beginPath();
            ctx.arc(cx, cy, radius, startAngle, startAngle + totalAngle);
            ctx.lineWidth = width;
            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            ctx.stroke();
            // Progress
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, radius, startAngle, endAngle);
            ctx.lineWidth = width;
            ctx.strokeStyle = color;
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 20;
            ctx.stroke();
            ctx.restore();
            // Tip
            if (progress > 0) {
                const tipX = cx + Math.cos(endAngle) * radius;
                const tipY = cy + Math.sin(endAngle) * radius;
                ctx.beginPath();
                ctx.arc(tipX, tipY, width/2, 0, Math.PI*2);
                ctx.fillStyle = '#fff';
                ctx.shadowColor = '#fff';
                ctx.shadowBlur = 10;
                ctx.fill();
            }
        };

        // Ring 1: SESSIONS (Blue)
        drawRing(r * 0.85, size * 0.04, progressRefs.current.sessions, '#3b82f6', '#3b82f6');
        // Ring 2: SETS (Pink)
        drawRing(r * 0.68, size * 0.03, progressRefs.current.sets, '#d946ef', '#d946ef');
        // Ring 3: SCORE (Gold/Cyan)
        const scoreColor = isOptimal ? '#f59e0b' : '#22d3ee';
        drawRing(r * 0.55, size * 0.02, progressRefs.current.score, scoreColor, scoreColor);

        // Center Cap
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationId);
    };
  }, [sessions, sets, score, isOptimal]);

  return (
    <div className="relative w-full max-w-md bg-black border-[2px] border-white/10 rounded-3xl flex flex-col h-full min-h-[550px] transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_50px_rgba(0,0,0,0.5)] z-20 overflow-hidden group">
      
      {/* 1. HEADER (Identique aux autres) */}
      <div className="bg-[#050505] px-6 py-4 border-b border-white/10 flex justify-between items-center z-10 shrink-0">
         <div>
            <h2 className="font-display font-bold text-white tracking-widest flex items-center gap-2 uppercase">
                <Cpu className="text-cyan-400" size={20} />
                System Core
            </h2>
            <p className="text-[10px] text-gray-400 font-mono font-bold mt-1">PERFORMANCE TRACKER</p>
         </div>
         <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${isOptimal ? 'border-amber-500/50 text-amber-500 bg-amber-500/10' : 'border-cyan-500/50 text-cyan-500 bg-cyan-500/10'}`}>
            {status === 'consistent' ? 'OPTIMIZED' : 'WARNING'}
         </div>
      </div>

      {/* 2. BODY (Canvas + Overlays) */}
      <div className="flex-1 bg-[#020202] p-4 flex justify-center items-center relative" ref={containerRef}>
         {/* Background FX */}
         <div className="absolute inset-0 bg-cyan-500/5 blur-3xl rounded-full transform scale-75 pointer-events-none"></div>
         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] opacity-50 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

         <canvas ref={canvasRef} className="relative z-10 w-full aspect-square max-w-[350px]" />

         {/* Center Score */}
         <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="flex flex-col items-center justify-center">
                <span className="text-[9px] text-gray-500 tracking-[0.2em] font-display uppercase mb-1 font-bold">Sys.Opt</span>
                <span className={`text-6xl font-display font-black tracking-tighter ${
                        isOptimal ? 'text-amber-400 drop-shadow-[0_0_25px_rgba(251,191,36,0.6)]' : 'text-cyan-400 drop-shadow-[0_0_25px_rgba(34,211,238,0.6)]'
                    }`}>
                    {Math.round(score)}<span className="text-2xl align-top opacity-50">%</span>
                </span>
            </div>
         </div>

         {/* Floating Badges (Mini Cards inside) - Positioned absolute relative to container */}
         {/* Sessions (Left) */}
         <div className="absolute top-[45%] left-4 -translate-y-1/2 z-30 pointer-events-auto">
             <div className="bg-black/80 backdrop-blur-md border border-blue-500/30 rounded-xl p-3 shadow-[0_0_20px_rgba(37,99,235,0.15)] flex flex-col items-center w-20 transform transition-all duration-300 hover:scale-110 hover:border-blue-500">
                 <div className="text-[9px] uppercase tracking-wider text-blue-400 font-bold mb-1">Séances</div>
                 <div className="text-xl font-display font-bold text-white leading-none">
                    {sessions.current}<span className="text-[10px] text-gray-500">/{sessions.max}</span>
                 </div>
             </div>
         </div>

         {/* Sets (Right) */}
         <div className="absolute top-[45%] right-4 -translate-y-1/2 z-30 pointer-events-auto">
             <div className="bg-black/80 backdrop-blur-md border border-fuchsia-500/30 rounded-xl p-3 shadow-[0_0_20px_rgba(192,38,211,0.15)] flex flex-col items-center w-20 transform transition-all duration-300 hover:scale-110 hover:border-fuchsia-500">
                 <div className="text-[9px] uppercase tracking-wider text-fuchsia-400 font-bold mb-1">Séries</div>
                 <div className="text-xl font-display font-bold text-white leading-none">
                    {sets.current}<span className="text-[10px] text-gray-500">/{sets.max}</span>
                 </div>
             </div>
         </div>
      </div>

      {/* 3. FOOTER (Grid Stats like the others) */}
      <div className="bg-[#080808] border-t border-white/10 shrink-0">
          <div className="grid grid-cols-3 divide-x divide-white/10">
              <MiniStat icon={<Activity size={14}/>} label="HRV" value="42ms" color="text-emerald-400" />
              <MiniStat icon={<Zap size={14}/>} label="KCAL" value="850" color="text-orange-400" />
              <MiniStat icon={<Hexagon size={14}/>} label="FOCUS" value="98%" color="text-violet-400" />
          </div>
      </div>

    </div>
  );
};

const MiniStat = ({ icon, label, value, color }: any) => (
    <div className="p-4 flex flex-col items-center justify-center hover:bg-white/5 transition-colors cursor-default h-24">
        <div className="text-gray-500 mb-1 opacity-80">{icon}</div>
        <div className="text-lg font-display font-bold text-white leading-none mb-1">{value}</div>
        <div className={`text-[9px] font-black uppercase tracking-widest ${color}`}>{label}</div>
    </div>
);
