import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Cpu, Wifi, Activity } from 'lucide-react';

export default function APUnit() {
  const params = new URLSearchParams(window.location.search);
  const deviceId = params.get('id'); // Captura el UUID de la URL
  const [status, setStatus] = useState('connecting');

  useEffect(() => {
    if (!deviceId) return;

    const startUnit = async () => {
      // Primer "Heartbeat" para avisar que la mesa está encendida
      const { error } = await supabase
        .from('devices')
        .update({ status: 'online', last_heartbeat: new Date().toISOString() })
        .eq('id', deviceId);

      if (error) console.error("Error al conectar unidad:", error.message);
      else setStatus('online');
    };

    startUnit();

    // Suscripción Realtime para reaccionar a cambios desde el Command Center
    const channel = supabase
      .channel(`unit-${deviceId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'devices', 
        filter: `id=eq.${deviceId}` 
      }, (payload) => {
        setStatus(payload.new.status);
      })
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [deviceId]);

  if (!deviceId) return <div className="p-10 text-red-500 font-mono">ERROR: NO_UNIT_ID_SPECIFIED</div>;

  return (
    <div className={`h-screen w-screen flex flex-col items-center justify-center font-mono p-10 ${status === 'promo' ? 'bg-cyan-950' : 'bg-black'} text-green-500 border-[16px] border-aura-dark`}>
      <Cpu size={80} className="mb-6 opacity-50" />
      <h1 className="text-2xl font-bold tracking-[0.3em] uppercase mb-2">AURA-Play Unit</h1>
      <div className="text-sm opacity-40 mb-10">ID: {deviceId}</div>
      <div className="flex flex-col items-center gap-4">
        <Activity className={`animate-pulse ${status === 'online' ? 'text-green-500' : 'text-cyan-400'}`} size={40} />
        <span className="text-4xl font-black uppercase tracking-widest">{status}</span>
      </div>
    </div>
  );
}