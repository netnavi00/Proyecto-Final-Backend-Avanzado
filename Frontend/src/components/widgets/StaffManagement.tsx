import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Fingerprint, Wifi, Trophy } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { TableData, StaffData } from '../../App';
import { supabase } from '../../services/supabase';

export const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-aura-black border border-aura-green/50 text-aura-green font-mono text-[12px] uppercase font-bold tracking-widest shadow-[0_0_10px_rgba(0,255,65,0.2)] p-[9px]">
        <p className="mb-1 text-aura-cyan">{label}</p>
        <p>Nodes: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export function StaffManagement({ staffList, setStaffList, tables }: { staffList: StaffData[], setStaffList: React.Dispatch<React.SetStateAction<StaffData[]>>, tables: TableData[] }) {
  const [formData, setFormData] = useState({ name: '' });
  const [isPairing, setIsPairing] = useState(false);
  const [pairedUid, setPairedUid] = useState<string | null>(null);



  const handleRegister = () => {
    if (!formData.name) return;
    const newStaff: StaffData = {
      id: `S${staffList.length + 1}`,
      name: formData.name,
      nfcUid: pairedUid,
      rating: 5.0, // Default for new staff
      tables: []
    };
    setStaffList(prev => [...prev, newStaff]);
    // Reset form
    setFormData({ name: '' });
    setIsPairing(false);
    setPairedUid(null);
  };



  const activeStaffStats = useMemo(() => {
    return staffList.map(staff => {
      const activeCount = tables.filter(t => t.staffId === staff.id).length;
      return { ...staff, activeCount };
    }).sort((a, b) => {
      // Sort by rating desc, then active tables desc
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.activeCount - a.activeCount;
    });
  }, [staffList, tables]);

  return (
    <div className="h-full flex flex-col xl:flex-row gap-[35px] max-w-6xl mx-auto w-full">
      {/* Registration & NFC Panel */}
      <div className="w-full xl:w-1/3 flex flex-col gap-[26px]">
        <h2 className="text-[13px] font-bold flex items-center gap-[9px] shrink-0">
          <span className="w-1 h-3 bg-aura-cyan"></span>
          STAFF REGISTRATION
        </h2>

        <div className="bg-aura-inner border-2 border-aura-dark p-[26px] flex flex-col gap-[18px]">
          <div className="flex flex-col gap-1">
            <label className="text-[12px] uppercase opacity-60">Full Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="bg-aura-bg border-2 border-aura-dark text-[15px] p-[14px] text-aura-text outline-none focus:border-aura-cyan transition-colors"
              placeholder="e.g. Sarah Connor"
            />
          </div>

          <div className="mt-[18px] border border-dashed border-aura-cyan/40 p-[18px] flex flex-col items-center justify-center relative overflow-hidden min-h-[120px]">
            {!isPairing ? (
              <button 
                onClick={() => setIsPairing(true)}
                className="flex flex-col items-center gap-[9px] text-aura-cyan hover:text-aura-text transition-colors"
              >
                <Fingerprint size={32} />
                <span className="text-[12px] uppercase font-bold tracking-widest">Pair NFC Tag</span>
              </button>
            ) : !pairedUid ? (
              <div className="flex flex-col items-center gap-[14px]">
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="absolute w-24 h-24 border sm rounded-full border-aura-cyan/50"
                />
                <motion.div
                  animate={{ scale: [1, 2, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                  className="absolute w-16 h-16 border sm rounded-full border-aura-cyan/80"
                />
                <Wifi size={24} className="text-aura-cyan animate-pulse z-10" />
                <span className="text-[12px] uppercase tracking-widest text-aura-cyan/70 z-10">Scanning...</span>
              </div>
            ) : (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-[9px] text-aura-green"
              >
                <div className="w-12 h-12 rounded-full bg-aura-green/20 border-2 border-aura-green flex items-center justify-center shadow-[0_0_15px_rgba(0,255,65,0.4)]">
                  <Fingerprint size={24} />
                </div>
                <span className="text-[12px] uppercase tracking-widest font-bold">Tag Paired</span>
                <span className="text-[12px] font-mono opacity-80">{pairedUid}</span>
              </motion.div>
            )}
          </div>

          <div className="flex flex-col gap-[14px] mt-[18px]">
            <button 
              disabled={!formData.name}
              onClick={handleRegister}
              className="w-full bg-aura-cyan text-black font-black text-[13px] py-4 uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 transition-all font-mono"
            >
              Register Profile
            </button>

          </div>
        </div>
      </div>

      {/* Leaderboard Panel */}
      <div className="flex-1 flex flex-col gap-[26px]">
        <h2 className="text-[13px] font-bold flex items-center gap-[9px] shrink-0">
          <span className="w-1 h-3 bg-aura-green"></span>
          DYNAMIC LEADERBOARD
        </h2>

        <div className="bg-aura-inner border-2 border-aura-dark overflow-hidden flex flex-col shrink-0" style={{ height: '140px' }}>
          <div className="text-[12px] uppercase text-aura-green/50 tracking-widest font-bold p-[9px] border-b border-aura-dark">
            Node Allocation Overview
          </div>
          <div className="flex-1 pt-2 w-full h-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeStaffStats.slice(0, 5)} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--color-aura-green)', opacity: 0.5 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: 'var(--color-aura-green)', opacity: 0.5 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  content={<CustomChartTooltip />}
                  cursor={{ fill: 'var(--color-aura-green)', opacity: 0.1 }}
                />
                <Bar dataKey="activeCount" radius={[2, 2, 0, 0]}>
                  {
                    activeStaffStats.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#00e5ff' : 'var(--color-aura-green)'} opacity={index === 0 ? 0.8 : 0.4} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-aura-inner border-2 border-aura-dark flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="grid grid-cols-12 gap-[18px] p-[18px] border-b border-aura-dark text-[12px] uppercase text-aura-green/50 tracking-widest font-bold shrink-0">
            <div className="col-span-1">Rank</div>
            <div className="col-span-4">Operator</div>
            <div className="col-span-3">Capacity Load</div>
            <div className="col-span-2 text-center">Active Nodes</div>
            <div className="col-span-2 text-right">Rating</div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-[9px]">
            <AnimatePresence>
              {activeStaffStats.map((staff, idx) => {
                const maxNodes = 12; // Example capacity
                const loadPercent = Math.min((staff.activeCount / maxNodes) * 100, 100);
                return (
                <motion.div 
                  key={staff.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`grid grid-cols-12 gap-[18px] items-center p-[14px] mb-[9px] border ${idx === 0 ? 'border-aura-cyan bg-aura-cyan/5 shadow-[0_0_10px_rgba(0,229,255,0.1)]' : 'border-aura-dark text-aura-text hover:bg-aura-dark/50'} transition-colors`}
                >
                  <div className={`col-span-1 text-[13px] font-bold ${idx === 0 ? 'text-aura-cyan' : 'text-aura-green/40'}`}>
                    #{idx + 1}
                  </div>
                  <div className="col-span-4 flex items-center gap-[14px] overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-aura-black border-2 border-aura-green/30 flex items-center justify-center text-[12px] font-bold text-aura-green shrink-0">
                      {staff.name.split(' ').map((n: string) => n[0]).join('').substring(0,2).toUpperCase()}
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="text-[15px] font-bold truncate">{staff.name}</span>
                      <span className="text-[12px] font-mono text-aura-green/40 truncate">{staff.nfcUid || 'NO_TAG'}</span>
                    </div>
                  </div>
                  <div className="col-span-3 flex items-center">
                    <div className="h-1.5 w-full bg-aura-black border-2 border-aura-dark overflow-hidden flex">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${loadPercent}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full ${idx === 0 ? 'bg-aura-cyan' : 'bg-aura-green/50'}`}
                      />
                    </div>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={`text-[15px] font-bold ${staff.activeCount > 0 ? 'text-aura-text' : 'text-aura-dark'}`}>
                      {staff.activeCount}
                    </span>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <div className="flex items-center gap-1 bg-aura-black px-2 py-1 border-2 border-yellow-500/30 text-yellow-500 text-[13px] font-bold">
                      <Trophy size={10} />
                      {staff.rating.toFixed(1)}
                    </div>
                  </div>
                </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
