import React, { useEffect, useState, useRef } from 'react'; // <-- Importamos useRef
import { supabase } from '../../services/supabase';
import { Cpu, Activity } from 'lucide-react';

export default function APUnit() {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [status, setStatus] = useState('connecting');
  const [errorMsg, setErrorMsg] = useState('');

  // ESTA ES LA CAJA FUERTE: Guardará el ID activo para el apagado seguro
  const activeIdRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let channel: any = null;

    const initializeDevice = async () => {
      const params = new URLSearchParams(window.location.search);
      let currentId = params.get('id');

      // REUTILIZACIÓN DINÁMICA CON ISO-CONTROL DE PESTAÑAS
      if (!currentId) {
        // 1. Traemos la lista de IDs que ya están corriendo en otras pestañas de tu localhost
        const activeTabs = JSON.parse(localStorage.getItem('aura_active_units') || '[]');

        // Intento A: ¿Hay alguna placa recién vinculada (provisioned) que NO esté abierta en otra pestaña?
        let { data } = await supabase
          .from('devices')
          .select('id')
          .eq('status', 'provisioned')
          .not('id', 'in', `(${activeTabs.join(',') || '00000000-0000-0000-0000-000000000000'})`)
          .limit(1)
          .maybeSingle();

        // Intento B: Si no hay, ¿hay alguna guardada como 'offline' libre de pestañas?
        if (!data) {
          const res = await supabase
            .from('devices')
            .select('id')
            .eq('status', 'offline')
            .not('id', 'in', `(${activeTabs.join(',') || '00000000-0000-0000-0000-000000000000'})`)
            .limit(1)
            .maybeSingle();
          data = res.data;
        }

        // Intento C: Permitir reconexión, pero SÓLO de placas que no estén activas en otra pestaña local
        if (!data) {
          const res = await supabase
            .from('devices')
            .select('id')
            .eq('status', 'online')
            .not('id', 'in', `(${activeTabs.join(',') || '00000000-0000-0000-0000-000000000000'})`)
            .limit(1)
            .maybeSingle();
          data = res.data;
        }

        // CRUCIAL: Si los 3 intentos fallan o están filtrados por pestañas activas, mandamos el error
        if (!data) {
          if (isMounted) setErrorMsg("NO_HARDWARE_FOUND_IN_DB");
          return;
        }
        
        currentId = data.id;

        // 2. Anotamos este ID como "ocupado por esta pestaña" en el navegador
        activeTabs.push(currentId);
        localStorage.setItem('aura_active_units', JSON.stringify(activeTabs));
      }

      if (!isMounted) return;

      // GUARDAMOS EL ID EN LA REF Y EN EL ESTADO
      activeIdRef.current = currentId;
      setDeviceId(currentId);

      // 3. Mandamos el Heartbeat para pasar la placa a ONLINE
      const { error: updateError } = await supabase
        .from('devices')
        .update({ status: 'online', last_heartbeat: new Date().toISOString() })
        .eq('id', currentId);

      if (updateError) {
        if (isMounted) setErrorMsg("CONNECTION_REJECTED");
      } else {
        if (isMounted) setStatus('online');
      }

      if (!isMounted) return;

      // Limpieza de canales para el Strict Mode
      supabase.removeAllChannels();

      // 4. Conexión Realtime
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

    // =========================================================
    // LIMPIEZA Y EVENTO DE APAGADO (MANDAR A OFFLINE)
    // =========================================================
    return () => { 
      isMounted = false; 
      
      // Recuperamos el ID directamente de la Ref que siempre está al día
      const idToShutdown = activeIdRef.current;
      
      if (idToShutdown) {
        // 1. RELEASING LOCALSTORAGE: Traemos las pestañas activas y borramos este ID del navegador
        const activeTabs = JSON.parse(localStorage.getItem('aura_active_units') || '[]');
        const updatedTabs = activeTabs.filter((id: string) => id !== idToShutdown);
        localStorage.setItem('aura_active_units', JSON.stringify(updatedTabs));

        // 2. Mandamos la placa a offline en Supabase al cerrar la pestaña
        supabase
          .from('devices')
          .update({ status: 'offline', last_heartbeat: new Date().toISOString() })
          .eq('id', idToShutdown)
          .then(({ error }) => {
            if (error) console.error("❌ Error al mandar a offline:", error.message);
          });
      }

      if (channel) {
        supabase.removeChannel(channel); 
      }
    };
  }, []);

  if (errorMsg) return <div className="h-screen flex items-center justify-center bg-black p-10 text-red-500 font-mono tracking-widest text-xl">ERROR: {errorMsg}</div>;
  if (!deviceId) return <div className="h-screen flex items-center justify-center bg-black p-10 text-aura-cyan font-mono animate-pulse tracking-widest text-xl">FETCHING_DB_ID...</div>;

  return (
    <div className={`h-screen w-screen flex flex-col items-center justify-center font-mono p-10 ${status === 'promo' ? 'bg-cyan-950' : 'bg-black'} text-green-500 border-[16px] border-aura-dark transition-colors duration-500`}>
      <Cpu size={80} className="mb-6 opacity-50" />
      <h1 className="text-2xl font-bold tracking-[0.3em] uppercase mb-2">AURA-Play Unit</h1>
      <div className="text-sm opacity-40 mb-10 text-aura-cyan select-all cursor-pointer" title="Haz doble clic para copiar">
        UUID: {deviceId || 'FETCHING...'}
      </div>
      <div className="flex flex-col items-center gap-4">
        <Activity className={`animate-pulse ${status === 'online' ? 'text-green-500' : 'text-cyan-400'}`} size={40} />
        <span className="text-4xl font-black uppercase tracking-widest">{status}</span>
      </div>
    </div>
  );
}