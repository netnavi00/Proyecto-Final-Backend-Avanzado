import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, CheckCircle, Terminal, AlertTriangle, ChevronsRight, Activity } from 'lucide-react';
import { supabase } from '../services/supabase';

export interface SystemEvent {
  id: string;
  timestamp: string;
  category: 'SUCCESS' | 'INFO' | 'WARN' | 'CRITICAL';
  message: string;
  unitId?: string;
}

interface EventHorizonProps {
  events: SystemEvent[];
  onSelectUnit?: (id: string) => void;
  activeNodesCount?: number;
  totalNodesCount?: number;
}

export function EventHorizon({ events, onSelectUnit, activeNodesCount = 12, totalNodesCount = 12 }: EventHorizonProps) {
  const [collapsed, setCollapsed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Uptime ticker
  const [uptime, setUptime] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setUptime(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'SUCCESS': return 'border-aura-green text-aura-green';
      case 'INFO': return 'border-aura-cyan text-aura-cyan';
      case 'WARN': return 'border-yellow-500 text-yellow-500';
      case 'CRITICAL': return 'border-aura-red text-aura-red';
      default: return 'border-aura-green text-aura-green';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'SUCCESS': return <CheckCircle size={14} />;
      case 'INFO': return <Terminal size={14} />;
      case 'WARN': return <AlertTriangle size={14} />;
      case 'CRITICAL': return <Zap size={14} />;
      default: return <Terminal size={14} />;
    }
  };

  if (collapsed) {
    return (
      <div className="w-12 bg-aura-black border-2 border-aura-dark flex flex-col items-center py-4 shrink-0 z-10 transition-all duration-300">
         <button onClick={() => setCollapsed(false)} className="text-aura-green opacity-60 hover:opacity-100 transition-opacity p-[9px] border border-transparent hover:border-aura-green/50 rounded bg-aura-panel mt-[9px]">
            <ChevronsRight size={16} className="rotate-180" />
         </button>
         <div className="flex-1" />
         <div className="text-[12px] text-aura-green/50 tracking-widest uppercase font-bold" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
           Event Horizon -- Offline
         </div>
         <div className="flex-1" />
      </div>
    );
  }

  return (
    <aside className="w-80 bg-aura-black border-2 border-aura-dark flex flex-col shrink-0 z-10 font-mono transition-all duration-300">
      {/* System Header */}
      <div className="p-[14px] border-b-2 border-aura-dark bg-aura-panel flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="text-[12px] flex items-center gap-[9px] text-aura-green font-bold glow-green">
             <div className="w-2 h-2 rounded-full bg-aura-green animate-pulse shadow-[0_0_8px_rgba(0,255,65,0.8)]" />
             DB: CONNECTED
          </div>
          <div className="text-[12px] text-aura-text opacity-80">
             NODES: {activeNodesCount}/{totalNodesCount}
          </div>
        </div>
        <button onClick={() => setCollapsed(true)} className="text-aura-green opacity-60 hover:opacity-100 transition-opacity p-1 border border-transparent hover:border-aura-green/50 rounded">
          <ChevronsRight size={16} />
        </button>
      </div>

      {/* The Stream */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-[14px] space-y-3 bg-aura-black"
        style={{ scrollBehavior: 'smooth' }}
      >
        <AnimatePresence initial={false}>
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={() => event.unitId && onSelectUnit && onSelectUnit(event.unitId)}
              className={`p-[9px] border-l-2 bg-aura-panel/80 hover:bg-aura-panel transition-colors ${event.unitId ? 'cursor-pointer hover:shadow-[0_0_10px_rgba(0,255,65,0.1)]' : ''} group ${getCategoryColor(event.category).split(' ')[0]} flex flex-col gap-1`}
            >
              <div className="flex justify-between items-center text-[12px] opacity-70">
                <span className="text-aura-text font-bold">[{event.timestamp}]</span>
                <span className={getCategoryColor(event.category).split(' ')[1]}>{getCategoryIcon(event.category)}</span>
              </div>
              <div className="text-[12px] leading-tight text-aura-text group-hover:text-white transition-colors">
                {event.message}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="p-[9px] border-t-2 border-aura-dark bg-aura-panel flex items-center justify-between text-[12px]">
        <div className="text-aura-green font-bold">
           UPTIME: {formatUptime(uptime)}
        </div>
      </div>
    </aside>
  );
}
