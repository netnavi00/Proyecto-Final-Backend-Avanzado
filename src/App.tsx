/// <reference types="vite/client" />
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, AlertTriangle, Monitor, Cpu, Server, Play, Copy, Maximize2, Crosshair, Map, X, Clock, Pencil, Users, Wifi, UserPlus, Trophy, Fingerprint, RefreshCw, Settings, ChevronLeft, ChevronRight, ShieldAlert, Globe, Key, ShieldCheck, LogOut, UserCog, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { createClient } from '@supabase/supabase-js';
import { EventHorizon, SystemEvent } from './components/EventHorizon';
import { supabase } from './services/supabase';

/* --- TYPES & MOCK DATA --- */
export type TableStatus = 'online' | 'alert' | 'promo' | 'offline' | 'admin';
export interface TableData {
  id: string;
  name: string;
  status: TableStatus;
  staffId: string | null;
  lastPing: number;
}

export interface StaffData {
  id: string;
  name: string;
  nfcUid: string | null;
  rating: number;
  tables: string[];
}

const INITIAL_STAFF: StaffData[] = [];
const INITIAL_EVENTS: SystemEvent[] = [];
const INITIAL_TABLES: TableData[] = [
  { id: 'TBL-01', name: 'T01', status: 'online', staffId: null, lastPing: Date.now() },
  { id: 'TBL-02', name: 'T02', status: 'online', staffId: null, lastPing: Date.now() },
  { id: 'TBL-03', name: 'T03', status: 'online', staffId: null, lastPing: Date.now() }
];

import SandboxModule from './components/SandboxModule';
import LoginModule from './components/LoginModule';
import { AuraLogo } from './components/AuraLogo';
import { TacticalGrid } from './components/TacticalGrid';
import { CreativeLab } from './components/CreativeLab';
import { Orchester } from './components/Orchester';
import { StaffManagement } from './components/StaffManagement';
import APUnit from './components/APUnit';

const TIERS = ['BASIC', 'PRO', 'PREMIUM'];
const CATEGORIES = ['PIZZA/PASTAS/ITALIANA', 'BAR', 'MEXICANA', 'ASIATICA', 'POSTRES/SNACKS', 'VEGETARIANA/GLUTEN-FREE/ENSALADAS', 'BEBIDAS','CARNES/CORTES', 'MARISCOS'];

