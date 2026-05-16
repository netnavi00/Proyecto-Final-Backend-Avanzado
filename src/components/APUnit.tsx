import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Cpu, Activity } from 'lucide-react';

export default function APUnit() {
  // Convertimos el ID en un estado dinámico
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [status, setStatus] = useState('connecting');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let isMounted = true; // <--- EL BLINDAJE CONTRA REACT STRICT MODE
    let channel: any = null;

    const initializeDevice = async () => {
      // 1. Revisamos si el ID viene en la URL
      const params = new URLSearchParams(window.location.search);
      let currentId = params.get('id');

      // 2. Si no hay ID, jalamos el más reciente
      if (!currentId) {
        const { data, error } = await supabase
          .from('devices')
          .select('id')
          .eq('status', 'provisioned') // <--- EL FILTRO MÁGICO
          .limit(1)
          .single();

        if (error || !data) {
          if (isMounted) setErrorMsg("NO_HARDWARE_FOUND_IN_DB");
          return;
        }
        currentId = data.id;
      }

      // Si React ya desmontó el componente mientras esperábamos a la DB, abortamos.
      if (!isMounted) return; 

      setDeviceId(currentId);

      // 3. Primer "Heartbeat"
      const { error: updateError } = await supabase
        .from('devices')
        .update({ status: 'online', last_heartbeat: new Date().toISOString() })
        .eq('id', currentId);

      if (updateError) {
        if (isMounted) setErrorMsg("CONNECTION_REJECTED");
      } else {
        if (isMounted) setStatus('online');
      }

      // Si React se arrepintió justo antes de crear el canal, abortamos.
      if (!isMounted) return;

      // Limpieza nuclear preventiva: borramos canales huérfanos antes de crear uno nuevo
      supabase.removeAllChannels();

      // 4. Suscripción Realtime blindada
      channel = supabase
        .channel(`unit-${currentId}`)
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'devices', 
          filter: `id=eq.${currentId}` 
        }, (payload) => {
          if (payload.new.status && isMounted) {
            setStatus(payload.new.status);
          }
        })
        .subscribe();
    };

    initializeDevice();

    return () => { 
      isMounted = false; // Al desmontar, matamos cualquier proceso asíncrono pendiente
      if (channel) {
        supabase.removeChannel(channel); 
      }
    };
  }, []);

  // Pantallas de carga y error
  if (errorMsg) return <div className="h-screen flex items-center justify-center bg-black p-10 text-red-500 font-mono tracking-widest text-xl">ERROR: {errorMsg}</div>;
  if (!deviceId) return <div className="h-screen flex items-center justify-center bg-black p-10 text-aura-cyan font-mono animate-pulse tracking-widest text-xl">FETCHING_DB_ID...</div>;

  // Render principal de la unidad
  return (
    <div className={`h-screen w-screen flex flex-col items-center justify-center font-mono p-10 ${status === 'promo' ? 'bg-cyan-950' : 'bg-black'} text-green-500 border-[16px] border-aura-dark transition-colors duration-500`}>
      <Cpu size={80} className="mb-6 opacity-50" />
      <h1 className="text-2xl font-bold tracking-[0.3em] uppercase mb-2">AURA-Play Unit</h1>
      <div className="text-sm opacity-40 mb-10 text-aura-cyan">UUID: {deviceId}</div>
      <div className="flex flex-col items-center gap-4">
        <Activity className={`animate-pulse ${status === 'online' ? 'text-green-500' : 'text-cyan-400'}`} size={40} />
        <span className="text-4xl font-black uppercase tracking-widest">{status}</span>
      </div>
    </div>
  );
}