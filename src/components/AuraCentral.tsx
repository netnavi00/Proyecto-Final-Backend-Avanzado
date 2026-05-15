import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; 
import { 
  ShieldAlert, 
  RefreshCw, 
  UserPlus, 
  UserCog, 
  ShieldCheck, 
  UserCheck, 
  Shield,
  X,
  Globe
} from 'lucide-react';
import { supabase } from '../services/supabase';

/* --- COMPONENTES AUXILIARES DE UI --- */
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="text-[11px] text-aura-green/40 uppercase tracking-[0.3em] mb-6 border-b border-aura-green/10 pb-2 flex items-center gap-2 font-mono">
    <div className="w-1.5 h-1.5 bg-[#a855f7] rounded-full shadow-[0_0_5px_#a855f7]" />
    {children}
  </div>
);

/* --- COMPONENTE PRINCIPAL --- */
export default function AuraCentral() {
  // 1. ESTADOS DE DATOS
  const [profiles, setProfiles] = useState<any[]>([]);
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 2. ESTADOS DEL MODAL / FORMULARIO
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', full_name: '', role: 'admin' });

  // 3. CARGA DE DATOS DESDE SUPABASE
  const loadGlobalData = async () => {
    setLoading(true);
    try {
      // Perfiles
      const { data: profs } = await supabase
        .from('profiles')
        .select('*')
        .order('role', { ascending: false });

      // Establecimientos (Con el join corregido a 'profiles')
      const { data: ests } = await supabase
        .from('establishments')
        .select('*, owner:profiles(full_name)');
      
      if (profs) setProfiles(profs);
      if (ests) setEstablishments(ests);
    } catch (err: any) {
      console.error("Error en carga AURA Central:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGlobalData();
  }, []);

  // 4. FUNCIONES DE ACCIÓN
  const openRegistration = (role: 'admin' | 'superadmin') => {
    setFormData({ id: '', full_name: '', role });
    setIsModalOpen(true);
  };

  const handleFinalAuthorization = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert([{ 
          id: formData.id, 
          full_name: formData.full_name.toUpperCase(), 
          role: formData.role 
        }]);

      if (error) throw error;
      
      setIsModalOpen(false);
      setFormData({ id: '', full_name: '', role: 'admin' });
      await loadGlobalData();
    } catch (err: any) {
      alert("Error de autorización: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 p-6 max-w-6xl mx-auto font-mono custom-scrollbar overflow-y-auto h-full">
      
      {/* SECCIÓN DE CABECERA Y BOTONES DE ALTA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-aura-black/20 p-6 border border-[#a855f7]/30 rounded-xl gap-4">
        <div className="flex items-center gap-4">
          <ShieldAlert size={38} className="text-[#a855f7] drop-shadow-[0_0_8px_#a855f7]" />
          <div>
            <h2 className="text-2xl font-black text-[#a855f7] tracking-tighter uppercase">AURA CENTRAL</h2>
            <p className="text-[10px] text-aura-green/50 uppercase tracking-widest font-bold">Terminal de Gestión de Rangos</p>
          </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => openRegistration('admin')}
            className="flex-1 md:flex-none px-4 py-2 border-2 border-aura-cyan text-aura-cyan text-[11px] font-black uppercase hover:bg-aura-cyan/10 transition-all active:scale-95"
          >
            <UserPlus size={14} className="inline mr-2" /> + Admin
          </button>
          <button 
            onClick={() => openRegistration('superadmin')}
            className="flex-1 md:flex-none px-4 py-2 border-2 border-[#a855f7] text-[#a855f7] text-[11px] font-black uppercase hover:bg-[#a855f7]/10 transition-all active:scale-95"
          >
            <Shield size={14} className="inline mr-2" /> + Super
          </button>
        </div>
      </div>

      {/* TABLA DE ENTIDADES AUTORIZADAS */}
      <div className="space-y-4">
        <SectionTitle>Authorized Entities</SectionTitle>
        <div className="border border-aura-dark bg-aura-black/40 rounded-lg overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-[10px] uppercase text-aura-green/60 font-black tracking-widest">
              <tr>
                <th className="p-4">UUID Signature</th>
                <th className="p-4">Full Name</th>
                <th className="p-4">Rank</th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
              {profiles.map((p) => (
                <tr key={p.id} className="border-t border-aura-dark/30 hover:bg-white/5 transition-colors">
                  <td className="p-4 opacity-30 text-[10px] font-mono">{p.id}</td>
                  <td className="p-4 text-aura-text font-bold uppercase tracking-tight">{p.full_name}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                      p.role === 'superadmin' ? 'border-[#a855f7] text-[#a855f7] bg-[#a855f7]/10' : 'border-aura-cyan text-aura-cyan bg-aura-cyan/10'
                    }`}>
                      {p.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RED DE ESTABLECIMIENTOS (UPLINK) */}
      <div className="space-y-4">
        <SectionTitle>Global Establishments Uplink</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {establishments.map((e) => (
            <div key={e.id} className="border border-aura-dark bg-aura-inner/30 p-4 rounded-lg group hover:border-aura-cyan transition-all">
              <div className="flex justify-between items-start mb-3">
                <Globe size={18} className="text-aura-cyan" />
                <span className="text-[9px] text-aura-cyan border border-aura-cyan/30 px-1 rounded uppercase">{e.tier || 'Standard'}</span>
              </div>
              <h4 className="text-aura-text font-bold uppercase text-sm mb-1">{e.name}</h4>
              <p className="text-[10px] text-aura-green/40 mb-3 font-mono">{e.id.slice(0,13)}...</p>
              <div className="pt-3 border-t border-aura-dark flex justify-between items-center">
                <span className="text-[9px] uppercase opacity-30">Owner:</span>
                <span className="text-[10px] text-aura-cyan font-bold">{e.owner?.full_name || 'System'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DE FORMULARIO (ANCLADO AL FINAL) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-aura-panel border-2 border-[#a855f7] p-8 max-w-md w-full relative z-[201] rounded-lg shadow-[0_0_50px_rgba(168,85,247,0.3)]"
            >
              <div className="flex justify-between items-center mb-6 border-b border-[#a855f7]/20 pb-4">
                <h3 className="text-[#a855f7] font-black uppercase tracking-widest flex items-center gap-3">
                  <UserCog size={20} /> Autorizar {formData.role.toUpperCase()}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-aura-text/40 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleFinalAuthorization} className="space-y-5">
                <div>
                  <label className="text-[10px] uppercase opacity-40 block mb-1 text-aura-green">User UUID (Authentication ID)</label>
                  <input 
                    required autoFocus
                    value={formData.id}
                    onChange={(e) => setFormData({...formData, id: e.target.value})}
                    placeholder="Pega el UUID de Supabase..."
                    className="w-full bg-aura-inner border border-aura-dark p-3 text-aura-text outline-none focus:border-[#a855f7] transition-all font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase opacity-40 block mb-1 text-aura-green">Full Name / Identificador</label>
                  <input 
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    placeholder="EJ: JUAN VEGA"
                    className="w-full bg-aura-inner border border-aura-dark p-3 text-aura-text outline-none focus:border-[#a855f7] uppercase transition-all"
                  />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="flex-1 py-3 border border-aura-dark text-aura-text/60 text-[11px] font-bold uppercase hover:bg-aura-dark transition-all font-mono"
                  >
                    Abortar
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="flex-1 py-3 bg-[#a855f7] text-white text-[11px] font-black uppercase shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:brightness-125 disabled:opacity-50 transition-all font-mono"
                  >
                    {loading ? 'Procesando...' : 'Autorizar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}