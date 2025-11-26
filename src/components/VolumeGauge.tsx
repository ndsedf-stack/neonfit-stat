
import React, { useEffect, useRef } from 'react';
import { Layers, Clock, TrendingUp } from 'lucide-react';

interface VolumeGaugeProps {
  volume: number;      // Current volume (e.g. 18500)
  maxVolume?: number;  // Max gauge value (e.g. 25000)
  optimalMin?: number; // Start of green zone (e.g. 15000)
  optimalMax?: number; // End of green zone (e.g. 22000)
  stats: {
    sets: number;
    tut: number; // in seconds
    sessions: number;
  };
}

export const VolumeGauge: React.FC<VolumeGaugeProps> = ({
  volume,
  maxVolume = 25000,
  optimalMin = 15000,
  optimalMax = 22000,
  stats
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Animation state references (to avoid re-renders during 60fps loop)
  const currentValRef = useRef(0);
  const targetValRef = useRef(volume);

  useEffect(() => {
    targetValRef.current = volume;
  }, [volume]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationId: number;
    
    // Resize handler
    const handleResize = () => {
      if (!containerRef.current || !canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = containerRef.current.getBoundingClientRect();
      
      // Make it square based on width, ensuring high DPI sharpness
      const size = rect.width; 
      
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize);
    // Initial size calculation
    setTimeout(handleResize, 0); 

    // --- DRAWING FUNCTIONS ---

    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const createCarbonPattern = () => {
        const pCanvas = document.createElement('canvas');
        pCanvas.width = 8;
        pCanvas.height = 8;
        const pCtx = pCanvas.getContext('2d');
        if (pCtx) {
            pCtx.fillStyle = '#050505';
            pCtx.fillRect(0, 0, 8, 8);
            pCtx.fillStyle = '#161616'; // Subtle checkerboard
            pCtx.beginPath();
            pCtx.moveTo(0, 8);
            pCtx.lineTo(8, 0);
            pCtx.lineTo(8, 8);
            pCtx.fill();
        }
        return ctx.createPattern(pCanvas, 'repeat');
    };

    const draw = () => {
        if (!canvas || !containerRef.current) return;
        
        // Physics: Smooth damping toward target (Lerp)
        const diff = targetValRef.current - currentValRef.current;
        // If close enough, snap to target to save calc, else ease
        if (Math.abs(diff) < 0.1) {
            currentValRef.current = targetValRef.current;
        } else {
            currentValRef.current += diff * 0.08; // 0.08 = speed/damping factor
        }

        const size = canvas.width / (window.devicePixelRatio || 1);
        const cx = size / 2;
        const cy = size / 2;
        const r = size * 0.45; // Radius of the gauge face

        const percent = Math.min(1, Math.max(0, currentValRef.current / maxVolume));
        
        // Determine Theme Color based on Zone
        let themeColor = '#22d3ee'; // Cyan (Default)
        
        const isOptimal = currentValRef.current >= optimalMin && currentValRef.current <= optimalMax;
        const isOver = currentValRef.current > optimalMax;

        if (isOptimal) {
            themeColor = '#fbbf24'; // Amber
        } else if (isOver) {
            themeColor = '#ef4444'; // Red
        }

        ctx.clearRect(0, 0, size, size);

        // 1. CHASSIS (Outer Ring with metal gradient)
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetY = 10;
        
        ctx.beginPath();
        ctx.arc(cx, cy, r * 1.05, 0, Math.PI * 2);
        
        const bezelGrad = ctx.createLinearGradient(0, 0, size, size);
        bezelGrad.addColorStop(0, '#334155');
        bezelGrad.addColorStop(0.5, '#0f172a');
        bezelGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = bezelGrad;
        ctx.fill();
        ctx.restore();

        // 2. CARBON FACE
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        const pattern = createCarbonPattern();
        if (pattern) {
            ctx.fillStyle = pattern;
            ctx.fill();
        }
        // Inner shadow vignette for depth
        const vignette = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, r);
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.9)');
        ctx.fillStyle = vignette;
        ctx.fill();
        
        // Rim highlight
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.stroke();
        ctx.restore();

        // 3. OPTIMAL ZONE ARC
        ctx.save();
        const startAng = toRad(135);
        const totalAng = toRad(270); // Span from 135 to 405 degrees
        
        const optStartPct = optimalMin / maxVolume;
        const optEndPct = optimalMax / maxVolume;
        
        const optStartAng = startAng + (totalAng * optStartPct);
        const optEndAng = startAng + (totalAng * optEndPct);

        // Draw faint background for zone
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.85, optStartAng, optEndAng);
        ctx.lineWidth = r * 0.08;
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.15)'; // Faint Amber
        ctx.lineCap = 'butt';
        ctx.stroke();
        
        // Zone marker line
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.92, optStartAng, optEndAng);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fbbf24'; // Amber solid line
        ctx.stroke();
        ctx.restore();

        // 4. TICKS & NUMBERS
        ctx.save();
        const tickCount = 50;
        for (let i = 0; i <= tickCount; i++) {
            const t = i / tickCount;
            const angle = startAng + (totalAng * t);
            const isMajor = i % 10 === 0;
            const isLit = t <= percent;

            const outerRad = r * 0.82;
            const innerRad = outerRad - (isMajor ? r * 0.08 : r * 0.04);

            const x1 = cx + Math.cos(angle) * innerRad;
            const y1 = cy + Math.sin(angle) * innerRad;
            const x2 = cx + Math.cos(angle) * outerRad;
            const y2 = cy + Math.sin(angle) * outerRad;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            
            if (isLit) {
                ctx.strokeStyle = isMajor ? themeColor : 'rgba(255,255,255,0.5)';
                ctx.lineWidth = isMajor ? 3 : 1;
                ctx.shadowColor = themeColor;
                ctx.shadowBlur = 10;
            } else {
                ctx.strokeStyle = '#334155';
                ctx.lineWidth = 1;
                ctx.shadowBlur = 0;
            }
            ctx.stroke();

            // Numbers (Only majors)
            if (isMajor) {
                const textRad = r * 0.65;
                const tx = cx + Math.cos(angle) * textRad;
                const ty = cy + Math.sin(angle) * textRad;
                
                ctx.font = `bold ${Math.max(10, size * 0.04)}px "Orbitron", sans-serif`;
                ctx.fillStyle = isLit ? '#fff' : '#475569';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowBlur = 0;
                
                const valK = Math.round((t * maxVolume) / 1000);
                ctx.fillText(`${valK}k`, tx, ty);
            }
        }
        ctx.restore();

        // 5. LCD DISPLAY (Bottom Center)
        ctx.save();
        const lcdY = cy + r * 0.4;
        const lcdW = r * 0.6;
        const lcdH = r * 0.25;
        
        // LCD Glass Background
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.roundRect(cx - lcdW/2, lcdY - lcdH/2, lcdW, lcdH, 4);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.stroke();

        // LCD Text
        ctx.font = `bold ${size * 0.08}px "Orbitron", monospace`;
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = themeColor;
        ctx.shadowBlur = 15;
        ctx.fillText(`${Math.round(currentValRef.current).toLocaleString()}`, cx, lcdY);
        
        ctx.font = `bold ${size * 0.03}px "Inter", sans-serif`;
        ctx.fillStyle = themeColor;
        ctx.shadowBlur = 0;
        ctx.fillText("TOTAL LOAD (KG)", cx, lcdY + size * 0.06);
        ctx.restore();

        // 6. NEEDLE
        ctx.save();
        const needleAngle = startAng + (totalAng * percent);
        const needleLen = r * 0.85;
        
        ctx.translate(cx, cy);
        ctx.rotate(needleAngle);
        
        ctx.shadowColor = themeColor;
        ctx.shadowBlur = 20;

        ctx.beginPath();
        // Needle shape
        ctx.moveTo(0, -4);
        ctx.lineTo(needleLen, 0);
        ctx.lineTo(0, 4);
        ctx.lineTo(-15, 0);
        ctx.fillStyle = '#fff';
        ctx.fill();
        
        // Color Tip
        ctx.beginPath();
        ctx.moveTo(needleLen * 0.7, -2);
        ctx.lineTo(needleLen, 0);
        ctx.lineTo(needleLen * 0.7, 2);
        ctx.fillStyle = themeColor;
        ctx.fill();
        
        ctx.restore();

        // Center Pin (Cap over needle)
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#cbd5e1';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.restore();

        // 7. SAPPHIRE GLASS REFLECTION (Top overlay)
        ctx.save();
        const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r/2, cy + r/2);
        grad.addColorStop(0, 'rgba(255,255,255,0.1)');
        grad.addColorStop(0.4, 'rgba(255,255,255,0.02)');
        grad.addColorStop(0.45, 'transparent');
        grad.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.95, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();

        animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationId);
    };
  }, [maxVolume, optimalMin, optimalMax]); // Dependencies trigger full redraw setup

  const isOptimal = volume >= optimalMin && volume <= optimalMax;

  return (
    <div className="relative w-full max-w-md bg-black border-[2px] border-white/10 rounded-3xl flex flex-col h-full min-h-[550px] transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_50px_rgba(0,0,0,0.5)] z-20 overflow-hidden group">
        
        {/* HEADER */}
        <div className="bg-[#050505] px-6 py-4 border-b border-white/10 flex justify-between items-center z-10 shrink-0">
            <div>
                 <h3 className="font-display font-bold text-white tracking-widest flex items-center gap-2 uppercase">
                    <TrendingUp size={18} className="text-cyan-400" />
                    Volume Load
                </h3>
                 <p className="text-[10px] text-gray-400 font-mono font-bold mt-1">WEEKLY ACCUMULATION</p>
            </div>
            <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${isOptimal ? 'border-amber-500/50 text-amber-500 bg-amber-500/10' : 'border-cyan-500/50 text-cyan-500 bg-cyan-500/10'}`}>
                {isOptimal ? 'OPTIMAL ZONE' : 'BUILDING'}
            </div>
        </div>

        {/* GAUGE CONTAINER */}
        <div className="flex-1 bg-[#020202] p-6 flex justify-center items-center relative" ref={containerRef}>
            {/* Background Glow */}
            <div className="absolute inset-0 bg-cyan-500/5 blur-3xl rounded-full transform scale-75 pointer-events-none"></div>
             {/* Tech Grid Background (matching MuscleHud) */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] opacity-50 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>
            
            <canvas ref={canvasRef} className="relative z-10 w-full aspect-square max-w-[350px]" />
        </div>

        {/* FOOTER STATS */}
        <div className="bg-[#080808] border-t border-white/10 shrink-0">
            <div className="grid grid-cols-2 divide-x divide-white/10">
                <div className="p-4 flex flex-col items-center hover:bg-white/5 transition-colors cursor-default">
                    <span className="text-[10px] text-gray-500 font-black tracking-widest uppercase mb-1 flex items-center gap-1">
                        <Layers size={12} /> Total Sets
                    </span>
                    <span className="text-2xl font-display font-black text-white">{stats.sets}</span>
                </div>
                <div className="p-4 flex flex-col items-center hover:bg-white/5 transition-colors cursor-default">
                    <span className="text-[10px] text-gray-500 font-black tracking-widest uppercase mb-1 flex items-center gap-1">
                        <Clock size={12} /> TUT (MIN)
                    </span>
                    <span className="text-2xl font-display font-black text-white">
                        {Math.floor(stats.tut / 60)}<span className="text-sm text-gray-500">:{String(stats.tut % 60).padStart(2, '0')}</span>
                    </span>
                </div>
            </div>
        </div>
        
        {/* STATUS BAR BOTTOM */}
        <div className={`py-1 text-center text-[8px] font-mono font-bold uppercase tracking-[0.2em] transition-colors duration-500 ${isOptimal ? 'bg-amber-500/20 text-amber-400' : 'bg-cyan-900/20 text-cyan-400'}`}>
            {isOptimal ? 'HYPERTROPHY RANGE ACTIVE' : 'ACCUMULATION PHASE'}
        </div>
    </div>
  );
};
