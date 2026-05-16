import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; 
import { 
  ShieldAlert, RefreshCw, UserPlus, UserCog, Shield, X, Globe, Cpu, HardDrive 
} from 'lucide-react';
import { supabase } from '../services/supabase';

/* --- COMPONENTES AUXILIARES DE UI --- */
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="text-[11px] text-aura-green/40 uppercase tracking-[0.3em] mb-6 border-b border-aura-green/10 pb-2 flex items-center gap-2 font-mono">
    <div className="w-1.5 h-1.5 bg-[#a855f7] rounded-full shadow-[0_0_5px_#a855f7]" />
    {children}
  </div>
);

export default function AuraCentral() {
  // 1. ESTADOS DE DATOS
  const [profiles, setProfiles] = useState<any[]>([]);
  const [establishment, setEstablishment] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]); // Nuevo: Para ver el inventario
  
  
  // 2. ESTADOS DE FORMULARIOS
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', full_name: '', role: 'admin' });
  
  // Nuevo: Estado para el alta de Hardware
  const [deviceData, setDeviceData] = useState({ id: '', establishment_id: '' });
  const [loading, setLoading] = useState(false);

  // 3. CARGA DE DATOS
  const loadGlobalData = async () => {
    setLoading(true);
    try {
      const { data: profs } = await supabase.from('profiles').select('*').order('role', { ascending: false });
      const { data: ests } = await supabase.from('establishment').select('*, owner:profiles(full_name)');
      
      // Cargamos dispositivos y traemos el nombre del Admin asignado
      const { data: devs } = await supabase.from('devices').select('*, owner:profiles(full_name)');
      
      if (profs) setProfiles(profs);
      if (ests) setEstablishment(ests);
      if (devs) setDevices(devs);
    } catch (err: any) {
      console.error("Error en carga:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadGlobalData(); }, []);

  // 4. FUNCIONES DE ACCIÓN
  const handleFinalAuthorization = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').upsert([{ 
        id: formData.id, 
        full_name: formData.full_name.toUpperCase(), 
        role: formData.role 
      }]);
      if (error) throw error;
      setIsModalOpen(false);
      setFormData({ id: '', full_name: '', role: 'admin' });
      await loadGlobalData();
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  // NUEVA FUNCIÓN: Provisionar Hardware (Solo Superadmin)
  const handleProvisionDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    // 1. Validación para no enviar datos vacíos por error
    if (!deviceData.id.trim() || !deviceData.establishment_id.trim()) {
        alert("Por favor, introduce tanto el ID del dispositivo como el del establecimiento.");
        return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.rpc('admin_provision_device', {
        p_id: deviceData.id,
        p_establishment_id: deviceData.establishment_id
      });
      if (error) throw error;
      setDeviceData({ id: '', establishment_id: '' });
      await loadGlobalData();
    } catch (err: any) {
      alert("Error en Provisioning: " + err.message);
    } finally {
      setLoading(false);
    }
  };

   return (
  <div className="space-y-10 p-6 max-w-6xl mx-auto font-mono pb-32 h-auto min-h-full overflow-y-visible">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-aura-black/20 p-6 border border-[#a855f7]/30 rounded-xl gap-4">
        <div className="flex items-center gap-4">
          <ShieldAlert size={38} className="text-[#a855f7] drop-shadow-[0_0_8px_#a855f7]" />
          <div>
            <h2 className="text-2xl font-black text-[#a855f7] tracking-tighter uppercase">AURA CENTRAL</h2>
            <p className="text-[10px] text-aura-green/50 uppercase tracking-widest font-bold">Terminal de Gestión de Rangos</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setFormData({id:'', full_name:'', role:'admin'}); setIsModalOpen(true); }} className="px-4 py-2 border-2 border-aura-cyan text-aura-cyan text-[11px] font-black uppercase hover:bg-aura-cyan/10">+ Admin</button>
          <button onClick={() => { setFormData({id:'', full_name:'', role:'superadmin'}); setIsModalOpen(true); }} className="px-4 py-2 border-2 border-[#a855f7] text-[#a855f7] text-[11px] font-black uppercase hover:bg-[#a855f7]/10">+ Super</button>
          <button onClick={loadGlobalData} className="p-2 text-[#a855f7] hover:bg-white/5 rounded-full"><RefreshCw className={loading ? 'animate-spin' : ''} /></button>
        </div>
      </div>

      {/* SECCIÓN 1: ENTIDADES */}
      <div className="space-y-4">
        <SectionTitle>Authorized Entities</SectionTitle>
        <div className="border border-aura-dark bg-aura-black/40 rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-[10px] uppercase text-aura-green/60 font-black tracking-widest">
              <tr><th className="p-4">UUID</th><th className="p-4">Full Name</th><th className="p-4">Rank</th></tr>
            </thead>
            <tbody className="text-[13px]">
              {profiles.map((p) => (
                <tr key={p.id} className="border-t border-aura-dark/30">
                  <td className="p-4 opacity-30 text-[10px]">{p.id}</td>
                  <td className="p-4 text-aura-text font-bold uppercase">{p.full_name}</td>
                  <td className="p-4"><span className={`px-2 py-0.5 rounded text-[10px] border ${p.role === 'superadmin' ? 'border-[#a855f7] text-[#a855f7]' : 'border-aura-cyan text-aura-cyan'}`}>{p.role}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECCIÓN 2: ESTABLECIMIENTOS */}
      <div className="space-y-4">
        <SectionTitle>Global Establishments Uplink</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {establishment.map((e) => (
            <div key={e.id} className="border border-aura-dark bg-aura-inner/30 p-4 rounded-lg group hover:border-aura-cyan transition-all">
              <div className="flex justify-between items-start mb-3">
                <Globe size={18} className="text-aura-cyan" />
                <span className="text-[9px] text-aura-cyan border border-aura-cyan/30 px-1 rounded uppercase">{e.tier || 'BASIC'}</span>
              </div>
              <h4 className="text-aura-text font-bold uppercase text-sm mb-1">{e.name}</h4>
              <div className="pt-3 border-t border-aura-dark flex justify-between items-center">
                <span className="text-[9px] uppercase opacity-30">Owner:</span>
                <span className="text-[10px] text-aura-cyan font-bold">{e.owner?.full_name || 'System'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
{/* INSERCIÓN: PANEL DE HARDWARE (APUNITS) */}
{/* ========================================================================= */}
<div className="mt-12 space-y-6">
  <div className="flex items-center justify-between border-b border-aura-cyan/30 pb-2">
    <h2 className="text-xl font-black tracking-tighter text-aura-cyan italic uppercase flex items-center gap-2">
      <Cpu size={20} /> Hardware Inventory & Provisioning
    </h2>
    <div className="text-[10px] text-aura-cyan/50 font-mono animate-pulse">AURA_FACTORY_LINK_ACTIVE</div>
  </div>

  <form onSubmit={handleProvisionDevice} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-aura-cyan/5 p-6 border border-aura-cyan/20 rounded-lg">
    <div>
      <label className="text-[10px] uppercase opacity-40 block mb-1 font-bold text-aura-cyan">RPi_Hardware_UUID</label>
      <input 
        type="text"
        value={deviceData.id} /* <--- CORRECCIÓN 1: Aquí decía establishment_id */
        onChange={(e) => setDeviceData({ ...deviceData, id: e.target.value })} /* <--- CORRECCIÓN 2: Aquí también */
        placeholder="Ej. DEV-RPIZ2W-001"
        className="w-full bg-aura-black border border-aura-dark p-3 text-aura-cyan outline-none focus:border-aura-cyan font-mono text-xs" /* Le agregué clases para que cuadre con tu diseño */
      />
    </div>
    <div>
  <label className="text-[10px] uppercase opacity-40 block mb-1 font-bold text-aura-cyan">Assign_To_Establishment</label>
  <select 
    required 
    value={deviceData.establishment_id}
    onChange={e => setDeviceData({...deviceData, establishment_id: e.target.value})}
    className="w-full bg-aura-black border border-aura-dark p-3 text-aura-cyan outline-none focus:border-aura-cyan uppercase text-xs"
  >
    <option value="">Select_Establishment</option>
    {/* AQUÍ ESTÁ LA MAGIA: Iteramos sobre los establecimientos, no los perfiles */}
    {establishment.map(e => (
      <option key={e.id} value={e.id}>
        {e.name} - ({e.owner?.full_name || 'Sin Admin'})
      </option>
    ))}
  </select>
</div>
    <div className="flex items-end">
      <button type="submit" disabled={loading} className="w-full bg-aura-cyan text-aura-black font-black p-3 uppercase hover:bg-white transition-all active:scale-95 disabled:opacity-50">
        Provision_Unit
      </button>
    </div>
  </form>

  <div className="border border-aura-dark bg-aura-black/20 rounded-lg overflow-hidden mt-4">
    <table className="w-full text-left text-[11px]">
      <thead className="bg-aura-cyan/10 text-aura-cyan font-black uppercase tracking-tighter">
        <tr><th className="p-3">Device UUID</th><th className="p-3">Owner Assigned</th><th className="p-3 text-right">Status</th></tr>
      </thead>
      <tbody>
        {devices.length === 0 ? (
          <tr><td colSpan={3} className="p-10 text-center opacity-20 italic">No hardware provisioned yet.</td></tr>
        ) : (
          devices.map((d) => (
            <tr key={d.id} className="border-t border-aura-dark/20 opacity-70">
              <td className="p-3 font-mono">{d.id}</td>
              <td className="p-3 uppercase">{d.owner?.full_name || 'Unassigned'}</td>
              <td className="p-3 text-right"><span className="text-aura-green">[{d.status}]</span></td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</div>
{/* ========================================================================= */}

      {/* MODAL DE AUTORIZACIÓN (EXISTENTE) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-aura-panel border-2 border-[#a855f7] p-8 max-w-md w-full relative z-[201] rounded-lg">
              <h3 className="text-[#a855f7] font-black uppercase mb-6 flex items-center gap-3"><UserCog /> Authorize {formData.role.toUpperCase()}</h3>
              <form onSubmit={handleFinalAuthorization} className="space-y-5">
                <input required value={formData.id} onChange={(e) => setFormData({...formData, id: e.target.value})} placeholder="UUID Signature" className="w-full bg-aura-inner border border-aura-dark p-3 text-aura-text outline-none focus:border-[#a855f7] text-xs font-mono" />
                <input required value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} placeholder="FULL NAME" className="w-full bg-aura-inner border border-aura-dark p-3 text-aura-text outline-none focus:border-[#a855f7] uppercase" />
                <div className="flex gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-aura-dark text-aura-text/60 text-[11px] font-bold uppercase">Abort</button>
                  <button type="submit" className="flex-1 py-3 bg-[#a855f7] text-white text-[11px] font-black uppercase">Authorize</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}