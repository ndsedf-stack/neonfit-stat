
import React, { useState, useEffect } from 'react';
import { NeonTrackerV7 } from './components/NeonTrackerV7';
import { MuscleHud } from './components/MuscleHud';
import { VolumeGauge } from './components/VolumeGauge';
import { WeeklyProgressV14 } from './components/WeeklyProgressV14';
import { MuscleWorkload } from './components/MuscleWorkload';
import { RotateCcw, Power, Fingerprint, TrendingUp } from 'lucide-react';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [bootStep, setBootStep] = useState(0);

  // Demo Data State
  const [score, setScore] = useState(84);
  const [sessions, setSessions] = useState(4);
  const [maxSessions, setMaxSessions] = useState(5);
  const [sets, setSets] = useState(45);
  const [maxSets, setMaxSets] = useState(60);
  const [volume, setVolume] = useState(18500);

  useEffect(() => {
    if (!loading) return;
    const timeouts = [
      setTimeout(() => setBootStep(1), 500),
      setTimeout(() => setBootStep(2), 1200),
      setTimeout(() => setBootStep(3), 2000),
      setTimeout(() => setLoading(false), 2800),
    ];
    return () => timeouts.forEach(clearTimeout);
  }, [loading]);

  const resetDemo = () => {
    setLoading(true);
    setBootStep(0);
    setScore(0);
    setSessions(0);
    setSets(0);
    setVolume(0);
    setTimeout(() => {
        setScore(84);
        setSessions(4);
        setSets(45);
        setVolume(18500);
    }, 2800);
  };

  if (loading) {
      return (
        <div className="fixed inset-0 bg-[#020202] text-cyan-500 font-mono z-50 flex flex-col items-center justify-center p-8 select-none">
            <div className="w-full max-w-[300px] flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-cyan-900/50 pb-2 mb-4">
                    <span className="text-xs font-bold tracking-[0.2em] animate-pulse">NEON.FIT SYSTEM</span>
                    <Power size={14} className="animate-spin-slow"/>
                </div>
                <div className="space-y-1 text-[10px] uppercase tracking-wider text-cyan-700">
                    <div className={bootStep >= 0 ? 'text-cyan-400' : ''}>[ SYSTEM_BOOT ] ... OK</div>
                    <div className={bootStep >= 1 ? 'text-cyan-400' : ''}>[ LOADING_MODULES ] ... V14 KINETIC</div>
                    <div className={bootStep >= 3 ? 'text-cyan-400' : ''}>[ DISPLAY_READY ] ... 100%</div>
                </div>
                <div className="h-1 w-full bg-cyan-900/30 mt-8 relative overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-cyan-400 animate-[slideIn_2.5s_ease-out_forwards]"></div>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#010101] text-white font-sans overflow-x-hidden relative selection:bg-cyan-500/30 pb-20">
      <header className="sticky top-0 left-0 w-full z-40 bg-[#010101]/90 backdrop-blur-lg border-b border-white/5 transition-all duration-300">
          <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
              <div>
                  <h1 className="font-display font-black text-xl tracking-tighter text-white flex items-center gap-1">
                      <Fingerprint size={18} className="text-cyan-400" />
                      NEON<span className="text-cyan-400">.FIT</span>
                  </h1>
              </div>
              <button onClick={resetDemo} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"><RotateCcw size={14} /></button>
          </div>
      </header>

      <main className="relative z-10 w-full max-w-md mx-auto px-4 py-6 flex flex-col gap-8">
        
        {/* 1. MAIN TRACKER (V7 - Hybrid Fighter) */}
        <div className="animate-slideIn" style={{animationDelay: '0.1s'}}>
            <NeonTrackerV7 score={score} sessions={{ current: sessions, max: maxSessions }} sets={{ current: sets, max: maxSets }} status={score > 80 ? 'consistent' : 'warning'} />
        </div>

        {/* 2. WEEKLY PROGRESS (V14 - Kinetic Atmosphere) */}
        <div className="animate-slideIn" style={{animationDelay: '0.2s'}}>
            <WeeklyProgressV14 />
        </div>

        {/* 3. SECONDARY MODULES */}
        <div className="space-y-6 animate-slideIn" style={{animationDelay: '0.3s'}}>
            <VolumeGauge volume={volume} maxVolume={25000} stats={{ sets: sets, tut: 2450, sessions: sessions }} />
            <MuscleWorkload />
            <MuscleHud />
        </div>

      </main>
      
      {/* FOOTER */}
      <footer className="fixed bottom-0 left-0 w-full bg-[#050505]/90 backdrop-blur border-t border-white/5 py-4 z-40">
          <div className="max-w-md mx-auto flex justify-center text-[10px] text-gray-600 font-mono tracking-widest uppercase">
              // SYSTEM OPTIMIZED //
          </div>
      </footer>
    </div>
  );
}
