import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../services/supabase';
import { Cpu, Activity } from 'lucide-react';

/* --- COMPONENTE SUB-RENDERIZADOR DE SLOTS PARA EL HARDWARE --- */
function KioskSlotRender({ id, config, catalog }: { id: string, config: any, catalog: any[] }) {
  if (!config) return null;
  const item = config.boundItemId ? catalog.find(i => i.id === config.boundItemId) : null;
  
  return (
    <div className="w-full h-full relative overflow-hidden bg-aura-bg border border-aura-dark/20">
      {item ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Imagen de fondo mix-blend de la receta */}
          <div 
            className="absolute inset-0 bg-cover bg-center mix-blend-screen" 
            style={{ backgroundImage: `url(${item.imageUrl})`, opacity: config.bgOpacity ?? 0.8 }} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-60" />
          
          {/* Bloque de transformación espacial exacto */}
          <div 
            className="relative z-10 flex flex-col items-center justify-center text-center p-4"
            style={{ 
              transform: `rotate(${config.rotation || 0}deg) translate(${config.posX || 0}px, ${config.posY || 0}px)` 
            }}
          >
             <h3 
               className={`${config.fontFamily || 'font-mono'} text-white font-black uppercase leading-tight tracking-widest drop-shadow-lg`}
               style={{ fontSize: `${config.customTextSize || 24}px` }}
             >
               {config.customText || item.name}
             </h3>
             {item.type === 'menu' && typeof item.price === 'number' && (
               <p 
                 className="font-bold mt-2 tracking-tighter" 
                 style={{ 
                   color: config.neonColor || '#00e5ff', 
                   textShadow: `0 0 10px ${config.neonColor || '#00e5ff'}`, 
                   fontSize: `${(config.customTextSize || 24) * 1.25}px` 
                 }}
               >
                 ${item.price.toFixed(2)}
               </p>
             )}
          </div>

          {/* Sticker Promocional */}
          {config.sticker && (
             <div 
               className="absolute top-4 right-4 bg-[#ff003c] text-white uppercase font-black transform rotate-12 shadow-[0_0_10px_rgba(255,0,60,0.5)]"
               style={{ 
                 fontSize: `${config.stickerSize || 12}px`, 
                 padding: `${(config.stickerSize || 12) * 0.25}px ${(config.stickerSize || 12) * 0.75}px` 
               }}
             >
               {config.sticker}
             </div>
          )}
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-aura-green/20 uppercase tracking-widest font-bold">
          VACÍO [{id}]
        </div>
      )}
    </div>
  );
}

