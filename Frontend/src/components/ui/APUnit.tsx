import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../services/supabase';
import { Cpu, Activity } from 'lucide-react';

/* --- CATÁLOGO BASE DE HARDWARE (Para resolución de elementos locales) --- */
const HARDWARE_CATALOG = [
  { id: 'p1', type: 'menu', name: 'NEON LAGER', price: 5.00, imageUrl: 'https://loremflickr.com/300/300/lager,beer?lock=1' },
  { id: 'p2', type: 'menu', name: 'CYBER WINGS', price: 12.50, imageUrl: 'https://loremflickr.com/300/300/chicken,wings?lock=2' },
  { id: 'p3', type: 'menu', name: 'VIP PROTOCOL', price: 50.00, imageUrl: 'https://loremflickr.com/300/300/champagne,vip?lock=3' },
  { id: 'p4', type: 'menu', name: 'MATRIX SHOT', price: 8.50, imageUrl: 'https://loremflickr.com/300/300/shot,drink?lock=4' },
  { id: 'p5', type: 'menu', name: 'EMP BURGER', price: 16.00, imageUrl: 'https://loremflickr.com/300/300/burger?lock=5' },
  { id: 'p6', type: 'menu', name: 'GLITCH PIZZA', price: 18.00, imageUrl: 'https://loremflickr.com/300/300/pizza?lock=6' },
  { id: 'p7', type: 'menu', name: 'QUANTUM SODA', price: 4.50, imageUrl: 'https://loremflickr.com/300/300/soda,can?lock=7' },
  { id: 'p8', type: 'menu', name: 'NEBULA DESSERT', price: 9.00, imageUrl: 'https://loremflickr.com/300/300/dessert?lock=8' },
  { id: 'p9', type: 'menu', name: 'SYNTH COCKTAIL', price: 14.00, imageUrl: 'https://loremflickr.com/300/300/cocktail,neon?lock=9' },
  { id: 'p10', type: 'menu', name: 'DARK MATTER STOUT', price: 7.50, imageUrl: 'https://loremflickr.com/300/300/stout,beer?lock=10' },
  { id: 'p11', type: 'menu', name: 'PLASMA WINGS', price: 14.00, imageUrl: 'https://loremflickr.com/300/300/spicy,wings?lock=11' },
  { id: 'p12', type: 'menu', name: 'HOLOGRAPHIC DONUT', price: 6.00, imageUrl: 'https://loremflickr.com/300/300/donut?lock=12' },
  { id: 'p13', type: 'menu', name: 'MECH TACOS', price: 11.00, imageUrl: 'https://loremflickr.com/300/300/tacos?lock=13' },
  { id: 'p14', type: 'menu', name: 'OVERCLOCK FRIES', price: 5.50, imageUrl: 'https://loremflickr.com/300/300/fries?lock=14' },
  { id: 'p15', type: 'menu', name: 'NANO ICE CREAM', price: 7.00, imageUrl: 'https://loremflickr.com/300/300/ice-cream?lock=15' },
  { id: 'p16', type: 'menu', name: 'IPA BIOS', price: 8.00, imageUrl: 'https://loremflickr.com/300/300/ipa,beer?lock=16' },
  { id: 'e1', type: 'event', name: 'LIVE DJ SET', imageUrl: 'https://loremflickr.com/300/300/dj,club?lock=17' },
  { id: 'e2', type: 'event', name: 'KARAOKE MONDAYS', imageUrl: 'https://loremflickr.com/300/300/karaoke?lock=18' },
  { id: 'e3', type: 'event', name: 'NEON PARTY', imageUrl: 'https://loremflickr.com/300/300/neon,party?lock=19' },
  { id: 'e4', type: 'event', name: 'SYSTEM REBOOT', imageUrl: 'https://loremflickr.com/300/300/cyberpunk,city?lock=20' },
  { id: 'e5', type: 'event', name: 'LADIES NIGHT', imageUrl: 'https://loremflickr.com/300/300/party,girls?lock=21' },
];