/* --- COMPONENTE FUNCIONAL: AURA CENTRAL --- */
function AuraCentral() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', full_name: '', role: 'admin', establishment_name: '' , establishment_tier: 'BASIC', establishment_category: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: profs } = await supabase.from('profiles').select('*').order('role', { ascending: false });
      const { data: ests } = await supabase.from('establishments').select('*, owner:profiles(full_name)');
      if (profs) setProfiles(profs);
      if (ests) setEstablishments(ests);
    } catch (e) {
      console.error("Central Load Error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // 1. Autorizar el rango del usuario
    const { error: profileError } = await supabase.rpc('admin_upsert_profile', {
      target_id: formData.id, 
      new_name: formData.full_name.toUpperCase(), 
      new_role: formData.role 
    });

    if (!profileError) {
      // 2. Si se escribió un establecimiento, lo creamos y lo linkeamos al instante
      if (formData.establishment_name.trim() !== '') {
        const { error: estError } = await supabase.rpc('admin_create_establishment', {
          p_name: formData.establishment_name.toUpperCase(),
          p_owner_id: formData.id.toUpperCase(),
          p_tier: formData.establishment_tier.toUpperCase(),
          p_category: formData.establishment_category.toUpperCase()
        });
        if (estError) console.error("Error creando establecimiento:", estError.message);
      }

      setIsModalOpen(false);
      setFormData({ id: '', full_name: '', role: 'admin', establishment_name: '', establishment_tier: 'BASIC', establishment_category: ''  });
      await loadData();
    } else {
      alert("Error en autorización: " + profileError.message);
    }
    setLoading(false);
  };

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    const { error } = await supabase.rpc('update_user_role', {
      target_user_id: userId,
      new_role: newRole
    });

    if (!error) await loadData();
    else console.error("Error updating role:", error.message);
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <ShieldAlert size={32} className="text-[#a855f7] drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
          <div>
            <h2 className="text-2xl font-black text-[#a855f7] tracking-widest uppercase">AURA Central</h2>
            <p className="text-[10px] text-aura-green/50 uppercase tracking-[0.2em]">Rank Authorization Terminal</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { setFormData({id: '', full_name: '', role: 'admin', establishment_name: '', establishment_tier: 'BASIC', establishment_category: ''}); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 border-2 border-aura-cyan text-aura-cyan text-[11px] font-bold uppercase hover:bg-aura-cyan/10 transition-all"
          >
            <UserPlus size={14} /> + Admin
          </button>
          <button 
            onClick={() => { setFormData({id: '', full_name: '', role: 'superadmin', establishment_name: '', establishment_tier: 'BASIC', establishment_category: ''}); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 border-2 border-[#a855f7] text-[#a855f7] text-[11px] font-bold uppercase hover:bg-[#a855f7]/10 transition-all"
          >
            <Shield size={14} /> + Super
          </button>
          <button onClick={loadData} disabled={loading} className="p-2 hover:bg-[#a855f7]/10 rounded-full transition-colors ml-4">
            <RefreshCw size={20} className={`${loading ? 'animate-spin' : ''} text-[#a855f7]`} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <SectionTitle>User Role Management</SectionTitle>
        <div className="border-2 border-[#a855f7]/20 bg-aura-black/40 overflow-hidden font-mono text-[13px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#a855f7]/20 bg-[#a855f7]/5">
                <th className="p-4 text-[10px] uppercase text-[#a855f7]">Profile / UUID Signature</th>
                <th className="p-4 text-[10px] uppercase text-[#a855f7]">Current Rank</th>
                <th className="p-4 text-[10px] uppercase text-[#a855f7] text-right">Operations</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id} className="border-b border-aura-dark/30 hover:bg-[#a855f7]/5 transition-colors group">
                  <td className="p-4">
                    <div className="text-aura-text text-[13px] uppercase font-bold">{p.full_name || 'Unknown_Entity'}</div>
                    <div className="text-[9px] opacity-30">{p.id}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase border ${
                      p.role === 'superadmin' ? 'border-[#a855f7] text-[#a855f7] shadow-[0_0_8px_rgba(168,85,247,0.3)]' :
                      p.role === 'admin' ? 'border-aura-cyan text-aura-cyan' : 'border-aura-dark text-aura-green/40'
                    }`}>
                      {p.role || 'user'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleRoleUpdate(p.id, 'admin')} className="px-2 py-1 border border-aura-dark hover:border-aura-cyan text-[9px] uppercase transition-colors">Set Admin</button>
                      <button onClick={() => handleRoleUpdate(p.id, 'superadmin')} className="px-2 py-1 border border-aura-dark hover:border-[#a855f7] text-[9px] uppercase transition-colors">Set Super</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4">
        <SectionTitle>Global Establishments Network</SectionTitle>
        <div className="border-2 border-aura-dark bg-aura-black/40 overflow-hidden font-mono text-[13px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-aura-dark bg-aura-dark/30">
                <th className="p-4 text-[10px] uppercase opacity-40 font-black">Node Name</th>
                <th className="p-4 text-[10px] uppercase opacity-40 font-black">Tier</th>
                <th className="p-4 text-[10px] uppercase opacity-40 font-black">Owner Handle</th>
              </tr>
            </thead>
            <tbody>
              {establishments.map((e) => (
                <tr key={e.id} className="border-b border-aura-dark/30 hover:bg-aura-dark/20 transition-colors">
                  <td className="p-4 text-aura-text font-bold uppercase tracking-widest">{e.name}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 border border-aura-cyan/50 text-aura-cyan text-[10px] font-bold uppercase">
                      {e.tier || 'BASIC'}
                    </span>
                  </td>
                  <td className="p-4 text-aura-green font-bold uppercase">
                    {e.owner?.full_name || 'System_Root'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-aura-panel border-2 border-[#a855f7] p-8 max-w-md w-full relative z-[201] shadow-[0_0_50px_rgba(168,85,247,0.3)]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[#a855f7] font-black uppercase tracking-widest flex items-center gap-3"><UserCog size={20} /> Authorize {formData.role.toUpperCase()}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-aura-text/40 hover:text-white transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleAuthorize} className="space-y-4 font-mono">
                <div>
                  <label className="text-[10px] uppercase opacity-40 block mb-1">User UUID (Authentication ID)</label>
                  <input required value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} placeholder="Paste Auth UUID..." className="w-full bg-aura-inner border border-aura-dark p-3 text-aura-text outline-none focus:border-[#a855f7] text-xs" />
                </div>
                <div>
                  <label className="text-[10px] uppercase opacity-40 block mb-1">Full Name / Alias</label>
                  <input required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} placeholder="EJ: JUAN VEGA" className="w-full bg-aura-inner border border-aura-dark p-3 text-aura-text outline-none focus:border-[#a855f7] uppercase" />
                </div>

                {formData.role === 'admin' && (
                  <div className="border-t border-aura-dark pt-4 mt-2">
                    <label className="text-[10px] uppercase opacity-40 block mb-1 text-aura-cyan font-bold">Link Establishment (Node Name)</label>
                    <input required={formData.role === 'admin'} value={formData.establishment_name} onChange={e => setFormData({...formData, establishment_name: e.target.value})} placeholder="EJ: ARCADE CHOLULA" className="w-full bg-aura-inner border border-aura-cyan/30 p-3 text-aura-cyan outline-none focus:border-aura-cyan uppercase" />
                    <div className="grid grid-cols-2 gap-4 mt-4">
  <div>
    <label className="text-[10px] uppercase opacity-40 block mb-1 text-aura-cyan font-bold">Tier</label>
    <select 
      value={formData.establishment_tier} 
      onChange={e => setFormData({...formData, establishment_tier: e.target.value})}
      className="w-full bg-aura-inner border border-aura-cyan/30 p-3 text-aura-cyan outline-none focus:border-aura-cyan uppercase"
    >
      <option value="BASIC">BASIC</option>
      <option value="PRO">PRO</option>
      <option value="PREMIUM">PREMIUM</option>
    </select>
  </div>
  <div>
    <label className="text-[10px] uppercase opacity-40 block mb-1 text-aura-cyan font-bold">Category</label>
    <select 
      value={formData.establishment_category} 
      onChange={e => setFormData({...formData, establishment_category: e.target.value})}
      className="w-full bg-aura-inner border border-aura-cyan/30 p-3 text-aura-cyan outline-none focus:border-aura-cyan uppercase"
    >
      {CATEGORIES.map(cat => (
        <option key={cat} value={cat}>{cat}</option>
      ))}
    </select>
  </div>
</div>
                  </div>

                )}

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-aura-dark text-aura-text/60 text-[11px] font-bold uppercase">Abort</button>
                  <button type="submit" disabled={loading} className="flex-1 py-3 bg-[#a855f7] text-white text-[11px] font-black uppercase tracking-widest hover:brightness-110 disabled:opacity-50">{loading ? 'Committing...' : 'Grant Access'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* --- MAIN COMPONENT --- */
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [establishmentId, setEstablishmentId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'grid' | 'lab' | 'orchester' | 'staff' | 'sandbox' | 'central'>('grid');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [tables, setTables] = useState<TableData[]>(INITIAL_TABLES);
  const [staffList, setStaffList] = useState<StaffData[]>(INITIAL_STAFF);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [tableToDelete, setTableToDelete] = useState<string | null>(null);
  const [systemEvents, setSystemEvents] = useState<SystemEvent[]>(INITIAL_EVENTS);
  
  const [winningRatio, setWinningRatio] = useState(50);
  const [flashCountdown, setFlashCountdown] = useState<number | null>(null);
  
  const queryParams = new URLSearchParams(window.location.search);
  if (queryParams.has('id')) {
    return <APUnit />;
  }

  // --- SINCRONIZACIÓN DE RANGO ---
  const loadUserContext = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle(); 

      if (error) {
        console.error("❌ Auth Sync Error:", error.message);
        setUserRole('user');
      } else {
        setUserRole(data?.role || 'user');
      }
    } catch (err) {
      console.error("⚠️ Fallo en contexto:", err);
      setUserRole('user');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setOrganizationId(session.user.id);
        setEstablishmentId(session.user.id);
        setIsAuthenticated(true); 
        await loadUserContext(session.user.id); 
      } else {
        setIsAuthenticated(false);
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        setOrganizationId(session.user.id);
        setEstablishmentId(session.user.id);
        setIsAuthenticated(true);
        loadUserContext(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUserRole(null);
        setOrganizationId(null);
        setEstablishmentId(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (flashCountdown !== null && flashCountdown > 0) {
      const t = setTimeout(() => setFlashCountdown(flashCountdown - 1), 1000);
      return () => clearTimeout(t);
    } else if (flashCountdown === 0) {
      setFlashCountdown(null);
      setTables(prev => prev.map(t => t.status === 'promo' ? { ...t, status: 'online' } : t));
    }
  }, [flashCountdown]);

  useEffect(() => {
    if (!establishmentId) return;
    const fetchUnits = async () => {
      const { data } = await supabase.from('devices').select('*, staff:current_staff_id (name)').eq('establishment_id', establishmentId);
      if (data) setTables(data);
    };
    fetchUnits();
    const channel = supabase.channel('grid-updates').on('postgres_changes', { event: '*', schema: 'public', table: 'devices', filter: `establishment_id=eq.${establishmentId}` }, () => fetchUnits()).subscribe();
    return () => { channel.unsubscribe(); };
  }, [establishmentId]);

  const handleAddTable = () => {
    const newId = `TBL-${String(tables.length + 1).padStart(2, '0')}`;
    const newTable: TableData = { id: newId, name: `T${String(tables.length + 1).padStart(2, '0')}`, status: 'offline', staffId: null, lastPing: Date.now() };
    setTables(prev => [...prev, newTable]);
  };

  const handleRemoveTable = (id: string) => { setTableToDelete(id); };

  const confirmRemoveTable = () => {
    if (!tableToDelete) return;
    setTables(prev => prev.filter(t => t.id !== tableToDelete));
    if (selectedTableId === tableToDelete) setSelectedTableId(null);
    setTableToDelete(null);
  };

  const handleRenameTable = (id: string, newName: string) => {
    setTables(prev => prev.map(t => t.id === id ? { ...t, name: newName } : t));
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-aura-cyan animate-pulse tracking-[1em] font-mono text-xs uppercase italic">Aura_OS_Booting...</div>;

  if (!isAuthenticated) return <LoginModule onLoginSuccess={() => {}} />;

  return (
    <div className="min-h-screen h-screen bg-aura-panel text-aura-green font-mono flex flex-col overflow-hidden p-[18px] border-4 border-aura-dark select-none text-[13px]">
      
      <header className="flex justify-between items-center border-b-2 border-aura-green/30 pb-4 mb-[18px] shrink-0 z-10">
        <div className="flex items-center gap-[26px]">
          <div className="flex items-center gap-4">
            <AuraLogo size={42} className="text-aura-green drop-shadow-[0_0_10px_rgba(0,255,65,0.6)]" />
            <div className="flex flex-col">
              <h1 className="text-[24px] font-black tracking-widest uppercase text-aura-green leading-none flex items-center gap-2">
                AURA <span className="font-light">Play</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-aura-cyan uppercase tracking-widest">Command Center</span>
                <span className="text-[10px] text-aura-dark font-bold">//</span>
                <span className="text-[10px] text-aura-text/60 uppercase">{userRole}</span>
              </div>
            </div>
          </div>
          
          <div className="h-10 w-[2px] bg-aura-dark"></div>

          <div className="flex gap-8 items-center">
            <div className="flex flex-col text-right">
              <span className="text-[9px] opacity-40 uppercase">Sys Time</span>
              <span className="text-[14px] text-aura-text">{new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[9px] opacity-40 uppercase">Auth Status</span>
              <span className="text-[14px] text-aura-cyan font-bold uppercase italic">STABLE</span>
            </div>
          </div>
        </div>

        <button 
          onClick={async () => {
            setIsAuthenticated(false);
            setUserRole(null);
            await supabase.auth.signOut();
            window.location.reload();
          }}
          className="p-2 text-aura-red hover:bg-aura-red/10 transition-colors rounded-lg group"
        >
          <LogOut size={24} className="drop-shadow-[0_0_8px_rgba(255,0,60,0.4)] group-hover:scale-110 transition-transform" />
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden gap-[18px]">
        <aside className={`${isSidebarCollapsed ? 'w-20 items-center' : 'w-64 p-[18px]'} bg-aura-panel border-2 border-aura-dark flex flex-col shrink-0 z-10 transition-all duration-300 relative`}>
          {isSidebarCollapsed ? (
            <div className="py-4 w-full flex justify-center">
              <button onClick={() => setIsSidebarCollapsed(false)} className="text-aura-green opacity-60 hover:opacity-100 transition-opacity p-[9px]">
                <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between mb-[18px]">
              <h2 className="text-[13px] font-bold flex items-center gap-[9px]">
                <span className="w-1 h-3 bg-aura-cyan"></span>
                MODULE TERMINAL
              </h2>
              <button onClick={() => setIsSidebarCollapsed(true)} className="text-aura-green opacity-60 hover:opacity-100 transition-opacity">
                <ChevronLeft size={16} />
              </button>
            </div>
          )}

          <div className={`space-y-2 w-full ${isSidebarCollapsed ? 'px-2' : ''}`}>
            <NavButton active={activeTab === 'grid'} onClick={() => setActiveTab('grid')} icon={<Map size={16} />} label="Tactical Grid" collapsed={isSidebarCollapsed} />
            <NavButton active={activeTab === 'lab'} onClick={() => setActiveTab('lab')} icon={<Cpu size={16} />} label="Creative Lab" collapsed={isSidebarCollapsed} />
            <NavButton active={activeTab === 'orchester'} onClick={() => setActiveTab('orchester')} icon={<Crosshair size={16} />} label="Orchester" collapsed={isSidebarCollapsed} />
            <NavButton active={activeTab === 'sandbox'} onClick={() => setActiveTab('sandbox')} icon={<Settings size={16} />} label="Sandbox" collapsed={isSidebarCollapsed} />
            <NavButton active={activeTab === 'staff'} onClick={() => setActiveTab('staff')} icon={<Users size={16} />} label="Staff & NFC" collapsed={isSidebarCollapsed} />
            
            {(userRole === 'superadmin' || userRole === 'admin') && (
              <>
                <div className="border-t border-aura-green/30 my-2 w-full"></div>
                <NavButton 
                  active={activeTab === 'central'} 
                  onClick={() => setActiveTab('central')} 
                  icon={<ShieldCheck size={16} className={activeTab === 'central' ? "text-[#a855f7]" : "text-[#a855f7]/60"} />} 
                  label="AURA Central" 
                  collapsed={isSidebarCollapsed}
                  customClass="text-[#a855f7]"
                />
              </>
            )}
          </div>

          <div className="mt-auto w-full">
            <div className={`bg-aura-inner border-l-2 border-aura-green ${isSidebarCollapsed ? 'p-[9px] flex flex-col items-center justify-center' : 'p-[14px]'}`}>
              {!isSidebarCollapsed && <p className="text-[12px] opacity-60 uppercase mb-1">Sys Gamification</p>}
              <div className="text-[15px] text-aura-text flex items-center justify-between">
                {!isSidebarCollapsed && <span>Win Ratio:</span>}
                <span className="font-bold">{winningRatio}%</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 bg-aura-panel border-2 border-aura-dark p-[18px] relative overflow-hidden flex flex-col font-mono text-[13px]">
          <AnimatePresence mode="wait">
            {activeTab === 'grid' && (
              <motion.div key="grid" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="w-full h-full p-[26px] overflow-y-auto">
                <TacticalGrid tables={tables} staffList={staffList} onTableSelect={(id:string) => setSelectedTableId(id)} onAddTable={handleAddTable} onRemoveTable={handleRemoveTable} />
              </motion.div>
            )}
            {activeTab === 'lab' && (
              <motion.div key="lab" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-full h-full p-[26px] overflow-y-auto"><CreativeLab /></motion.div>
            )}
            {activeTab === 'orchester' && (
              <motion.div key="orchester" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full h-full p-[26px] overflow-y-auto">
                <Orchester tables={tables} winningRatio={winningRatio} setWinningRatio={setWinningRatio} onFlashAction={() => { setFlashCountdown(15); setTables(prev => prev.map(t => ({ ...t, status: 'promo' }))); }} isFlashActive={flashCountdown !== null} flashTime={flashCountdown} />
              </motion.div>
            )}
            {activeTab === 'staff' && (
              <motion.div key="staff" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full h-full p-[26px] overflow-y-auto"><StaffManagement staffList={staffList} setStaffList={setStaffList} tables={tables} /></motion.div>
            )}
            {activeTab === 'central' && (
              <motion.div key="central" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full h-full p-[26px] overflow-y-auto"><AuraCentral /></motion.div>
            )}
            {activeTab === 'sandbox' && (
              <motion.div key="sandbox" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full h-full overflow-hidden"><SandboxModule /></motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {selectedTableId && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="absolute inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedTableId(null)} />
                <LiveMirrorDrawer 
                  table={tables.find(t => t.id === selectedTableId)} 
                  staff={staffList.find(s => s.id === tables.find(t => t.id === selectedTableId)?.staffId)}
                  onClose={() => setSelectedTableId(null)} 
                  onRename={(name:string) => { if (selectedTableId) handleRenameTable(selectedTableId, name); }}
                  onToggleAdmin={(id:string, isCurrentlyAdmin:boolean) => { setTables(prev => prev.map(t => t.id === id ? { ...t, status: isCurrentlyAdmin ? 'online' : 'admin' } : t)); }}
                />
              </>
            )}
          </AnimatePresence>
        </main>

        <EventHorizon events={systemEvents} onSelectUnit={(id:string) => { setActiveTab('grid'); setSelectedTableId(id); }} activeNodesCount={tables.filter(t => t.status !== 'offline').length} totalNodesCount={tables.length} />
      </div>
      
      <footer className="mt-[18px] pt-2 border-t border-aura-dark flex justify-between items-center text-[11px] opacity-60 shrink-0 font-mono tracking-widest uppercase">
        <div className="flex gap-[26px]">
          <span>DB: CONNECTED</span>
          <span className="text-aura-cyan">Uplink: {organizationId?.slice(0, 8)}...</span>
        </div>
        <span>LATENCY: 12ms</span>
      </footer>

      <AnimatePresence>
        {tableToDelete && (
          <ConfirmModal title="Confirm Node Deletion" message={`Are you sure you want to permanently delete ${tableToDelete}?`} onConfirm={confirmRemoveTable} onCancel={() => setTableToDelete(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* --- UI COMPONENTS ORIGINALES --- */
function NavButton({ active, onClick, icon, label, collapsed, customClass }: any) {
  return (
    <div className="relative group w-full">
      <button onClick={onClick} className={`w-full flex items-center ${collapsed ? 'justify-center p-[14px]' : 'gap-[14px] p-[14px]'} text-[13px] font-bold transition-all border-l-2 ${active ? (customClass ? 'border-[#a855f7] bg-[#a855f7]/10' : 'border-aura-green bg-aura-inner') + ' text-aura-text' : (customClass ? customClass + ' opacity-60 hover:opacity-100' : 'border-transparent text-aura-green/60 hover:text-aura-text') + ' hover:bg-aura-dark'}`}>
        {icon}
        {!collapsed && <span className="uppercase tracking-widest">{label}</span>}
      </button>
    </div>
  );
}

function LiveMirrorDrawer({ table, staff, onClose, onRename, onToggleAdmin }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  useEffect(() => { if (table && !isEditing) setEditName(table.name); }, [table?.name, isEditing]);
  if (!table) return null;

  const submitEdit = () => {
    setIsEditing(false);
    if (editName.trim() !== '' && editName !== table.name) onRename(editName.trim().toUpperCase());
  };

  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="absolute top-0 right-0 bottom-0 w-[400px] border-l border-aura-green/30 bg-aura-bg/95 backdrop-blur-xl shadow-[-10px_0_30px_rgba(0,0,0,0.8)] z-50 flex flex-col font-mono text-[13px]">
      <div className="flex items-center justify-between p-[18px] border-b border-aura-green/20">
        <div className="flex items-center gap-[14px] text-aura-green"><Maximize2 size={18} /><h3 className="font-bold uppercase tracking-widest text-[14px]">Live Mirroring</h3></div>
        <button onClick={onClose} className="text-aura-green/50 hover:text-aura-green transition-colors"><X size={20} /></button>
      </div>
      <div className="p-[26px] flex-1 flex flex-col overflow-y-auto">
        <div className="flex items-start justify-between mb-6 gap-4">
          <div className="flex-1 min-w-0">
            <div className="text-[33px] font-black tracking-widest text-aura-green mb-1 flex items-center gap-[14px]">
              {isEditing ? <input autoFocus value={editName} onChange={e => setEditName(e.target.value)} onBlur={submitEdit} className="bg-transparent border-b border-aura-cyan text-aura-text outline-none w-48" /> : <span className="truncate flex items-center gap-4">{table.name} <button onClick={() => setIsEditing(true)}><Pencil size={18} className="opacity-30"/></button></span>}
            </div>
            <p className="text-[10px] uppercase opacity-40 font-bold">{table.id} // STAFF: {staff?.name || 'NONE'}</p>
          </div>
        </div>
        <div className="w-full aspect-video border-2 border-aura-green/50 bg-aura-black flex items-center justify-center">
          <Play className="text-aura-green/30" size={40} />
        </div>
      </div>
    </motion.div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-[12px] text-aura-green/50 uppercase tracking-[0.2em] mb-[18px] border-b border-aura-green/10 pb-2 font-black">{children}</div>;
}

function StatBox({ label, value }: { label: string, value: string }) {
  return <div className="border-2 border-aura-green/20 p-[14px] bg-aura-green/5"><div className="text-[12px] uppercase text-aura-green/50 mb-1">{label}</div><div className="text-[15px] font-bold text-aura-green tracking-widest">{value}</div></div>;
}

function ConfirmModal({ title, message, onConfirm, onCancel }: any) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-aura-panel border-2 border-aura-red p-10 max-w-md w-full shadow-[0_0_50px_rgba(255,0,0,0.2)]">
        <h2 className="text-aura-red font-black uppercase tracking-widest text-xl mb-4">{title}</h2>
        <p className="text-aura-text mb-8 font-mono opacity-80">{message}</p>
        <div className="flex gap-4">
          <button onClick={onCancel} className="flex-1 py-4 border-2 border-aura-dark text-[12px] font-black uppercase">Abort</button>
          <button onClick={onConfirm} className="flex-1 py-4 bg-aura-red text-white text-[12px] font-black uppercase">Confirm</button>
        </div>
      </motion.div>
    </div>
  );
}