import React, { useState, useEffect } from 'react';
import { NeonTracker } from './components/NeonTracker';
import { MuscleHud } from './components/MuscleHud';
import { VolumeGauge } from './components/VolumeGauge';
import { WeeklyProgress } from './components/WeeklyProgress';
import { MuscleWorkload } from './components/MuscleWorkload';
import { IntensityZones } from './components/IntensityZones';
import { RotateCcw, Power, Fingerprint } from 'lucide-react';

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

  // BOOT SEQUENCE SIMULATION
  useEffect(() => {
    if (!loading) return;
    
    const timeouts = [
      setTimeout(() => setBootStep(1), 500),  // Init
      setTimeout(() => setBootStep(2), 1200), // Biometrics
      setTimeout(() => setBootStep(3), 2000), // Connection
      setTimeout(() => setLoading(false), 2800), // Launch
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
    
    // Values restore happens after boot
    setTimeout(() => {
        setScore(84);
        setSessions(4);
        setSets(45);
        setVolume(18500);
    }, 2800);
  };

  // --- SPLASH SCREEN RENDER ---
  if (loading) {
      return (
        <div className="fixed inset-0 bg-[#020202] text-cyan-500 font-mono z-50 flex flex-col items-center justify-center p-8 select-none">
            <div className="w-full max-w-[300px] flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-cyan-900/50 pb-2 mb-4">
                    <span className="text-xs font-bold tracking-[0.2em] animate-pulse">NEON.FIT V2.5</span>
                    <Power size={14} className="animate-spin-slow"/>
                </div>

                <div className="space-y-1 text-[10px] uppercase tracking-wider text-cyan-700">
                    <div className={bootStep >= 0 ? 'text-cyan-400' : ''}>[ SYSTEM_BOOT ] ... OK</div>
                    <div className={bootStep >= 1 ? 'text-cyan-400' : ''}>[ MEMORY_CHECK ] ... 64TB OK</div>
                    <div className={bootStep >= 2 ? 'text-cyan-400' : ''}>[ LOADING_USER_DATA ] ... OK</div>
                    <div className={bootStep >= 3 ? 'text-cyan-400' : ''}>[ ESTABLISHING_LINK ] ... SECURE</div>
                </div>

                {/* Progress Bar */}
                <div className="h-1 w-full bg-cyan-900/30 mt-8 relative overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-cyan-400 animate-[slideIn_2.5s_ease-out_forwards]"></div>
                </div>
                
                <div className="mt-2 text-center text-xs text-cyan-600 animate-pulse">
                    {bootStep === 3 ? 'ACCESS GRANTED' : 'INITIALIZING...'}
                </div>
            </div>
            
            <div className="absolute bottom-10 text-[9px] text-cyan-900 font-bold tracking-[0.3em]">
                SECURE BIOMETRIC VAULT
            </div>
        </div>
      );
  }

  // --- MAIN APP RENDER ---
  return (
    <div className="min-h-screen bg-[#010101] text-white font-sans overflow-x-hidden relative selection:bg-cyan-500/30 pb-20">
      
      {/* BACKGROUND FX */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-900/10 blur-[120px] rounded-full mix-blend-screen"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-900/10 blur-[120px] rounded-full mix-blend-screen"></div>
         {/* Grid Floor */}
         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 [mask-image:linear-gradient(to_bottom,transparent,black_80%)]"></div>
      </div>

      {/* HEADER (STICKY) */}
      <header className="sticky top-0 left-0 w-full z-40 bg-[#010101]/80 backdrop-blur-lg border-b border-white/5 transition-all duration-300">
          <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
              <div>
                  <h1 className="font-display font-black text-xl tracking-tighter text-white flex items-center gap-1">
                      <Fingerprint size={18} className="text-cyan-400" />
                      NEON<span className="text-cyan-400">.FIT</span>
                  </h1>
              </div>
              <button 
                  onClick={resetDemo}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
              >
                  <RotateCcw size={14} />
              </button>
          </div>
      </header>

      {/* MAIN SCROLLABLE CONTENT */}
      <main className="relative z-10 w-full max-w-md mx-auto px-4 py-6 flex flex-col gap-6">
        
        {/* SECTION 1: OVERVIEW */}
        <div className="animate-slideIn" style={{ animationDelay: '0.1s' }}>
             <NeonTracker 
                score={score} 
                sessions={{ current: sessions, max: maxSessions }} 
                sets={{ current: sets, max: maxSets }}
                status={score > 80 ? 'consistent' : 'warning'}
            />
        </div>

        {/* SECTION 2: VOLUME & PROGRESS */}
        <div className="animate-slideIn" style={{ animationDelay: '0.2s' }}>
            <WeeklyProgress />
        </div>

        <div className="animate-slideIn" style={{ animationDelay: '0.3s' }}>
            <VolumeGauge 
                volume={volume} 
                maxVolume={25000} 
                stats={{ sets: sets, tut: 2450, sessions: sessions }} 
            />
        </div>

        {/* SECTION 3: MUSCLE ANALYSIS */}
        <div className="grid gap-6">
            <div className="animate-slideIn" style={{ animationDelay: '0.4s' }}>
                <MuscleWorkload />
            </div>

            <div className="animate-slideIn" style={{ animationDelay: '0.5s' }}>
                <IntensityZones />
            </div>

            <div className="animate-slideIn" style={{ animationDelay: '0.6s' }}>
                <MuscleHud />
            </div>
        </div>

      </main>

      {/* BOTTOM NAV / FOOTER */}
      <footer className="fixed bottom-0 left-0 w-full bg-[#050505]/90 backdrop-blur border-t border-white/5 py-4 z-40">
          <div className="max-w-md mx-auto flex justify-center text-[10px] text-gray-600 font-mono tracking-widest uppercase">
              // END OF STREAM //
          </div>
      </footer>
    </div>
  );
}