export default function APUnit() {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [status, setStatus] = useState('connecting');
  const [errorMsg, setErrorMsg] = useState('');
  
  // 🚀 DATOS LOCALES EXTRAÍDOS DEL JSONB DEL CREATIVE LAB
  const [recipePages, setRecipePages] = useState<any[]>([]);
  const [recipeCatalog, setRecipeCatalog] = useState<any[]>([]);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);

  const activeIdRef = useRef<string | null>(null);
  const isStreamingRef = useRef<boolean>(false);

  // 🚀 CARRUSEL AUTOMÁTICO INDUSTRIAL: Rota las páginas del menú si hay más de una
  useEffect(() => {
    if (recipePages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentPageIdx(prev => (prev + 1) % recipePages.length);
    }, 6000); // Cambia de página cada 6 segundos

    return () => clearInterval(interval);
  }, [recipePages]);

  useEffect(() => {
    let isMounted = true;
    let channel: any = null;
    let telemetryInterval: any = null;

    // Generador dinámico de formato de catálogo para logs
    const d = new Date();
    const day = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const date = d.toISOString().split('T')[0];
    const trialLabel = `${day}-TRIAL-${date}`;

    const initializeDevice = async () => {
      const params = new URLSearchParams(window.location.search);
      const currentMode = params.get('mode');
      let currentId = params.get('id');

      if (currentId && currentMode !== 'apunit') {
        return; 
      }

      if (!currentId) {
        localStorage.removeItem('aura_active_units');
        const activeTabs = JSON.parse(localStorage.getItem('aura_active_units') || '[]');

        const { data } = await supabase
          .from('devices')
          .select('id')
          .in('status', ['provisioned', 'offline', 'online', 'running'])
          .not('id', 'in', `(${activeTabs.join(',') || '00000000-0000-0000-0000-000000000000'})`)
          .limit(1)
          .maybeSingle();

        if (!data) {
          if (isMounted) setErrorMsg("NO_HARDWARE_FOUND_IN_DB");
          return;
        }
        
        currentId = data.id;
        activeTabs.push(currentId);
        localStorage.setItem('aura_active_units', JSON.stringify(activeTabs));
      }

      if (!isMounted) return;

      console.log(`[${trialLabel}] RPi Zero 2 W Boot Sequence Initiated... UUID: ${currentId}`);

      activeIdRef.current = currentId;
      setDeviceId(currentId);

      // Seteamos la placa online y descargamos receta si ya existe en la DB
      const { data: currentDeviceState, error: updateError } = await supabase
        .from('devices')
        .update({ status: 'online', last_heartbeat: new Date().toISOString() })
        .eq('id', currentId)
        .select('status, is_mirroring_active, current_recipe')
        .maybeSingle();

      if (updateError) {
        if (isMounted) setErrorMsg("CONNECTION_REJECTED");
        return;
      } else {
        if (isMounted) {
          const deviceData = currentDeviceState as any;
          
          // Procesar receta inicial si existe
          if (deviceData?.current_recipe) {
            parseAndSetRecipe(deviceData.current_recipe);
          }

          if (deviceData?.status === 'running') {
            isStreamingRef.current = true;
            setStatus('running');
          } else {
            setStatus(deviceData?.current_recipe ? 'promo' : 'online');
          }
        }
      }

      // MOTOR DE TELEMETRÍA (Raspberry Pi Zero 2W background logs)
      let tick = 0;
      telemetryInterval = setInterval(async () => {
        if (!isMounted || !currentId) return;
        
        tick++;
        const simulatedTemp = parseFloat((42 + Math.sin(tick * 0.1) * 4 + Math.random() * 0.5).toFixed(2));
        const simulatedVolt = parseFloat((5.05 + Math.random() * 0.08).toFixed(2));
        const simulatedFps = parseFloat((59.85 + Math.random() * 0.3).toFixed(2));
        const simulatedRssi = Math.floor(85 + Math.random() * 15);

        await supabase
          .from('device_telemetry')
          .upsert({
            device_id: currentId,
            mode: recipePages.length > 0 ? 'MEDIA_PLAYER' : 'DIAGNOSTIC',
            state: 'RUNNING',
            current_item: `[${trialLabel}] ${recipePages.length > 0 ? 'Rendering Creative Lab Recipe' : 'Hardware Standby'}`,
            runtime_seconds: tick * 5,
            cpu_temp: simulatedTemp,
            sys_volt: simulatedVolt,
            fps: simulatedFps,
            wifi_signal: simulatedRssi,
            components: [{ id: 'sys', type: 'text', label: 'KIOSK_ENGINE', value: 'OPERATIONAL' }]
          });

      }, 5000);

      // ESCUCHADOR REALTIME SCADA (Detecta actualizaciones instantáneas del Orchester)
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
              if (target.current_recipe) {
                parseAndSetRecipe(target.current_recipe);
              }

              if (target.status === 'running') {
                isStreamingRef.current = true;
                setStatus('running');
              } else {
                setStatus(target.current_recipe ? 'promo' : 'online');
              }
            }
          });

        if (channel) channel.subscribe();
      }
    };

    initializeDevice();

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
            .update({ status: 'offline', current_recipe: null, last_heartbeat: new Date().toISOString() })
            .eq('id', idToShutdown);
        });
      }

      if (channel) supabase.removeChannel(channel); 
    };
  }, []); // 🔒 CORREGIDO: Arreglo vacío (Se monta una sola vez)

  // Auxiliar para desempaquetar la receta de la DB de manera segura
  const parseAndSetRecipe = (rawRecipe: any) => {
    try {
      let payload = rawRecipe;
      if (typeof payload === 'string') {
        payload = JSON.parse(payload);
      }
      if (payload && payload.pages) {
        setRecipePages(payload.pages);
        setRecipeCatalog(payload.catalog || []);
        setCurrentPageIdx(0);
      }
    } catch (e) {
      console.error("Error parseando receta en APUnit:", e);
    }
  };

  if (errorMsg) return <div className="h-screen flex items-center justify-center bg-black p-10 text-red-500 font-mono text-xl">ERROR: {errorMsg}</div>;
  if (!deviceId) return <div className="h-screen flex items-center justify-center bg-black p-10 text-aura-cyan font-mono animate-pulse text-xl">INITIALIZING_HARDWARE...</div>;

  // 🚀 CONTROL DE RENDERIZADO VISUAL SEGÚN EL ESTADO REAL DE LA UNIDAD
  
  // MODO A: Admin Mirroring / Diagnostics activo (Look terminal de control)
  if (status === 'running') {
    return (
      <div className="h-screen w-screen bg-cyan-950 text-aura-cyan flex flex-col items-center justify-center font-mono p-10 border-[16px] border-aura-dark shadow-[inset_0_0_60px_rgba(0,243,255,0.15)]">
        <Cpu size={80} className="mb-6 text-aura-cyan animate-spin" style={{ animationDuration: '12s' }} />
        <h1 className="text-xl font-bold tracking-[0.3em] uppercase">AP-UNIT // ADMIN_MODE</h1>
        <div className="text-[11px] opacity-40 mt-1 select-all">UUID: {deviceId}</div>
        <div className="mt-8 flex flex-col items-center gap-2">
          <Activity className="animate-pulse text-aura-cyan" size={32} />
          <span className="text-2xl font-black tracking-widest uppercase">STREAMING TELEMETRY</span>
        </div>
      </div>
    );
  }

  // MODO B: SEÑALIZACIÓN DIGITAL PROMO ACTIVA (Renderiza el layout del Creative Lab)
  if (recipePages.length > 0 && recipePages[currentPageIdx]) {
    const activePage = recipePages[currentPageIdx];
    
    return (
      <div className="h-screen w-screen bg-black text-white overflow-hidden flex flex-col relative p-4">
        {/* Línea sutil cyberpunk superior indicando red Aura */}
        <div className="absolute top-1 left-4 text-[9px] font-mono opacity-20 tracking-widest z-50">
          AURA-NET // DISPLAY_MODE: PROMO_SCRIPT // PAGE {currentPageIdx + 1} OF {recipePages.length}
        </div>
        
        {/* Motor de inyección de rejillas responsivas idénticas a la previsualización */}
        <div className="flex-1 w-full h-full p-2">
          {activePage.layout === 'full' && (
            <KioskSlotRender id="slot-0" catalog={recipeCatalog} config={activePage.slots['slot-0']} />
          )}
          
          {activePage.layout === 'split' && (
            <div className="flex w-full h-full gap-4">
              <div className="flex-1"><KioskSlotRender id="slot-0" catalog={recipeCatalog} config={activePage.slots['slot-0']} /></div>
              <div className="flex-1"><KioskSlotRender id="slot-1" catalog={recipeCatalog} config={activePage.slots['slot-1']} /></div>
            </div>
          )}
          
          {activePage.layout === 'focus' && (
            <div className="flex w-full h-full gap-4">
              <div className="flex-[2]"><KioskSlotRender id="slot-0" catalog={recipeCatalog} config={activePage.slots['slot-0']} /></div>
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex-1"><KioskSlotRender id="slot-1" catalog={recipeCatalog} config={activePage.slots['slot-1']} /></div>
                <div className="flex-1"><KioskSlotRender id="slot-2" catalog={recipeCatalog} config={activePage.slots['slot-2']} /></div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // MODO C: Standby Standard (Esperando campaña)
  return (
    <div className="h-screen w-screen bg-black text-green-500 flex flex-col items-center justify-center font-mono p-10 border-[16px] border-aura-dark">
      <Cpu size={80} className="mb-6 text-green-500 animate-bounce" style={{ animationDuration: '4s' }} />
      <h1 className="text-2xl font-bold tracking-[0.3em] uppercase mb-2">AURA-Play Unit</h1>
      <div className="text-xs opacity-40 mb-10 text-aura-cyan">UUID: {deviceId}</div>
      <div className="flex flex-col items-center gap-4">
        <Activity className="animate-pulse text-green-500" size={40} />
        <span className="text-4xl font-black uppercase tracking-widest animate-pulse">ONLINE</span>
        <span className="text-[10px] text-center text-neutral-500 tracking-wider max-w-sm mt-2">
          MÓDULO EN ESPERA — CONFIGURACIÓN VACÍA. INYECTA UN SCRIPT DESDE EL ORCHESTER CENTER PARA TRANSMITIR...
        </span>
      </div>
    </div>
  );
}