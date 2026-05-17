/// <reference types="vite/client" />
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion'; 
import { 
  Map, Cpu, Crosshair, Settings, Users, ShieldCheck, LogOut, 
  ChevronLeft, ChevronRight, Play, X, Pencil, Maximize2, Terminal 
} from 'lucide-react';
import { supabase } from './services/supabase';

/* --- COMPONENTES MODULARES --- */
import SandboxModule from './components/SandboxModule';
import {LoginModule} from './components/LoginModule';
import { AuraLogo } from './components/AuraLogo';
import { TacticalGrid } from './components/TacticalGrid';
import { CreativeLab } from './components/CreativeLab';
import { Orchester } from './components/Orchester';
import { StaffManagement } from './components/StaffManagement';
import { EventHorizon } from './components/EventHorizon';
import APUnit from './components/APUnit';
import { AuraCentral } from './components/AuraCentral';
import { Endpoints } from './components/Endpoints';


/* --- TYPES --- */
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

export default function App() {
  // 1. CONTEXTO DE AUTENTICACIÓN
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [establishmentId, setEstablishmentId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 2. CONTROL DE NAVEGACIÓN Y PANEL
  const [activeTab, setActiveTab] = useState<'grid' | 'lab' | 'orchester' | 'staff' | 'sandbox' | 'central'>('grid');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // 👇 NUEVO ESTADO: CONTROL DE LA VENTANA FLOTANTE DE ENDPOINTS 👇
  const [showTerminal, setShowTerminal] = useState(false);
  
  // 3. ESTADOS DE RED (Sincronizados en caliente con la DB)
  const [tables, setTables] = useState<TableData[]>([]);
  const [staffList, setStaffList] = useState<StaffData[]>([]);
  const [systemEvents] = useState<any[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [tableToDelete, setTableToDelete] = useState<string | null>(null);
  
  // 4. SISTEMA DE GAMIFICATION & COUNTDOWNS
  const [winningRatio, setWinningRatio] = useState(50);
  const [flashCountdown, setFlashCountdown] = useState<number | null>(null);  

  // =========================================================
  // ENRUTADOR DE MARKETING (AISLAMIENTO DE PLACA APUNIT)
  // =========================================================
  const params = new URLSearchParams(window.location.search);
  if (params.get('mode') === 'apunit' || params.has('id')) {
    return <APUnit />;
  }

  // --- SINCRONIZACIÓN AUTOMÁTICA DE RANGO ---
  const loadUserContext = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle(); 

      if (error) throw error;
      setUserRole(data?.role || 'user');
    } catch (err) {
      console.error("⚠️ Error cargando rango del perfil:", err);
      setUserRole('user');
    } finally {
      setLoading(false);
    }
  };
  
  // --- MONITOREO DE SESIÓN ACTIVA ---
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

  // --- CONTADOR DE EVENTOS PROMO ---
  useEffect(() => {
    if (flashCountdown !== null && flashCountdown > 0) {
      const t = setTimeout(() => setFlashCountdown(flashCountdown - 1), 1000);
      return () => clearTimeout(t);
    } else if (flashCountdown === 0) {
      setFlashCountdown(null);
      setTables(prev => prev.map(t => t.status === 'promo' ? { ...t, status: 'online' } : t));
    }
  }, [flashCountdown]);

  // --- CARGA Y REALTIME DE HARDWARE (TACTICAL GRID) ---
  useEffect(() => {
    if (!establishmentId) return;
    
    const fetchUnits = async () => {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('establishment_id', establishmentId);
        
      if (error) {
        console.error("❌ Error actualizando nodos en grid:", error.message);
      } else if (data) {
        setTables(data); 
      }
    };

    fetchUnits();

    const channel = supabase
      .channel('grid-updates')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'devices', 
        filter: `establishment_id=eq.${establishmentId}` 
      }, () => fetchUnits())
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [establishmentId]);

  // --- OPERACIONES DE NODOS LOCALES ---
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
    <div className="min-h-screen h-screen bg-aura-panel text-aura-green font-mono flex flex-col overflow-hidden p-[18px] border-4 border-aura-dark select-none text-[13px] relative">
      
      {/* --- CORE CONTROL HEADER --- */}
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

      {/* --- DASHBOARD WRAPPER --- */}
      <div className="flex flex-1 overflow-hidden gap-[18px]">
        
        {/* SIDEBAR NAVIGATION */}
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
            
            {userRole === 'superadmin' && (
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

        {/* WORKSPACE AREA */}
        <main className="flex-1 bg-aura-panel border-2 border-aura-dark p-[18px] relative overflow-hidden flex flex-col font-mono text-[13px]">
          <div className="flex-1 min-h-0 relative flex flex-col overflow-hidden">
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
                <motion.div key="central" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full h-full p-[26px] overflow-y-auto">
                  {userRole === 'superadmin' ? (
                    <AuraCentral />
                  ) : (
                    /* TERMINAL DE ACCESO DENEGADO */
                    <div className="h-full flex flex-col items-center justify-center font-mono text-center space-y-4 border-2 border-aura-red/30 bg-aura-red/5 p-8 rounded-lg">
                      <div className="w-3 h-3 bg-aura-red rounded-full animate-ping shadow-[0_0_10px_#ff003c]" />
                      <h2 className="text-2xl font-black text-aura-red uppercase tracking-widest">CRITICAL_SECURITY_BREACH</h2>
                      <p className="text-xs text-aura-text/60 max-w-md uppercase tracking-wider">
                        Access denied. Your current clearance level <span className="text-aura-cyan">[{userRole}]</span> is insufficient to uplink with AURA ROOT TERMINAL. This incident has been logged.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
              {activeTab === 'sandbox' && (
                <motion.div key="sandbox" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full h-full overflow-hidden"><SandboxModule /></motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* OVERLAY TELEMETRÍA: DRAWERS */}
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

        {/* FEED LATERAL DE EVENTOS */}
        <EventHorizon events={systemEvents} onSelectUnit={(id:string) => { setActiveTab('grid'); setSelectedTableId(id); }} activeNodesCount={tables.filter(t => t.status !== 'offline').length} totalNodesCount={tables.length} />
      </div>
      
      {/* 👇 VENTANA FLOTANTE "POR APARTE" DE ENDPOINTS CON ANIMACIÓN TÁCTICA 👇 */}
      <AnimatePresence>
        {userRole === 'superadmin' && showTerminal && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed top-[100px] right-[420px] bottom-[80px] w-[650px] bg-zinc-950/95 backdrop-blur-md border-2 border-aura-cyan shadow-[0_0_50px_rgba(0,243,255,0.2)] z-50 flex flex-col p-2"
          >
            {/* BARRA DE TÍTULO DE LA VENTANA */}
            <div className="flex justify-between items-center bg-zinc-900 px-3 py-1.5 border-b border-aura-cyan/30 text-[11px] font-bold text-aura-cyan">
              <span className="flex items-center gap-2"><Terminal size={12}/> [SYS_UPLINK_CONSOLE] // ISOLATED_MODE</span>
              <button 
                onClick={() => setShowTerminal(false)}
                className="text-zinc-500 hover:text-aura-red uppercase font-black px-1.5 hover:bg-aura-red/10 transition-colors"
              >
                [X]
              </button>
            </div>
            {/* CONTENIDO INTERNO CON SCROLL PROPIO */}
            <div className="flex-1 overflow-y-auto p-2">
              <Endpoints />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SYSTEM SYSTEM FOOTER */}
      <footer className="mt-[18px] pt-2 border-t border-aura-dark flex justify-between items-center text-[11px] opacity-60 shrink-0 font-mono tracking-widest uppercase">
        <div className="flex gap-[26px] items-center">
          <span>DB: CONNECTED</span>
          <span className="text-aura-cyan">Uplink: {organizationId?.slice(0, 8)}...</span>
          
          {/* 👇 BOTÓN DE ACCESO RÁPIDO PARA ACTIVAR LA VENTANA FLOTANTE 👇 */}
          {userRole === 'superadmin' && (
            <button
              onClick={() => setShowTerminal(!showTerminal)}
              className={`ml-4 px-2 py-0.5 border flex items-center gap-1.5 font-bold transition-all ${showTerminal ? 'bg-aura-cyan text-black border-aura-cyan animate-pulse' : 'text-aura-cyan border-aura-cyan/30 hover:bg-aura-cyan/10'}`}
            >
              <Terminal size={12}/> {showTerminal ? 'CLOSE_TERMINAL' : 'OPEN_TERMINAL'}
            </button>
          )}
        </div>
        <span>LATENCY: 12ms</span>
      </footer>

      {/* MODAL DE CONFIRMACIÓN DE BORRADO */}
      <AnimatePresence>
        {tableToDelete && (
          <ConfirmModal title="Confirm Node Deletion" message={`Are you sure you want to permanently delete ${tableToDelete}?`} onConfirm={confirmRemoveTable} onCancel={() => setTableToDelete(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* --- UI SUB-COMPONENTS --- */
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

function LiveMirrorDrawer({ table, staff, onClose, onRename }: any) {
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