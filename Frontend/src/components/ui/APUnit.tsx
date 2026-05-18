import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../services/supabase';
import { Cpu, Activity } from 'lucide-react';

export default function APUnit() {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [status, setStatus] = useState('connecting');
  const [errorMsg, setErrorMsg] = useState('');

  // Caja fuerte para el apagado seguro de la unidad física simulada
  const activeIdRef = useRef<string | null>(null);
  
  // 🚀 REFERENCIA SCADA: Bandera de control para activar/desactivar las ráfagas remotamente
  const isStreamingRef = useRef<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    let channel: any = null;
    let telemetryInterval: any = null; // Guardará el ciclo de ráfagas periódicas

    const initializeDevice = async () => {
      const params = new URLSearchParams(window.location.search);
      const currentMode = params.get('mode');
      let currentId = params.get('id');

      // 🚀 FILTRO DE ACCESO CRUCIAL: 
      // Si la URL tiene un ID pero NO viene en modo esclavo (es decir, eres el administrador en el Grid),
      // salimos inmediatamente sin activar la interfaz del simulador ni modificar Supabase.
      if (currentId && currentMode !== 'apunit') {
        return; 
      }

      // REUTILIZACIÓN DINÁMICA CON ISO-CONTROL DE PESTAÑAS (Tu lógica original intacta)
      if (!currentId) {
        // 🚀 COMPENSACIÓN EN CALIENTE:
        // Si recargamos la pestaña a la fuerza o tras un crash de HMR, liberamos preventivamente
        // los registros locales residuales para evitar que la app se auto-bloquee el acceso.
        localStorage.removeItem('aura_active_units');

        const activeTabs = JSON.parse(localStorage.getItem('aura_active_units') || '[]');

        // Intento A: ¿Placa recién provisionada libre?
        let { data } = await supabase
          .from('devices')
          .select('id')
          .eq('status', 'provisioned')
          .not('id', 'in', `(${activeTabs.join(',') || '00000000-0000-0000-0000-000000000000'})`)
          .limit(1)
          .maybeSingle();

        // Intento B: ¿Placa offline libre?
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

        // Intento C: Permitir reconexión de placas online desocupadas
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

        if (!data) {
          if (isMounted) setErrorMsg("NO_HARDWARE_FOUND_IN_DB");
          return;
        }
        
        currentId = data.id;

        activeTabs.push(currentId);
        localStorage.setItem('aura_active_units', JSON.stringify(activeTabs));
      }

      if (!isMounted) return;

      activeIdRef.current = currentId;
      setDeviceId(currentId);

      // Heartbeat inicial para pasar la placa a ONLINE en devices
      const { data: currentDeviceState, error: updateError } = await supabase
        .from('devices')
        .update({ status: 'online', last_heartbeat: new Date().toISOString() })
        .eq('id', currentId)
        .select('status, is_mirroring_active') // 🚀 CORRECCIÓN: Todo en un solo string separado por una coma
        .maybeSingle();

      if (updateError) {
        if (isMounted) setErrorMsg("CONNECTION_REJECTED");
        return;
      } else {
        if (isMounted) {
          // Extraemos con tipado dinámico para evitar que TypeScript se queje del tipado implícito
          const deviceData = currentDeviceState as any;
          
          const isMirroring = deviceData?.is_mirroring_active === true || deviceData?.is_mirroring_active === 'true';
          const isStateRunning = deviceData?.status === 'running';

          if (isMirroring || isStateRunning) {
            isStreamingRef.current = true;
            setStatus('running');
          } else {
            setStatus('online');
          }
        }
      }

      // 🚀 MOTOR DE RÁFAGAS (FORZADO PARA PRUEBAS)
      let tick = 0;
      telemetryInterval = setInterval(async () => {
        if (!isMounted || !currentId) return;
        
        // 🛡️ COMENTA ESTA LÍNEA TEMPORALMENTE PARA FORZAR EL STREAMING DE PRUEBA:
        // if (!isStreamingRef.current) return; 
        
        tick++;

        // Simulación matemática de variables físicas reales de la Raspberry Pi Zero 2W
        const simulatedTemp = parseFloat((42 + Math.sin(tick * 0.1) * 4 + Math.random() * 0.5).toFixed(2));
        const simulatedVolt = parseFloat((5.05 + Math.random() * 0.08).toFixed(2));
        const simulatedFps = parseFloat((59.85 + Math.random() * 0.3).toFixed(2));
        const simulatedRssi = Math.floor(85 + Math.random() * 15);

        // Cambia dinámicamente de modo de juego interactivo cada ráfaga larga para probar el comportamiento reactivo
        const runtimeModes: Array<'INTERACTIVE' | 'MEDIA_PLAYER' | 'DIAGNOSTIC'> = ['INTERACTIVE', 'MEDIA_PLAYER', 'DIAGNOSTIC'];
        const currentSimMode = runtimeModes[Math.floor(tick / 10) % runtimeModes.length];
        
        // Generamos componentes de UI basados en el JSONB tipado que creamos
        let mockComponents = [];
        if (currentSimMode === 'INTERACTIVE') {
          mockComponents = [
            { id: 'progress_1', type: 'progress', label: 'CARGA DE BUFFER', value: (tick * 5) % 101 },
            { id: 'bumper_l', type: 'status_grid', label: 'BUMPER IZQUIERDO', value: 'OK', status: 'success' },
            { id: 'bumper_r', type: 'status_grid', label: 'BUMPER DERECHO', value: 'OK', status: 'success' }
          ];
          if (simulatedTemp > 45) {
            mockComponents.push({ id: 'alert_temp', type: 'alert', label: 'VENTILACIÓN', value: 'TEMP_CRÍTICA', status: 'danger' });
          }
        } else if (currentSimMode === 'MEDIA_PLAYER') {
          mockComponents = [
            { id: 'track_time', type: 'text', label: 'PISADA ACTUAL', value: `00:${String(tick % 60).padStart(2, '0')}` },
            { id: 'audio_rail', type: 'status_grid', label: 'LÍNEA DE AUDIO', value: 'ENGAGED', status: 'info' }
          ];
        } else {
          mockComponents = [
            { id: 'test_1', type: 'status_grid', label: 'E/S DIGITALES', value: 'STANDBY', status: 'warning' },
            { id: 'mem_free', type: 'progress', label: 'MEMORIA DISPONIBLE', value: 78 }
          ];
        }

        // Ejecuta el UPSERT en la nueva tabla dedicada de telemetría de alta frecuencia
        await supabase
          .from('device_telemetry')
          .upsert({
            device_id: currentId,
            mode: currentSimMode,
            state: 'RUNNING',
            current_item: currentSimMode === 'INTERACTIVE' ? 'Aura Play Game Client' : currentSimMode === 'MEDIA_PLAYER' ? 'Ambience Music Loop' : 'Hardware Diagnostic Tool',
            runtime_seconds: tick * 2,
            cpu_temp: simulatedTemp,
            sys_volt: simulatedVolt,
            fps: simulatedFps,
            wifi_signal: simulatedRssi,
            components: mockComponents
          });

      }, 5000);

      // 🚀 INTERCEPTOR DUAL: Despierta por bandera de espejo O por estado de ejecución
      if (isMounted && currentId) {
        channel = supabase
          .channel(`unit-uplink-${currentId}`)
          .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'devices', 
            filter: `id=eq.${currentId}` 
          }, (payload: any) => {
            if (!isMounted) return;
            
            const target = payload?.new;
            
            if (target) {
              // 🎛️ CRITERIO DUAL: Si la bandera de espejo es verdadera O el estado de la mesa es 'running'
              const isMirroringActive = target.is_mirroring_active === true || target.is_mirroring_active === 'true';
              const isStateRunning = target.status === 'running';

              if (isMirroringActive || isStateRunning) {
                isStreamingRef.current = true; // Desbloquea el bucle de ráfagas matemáticas
                setStatus('running');           // Aplica el look Cyberpunk azul cian
              } else {
                isStreamingRef.current = false;
                setStatus(target.status || 'online');
              }
            }
          });

        if (channel) {
          channel.subscribe();
        }
      }
    };

    initializeDevice();

    // =========================================================
    // LIMPIEZA Y EVENTO DE APAGADO (MANDAR A OFFLINE)
    // =========================================================
    return () => { 
      isMounted = false; 
      
      if (telemetryInterval) clearInterval(telemetryInterval);
      
      const idToShutdown = activeIdRef.current;
      
      if (idToShutdown) {
        const activeTabs = JSON.parse(localStorage.getItem('aura_active_units') || '[]');
        const updatedTabs = activeTabs.filter((id: string) => id !== idToShutdown);
        localStorage.setItem('aura_active_units', JSON.stringify(updatedTabs));

        supabase.from('device_telemetry').delete().eq('device_id', idToShutdown).then(() => {
          supabase
            .from('devices')
            .update({ status: 'offline', is_mirroring_active: false, last_heartbeat: new Date().toISOString() })
            .eq('id', idToShutdown)
            .then(({ error }) => {
              if (error) console.error("❌ Error al mandar a offline:", error.message);
            });
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
    <div className={`h-screen w-screen flex flex-col items-center justify-center font-mono p-10 ${status === 'running' ? 'bg-cyan-950 text-aura-cyan border-aura-cyan shadow-[inset_0_0_60px_rgba(0,243,255,0.15)]' : status === 'promo' ? 'bg-cyan-950 text-green-500' : 'bg-black text-green-500'} border-[16px] border-aura-dark transition-all duration-500`}>
      <Cpu size={80} className={`mb-6 opacity-50 ${status === 'running' ? 'text-aura-cyan animate-spin' : 'text-aura-cyan animate-bounce'}`} style={{ animationDuration: status === 'running' ? '12s' : '4s' }} />
      <h1 className="text-2xl font-bold tracking-[0.3em] uppercase mb-2">AURA-Play Unit</h1>
      <div className="text-sm opacity-40 mb-10 text-aura-cyan select-all cursor-pointer" title="Haz doble clic para copiar">
        UUID: {deviceId || 'FETCHING...'}
      </div>
      <div className="flex flex-col items-center gap-4">
        <Activity className={`animate-pulse ${status === 'running' ? 'text-aura-cyan' : status === 'online' ? 'text-green-500' : 'text-cyan-400'}`} size={40} />
        <span className="text-4xl font-black uppercase tracking-widest animate-pulse">{status}</span>
        <span className="text-[10px] text-aura-text/40 tracking-wider animate-pulse mt-2">
          {status === 'running' ? '📡 TRANSMITIENDO RÁFAGAS DE TELEMETRÍA EN TIEMPO REAL...' : '💤 MÓDULO EN ESPERA — ESPERANDO ORDEN DE INICIO REMOTA...'}
        </span>
      </div>
    </div>
  );
}