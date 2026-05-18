import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Activity, RefreshCw } from 'lucide-react';
import { supabase } from '../../services/supabase';

export function Orchester({ tables, winningRatio, setWinningRatio, onFlashAction, isFlashActive, flashTime }: any) {
  const [pulseActive, setPulseActive] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [auraColor, setAuraColor] = useState('Auto');
  const [targetType, setTargetType] = useState<'All' | 'Zone' | 'Individual'>('All');
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [slides, setSlides] = useState<string[]>(['', '', '', '']);

  const handleGlobalPush = async () => {
    setIsPushing(true);
    setPulseActive(true);
    
    // Simulate Supabase deployment
    try {
      // Direct logic with supabase-js
      await supabase.from('units').update({ 
        action: 'global_pulse',
        aura_color: auraColor !== 'Auto' ? auraColor : null,
        updated_at: new Date().toISOString()
      }).in('id', targetType === 'All' ? tables.map((t:any) => t.id) : selectedUnits);
      
      alert('Global Push deployed successfully across AP-Units');
    } catch (e) {
      console.error(e);
      alert('Failed to push to Supabase');
    } finally {
      setIsPushing(false);
      setTimeout(() => setPulseActive(false), 2000);
    }
  };

  const handleSyncContent = async () => {
    try {
      await supabase.from('publicity_slides').insert(
        slides.filter(s => s).map((url, i) => ({ url, order: i }))
      );
      alert('Content Deployment Synced to Network');
    } catch (error) {
      console.error(error);
    }
  };

  const auraColors = [
    { name: 'Auto', hex: '#555555' },
    { name: 'Cyan', hex: '#00e5ff' },
    { name: 'Green', hex: 'var(--color-aura-green)' },
    { name: 'Red', hex: '#ff003c' },
    { name: 'Violet', hex: '#8a2be2' },
    { name: 'Gold', hex: '#ffd700' },
  ];

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-[13px] font-bold mb-[18px] flex items-center gap-[9px] shrink-0">
        <span className="w-1 h-3 bg-aura-cyan"></span>
        ORCHESTER DEPLOYMENT CENTER
      </h2>

      <div className="flex flex-col xl:flex-row gap-[26px] flex-1 overflow-y-auto">
        
        {/* Left Col: Main Controls */}
        <div className="w-full xl:w-1/2 flex flex-col gap-[26px]">
          
          {/* Target Selection */}
          <div className="bg-aura-inner border-2 border-aura-dark p-[18px]">
            <h3 className="text-[12px] uppercase text-aura-green/60 font-bold tracking-widest mb-[14px]">Targeting (AP-Units)</h3>
            <div className="flex gap-[9px]">
              {['All', 'Zone', 'Individual'].map(t => (
                <button 
                  key={t}
                  onClick={() => {
                    setTargetType(t as any);
                    if (t === 'All') setSelectedUnits([]);
                  }}
                  className={`flex-1 py-2 text-[12px] uppercase font-bold tracking-widest transition-colors ${targetType === t ? 'bg-aura-cyan text-black' : 'border-2 border-aura-dark text-aura-green/40 hover:border-aura-green/50'}`}
                >
                  {t}
                </button>
              ))}
            </div>
            
            {(targetType === 'Zone' || targetType === 'Individual') && (
               <div className="mt-[14px] grid grid-cols-4 gap-[9px] max-h-32 overflow-y-auto">
                 {tables.map((t:any) => (
                   <button 
                     key={t.id}
                     onClick={() => setSelectedUnits(prev => prev.includes(t.id) ? prev.filter(id => id !== t.id) : [...prev, t.id])}
                     className={`text-[12px] py-1 border transition-colors ${selectedUnits.includes(t.id) ? 'border-aura-cyan bg-aura-cyan/20 text-aura-text' : 'border-aura-dark text-aura-green/40'}`}
                   >
                     {t.name}
                   </button>
                 ))}
               </div>
            )}
            {targetType === 'All' && (
               <div className="mt-[14px] text-[12px] text-aura-green/50 flex space-x-1 items-start bg-aura-black/40 p-[9px] border-2 border-aura-dark">
                  <AlertTriangle size={12} className="text-aura-cyan shrink-0" />
                  <span>Command will be broadcasted to all active units on the network.</span>
               </div>
            )}
          </div>

          {/* Gamification Tuning */}
          <div className="bg-aura-inner border-2 border-aura-dark p-[18px]">
            <h3 className="text-[12px] uppercase text-aura-green/60 font-bold tracking-widest mb-[14px]">Gamification Tuning</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[12px]">
                <span className="uppercase opacity-50">Winning Ratio</span>
                <span className="text-aura-green font-bold bg-aura-green/10 px-2 py-1 rounded-sm">{winningRatio}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={winningRatio}
                onChange={(e) => setWinningRatio(parseInt(e.target.value))}
                className="w-full accent-aura-green bg-aura-black h-2 rounded-none appearance-none cursor-pointer border-2 border-aura-dark"
              />
              <div className="flex justify-between text-[12px] text-aura-green/40">
                <span>0% (House Wins)</span>
                <span>100% (Full Pay-out)</span>
              </div>
            </div>
          </div>

          {/* Manual Aura Override */}
          <div className="bg-aura-inner border-2 border-aura-dark p-[18px]">
            <h3 className="text-[12px] uppercase text-aura-green/60 font-bold tracking-widest mb-[14px]">Manual Aura Override</h3>
            <p className="text-[12px] text-aura-green/40 mb-[14px]">Force hardware LED colors for special events or diagnostics.</p>
            <div className="flex flex-wrap gap-[9px]">
              {auraColors.map(c => (
                <button
                  key={c.name}
                  onClick={() => setAuraColor(c.name)}
                  className={`preset-btn flex items-center gap-[9px] px-3 py-2 text-[12px] font-bold uppercase transition-all ${auraColor === c.name ? 'ring-2 ring-white shadow-[0_0_10px_rgba(255,255,255,0.2)] preset-btn-active' : 'opacity-60 hover:opacity-100'} bg-aura-black border-2 border-aura-dark`}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.name === 'Auto' ? 'transparent' : c.hex, border: c.name === 'Auto' ? '1px dashed #555' : 'none' }} />
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Global Push & Content */}
        <div className="w-full xl:w-1/2 flex flex-col gap-[26px]">
          
          {/* Global Push */}
          <div className="bg-aura-dark/20 border-2 border-aura-red p-[26px] flex flex-col items-center justify-center relative overflow-hidden min-h-[220px]">
            {pulseActive && (
              <motion.div 
                className="absolute inset-0 bg-aura-red opacity-10"
                animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
            
            <motion.button 
              onClick={handleGlobalPush}
              disabled={isPushing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative z-10 w-40 h-40 rounded-full flex flex-col items-center justify-center font-black uppercase tracking-widest shadow-[0_0_40px_color-mix(in_srgb,_var(--color-aura-red)_40%,_transparent)] ${isPushing ? 'bg-aura-red/50 text-white cursor-wait' : 'bg-aura-red text-white hover:bg-red-500 hover:shadow-[0_0_60px_color-mix(in_srgb,_var(--color-aura-red)_60%,_transparent)]'} transition-all`}
            >
              <Activity size={32} className="mb-[9px]" />
              <span className="text-[22px]">Global</span>
              <span className="text-[22px]">Push</span>
            </motion.button>
            <p className="relative z-10 text-[12px] uppercase text-aura-red mt-6 font-bold flex items-center gap-[9px]">
              <AlertTriangle size={12} />
              Triggers Immediate Supabase Table Mutation
            </p>
          </div>

          {/* Content Deployment */}
          <div className="bg-aura-inner border-2 border-aura-dark p-[18px] flex-1 flex flex-col">
            <h3 className="text-[12px] uppercase text-aura-green/60 font-bold tracking-widest mb-[14px]">Content Deployment (Publicity v2)</h3>
            <p className="text-[12px] text-aura-green/40 mb-[14px]">Inject image slides directly into network queue.</p>
            
            <div className="flex flex-col gap-[14px] flex-1">
              {[0, 1, 2, 3].map(i => (
                <input 
                  key={i}
                  type="text" 
                  placeholder={`Slide ${i+1} Image URL`}
                  value={slides[i]}
                  onChange={e => {
                    const newSlides = [...slides];
                    newSlides[i] = e.target.value;
                    setSlides(newSlides);
                  }}
                  className="bg-aura-black border-2 border-aura-dark text-[13px] p-[9px] text-aura-text outline-none focus:border-aura-cyan w-full"
                />
              ))}
            </div>

            <button 
              onClick={handleSyncContent}
              className="mt-[18px] w-full bg-transparent border-2 border-aura-cyan text-aura-cyan font-bold text-[12px] py-4 uppercase tracking-widest hover:bg-aura-cyan/10 transition-colors flex items-center justify-center gap-[9px]"
            >
              <RefreshCw size={14} />
              Sync To Network
            </button>
          </div>
          
        </div>
        
      </div>
    </div>
  );
}