/* --- COMPONENTE RENDERIZADOR DE SLOTS DE HARDWARE --- */
function KioskSlotRender({ id, config, catalog }: { id: string, config: any, catalog: any[] }) {
  if (!config) return null;
  // Busca primero en el catálogo de la receta; si no está, busca en el catálogo base de hardware
  const item = config.boundItemId ? (catalog.find(i => i.id === config.boundItemId) || HARDWARE_CATALOG.find(i => i.id === config.boundItemId)) : null;
  
  return (
    <div className="w-full h-full relative overflow-hidden bg-[#050505] border border-aura-dark/30">
      {item ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div 
            className="absolute inset-0 bg-cover bg-center mix-blend-screen" 
            style={{ backgroundImage: `url(${item.imageUrl})`, opacity: config.bgOpacity ?? 0.8 }} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-75" />
          
          <div 
            className="relative z-10 flex flex-col items-center justify-center text-center p-4"
            style={{ 
              transform: `rotate(${config.rotation || 0}deg) translate(${config.posX || 0}px, ${config.posY || 0}px)` 
            }}
          >
             <h3 
               className={`${config.fontFamily || 'font-mono'} text-white font-black uppercase leading-tight tracking-widest drop-shadow-2xl`}
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

          {config.sticker && (
             <div 
               className="absolute top-4 right-4 bg-[#ff003c] text-white uppercase font-black transform rotate-12 shadow-[0_0_15px_rgba(255,0,60,0.6)]"
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
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-neutral-700 uppercase tracking-widest font-bold">
          EMPTY SLOT [{id}]
        </div>
      )}
    </div>
  );
}

export default function APUnit() {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [status, setStatus] = useState('connecting');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [recipePages, setRecipePages] = useState<any[]>([]);
  const [recipeCatalog, setRecipeCatalog] = useState<any[]>([]);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);

  const activeIdRef = useRef<string | null>(null);
  const isStreamingRef = useRef<boolean>(false);

  // 🚀 TIMING ENGINE: Carrusel automático independiente para ciclar páginas
  useEffect(() => {
    if (recipePages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentPageIdx(prev => (prev + 1) % recipePages.length);
    }, 6000); 

    return () => clearInterval(interval);
  }, [recipePages]);

  useEffect(() => {
    let isMounted = true;
    let channel: any = null;
    let telemetryInterval: any = null;

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

      activeIdRef.current = currentId;
      setDeviceId(currentId);

      // Sincronizar estado inicial
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

      // MOTOR DE TELEMETRÍA (Frecuencia base 5s)
      telemetryInterval = setInterval(async () => {
        if (!isMounted || !currentId) return;
        
        const simulatedTemp = parseFloat((42 + Math.sin(Date.now() * 0.0001) * 4 + Math.random() * 0.5).toFixed(2));
        const simulatedVolt = parseFloat((5.05 + Math.random() * 0.08).toFixed(2));
        const simulatedFps = parseFloat((59.85 + Math.random() * 0.3).toFixed(2));
        const simulatedRssi = Math.floor(85 + Math.random() * 15);

        await supabase
          .from('device_telemetry')
          .upsert({
            device_id: currentId,
            mode: isStreamingRef.current ? 'DIAGNOSTIC' : 'MEDIA_PLAYER',
            state: 'RUNNING',
            current_item: isStreamingRef.current ? 'Streaming Dashboard Telemetry' : 'Rendering Promo Engine',
            runtime_seconds: Math.floor(Performance.now() / 1000),
            cpu_temp: simulatedTemp,
            sys_volt: simulatedVolt,
            fps: simulatedFps,
            wifi_signal: simulatedRssi,
            components: [{ id: 'sys', type: 'text', label: 'DISPLAY_ENGINE', value: 'ACTIVE' }]
          });

      }, 5000);

      // 🚀 ESCUCHADOR REALTIME SCADA SIN INTERRUPCIONES
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
              console.log("⚡ Realtime update detectado en Hardware:", target);
              
              if (target.current_recipe) {
                // Desempaquetamos el JSONB de inmediato en los estados sin reiniciar el useEffect
                try {
                  let payloadData = target.current_recipe;
                  if (typeof payloadData === 'string') payloadData = JSON.parse(payloadData);
                  if (payloadData && payloadData.pages) {
                    setRecipePages(payloadData.pages);
                    setRecipeCatalog(payloadData.catalog || []);
                    setCurrentPageIdx(0);
                  }
                } catch (err) {
                  console.error(err);
                }
              }

              if (target.status === 'running') {
                isStreamingRef.current = true;
                setStatus('running');
              } else {
                isStreamingRef.current = false;
                setStatus(target.current_recipe ? 'promo' : 'online');
              }
            }
          });

        if (channel) channel.subscribe();
      }
    };

    initializeDevice();

    // 🚀 CLEANUP SEGURO: Solo se ejecuta si la pestaña se cierra o el componente se desmonta de verdad
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
            .update({ status: 'offline', last_heartbeat: new Date().toISOString() })
            .eq('id', idToShutdown);
        });
      }

      if (channel) supabase.removeChannel(channel); 
    };
  }, []); // 🔒 FIJADO EN APERTURA ÚNICA PARA EVITAR BUCLE DE BORRADO DE DATOS

  const parseAndSetRecipe = (rawRecipe: any) => {
    try {
      let payload = rawRecipe;
      if (typeof payload === 'string') payload = JSON.parse(payload);
      if (payload && payload.pages) {
        setRecipePages(payload.pages);
        setRecipeCatalog(payload.catalog || []);
        setCurrentPageIdx(0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (errorMsg) return <div className="h-screen flex items-center justify-center bg-black p-10 text-red-500 font-mono text-xl">ERROR: {errorMsg}</div>;
  if (!deviceId) return <div className="h-screen flex items-center justify-center bg-black p-10 text-aura-cyan font-mono animate-pulse text-xl">BOOTING_KIOSK_OS...</div>;

  // MODO DIAGNÓSTICO AZUL
  if (status === 'running') {
    return (
      <div className="h-screen w-screen bg-cyan-950 text-aura-cyan flex flex-col items-center justify-center font-mono p-10 border-[16px] border-aura-dark shadow-[inset_0_0_60px_rgba(0,243,255,0.15)]">
        <Cpu size={80} className="mb-6 text-aura-cyan animate-spin" style={{ animationDuration: '12s' }} />
        <h1 className="text-xl font-bold tracking-[0.3em] uppercase">AP-UNIT // SCADA_MODE</h1>
        <div className="text-[11px] opacity-40 mt-1">UUID: {deviceId}</div>
        <div className="mt-8 flex flex-col items-center gap-2">
          <Activity className="animate-pulse text-aura-cyan" size={32} />
          <span className="text-2xl font-black tracking-widest">TRANSMITTING TELEMETRY</span>
        </div>
      </div>
    );
  }

  // MODO PROMO: SEÑALIZACIÓN DIGITAL INTERACTIVA (AQUÍ SUCEDE EL LIENZO)
  if (recipePages.length > 0 && recipePages[currentPageIdx]) {
    const activePage = recipePages[currentPageIdx];
    
    return (
      <div className="h-screen w-screen bg-black text-white overflow-hidden flex flex-col relative p-4 select-none">
        <div className="absolute top-1 left-4 text-[9px] font-mono opacity-20 tracking-widest z-50">
          AURA-NET // RENDERING PROMO_SCRIPT // PAGE {currentPageIdx + 1} OF {recipePages.length}
        </div>
        
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

  // MODO STANDBY VERDE TERMINAL
  return (
    <div className="h-screen w-screen bg-black text-green-500 flex flex-col items-center justify-center font-mono p-10 border-[16px] border-aura-dark">
      <Cpu size={80} className="mb-6 text-green-500 animate-bounce" style={{ animationDuration: '4s' }} />
      <h1 className="text-2xl font-bold tracking-[0.3em] uppercase mb-2">AURA-Play Unit</h1>
      <div className="text-xs opacity-40 mb-10 text-aura-cyan">UUID: {deviceId}</div>
      <div className="flex flex-col items-center gap-4">
        <Activity className="animate-pulse text-green-500" size={40} />
        <span className="text-4xl font-black uppercase tracking-widest animate-pulse">ONLINE</span>
        <span className="text-[10px] text-center text-neutral-600 tracking-wider max-w-sm mt-2">
          MÓDULO EN ESPERA — CONFIGURACIÓN VACÍA. INYECTA UN SCRIPT DESDE EL ORCHESTER CENTER PARA TRANSMITIR...
        </span>
      </div>
    </div>
  );
}