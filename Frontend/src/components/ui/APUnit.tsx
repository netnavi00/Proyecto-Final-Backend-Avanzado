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

/* --- COMPONENTE RENDERIZADOR DE SLOTS DE HARDWARE MEJORADO --- */
function KioskSlotRender({ id, config, catalog }: { id: string, config: any, catalog: any[] }) {
  if (!config) return null;
  
  // 1. Buscamos el ítem en el catálogo (A prueba de errores)
  const safeCatalog = Array.isArray(catalog) ? catalog : [];
  const item = config.boundItemId ? (safeCatalog.find(i => i.id === config.boundItemId) || HARDWARE_CATALOG.find(i => i.id === config.boundItemId)) : null;
  
  // 2. Lógica de Fallback: Rescata imágenes o textos personalizados aunque no haya ítem
  const bgImage = item?.imageUrl || config.imageUrl;
  const displayText = config.customText || item?.name;
  const displayPrice = item?.type === 'menu' ? item.price : undefined;
  
  // 3. Verificamos si hay ALGO que mostrar
  const hasContent = !!(bgImage || displayText);

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#050505] border border-aura-dark/30">
      {hasContent ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Fondo (Imagen o Color) */}
          {bgImage && (
            <div 
              className="absolute inset-0 bg-cover bg-center mix-blend-screen transition-all duration-1000" 
              style={{ backgroundImage: `url(${bgImage})`, opacity: config.bgOpacity ?? 0.8 }} 
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-75" />
          
          {/* Contenedor de Texto y Precio */}
          <div 
            className="relative z-10 flex flex-col items-center justify-center text-center p-4 w-full h-full"
            style={{ 
              transform: `rotate(${config.rotation || 0}deg) translate(${config.posX || 0}px, ${config.posY || 0}px)` 
            }}
          >
             {displayText && (
               <h3 
                 className={`${config.fontFamily || 'font-mono'} text-white font-black uppercase leading-tight tracking-widest drop-shadow-2xl`}
                 style={{ fontSize: `${config.customTextSize || 24}px` }}
               >
                 {displayText}
               </h3>
             )}
             {displayPrice !== undefined && typeof displayPrice === 'number' && (
               <p 
                 className="font-bold mt-2 tracking-tighter" 
                 style={{ 
                   color: config.neonColor || '#00e5ff', 
                   textShadow: `0 0 10px ${config.neonColor || '#00e5ff'}`, 
                   fontSize: `${(config.customTextSize || 24) * 1.25}px` 
                 }}
               >
                 ${displayPrice.toFixed(2)}
               </p>
             )}
          </div>

          {/* Etiqueta Promocional */}
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
        // Si de verdad está vacío, mostramos un mensaje que SÍ se vea
        <div className="absolute inset-0 flex items-center justify-center text-[14px] text-aura-cyan/40 uppercase tracking-widest font-bold">
          [ ESPACIO DISPONIBLE: {id} ]
        </div>
      )}
    </div>
  );
}

