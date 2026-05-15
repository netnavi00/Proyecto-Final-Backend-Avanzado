import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../services/supabase';
import { Split, GitMerge, RotateCw, Settings, PlaySquare, Save, ChevronRight, Activity, Command, Zap, Trash2, Plus } from 'lucide-react';

export default function SandboxModule() {
  // Interaction Architect State
  const [abQuestion, setAbQuestion] = useState('WHAT DO YOU PREFER?');
  const [leftAction, setLeftAction] = useState('BEER');
  const [rightAction, setRightAction] = useState('COCKTAIL');
  const [leftFeedback, setLeftFeedback] = useState('cyan');
  const [rightFeedback, setRightFeedback] = useState('red');

  // Roulette Engine State
  const [rouletteSegments, setRouletteSegments] = useState([
    { id: 1, text: 'FREE SHOT', probability: 20 },
    { id: 2, text: 'MERCH', probability: 5 },
    { id: 3, text: 'TRY AGAIN', probability: 75 },
  ]);

  // Mini-Game Tuner State
  const [runnerSpeed, setRunnerSpeed] = useState(50);
  const [runnerGravity, setRunnerGravity] = useState(30);
  const [runnerThreshold, setRunnerThreshold] = useState(1000);

  const [activePreview, setActivePreview] = useState<'A/B' | 'ROULETTE' | 'GAME'>('A/B');
  const [isCommitting, setIsCommitting] = useState(false);

  const handleCommit = async () => {
    setIsCommitting(true);
    const payload = {
      type: activePreview,
      configuration: {
        interaction: { abQuestion, leftAction, rightAction, leftFeedback, rightFeedback },
        roulette: rouletteSegments,
        game: { speed: runnerSpeed, gravity: runnerGravity, threshold: runnerThreshold }
      },
      created_at: new Date().toISOString()
    };

    try {
      // Intenta guardar en la base de datos (incluso si falla en mockup, la intención cuenta)
      await supabase.from('experience_presets').insert(payload);
      alert('Blueprint Committed to Database: ' + payload.type);
    } catch (e) {
      console.error(e);
      alert('Mock Save Success! (Supabase error ignored for preview)');
    } finally {
      setIsCommitting(false);
    }
  };

  const updateSegment = (id: number | string, key: string, value: string | number) => {
    setRouletteSegments(prev => prev.map(s => s.id === id ? { ...s, [key]: value } : s));
  };

  const handleAddSegment = () => {
    if (rouletteSegments.length < 10) {
      setRouletteSegments(prev => [...prev, { id: crypto.randomUUID() as any, text: 'NEW ITEM', probability: 0 }]);
    }
  };

  const handleRemoveSegment = (id: number | string) => {
    if (rouletteSegments.length > 3) {
      setRouletteSegments(prev => prev.filter(s => s.id !== id));
    }
  };

  return (
    <div className="sandbox-grid h-full w-full flex flex-col font-mono text-aura-green bg-aura-bg relative overflow-hidden">
      
      {/* HEADER */}
      <div className="shrink-0 border-b border-aura-green/30 p-[18px] bg-aura-black/60 backdrop-blur-md flex justify-between items-center z-10 relative">
        <div className="flex items-center gap-[14px]">
          <Command size={24} className="text-aura-green" />
          <div>
            <h1 className="text-[15px] font-bold tracking-[0.2em] leading-none">SANDBOX MODULE</h1>
            <p className="text-[12px] opacity-60 tracking-widest mt-1">LOGIC & GAME DESIGN BLUEPRINT</p>
          </div>
        </div>
        <button 
          onClick={handleCommit}
          disabled={isCommitting}
          className="commit-btn bg-aura-green/10 border-2 border-aura-green px-4 py-2 text-[13px] flex items-center gap-[9px] hover:bg-aura-green/20 hover:shadow-[0_0_15px_color-mix(in_srgb,_var(--color-aura-green)_30%,_transparent)] transition-all font-bold tracking-widest uppercase disabled:opacity-50"
        >
          <Save size={14} />
          {isCommitting ? 'COMMITTING...' : 'COMMIT TO DATABASE'}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden z-10 relative">
        {/* LEFT COLUMN: EDITORS */}
        <div className="w-full lg:w-1/2 flex flex-col overflow-y-auto border-r border-aura-green/30 p-[26px] space-y-8 custom-scrollbar">
          
          {/* Interaction Architect */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h2 className="text-[13px] uppercase tracking-widest border-b border-aura-green/30 pb-2 flex items-center gap-[9px]" onClick={() => setActivePreview('A/B')}>
              <Split size={14} /> ARCHITECT: LÓGICA A/B
            </h2>
            <div className="grid gap-[18px] bg-aura-green/5 border-2 border-aura-green/20 p-[18px]">
              <div>
                <label className="text-[12px] uppercase tracking-widest opacity-60 mb-[9px] block">MASTER QUESTION</label>
                <input type="text" value={abQuestion} onChange={e => setAbQuestion(e.target.value)}
                       className="w-full bg-aura-black border-2 border-aura-dark text-aura-text p-[9px] text-[15px] focus:border-aura-green focus:shadow-[0_0_0_1px_var(--color-aura-green)] outline-none font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-[18px]">
                <div className="space-y-2 border-r border-aura-green/10 pr-4">
                  <label className="text-[12px] uppercase tracking-widest opacity-60 flex justify-between">
                    <span>LEFT ACTION (SWIPE)</span>
                  </label>
                  <input type="text" value={leftAction} onChange={e => setLeftAction(e.target.value)}
                         className="w-full bg-aura-black border-2 border-aura-dark text-aura-text p-[9px] text-[13px] focus:border-aura-green focus:shadow-[0_0_0_1px_var(--color-aura-green)] outline-none" />
                  <select value={leftFeedback} onChange={e => setLeftFeedback(e.target.value)}
                          className="w-full bg-aura-black border-2 border-aura-dark text-aura-text p-[9px] text-[13px] focus:border-aura-green focus:shadow-[0_0_0_1px_var(--color-aura-green)] outline-none appearance-none cursor-pointer">
                    <option value="cyan">Feedback: Aura Cyan</option>
                    <option value="green">Feedback: Aura Green</option>
                    <option value="red">Feedback: Aura Red</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] uppercase tracking-widest opacity-60 flex justify-between">
                    <span>RIGHT ACTION (SWIPE)</span>
                  </label>
                  <input type="text" value={rightAction} onChange={e => setRightAction(e.target.value)}
                         className="w-full bg-aura-black border-2 border-aura-dark text-aura-text p-[9px] text-[13px] focus:border-aura-green focus:shadow-[0_0_0_1px_var(--color-aura-green)] outline-none" />
                  <select value={rightFeedback} onChange={e => setRightFeedback(e.target.value)}
                          className="w-full bg-aura-black border-2 border-aura-dark text-aura-text p-[9px] text-[13px] focus:border-aura-green focus:shadow-[0_0_0_1px_var(--color-aura-green)] outline-none appearance-none cursor-pointer">
                    <option value="cyan">Feedback: Aura Cyan</option>
                    <option value="green">Feedback: Aura Green</option>
                    <option value="red">Feedback: Aura Red</option>
                  </select>
                </div>
              </div>
              <button 
                onClick={() => setActivePreview('A/B')}
                className="commit-btn w-full mt-[9px] text-[12px] uppercase border-2 border-aura-green/30 hover:bg-aura-green/10 py-1"
              >
                SYNC TO PREVIEW
              </button>
            </div>
          </motion.div>

          {/* Roulette Engine */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
            <h2 className="text-[13px] uppercase tracking-widest border-b border-aura-green/30 pb-2 flex items-center gap-[9px]" onClick={() => setActivePreview('ROULETTE')}>
              <RotateCw size={14} /> ENGINE: ROULETTE
            </h2>
            <div className="bg-aura-green/5 border-2 border-aura-green/20 p-[18px] space-y-3">
              <div className="grid grid-cols-12 gap-[9px] text-[12px] uppercase opacity-60 tracking-widest pb-1 border-b border-aura-green/10">
                <div className="col-span-1">ID</div>
                <div className="col-span-6">SEGMENT TEXT</div>
                <div className="col-span-4">PROBABILITY (%)</div>
                <div className="col-span-1"></div>
              </div>
              {rouletteSegments.map((seg, idx) => (
                <div key={seg.id} className="grid grid-cols-12 gap-[9px] items-center">
                  <div className="col-span-1 text-[13px] opacity-50">0{idx + 1}</div>
                  <div className="col-span-6">
                    <input type="text" value={seg.text} onChange={e => updateSegment(seg.id, 'text', e.target.value)}
                           className="w-full bg-aura-black border-2 border-aura-dark text-aura-text p-1.5 text-[13px] focus:border-aura-green focus:shadow-[0_0_0_1px_var(--color-aura-green)] outline-none" />
                  </div>
                  <div className="col-span-4 flex items-center gap-[9px]">
                    <input type="range" min="0" max="100" value={seg.probability} onChange={e => updateSegment(seg.id, 'probability', parseInt(e.target.value))}
                           className="flex-1 accent-aura-green h-1" />
                    <span className="text-[12px] w-6">{seg.probability}%</span>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button onClick={() => handleRemoveSegment(seg.id)} disabled={rouletteSegments.length <= 3} className="text-aura-green/50 hover:text-red-500 disabled:opacity-20 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={handleAddSegment} disabled={rouletteSegments.length >= 10} className="w-full flex items-center justify-center gap-[9px] mt-[9px] text-[12px] uppercase border border-dashed border-aura-green/30 hover:bg-aura-green/10 py-2 disabled:opacity-30 transition-all font-bold">
                <Plus size={12} /> ADD SEGMENT ({rouletteSegments.length}/10)
              </button>
              <button 
                onClick={() => setActivePreview('ROULETTE')}
                className="commit-btn w-full mt-[9px] text-[12px] uppercase border-2 border-aura-green/30 hover:bg-aura-green/10 py-1"
              >
                SYNC TO PREVIEW
              </button>
            </div>
          </motion.div>

          {/* Mini-Game Tuner */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
            <h2 className="text-[13px] uppercase tracking-widest border-b border-aura-green/30 pb-2 flex items-center gap-[9px]" onClick={() => setActivePreview('GAME')}>
              <Settings size={14} /> TUNER: AURA RUNNER
            </h2>
            <div className="bg-aura-green/5 border-2 border-aura-green/20 p-[18px] space-y-4">
              <div className="grid grid-cols-2 gap-[26px]">
                <div>
                  <label className="text-[12px] uppercase tracking-widest opacity-60 flex justify-between mb-[9px]">
                    <span>OBSTACLE SPEED</span>
                    <span>{runnerSpeed}px/s</span>
                  </label>
                  <input type="range" min="10" max="200" value={runnerSpeed} onChange={e => setRunnerSpeed(parseInt(e.target.value))}
                         className="w-full accent-aura-green h-1" />
                </div>
                <div>
                  <label className="text-[12px] uppercase tracking-widest opacity-60 flex justify-between mb-[9px]">
                    <span>GRAVITY</span>
                    <span>{runnerGravity} G</span>
                  </label>
                  <input type="range" min="5" max="100" value={runnerGravity} onChange={e => setRunnerGravity(parseInt(e.target.value))}
                         className="w-full accent-aura-green h-1" />
                </div>
                <div className="col-span-2 mt-[9px]">
                  <label className="text-[12px] uppercase tracking-widest opacity-60 flex justify-between mb-[9px]">
                    <span>SCORE THRESHOLD TO UNLOCK (PTS)</span>
                    <span className="text-aura-green font-bold border-2 border-aura-green/30 px-2">{runnerThreshold}</span>
                  </label>
                  <input type="range" min="100" max="5000" step="100" value={runnerThreshold} onChange={e => setRunnerThreshold(parseInt(e.target.value))}
                         className="w-full accent-aura-green h-1" />
                </div>
              </div>
              <button 
                onClick={() => setActivePreview('GAME')}
                className="w-full text-[12px] uppercase border-2 border-aura-green/30 hover:bg-aura-green/10 py-1"
              >
                SYNC TO PREVIEW
              </button>
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: PREVIEW PANEL */}
        <div className="w-full lg:w-1/2 border-l border-aura-green/30 bg-aura-black/80 flex flex-col items-center justify-center p-[26px] relative">
          <div className="absolute top-4 left-4 flex items-center gap-[9px] opacity-50 text-[12px] tracking-widest">
            <PlaySquare size={12} /> AP-UNIT SIMULATION [{activePreview}]
          </div>

          {/* Simulated Outer Device */}
          <div className="border-2 border-aura-green/40 p-[9px] rounded-xl relative shadow-[0_0_30px_color-mix(in_srgb,_var(--color-aura-green)_5%,_transparent)] w-full max-w-[550px] aspect-[16/9] flex flex-col bg-aura-bg overflow-hidden">
            {/* Notch / Camera visual */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-aura-green/20 rounded-b-lg border-b border-x border-aura-green/40 z-20" />

            {/* Simulated Screen */}
            <div className="flex-1 rounded-lg border-2 border-aura-green/20 overflow-hidden relative shadow-[inset_0_0_20px_color-mix(in_srgb,_var(--color-aura-green)_10%,_transparent)] flex flex-col items-center text-center bg-aura-black">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-screen grayscale filter" />
              
              <AnimatePresence mode="wait">
                {activePreview === 'A/B' && (
                  <motion.div key="ab" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                              className="absolute inset-0 flex flex-col items-center justify-center p-[26px] z-10 w-full">
                    <Zap size={32} className="text-aura-green mb-[18px] opacity-80" />
                    <h3 className="text-[22px] md:text-[26px] font-bold uppercase tracking-widest leading-relaxed mb-8 shadow-black drop-shadow-md">
                      {abQuestion}
                    </h3>
                    <div className="w-full flex flex-row gap-[18px] justify-center px-4">
                      <button className="flex-1 py-4 border-2 border-dashed border-aura-green/40 hover:border-aura-green hover:bg-aura-green/10 transition-colors uppercase font-bold text-[13px] tracking-widest flex items-center justify-center gap-[9px]">
                        <ChevronRight className="rotate-180 opacity-50" />
                        <span>{leftAction}</span>
                      </button>
                      <button className="flex-1 py-4 border-2 border-dashed border-aura-green/40 hover:border-aura-green hover:bg-aura-green/10 transition-colors uppercase font-bold text-[13px] tracking-widest flex items-center justify-center gap-[9px]">
                        <span>{rightAction}</span>
                        <ChevronRight className="opacity-50" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {activePreview === 'ROULETTE' && (
                  <motion.div key="roulette" initial={{ opacity: 0, rotate: -45 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0 }}
                              className="absolute inset-0 flex flex-row items-center justify-center p-[26px] z-10 gap-12">
                    <div className="relative w-48 h-48 md:w-56 md:h-56 border-2 border-aura-green rounded-full flex items-center justify-center shadow-[0_0_30px_color-mix(in_srgb,_var(--color-aura-green)_20%,_transparent)] shrink-0">
                      {/* Roulette Center */}
                      <div className="w-6 h-6 bg-aura-green rounded-full z-20 shadow-[0_0_10px_color-mix(in_srgb,_var(--color-aura-green)_80%,_transparent)] border-4 border-aura-bg" />
                      
                      {/* Simple segments visualization */}
                      {rouletteSegments.map((seg, i) => {
                         const sliceAngle = 360 / rouletteSegments.length;
                         const rot = sliceAngle * i;
                         return (
                           <div key={seg.id} className="absolute inset-0 z-10" style={{ transform: `rotate(${rot}deg)` }}>
                             <div className="absolute top-1/2 left-1/2 right-0 h-[2px] bg-aura-green/50" style={{ transformOrigin: 'left center' }} />
                             <div className="absolute top-0 bottom-0 right-0 left-1/2 flex items-center justify-end px-4 pb-1" style={{ transform: `rotate(${sliceAngle / 2}deg)`, transformOrigin: 'left center' }}>
                               <span className="text-[12px] md:text-[13px] uppercase whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px] md:max-w-[100px] font-bold" style={{ textShadow: '1px 1px 2px black' }}>{seg.text}</span>
                             </div>
                           </div>
                         );
                      })}
                      
                      {/* Pointer */}
                      <div className="absolute top-1/2 -right-4 -translate-y-1/2 w-6 h-6 border-y-8 border-r-8 border-l-0 border-transparent border-r-aura-green z-30" />
                    </div>
                    <div className="flex flex-col items-center">
                      <h4 className="text-[12px] uppercase tracking-widest mb-[18px] opacity-60">SPIN THE WHEEL</h4>
                      <button className="bg-aura-green text-black px-8 py-3 text-[13px] font-black uppercase tracking-widest hover:brightness-125 shadow-[0_0_20px_color-mix(in_srgb,_var(--color-aura-green)_40%,_transparent)]">
                        SPIN (MOCK)
                      </button>
                    </div>
                  </motion.div>
                )}

                {activePreview === 'GAME' && (
                  <motion.div key="game" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                              className="absolute inset-0 flex flex-col z-10 bg-aura-black/90">
                    <div className="p-[18px] border-b border-aura-green/20 flex justify-between items-center text-[12px]">
                      <span>SCORE: 000</span>
                      <span className="text-aura-green">GOAL: {runnerThreshold}</span>
                    </div>
                    <div className="flex-1 relative overflow-hidden flex flex-col justify-end pb-8 border-b border-aura-green/20 gap-[18px]">
                       {/* Mock Player */}
                       <div className="w-8 h-8 rounded-sm shrink-0 border-2 border-aura-green absolute bottom-8 left-16 shadow-[0_0_10px_color-mix(in_srgb,_var(--color-aura-green)_80%,_transparent)]" />
                       {/* Mock Floor line */}
                       <div className="w-full h-1 bg-aura-green/30 absolute bottom-8 left-0 right-0" />
                       
                       {/* Mock Obstacles flying by */}
                       <motion.div 
                         animate={{ x: [-100, -700] }} 
                         transition={{ duration: 600 / runnerSpeed, repeat: Infinity, ease: 'linear' }}
                         className="absolute bottom-9 left-[100%] w-6 h-6 border bg-aura-black border-aura-green/50" 
                       />
                       <motion.div 
                         initial={{ x: 0 }}
                         animate={{ x: [-100, -700] }} 
                         transition={{ duration: 600 / runnerSpeed, repeat: Infinity, ease: 'linear', delay: 1 }}
                         className="absolute bottom-9 left-[100%] w-6 h-12 border bg-aura-black border-aura-green/50" 
                       />
                       
                       <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 text-[60px] font-black uppercase text-aura-green tracking-widest z-0">
                         g = {runnerGravity}
                       </div>
                    </div>
                    <div className="p-[18px]">
                      <button className="w-full py-2 border-2 border-aura-green/50 text-[13px] font-black tracking-widest uppercase active:bg-aura-green/20 transition-colors">
                        TAP TO JUMP
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Visual bottom indicator maybe not needed for landscape, we can keep it subtle */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-aura-green/20 rounded-full" />
          </div>

        </div>
      </div>
      
      {/* GLOBAL STYLES FOR SCROLLBAR IN THIS MODULE TO LOOK CYBER */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; border-left: 1px solid color-mix(in_srgb,_var(--color-aura-green)_10%,_transparent); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: color-mix(in_srgb,_var(--color-aura-green)_30%,_transparent); }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: color-mix(in_srgb,_var(--color-aura-green)_80%,_transparent); }
      `}</style>
    </div>
  );
}
