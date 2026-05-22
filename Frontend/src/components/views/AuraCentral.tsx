import { Endpoints } from '../widgets/Endpoints';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; 
import { 
  ShieldAlert, RefreshCw, UserPlus, UserCog, Shield, X, Globe, Cpu, HardDrive 
} from 'lucide-react';
import { supabase } from '../../services/supabase';

const TIERS = ['BASIC', 'PRO', 'PREMIUM'];
const CATEGORIES = ['PIZZA/PASTAS/ITALIANA', 'BAR', 'MEXICANA', 'ASIATICA', 'POSTRES/SNACKS', 'VEGETARIANA/GLUTEN-FREE/ENSALADAS', 'BEBIDAS','CARNES/CORTES', 'MARISCOS'];

/* --- COMPONENTES AUXILIARES DE UI --- */
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="text-[11px] text-aura-green/40 uppercase tracking-[0.3em] mb-6 border-b border-aura-green/10 pb-2 flex items-center gap-2 font-mono">
    <div className="w-1.5 h-1.5 bg-[#a855f7] rounded-full shadow-[0_0_5px_#a855f7]" />
    {children}
  </div>
);

export function AuraCentral() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [establishment, setEstablishment] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]); 
  const [loading, setLoading] = useState(false);
  
  // CONTROL MAESTRO DE FILTRADO POR PESTAÑAS
  const [activeNetworkTab, setActiveNetworkTab] = useState<string>('ALL');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', full_name: '', role: 'admin', establishment_name: '' , establishment_tier: 'BASIC', establishment_category: '' });
  const [deviceData, setDeviceData] = useState({id: '', establishment_id: ''});

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: profs, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .order('role', { ascending: false });
      
      const { data: ests, error: eErr } = await supabase
        .from('establishments')
        .select('*');
        
      const { data: devs, error: dErr } = await supabase
        .from('devices')
        .select('*'); 
      
      if (pErr) console.error("Error perfiles:", pErr.message);
      if (eErr) console.error("Error locales:", eErr.message);
      if (dErr) console.error("Error hardware:", dErr.message);

      setProfiles(profs || []);
      setEstablishment(ests || []); 
      setDevices(devs || []);

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
    
    const { error: profileError } = await supabase.rpc('admin_upsert_profile', {
      target_id: formData.id, 
      new_name: formData.full_name.toUpperCase(), 
      new_role: formData.role 
    });

    if (!profileError) {
      if (formData.establishment_name.trim() !== '') {
        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
        const validOwnerId = uuidRegex.test(formData.id) ? formData.id : null;

        const { error: estError } = await supabase.rpc('admin_create_establishment', {
          p_name: formData.establishment_name.toUpperCase(),
          p_owner_id: validOwnerId, 
          p_tier: formData.establishment_tier.toUpperCase(),
          p_category: formData.establishment_category.toUpperCase() 
        });

        if (estError) console.error("Error creando establecimiento:", estError.message);
      }

      setIsModalOpen(false);
      setFormData({ id: '', full_name: '', role: 'admin', establishment_name: '', establishment_tier: 'BASIC', establishment_category: '' });
      await loadData();
    } else {
      alert("Error en autorización: " + profileError.message);
    }
    setLoading(false);
  };

  const handleProvisionDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.rpc('admin_provision_device', {
      p_id: deviceData.id.trim() || null,
      p_establishment_id: deviceData.establishment_id.trim()
    });

    if (error) alert("Error: " + error.message);
    else {
      setDeviceData({ id: '', establishment_id: '' });
      await loadData();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-10 pb-20">
      
      {/* HEADER */}
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

      {/* SECCIÓN 1: ENTIDADES (CON RASTREO FINANCIERO/TIER ) */}
      <div className="space-y-4">
        <SectionTitle>User Role Management</SectionTitle>
        <div className="border-2 border-[#a855f7]/20 bg-aura-black/40 overflow-x-auto font-mono text-[13px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#a855f7]/20 bg-[#a855f7]/5">
                <th className="p-4 text-[10px] uppercase text-[#a855f7] min-w-[160px]">Profile / UUID Signature</th>
                <th className="p-4 text-[10px] uppercase text-[#a855f7] min-w-[140px]">Linked Node</th>
                <th className="p-4 text-[10px] uppercase text-[#a855f7] min-w-[120px]">Last Session</th>
                <th className="p-4 text-[10px] uppercase text-[#a855f7] min-w-[120px]">Tier Updated</th>
                <th className="p-4 text-[10px] uppercase text-[#a855f7] min-w-[120px]">Registered At</th>
                <th className="p-4 text-[10px] uppercase text-[#a855f7] text-right min-w-[100px]">System Rank</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => {
                const linkedEst = establishment.find(e => e.owner_id === p.id);
                const computedRole = linkedEst ? 'admin' : 'superadmin';

                return (
                  <tr key={p.id} className="border-b border-aura-dark/30 hover:bg-[#a855f7]/5 transition-colors group">
                    <td className="p-4">
                      <div className="text-aura-text text-[13px] uppercase font-bold">{p.full_name || 'Unknown_Entity'}</div>
                      <div className="text-[9px] opacity-30 select-all">{p.id}</div>
                    </td>
                    
                    <td className="p-4 uppercase text-xs">
                      {linkedEst ? (
                        <div className="flex flex-col">
                          <span className="text-aura-cyan font-black tracking-wider">{linkedEst.name}</span>
                          <span className="text-[9px] text-aura-cyan/60">TIER: {linkedEst.tier}</span>
                        </div>
                      ) : (
                        <span className="text-aura-dark/40 italic">[ALL_NODES_UPLINK]</span>
                      )}
                    </td>

                    <td className="p-4 text-xs whitespace-nowrap text-purple-400/80">
                      {p.last_sign_in_at ? (
                        <>
                          <div>{new Date(p.last_sign_in_at).toLocaleDateString('es-MX', { year: '2-digit', month: '2-digit', day: '2-digit' })}</div>
                          <div className="text-[10px] opacity-70">{new Date(p.last_sign_in_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</div>
                        </>
                      ) : (
                        <span className="text-zinc-600 italic text-[11px]">NO_LOG_DATA</span>
                      )}
                    </td>

                    <td className="p-4 text-xs opacity-50 whitespace-nowrap">
                      {p.created_at ? (
                        <>
                          <div>{new Date(p.created_at).toLocaleDateString('es-MX', { year: '2-digit', month: '2-digit', day: '2-digit' })}</div>
                          <div className="text-[10px] text-aura-cyan/70">{new Date(p.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</div>
                        </>
                      ) : '---'}
                    </td>

                    <td className="p-4 text-xs whitespace-nowrap text-amber-400/80">
                      {p.tier_updated_at ? (
                        <>
                          <div>{new Date(p.tier_updated_at).toLocaleDateString('es-MX', { year: '2-digit', month: '2-digit', day: '2-digit' })}</div>
                          <div className="text-[10px] opacity-70">{new Date(p.tier_updated_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</div>
                        </>
                      ) : (
                        <span className="text-zinc-600 italic text-[11px]">BASE_VERSION</span>
                      )}
                    </td>

                    <td className="p-4 text-right whitespace-nowrap">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase border ${
                        computedRole === 'superadmin' 
                          ? 'border-[#a855f7] text-[#a855f7] shadow-[0_0_8px_rgba(168,85,247,0.3)]' 
                          : 'border-aura-cyan text-aura-cyan'
                      }`}>
                        {computedRole}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECCIÓN 2: ESTABLECIMIENTOS */}
      <div className="space-y-4">
        <SectionTitle>Global Establishments Network</SectionTitle>
        <div className="border-2 border-aura-dark bg-aura-black/40 overflow-x-auto font-mono text-[13px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-aura-dark bg-aura-dark/30">
                <th className="p-4 text-[10px] uppercase opacity-40 font-black min-w-[180px]">Node Name</th>
                <th className="p-4 text-[10px] uppercase opacity-40 font-black min-w-[100px]">Tier</th>
                <th className="p-4 text-[10px] uppercase opacity-40 font-black min-w-[140px]">Category</th>
                <th className="p-4 text-[10px] uppercase opacity-40 font-black min-w-[180px]">Owner Handle</th>
              </tr>
            </thead>
            <tbody>
              {establishment.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center opacity-20 italic">
                    NO_NODES_DETECTED_IN_GRID
                  </td>
                </tr>
              ) : (
                establishment.map((e) => (
                  <tr key={e.id} className="border-b border-aura-dark/30 hover:bg-aura-dark/20 transition-colors">
                    <td className="p-4 text-aura-text font-bold uppercase tracking-widest">{e.name}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 border border-aura-cyan/50 text-aura-cyan text-[10px] font-bold uppercase">{e.tier}</span>
                    </td>
                    <td className="p-4 text-aura-text/70 uppercase">{e.category_id || 'N/A'}</td>
                    <td className="p-4 text-aura-green font-bold uppercase">
                      {(() => {
                        if (!e.owner_id) return 'System_Root';
                        const owner = profiles.find(p => p.id === e.owner_id);
                        return owner ? `${owner.username || owner.full_name}`.toUpperCase() : 'System_Root';
                      })()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- SECCIÓN 3: HARDWARE INVENTORY & PROVISIONING  --- */}
      <div className="space-y-4 pt-4">
        <SectionTitle>Hardware Inventory & Provisioning</SectionTitle>
        
        <form onSubmit={handleProvisionDevice} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-aura-cyan/5 p-6 border border-aura-cyan/20 font-mono mb-6">
          <div>
            <label className="text-[10px] uppercase opacity-40 block mb-1 font-bold text-aura-cyan">RPi_Hardware_UUID</label>
            <input 
              required value={deviceData.id}
              onChange={e => setDeviceData({...deviceData, id: e.target.value})}
              placeholder="00000000-0000-0000..."
              className="w-full bg-aura-inner border border-aura-dark p-3 text-aura-cyan font-mono text-xs outline-none focus:border-aura-cyan"
            />
          </div>
          <div>
           <label className="text-[10px] uppercase opacity-40 block mb-1 font-bold text-aura-cyan">Assign_To_Establishment</label>
            <select 
              required 
              value={deviceData.establishment_id || ''}
              onChange={e => setDeviceData({...deviceData, establishment_id: e.target.value})}
              className="w-full bg-aura-inner border border-aura-cyan/30 p-3 text-aura-cyan outline-none focus:border-aura-cyan uppercase text-xs"
            >
              <option value="">Select_Establishment</option>
              {establishment?.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={loading} className="w-full bg-aura-cyan text-black font-black p-3 uppercase hover:brightness-110 transition-all active:scale-95 disabled:opacity-50">
              Provision_Unit
            </button>
          </div>
        </form>

        <div className="flex flex-col">
          {/* BARRA DE TABS SUPERIORES */}
          <div className="flex flex-wrap gap-1 z-10 translate-y-[2px]">
            <button
              type="button"
              onClick={async () => {
                setActiveNetworkTab('ALL');
                setLoading(true);
                await supabase.from('devices').update({ status: 'offline' }).neq('id', '00000000-0000-0000-0000-000000000000');
                await loadData();
              }}
              className={`px-4 py-2 text-[10px] font-mono font-black tracking-widest uppercase border-t-2 border-x-2 transition-all duration-200 ${
                activeNetworkTab === 'ALL'
                  ? 'bg-white text-black border-white rounded-t'
                  : 'bg-black/40 text-white/40 border-aura-dark hover:border-white/20 hover:bg-black rounded-t'
              }`}
            >
              [ SHOW_ALL_NODES ]
            </button>
            
            {establishment && establishment.map((est) => (
              <button
                key={est.id}
                type="button"
                onClick={async () => {
                  setActiveNetworkTab(est.id);
                  setLoading(true);
                  
                  await supabase
                    .from('devices')
                    .update({ status: 'offline', last_heartbeat: new Date().toISOString() })
                    .not('establishment_id', 'eq', est.id);

                  await supabase
                    .from('devices')
                    .update({ status: 'online', last_heartbeat: new Date().toISOString() })
                    .eq('establishment_id', est.id);

                  await loadData();
                }}
                className={`px-4 py-2 text-[10px] font-mono font-black tracking-widest uppercase border-t-2 border-x-2 transition-all duration-300 ${
                  activeNetworkTab === est.id
                    ? 'bg-aura-cyan text-black border-aura-cyan shadow-[0_-4px_10px_rgba(0,243,255,0.15)] rounded-t'
                    : 'bg-black/40 text-white/50 border-aura-dark hover:border-white/30 hover:bg-black rounded-t'
                }`}
              >
                {est.name}
              </button>
            ))}
          </div>

          {/* TABLA DE INVENTARIO */}
          <div className="w-full overflow-x-auto border-2 border-aura-dark bg-aura-black/40 rounded-b-lg rounded-tr-lg">
            <table className="w-full text-left border-collapse font-mono text-[13px]">
              <thead className="bg-white/5 text-[10px] uppercase text-aura-cyan font-black tracking-widest border-b border-aura-dark">
                <tr>
                  <th className="p-4 font-black">Device UUID</th>
                  <th className="p-4 font-black">Node Assigned</th>
                  <th className="p-4 font-black">Provisioned At</th>
                  <th className="p-4 font-black">Last Heartbeat</th>
                  <th className="p-4 font-black text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const filteredDevices = !devices ? [] : activeNetworkTab === 'ALL'
                    ? devices
                    : devices.filter(d => d.establishment_id === activeNetworkTab);

                  if (filteredDevices.length === 0) {
                    return (
                      <tr key="empty-row">
                        <td colSpan={5} className="p-10 text-center text-aura-dark/40 italic tracking-widest">
                          NO_HARDWARE_UNITS_PROVISIONED_IN_THIS_NODE_CLUSTER
                        </td>
                      </tr>
                    );
                  }

                  return filteredDevices.map((d, i) => (
                    <tr key={d.id || i} className="border-t border-aura-dark/20 hover:bg-white/[0.02] transition-colors group">
                      <td className="p-4 font-mono flex items-center gap-3">
                        <a 
                          href={`http://localhost:3000/?mode=apunit&id=${d.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 border border-aura-cyan/30 text-aura-cyan bg-aura-cyan/5 hover:bg-aura-cyan hover:text-black transition-all rounded flex items-center justify-center"
                          title="Launch APUnit Emulator"
                        >
                          <Globe size={14} className="animate-pulse" />
                        </a>
                        <span className="opacity-60 select-all cursor-pointer truncate max-w-[160px] md:max-w-none" title={d.id}>
                          {d.id}
                        </span>
                      </td>
                      <td className="p-4 uppercase text-aura-text font-bold">
                        {(() => {
                          if (!d.establishment_id) return <span className="text-gray-500 italic">Unassigned</span>;
                          const matchingEst = establishment.find(e => e.id === d.establishment_id);
                          return matchingEst ? matchingEst.name : `NODO [${d.establishment_id.substring(0,8)}]`;
                        })()}
                      </td>
                      
                      <td className="p-4 text-xs opacity-50 whitespace-nowrap">
                        {d.created_at ? (
                          <>
                            <div>{new Date(d.created_at).toLocaleDateString('es-MX', { year: '2-digit', month: '2-digit', day: '2-digit' })}</div>
                            <div className="text-[10px] text-aura-cyan/70">{new Date(d.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</div>
                          </>
                        ) : '---'}
                      </td>

                      <td className="p-4 text-xs whitespace-nowrap text-aura-green/80">
                        {d.last_heartbeat ? (
                          <>
                            <div>{new Date(d.last_heartbeat).toLocaleDateString('es-MX', { year: '2-digit', month: '2-digit', day: '2-digit' })}</div>
                            <div className="text-[10px] opacity-70">{new Date(d.last_heartbeat).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</div>
                          </>
                        ) : (
                          <span className="text-zinc-600 italic text-[11px]">NEVER_CONNECTED</span>
                        )}
                      </td>

                      <td className="p-4 text-right whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 border text-[10px] font-bold uppercase tracking-widest ${
                          d.status === 'online' ? 'border-green-500/40 bg-green-950/20 text-green-400' :
                          d.status === 'provisioned' ? 'border-blue-500/30 bg-blue-950/10 text-aura-cyan' :
                          'border-zinc-500/20 bg-zinc-900/10 text-zinc-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${d.status === 'online' ? 'bg-green-400 animate-pulse' : d.status === 'provisioned' ? 'bg-blue-400' : 'bg-zinc-600'}`} />
                          {d.status || 'provisioned'}
                        </span>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL DE AUTORIZACIÓN */}
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
                    <input 
                      required={formData.role === 'admin'} 
                      value={formData.establishment_name} 
                      onChange={e => setFormData({...formData, establishment_name: e.target.value})} 
                      placeholder="EJ: ARCADE CHOLULA" 
                      className="w-full bg-aura-inner border border-aura-cyan/30 p-3 text-aura-cyan outline-none focus:border-aura-cyan uppercase" 
                    />
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="text-[10px] uppercase opacity-40 block mb-1 text-aura-cyan font-bold">Tier</label>
                        <select 
                          value={formData.establishment_tier} 
                          onChange={e => setFormData({...formData, establishment_tier: e.target.value})}
                          className="w-full bg-aura-inner border border-aura-cyan/30 p-3 text-aura-cyan outline-none focus:border-aura-cyan uppercase cursor-pointer"
                        >
                          <option value="BASIC">BASIC</option>
                          <option value="PRO">PRO</option>
                          <option value="PREMIUM">PREMIUM</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase opacity-40 block mb-1 text-aura-cyan font-bold">Category</label>
                        <select 
                          required={formData.role === 'admin'}
                          value={formData.establishment_category} 
                          onChange={e => setFormData({...formData, establishment_category: e.target.value})}
                          className="w-full bg-aura-inner border border-aura-cyan/30 p-3 text-aura-cyan outline-none focus:border-aura-cyan uppercase cursor-pointer"
                        >
                          <option value="">SELECT_CATEGORY</option>
                          {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
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