export default function APUnit() {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState<string>('UNIT_UNKNOWN');
  const [status, setStatus] = useState('connecting');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [recipePages, setRecipePages] = useState<any[]>([]);
  const [recipeCatalog, setRecipeCatalog] = useState<any[]>([]);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);

  const activeIdRef = useRef<string | null>(null);
  const isStreamingRef = useRef<boolean>(false);
  
  // 🚀 TIMING ENGINE: Carrusel automático
  useEffect(() => {
    if (recipePages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentPageIdx(prev => (prev + 1) % recipePages.length);
    }, 6000); 

    return () => clearInterval(interval);
  }, [recipePages]);

  // 🛡️ PARSER INDESTRUCTIBLE: Compatible con scripts viejos (Array) y nuevos ({pages, catalog})
  const parseAndSetRecipe = (rawRecipe: any) => {
    try {
      let payload = rawRecipe;
      if (typeof payload === 'string') payload = JSON.parse(payload);
      
      const pagesToLoad = Array.isArray(payload) ? payload : (payload?.pages || []);
      const catalogToLoad = Array.isArray(payload) ? [] : (payload?.catalog || []);

      if (pagesToLoad && pagesToLoad.length > 0) {
        setRecipePages(pagesToLoad);
        setRecipeCatalog(catalogToLoad);
        setCurrentPageIdx(0);
      }
    } catch (e) {
      console.error("Error procesando payload de receta:", e);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let channel: any = null;
    let telemetryInterval: any = null;

    // 🛰️ FUNCIÓN DE INICIALIZACIÓN COMPLETA Y FILTRADA
    const initializeDevice = async () => {
      const params = new URLSearchParams(window.location.search);
      const currentMode = params.get('mode');
      let currentId = params.get('id');
      const paramEstId = params.get('est'); // <-- 🚀 EXTRAEMOS EL ESTABLECIMIENTO DE LA URL

      if (currentId && currentMode !== 'apunit') return; 

      // 🔍 Si entramos por ?mode=apunit sin ID fijo, buscamos o creamos dinámicamente
      if (!currentId) {
        // 1. Limpiamos y leemos las pestañas activas del navegador
        const rawStorage = localStorage.getItem('aura_active_units');
        let activeTabs = [];
        try { activeTabs = JSON.parse(rawStorage || '[]'); } catch { activeTabs = []; }

        // 2. Buscamos el establecimiento que le pertenece al usuario logueado O DE LA URL
        const { data: sessionData } = await supabase.auth.getSession();
        let myEstId = paramEstId || null; // <-- 🚀 TOMA EL ID DE LA URL PRIMERO
        if (!myEstId && sessionData?.session?.user) {
           const { data: est } = await supabase
             .from('establishments')
             .select('id')
             .eq('owner_id', sessionData.session.user.id)
             .single();
           if (est) myEstId = est.id;
        }

        // 3. Consultamos las unidades que correspondan a este establecimiento específico
        let query = supabase
          .from('devices')
          .select('id, status, current_recipe')
          .in('status', ['provisioned', 'offline', 'online', 'promo']);
          
        if (myEstId) query = query.eq('establishment_id', myEstId);

        const { data: allDevices } = await query;
        
        // 4. Encontramos un dispositivo que no esté ya abierto en otra pestaña local
        const availableDevice = allDevices?.find(d => !activeTabs.includes(d.id));

        if (!availableDevice) {
          // =========================================================
          // 🚀 BOOT SEQUENCE: AUTO-PROVISIONAMIENTO
          // =========================================================
          if (!myEstId) {
             if (isMounted) setErrorMsg("NO_HARDWARE_FOUND (Falta el parámetro '&est=' en la URL o iniciar sesión)");
             return;
          }
          
          // Genera un ID único rápido para el dispositivo y lo inyecta en la DB
          currentId = `AP-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
          const { error: insertError } = await supabase.from('devices').insert({
             id: currentId,
             name: `NODE-${currentId}`,
             status: 'online',
             establishment_id: myEstId,
             last_heartbeat: new Date().toISOString()
          });

          if (insertError) {
             console.error("Fallo al auto-provisionar hardware:", insertError);
             if (isMounted) setErrorMsg("HARDWARE_PROVISIONING_FAILED (Verifica políticas RLS en Supabase)");
             return;
          }
          console.log(`[SYS.BOOT] Nodo auto-registrado en la red: ${currentId}`);
          
        } else {
          currentId = availableDevice.id;
        }
        
        activeTabs.push(currentId);
        localStorage.setItem('aura_active_units', JSON.stringify(activeTabs));
      }

      if (!isMounted) return;

      activeIdRef.current = currentId;
      setDeviceId(currentId);

      // Sincronizar estado inicial en la base de datos a ONLINE (El ping de arranque oficial)
      const { data: currentDeviceState, error: updateError } = await supabase
        .from('devices')
        .update({ status: 'online', last_heartbeat: new Date().toISOString() })
        .eq('id', currentId)
        .select('status, is_mirroring_active, current_recipe, name') // Ahora traemos el nombre
        .maybeSingle();

      if (updateError) {
        if (isMounted) setErrorMsg("CONNECTION_REJECTED");
        return;
      } else {
        if (isMounted) {
          const deviceData = currentDeviceState as any;
          if (deviceData?.name) setDeviceName(deviceData.name);
          if (deviceData?.current_recipe) parseAndSetRecipe(deviceData.current_recipe);

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
            runtime_seconds: Math.floor(performance.now() / 1000),
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
              if (target.current_recipe) {
                parseAndSetRecipe(target.current_recipe);
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

    // 🔥 LLAMADA AUTOMÁTICA AL MONTAR EL COMPONENTE
    initializeDevice();

    // 🧹 CLEANUP DE SALIDA
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
  }, []); 

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

  // MODO PROMO: SEÑALIZACIÓN DIGITAL INTERACTIVA
  if (recipePages.length > 0 && recipePages[currentPageIdx]) {
    const activePage = recipePages[currentPageIdx];

    const safeLayout = activePage.layout || 'full';
    const safeSlots = activePage.slots || { 'slot-0': activePage };
    
    return (
      <div className="h-screen w-screen bg-black text-white overflow-hidden flex flex-col relative p-4 select-none">
        {/* 🚀 ETIQUETA DE TELEMETRÍA VISIBLE */}
        <div className="absolute top-3 left-4 text-[11px] font-mono text-aura-cyan font-bold tracking-widest z-50 bg-black/60 px-3 py-1.5 border border-aura-cyan/30 shadow-[0_0_10px_rgba(0,0,0,0.8)] backdrop-blur-sm flex items-center gap-2">
          <span className="w-2 h-2 bg-aura-cyan rounded-full animate-pulse"></span>
          AURA-NET // {deviceName !== 'UNIT_UNKNOWN' ? deviceName.toUpperCase() : 'AP-UNIT'} [ ID: {deviceId?.split('-')[0]} ] // PAGE {currentPageIdx + 1} OF {recipePages.length}
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