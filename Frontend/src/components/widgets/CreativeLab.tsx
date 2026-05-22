import React, { useState, useEffect,useRef } from 'react';
import { AlertTriangle, UploadCloud, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../services/supabase';

/* --- CONFIGURACIÓN DE TIPOGRAFÍAS --- */
export const FONT_OPTIONS = [
  { name: 'Mono Industrial', class: 'font-mono' },
  { name: 'Orbitron Cyber', class: 'font-orbitron' },
  { name: 'Rajdhani Tech', class: 'font-rajdhani' },
  { name: 'Michroma Futur', class: 'font-michroma' },
  { name: 'Exo Technology', class: 'font-exo' }
];

/* --- CREATIVE LAB TYPES & MOCK --- */
export type LayoutType = 'full' | 'split' | 'focus';

export interface CatalogItem {
  id: string;
  type: 'menu' | 'event';
  name: string;
  price?: number;
  imageUrl: string;
}

export const DEFAULT_CATALOG: CatalogItem[] = [
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

export const PRESETS_MARKETING_IMAGES = [
  { name: 'Fondo Neon Grid', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=500&auto=format&fit=crop' },
  { name: 'Pizza Humante', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=500&auto=format&fit=crop' },
  { name: 'Cerveza Helada', url: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=500&auto=format&fit=crop' },
  { name: 'Alitas de Pollo Fuego', url: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=500&auto=format&fit=crop' },
  { name: 'Cóctel Cyberpunk', url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=500&auto=format&fit=crop' }
];

export const DESIGN_PRESETS: Record<string, Partial<SlotConfig>> = {
  ofertaFlash: { customTextSize: 32, neonColor: '#ff003c', sticker: '2x1 PROMO', stickerSize: 14, bgOpacity: 0.9 },
  cyberPremium: { customTextSize: 28, neonColor: '#00e5ff', sticker: 'RECOMMENDED', stickerSize: 11, bgOpacity: 0.7 },
  minimalista: { customTextSize: 22, neonColor: '#ffffff', sticker: null, stickerSize: 12, bgOpacity: 0.5 }
};

export interface SlotConfig {
  boundItemId: string | null;
  customText: string | null;
  imageUrl?: string | null;
  customTextSize: number;
  fontFamily: string;
  rotation: number;
  posX: number;
  posY: number;
  neonColor: string;
  sticker: string | null;
  stickerSize: number;
  bgOpacity: number;
}

export interface PageConfig {
  id: number;
  layout: LayoutType;
  slots: Record<string, SlotConfig>;
}

export const DEFAULT_SLOT: SlotConfig = { 
  boundItemId: null, 
  customText: null, 
  customTextSize: 24, 
  fontFamily: 'font-mono',
  rotation: 0,
  posX: 0,
  posY: 0,
  neonColor: '#00e5ff', 
  sticker: null, 
  stickerSize: 12, 
  bgOpacity: 0.8 
};

export function SlotRender({ id, config, catalog, onSelect, isSelected }: { id: string, config?: SlotConfig, catalog: CatalogItem[], onSelect: () => void, isSelected: boolean }) {
  if (!config) return null;
  const item = config.boundItemId ? catalog.find(i => i.id === config.boundItemId) : null;
  
  return (
    <div 
      onClick={onSelect}
      className={`w-full h-full relative cursor-pointer overflow-hidden border-2 transition-all bg-aura-bg ${isSelected ? 'border-aura-cyan shadow-[0_0_15px_rgba(0,229,255,0.4)] z-10' : 'border-dashed border-aura-dark hover:border-aura-green/50'}`}
    >
      {item ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="absolute inset-0 bg-cover bg-center mix-blend-screen" 
               style={{ backgroundImage: `url(${item.imageUrl})`, opacity: config.bgOpacity }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-60" />
          
          <div className="relative z-10 flex flex-col items-center justify-center text-center p-[9px]"
               style={{ 
                 transform: `rotate(${config.rotation || 0}deg) translate(${config.posX || 0}px, ${config.posY || 0}px)` 
               }}>
             {/* TÍTULO PRINCIPAL MODIFICADO */}
             <h3 
               className={`${config.fontFamily || 'font-mono'} font-black uppercase leading-tight tracking-widest ${item.type !== 'event' ? 'text-aura-text drop-shadow-lg' : ''}`}
               style={{ 
                 fontSize: `${config.customTextSize || 24}px`,
                 // Si es un evento, pintamos el texto con el color neón. Si no, usa el default.
                 color: item.type === 'event' ? config.neonColor : undefined,
                 // Si es un evento, le damos el brillo neón al título.
                 textShadow: item.type === 'event' ? `0 0 15px ${config.neonColor}` : undefined
               }}
             >
               {config.customText || item.name}
             </h3>
             {item.type === 'menu' && typeof item.price === 'number' && (
               <p className="font-bold mt-[9px] tracking-tighter" style={{ color: config.neonColor, textShadow: `0 0 10px ${config.neonColor}`, fontSize: `${(config.customTextSize || 24) * 1.25}px` }}>
                 ${item.price.toFixed(2)}
               </p>
             )}
          </div>
          {config.sticker && (
             <div 
               className="absolute top-4 right-4 bg-aura-red text-aura-text uppercase font-black transform rotate-12 shadow-[0_0_10px_color-mix(in_srgb,_var(--color-aura-red)_50%,_transparent)]"
               style={{ fontSize: `${config.stickerSize || 12}px`, padding: `${(config.stickerSize || 12) * 0.25}px ${(config.stickerSize || 12) * 0.75}px` }}
             >
               {config.sticker}
             </div>
          )}
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-[12px] text-aura-green/30 uppercase tracking-widest font-bold">
          <div className="flex flex-col items-center gap-[9px]">
            <span className="opacity-50">EMPTY SLOT</span>
            <span>[{id}]</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function CreativeLab() {
  const [catalog, setCatalog] = useState<CatalogItem[]>(DEFAULT_CATALOG);
  const [catalogTab, setCatalogTab] = useState<'menu' | 'event'>('menu');
  const [pages, setPages] = useState<PageConfig[]>([
    { id: 1, layout: 'full', slots: { 'slot-0': { ...DEFAULT_SLOT } } },
    { id: 2, layout: 'split', slots: { 'slot-0': { ...DEFAULT_SLOT }, 'slot-1': { ...DEFAULT_SLOT } } },
    { id: 3, layout: 'focus', slots: { 'slot-0': { ...DEFAULT_SLOT }, 'slot-1': { ...DEFAULT_SLOT }, 'slot-2': { ...DEFAULT_SLOT } } },
    { id: 4, layout: 'full', slots: { 'slot-0': { ...DEFAULT_SLOT } } }
  ]);
  const [currentEstablishmentId, setCurrentEstablishmentId] = useState<string>('');
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [selectedPageId, setSelectedPageId] = useState(1);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('slot-0');
  const [gridMode, setGridMode] = useState(false);

  // 🚀 ESTADOS PARA EL GUARDADO EN NUBE Y CARGA
  const [campaignName, setCampaignName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedCampaigns, setSavedCampaigns] = useState<any[]>([]);
 

  // 🚀 ESTADOS PARA LOS ACORDEONES DEL MENÚ IZQUIERDO
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(true);

  const activePage = pages.find(p => p.id === selectedPageId)!;
  const activeSlot = activePage.slots[selectedSlotId];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Si el ref existe y el elemento clickeado NO está dentro del menú
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownMenuOpen(false);
      }
    };

    // Escuchamos los clics en todo el documento
    document.addEventListener('mousedown', handleClickOutside);
    
    // Limpieza del evento cuando se desmonta el componente
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchSession = async () => {
      // Obtenemos el usuario que tiene la sesión iniciada
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (user) {
        setCurrentEstablishmentId(user.id);
      } else {
        console.warn("⚠️ No hay sesión activa. Los scripts no tendrán un establishment_id.");
        // Si estás haciendo pruebas sin iniciar sesión, puedes descomentar la línea de abajo 
        // y pegar un ID real de tu base de datos temporalmente para que no marque error:
        // setCurrentEstablishmentId('PEGAR-UN-UUID-DE-TU-BASE-DE-DATOS-AQUI');
      }
    };

    fetchSession();
  }, []);


  // Reacciona y se dispara SOLO cuando ya detectó el ID del local
  useEffect(() => {
    if (currentEstablishmentId) {
      fetchCampaigns();
    }
  }, [currentEstablishmentId]);

  const fetchCampaigns = async () => {
    // 2. Seguridad extra: Si no hay ID, no hace la consulta
    if (!currentEstablishmentId) return; 

    const { data, error } = await supabase
      .from('promo_scripts')
      .select('id, name, config_payload')
      .eq('establishment_id', currentEstablishmentId) // 🔒 EL CANDADO (Filtro Multi-tenant)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setSavedCampaigns(data);
    }
  };

  // 🚀 LÓGICA DE CARGA INSTANTÁNEA (Directo del select)
  const loadCampaign = (id: string) => {
    console.log("🔍 Intentando cargar la campaña ID:", id);
    if (!id) return;
    
    const campaign = savedCampaigns.find(c => String(c.id) === String(id));;
    if (!campaign) {
      console.error("❌ Campaña no encontrada en memoria.");
      return;
    }

    try {
      let payload = campaign.config_payload;
      if (typeof payload === 'string') {
        payload = JSON.parse(payload);
      }
      console.log("📦 Datos obtenidos:", payload);

      const pagesToLoad = payload.pages || payload;

      if (pagesToLoad && Array.isArray(pagesToLoad)) {
        setPages([...pagesToLoad]); 
        
        if (payload.catalog && Array.isArray(payload.catalog)) {
           setCatalog([...payload.catalog]);
        }
        
        setCampaignName(campaign.name);
        setSelectedPageId(1);
        setSelectedSlotId('slot-0');
        
        alert(`✅ Campaña "${campaign.name}" cargada correctamente.`);
      } else {
        alert("⚠️ Archivo corrupto. Revisa la consola.");
      }
    } catch (error) {
      console.error("❌ Error grave al cargar:", error);
      alert("⚠️ Hubo un error de procesamiento.");
    }
  };

  const updatePage = (updates: Partial<PageConfig>) => {
    setPages(prev => prev.map(p => p.id === selectedPageId ? { ...p, ...updates } : p));
  };

  const updateSlot = (updates: Partial<SlotConfig>) => {
    updatePage({
      slots: { ...activePage.slots, [selectedSlotId]: { ...activePage.slots[selectedSlotId], ...updates } }
    });
  };

  const handleLayoutChange = (layout: LayoutType) => {
    setPages(prev => prev.map(p => {
      if (p.id !== selectedPageId) return p;
      const newSlots: Record<string, SlotConfig> = {};
      newSlots['slot-0'] = { ...DEFAULT_SLOT };
      if (layout === 'split' || layout === 'focus') newSlots['slot-1'] = { ...DEFAULT_SLOT };
      if (layout === 'focus') newSlots['slot-2'] = { ...DEFAULT_SLOT };
      return { ...p, layout, slots: newSlots };
    }));
    setSelectedSlotId('slot-0');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newItem: CatalogItem = {
          id: `upl-${crypto.randomUUID()}`,
          type: catalogTab,
          name: file.name.split('.')[0] || 'Uploaded Image',
          price: catalogTab === 'menu' ? 0.00 : undefined,
          imageUrl: dataUrl
        };
        setCatalog(prev => [newItem, ...prev]);
        updateSlot({ boundItemId: newItem.id }); 
        setIsLibraryOpen(true); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteCatalogItem = (e: React.MouseEvent, idToDelete: string) => {
    e.stopPropagation(); // 🛡️ CRUCIAL: Evita que el clic seleccione la imagen en el lienzo
    const confirmDelete = window.confirm("¿Seguro que deseas eliminar este elemento de la biblioteca?");
    if (confirmDelete) {
      setCatalog(prev => prev.filter(item => item.id !== idToDelete));
      
      // Opcional: Si el elemento borrado estaba seleccionado en el slot actual, lo quitamos
      if (activeSlot?.boundItemId === idToDelete) {
        updateSlot({ boundItemId: null });
      }
    }
  };

  const exportRecipe = async (currentEstablishmentId: string) => {
    const MAX_RECIPES = 5; 

    if (!currentEstablishmentId) {
      alert("🛑 ERROR: No se detectó un ID de establecimiento válido.");
      return;
    }

    const normalizedName = campaignName.trim().toUpperCase();

    if (!normalizedName) {
      alert("⚠️ ALERTA: Por favor, asígnale un nombre a la campaña.");
      return;
    }

    // ==========================================
    // 🛡️ MOTOR DE VALIDACIÓN DE INTEGRIDAD V2
    // ==========================================
    const emptyPages: number[] = [];
    const incompletePages: number[] = [];
    const pagesWithWarnings: number[] = [];
    const validPages: typeof pages = [];

    pages.forEach((page) => {
      let requiredKeys: string[] = [];
      if (page.layout === 'full') requiredKeys = ['slot-0'];
      else if (page.layout === 'split') requiredKeys = ['slot-0', 'slot-1'];
      else if (page.layout === 'focus') requiredKeys = ['slot-0', 'slot-1', 'slot-2'];

      let emptyCount = 0;
      let hasPartialSlot = false;

      requiredKeys.forEach(key => {
        const slot = page.slots[key];
        
        // Evaluamos qué contiene el slot exactamente
        const hasCatalogItem = !!(slot && slot.boundItemId);
        const hasCustomImage = !!(slot && slot.imageUrl);
        const hasCustomText = !!(slot && slot.customText);

        if (!hasCatalogItem && !hasCustomImage && !hasCustomText) {
          // El slot está 100% muerto
          emptyCount++;
        } else {
          // El slot tiene contenido. Evaluamos si es "parcial" (solo texto o solo imagen sin ítem del catálogo)
          if (!hasCatalogItem && ((hasCustomImage && !hasCustomText) || (hasCustomText && !hasCustomImage))) {
            hasPartialSlot = true;
          }
        }
      });

      if (emptyCount === requiredKeys.length) {
        emptyPages.push(page.id); // No hay nada en toda la página
      } else if (emptyCount > 0) {
        incompletePages.push(page.id); // La página tiene huecos reales
      } else {
        validPages.push(page); // La página tiene todos los slots ocupados
        if (hasPartialSlot) {
          pagesWithWarnings.push(page.id); // Pero detectamos algo que requiere advertencia suave
        }
      }
    });

    // 🛑 1. BLOQUEO ESTRICTO: Páginas a medias (Espacios 100% en blanco)
    if (incompletePages.length > 0) {
      alert(`🛑 ERROR VISUAL: La(s) página(s) [ ${incompletePages.join(', ')} ] tienen HUECOS VACÍOS.\n\nEl sistema no permite guardar layouts rotos. Llena todos los espacios o cambia el tipo de Layout.`);
      return; 
    }

    // 🧹 2. AUTO-LIMPIEZA: Páginas totalmente vacías
    if (emptyPages.length > 0) {
      const confirmClean = window.confirm(`⚠️ ANOMALÍA: La(s) página(s) [ ${emptyPages.join(', ')} ] están completamente vacías.\n\n¿Purgar páginas en blanco y continuar guardando el resto?`);
      if (!confirmClean) return; 
    }

    // Si después de limpiar no quedó nada...
    if (validPages.length === 0) {
      alert("🛑 ERROR: No hay páginas con contenido válido para guardar. Abortando.");
      return;
    }

    // ⚠️ 3. ADVERTENCIA SUAVE: Slots con solo texto o solo imagen
    if (pagesWithWarnings.length > 0) {
      const confirmPartial = window.confirm(`👁️ REVISIÓN RECOMENDADA: La(s) página(s) [ ${pagesWithWarnings.join(', ')} ] contienen slots que tienen SOLO texto o SOLO una imagen.\n\nSi es intencional (ej. una imagen que ya trae texto o un mensaje sorpresa), presiona 'Aceptar' para guardar.`);
      if (!confirmPartial) return; // El usuario prefiere regresar a ponerle texto o imagen
    }
    // ==========================================

    const existingCampaign = savedCampaigns.find(
      c => String(c.name).trim().toUpperCase() === normalizedName
    );

    if (!existingCampaign && savedCampaigns.length >= MAX_RECIPES) {
      alert(`🛑 LÍMITE ALCANZADO: Tienes ${savedCampaigns.length}/${MAX_RECIPES} scripts almacenados.`);
      return;
    }

    if (existingCampaign) {
      const confirmOverwrite = window.confirm(
        `⚠️ ADVERTENCIA: Ya existe un script llamado "${normalizedName}".\n¿Sobreescribir memoria existente?`
      );
      if (!confirmOverwrite) return; 
    }

    setIsSaving(true);
    
    // 📦 EMPAQUETADO FINAL: Enviamos las páginas purificadas (validPages)
    const payload = { 
      pages: validPages, 
      catalog: catalog 
    };

    try {
      if (existingCampaign) {
        const { error } = await supabase
          .from('promo_scripts')
          .update({ config_payload: payload, name: normalizedName })
          .eq('id', existingCampaign.id)
          .eq('establishment_id', currentEstablishmentId); 
          
        if (error) throw error;
        alert(`🔄 Receta "${normalizedName}" actualizada en el SYS.STORAGE.`);
      } else {
        const { error } = await supabase
          .from('promo_scripts')
          .insert({
            name: normalizedName,
            config_payload: payload,
            slot: 1,
            establishment_id: currentEstablishmentId 
          });
          
        if (error) throw error;
        alert(`✅ Nueva receta "${normalizedName}" inyectada en memoria.`);
      }

      setCampaignName(''); 
      fetchCampaigns(); 
    } catch (error: any) {
      console.error(error);
      alert("Fallo al guardar en la base de datos: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

const deleteRecipe = async (recipeId: string, recipeName: string, currentEstablishmentId: string) => {
    if (!currentEstablishmentId) {
      alert("🛑 ERROR: No se detectó un ID de establecimiento válido.");
      return;
    }

    // Un prompt de confirmación rápido para evitar botonazos por error
    const confirmDelete = window.confirm(`⚠️ ¿Estás seguro de que deseas ELIMINAR permanentemente la campaña "${recipeName}"?`);
    if (!confirmDelete) return;

    try {
      // Ejecutamos el borrado físico con doble validación de seguridad
      const { error } = await supabase
        .from('promo_scripts')
        .delete()
        .eq('id', recipeId)
        .eq('establishment_id', currentEstablishmentId);

      if (error) throw error;

      alert(`🗑️ Campaña "${recipeName}" eliminada correctamente.`);
      
      // Si la receta que borraste estaba seleccionada en el input o pantalla actual, la limpiamos
      if (campaignName.toUpperCase() === recipeName.toUpperCase()) {
        setCampaignName('');
      }

      // Recargamos el estado local y la lista del desplegable
      fetchCampaigns(); 
    } catch (error: any) {
      console.error(error);
      alert("Fallo al eliminar de la base de datos: " + error.message);
    }
  };

return (
    /* ========================================================= */
    /* 📦 CONTENEDOR PRINCIPAL: Envuelve toda la pantalla        */
    /* ========================================================= */
    <div className="h-full flex flex-col">
      
      {/* ========================================================= */}
      {/* 1️⃣ HEADER PRINCIPAL: Título, Storage y Guardar            */}
      {/* ========================================================= */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center w-full shrink-0 gap-6 mb-[12px]">
        <h2 className="text-[13px] font-bold flex flex-col xl:flex-row items-center w-full shrink-0 gap-4">
          
          {/* --- A. Título Izquierdo --- */}
          <div className="flex items-center gap-[12px] whitespace-nowrap shrink-0">
            <span className="w-1.5 h-6 bg-aura-green shadow-[0_0_10px_rgba(0,229,255,0.5)]"></span>
            <h1 className="text-2xl font-black text-aura-green tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              CREATIVE LAB
            </h1>
          </div>
          
          {/* --- B. Zona Central (SYS.STORAGE) --- */}
          <div className="flex-1 flex justify-end w-full min-w-0 mt-4 xl:mt-0 pr-2">
            <div className="border-2 border-aura-dark bg-black/40 relative min-w-[200px] max-w-full">
              <div className="absolute -top-[10px] left-3 bg-black px-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-aura-cyan rounded-full animate-pulse shadow-[0_0_5px_rgba(0,229,255,0.8)]"></span>
                <span className="text-[11px] font-mono text-aura-cyan uppercase tracking-widest font-black">
                  [ SYS.STORAGE ]
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-[9px] p-3 pt-5">
                {savedCampaigns.length === 0 ? (
                  <span className="text-[11px] text-aura-cyan/40 font-mono tracking-widest uppercase opacity-50 ml-2">
                    [ MEMORIA VACÍA... ]
                  </span>
                ) : (
                  savedCampaigns.map(c => (
                    <div key={c.id} className="group flex items-center bg-[#0a0a0a] border border-aura-cyan/40 hover:border-aura-cyan transition-all shrink-0 shadow-[0_0_10px_rgba(0,229,255,0.05)] hover:shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                      <button onClick={() => loadCampaign(c.id)} className="px-3 py-1.5 text-[11px] uppercase font-bold text-aura-cyan/80 group-hover:text-aura-cyan transition-colors tracking-wider">{c.name}</button>
                      <button onClick={(e) => { e.stopPropagation(); deleteRecipe(c.id, c.name, currentEstablishmentId); }} className="hidden group-hover:flex items-center justify-center border-l border-aura-cyan/40 hover:border-aura-red px-2.5 py-1.5 text-[11px] font-black text-aura-red hover:bg-aura-red/10 transition-colors">X</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* --- C. Controles Derechos (Input y Guardar) --- */}
          <div className="flex items-center gap-3 whitespace-nowrap shrink-0 mt-4 xl:mt-0 self-end xl:self-center">
            <input type="text" placeholder="NOMBRE NUEVO..." value={campaignName} onChange={(e) => setCampaignName(e.target.value)} className="bg-aura-bg border-2 border-aura-dark text-[12px] px-3 py-2 text-aura-text outline-none focus:border-aura-cyan uppercase w-48 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]" />
            <button onClick={() => exportRecipe(currentEstablishmentId)} disabled={isSaving} className={`text-[12px] px-4 py-2 uppercase tracking-widest font-bold transition-all ${isSaving ? 'bg-aura-dark text-aura-cyan/30 cursor-not-allowed' : 'bg-aura-cyan text-black hover:brightness-110 shadow-[0_0_15px_rgba(0,229,255,0.4)]'}`}>
              {isSaving ? 'GUARDANDO...' : 'GUARDAR'}
            </button>
          </div>
        </h2>
      </div> 
      {/* <--- FIN DEL 1️⃣ HEADER PRINCIPAL ---> */}


      {/* ========================================================= */
      /* 2️⃣ BARRA DE SUBIDA DE ARCHIVOS: 100% libre e independiente */
      /* ========================================================= */}
      <div className="w-full shrink-0 mb-[24px]">
         <label className="border border-dashed border-aura-cyan/50 bg-aura-cyan/5 hover:bg-aura-cyan/10 text-aura-cyan p-3 flex items-center justify-center cursor-pointer transition-colors gap-2 w-full group">
           <UploadCloud size={16} className="group-hover:scale-110 transition-transform" />
           <span className="text-[12px] uppercase tracking-widest font-bold">SUBIR IMAGEN DESDE EL EQUIPO (UPLOAD)</span>
           <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
         </label>
      </div>
      {/* <--- FIN DE LA 2️⃣ BARRA DE SUBIDA ---> */}


      {/* ========================================================= */
      /* 3️⃣ ÁREA DE TRABAJO: Grid dividido en 2 columnas            */
      /* ========================================================= */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-[26px] max-w-[1600px] mx-auto w-full items-stretch min-h-0 min-w-0">
        
        {/* ------------------------------------------------------- */}
        {/* COLUMNA IZQUIERDA (Toolbox - 4 de 12 columnas)          */}
        {/* ------------------------------------------------------- */}
        <div className="w-full xl:col-span-4 flex flex-col gap-[26px] overflow-y-auto pr-1 min-h-0">
          
          {/* Bloque: Layout Engine */}
          <div className="flex flex-col gap-[14px] p-[18px] border-2 border-aura-dark bg-aura-inner shrink-0">
            <h3 className="text-[12px] uppercase text-aura-green/60 font-bold tracking-widest border-b border-aura-dark pb-2 mb-[9px]">Layout Engine (Diseño de Página)</h3>
            <div className="grid grid-cols-3 gap-[9px]">
                {(['full', 'split', 'focus'] as LayoutType[]).map(l => (
                  <button key={l} onClick={() => handleLayoutChange(l)} className={`py-2 text-[12px] uppercase font-bold transition-colors ${activePage.layout === l ? 'border-2 border-aura-green bg-aura-green/10 text-aura-text' : 'border-2 border-aura-dark text-aura-green/40 hover:border-aura-green/50'}`}>
                    {l}
                  </button>
                ))}
            </div>
          </div>

          {/* Bloque: Biblioteca de Activos */}
          <div className="flex flex-col border-2 border-aura-dark bg-aura-inner shrink-0 transition-all">
            <button onClick={() => setIsLibraryOpen(!isLibraryOpen)} className="flex justify-between items-center w-full p-[18px] hover:bg-aura-dark/20 transition-colors">
              <h3 className="text-[12px] uppercase text-aura-green/60 font-bold tracking-widest">Biblioteca de Activos</h3>
              {isLibraryOpen ? <ChevronUp size={16} className="text-aura-green/60" /> : <ChevronDown size={16} className="text-aura-green/60" />}
            </button>
            {isLibraryOpen && (
              <div className="flex flex-col gap-[18px] p-[18px] pt-0 border-t border-aura-dark/50">
                <div className="flex gap-[9px] mt-2">
                  <button onClick={() => setCatalogTab('menu')} className={`flex-1 py-2 text-[10px] font-bold uppercase transition-colors ${catalogTab === 'menu' ? 'bg-aura-cyan text-black' : 'border-2 border-aura-dark text-aura-green/40 hover:border-aura-green/50'}`}>Menu & Items</button>
                  <button onClick={() => setCatalogTab('event')} className={`flex-1 py-2 text-[10px] font-bold uppercase transition-colors ${catalogTab === 'event' ? 'bg-purple-500 text-aura-text' : 'border-2 border-aura-dark text-aura-green/40 hover:border-purple-500/50 hover:text-purple-400'}`}>Eventos</button>
                </div>
                <div className="flex flex-col gap-[14px]">
                    {/* 🚀 INICIO DEL BLOQUE REEMPLAZADO 🚀 */}
                    {catalog.filter(i => i.type === catalogTab).map(item => {
                        const isSelected = activeSlot?.boundItemId === item.id;
                        
                        return (
                          <div 
                            key={item.id} 
                            onClick={() => updateSlot({ boundItemId: item.id })} 
                            // 👇 Añadimos 'group' al inicio del className
                            className={`group flex items-center gap-[14px] p-[9px] border cursor-pointer transition-colors ${
                              isSelected 
                                ? (item.type === 'menu' ? 'border-aura-cyan bg-aura-cyan/10' : 'border-purple-500 bg-purple-500/10') 
                                : 'border-aura-dark hover:border-aura-green/50 bg-aura-bg hover:bg-aura-panel'
                            }`}
                          >
                            <div className="w-12 h-12 bg-cover bg-center border-2 border-aura-dark shrink-0" style={{ backgroundImage: `url(${item.imageUrl})` }} />
                            <div className="flex flex-col flex-1 overflow-hidden">
                              <span className={`text-[13px] font-bold truncate transition-colors ${
                                isSelected 
                                  ? (item.type === 'menu' ? 'text-aura-cyan' : 'text-purple-400') 
                                  : 'text-aura-text'
                              }`}>
                                {item.name}
                              </span>
                              {item.type === 'menu' && typeof item.price === 'number' && (
                                <span className="text-[12px] text-aura-green font-mono">${item.price.toFixed(2)}</span>
                              )}
                            </div>

                            {/* 👇 NUEVO BOTÓN DE ELIMINAR (Oculto por defecto, visible al hacer hover) */}
                            <button 
                              onClick={(e) => handleDeleteCatalogItem(e, item.id)}
                              className="hidden group-hover:flex items-center justify-center w-8 h-8 shrink-0 text-aura-red hover:bg-aura-red/20 border border-transparent hover:border-aura-red/50 transition-all font-black text-[12px]"
                              title="Eliminar elemento"
                            >
                              X
                            </button>

                          </div>
                        );
                      })}
                    {/* 🚀 FIN DEL BLOQUE REEMPLAZADO 🚀 */}
                </div>
              </div>
            )}
          </div>

          {/* Bloque: Propiedades del Slot */}
          <div className="flex flex-col border-2 border-aura-cyan/30 bg-aura-inner/80 shadow-[0_0_20px_rgba(0,229,255,0.05)] shrink-0 transition-all mb-[20px]">
            <button onClick={() => setIsPropertiesOpen(!isPropertiesOpen)} className="flex justify-between items-center w-full p-[18px] hover:bg-aura-cyan/10 transition-colors">
              <h3 className="text-[12px] uppercase text-aura-cyan font-bold tracking-widest">Propiedades del Slot [{selectedSlotId}]</h3>
              {isPropertiesOpen ? <ChevronUp size={16} className="text-aura-cyan" /> : <ChevronDown size={16} className="text-aura-cyan" />}
            </button>
            {isPropertiesOpen && (
              <div className="flex flex-col gap-[14px] p-[18px] pt-0 border-t border-aura-cyan/30">
                <div className="flex flex-col gap-[9px] mt-2">
                  <label className="text-[12px] uppercase opacity-60">Texto Sobrescrito (Opcional)</label>
                  <input type="text" value={activeSlot?.customText || ''} onChange={e => updateSlot({ customText: e.target.value || null })} className="bg-aura-bg border-2 border-aura-dark text-[13px] p-[9px] text-aura-text outline-none focus:border-aura-cyan" placeholder="Escribe el título aquí..." />
                </div>
                <div className="flex flex-col gap-[9px] mt-[9px]">
                  <label className="text-[12px] uppercase opacity-60 flex justify-between"><span>Tamaño del Texto</span><span>{activeSlot?.customTextSize || 24}px</span></label>
                  <input type="range" min="12" max="72" step="2" value={activeSlot?.customTextSize || 24} onChange={e => updateSlot({ customTextSize: parseInt(e.target.value) })} className="w-full accent-aura-cyan" />
                </div>
                <div className="flex flex-col gap-[9px] mt-[9px]">
                   <label className="text-[12px] uppercase opacity-60">Tipografía</label>
                   <select value={activeSlot?.fontFamily || 'font-mono'} onChange={e => updateSlot({fontFamily: e.target.value})} className="bg-aura-bg border-2 border-aura-dark text-[13px] p-[9px] text-aura-text outline-none focus:border-aura-cyan">
                      {FONT_OPTIONS.map(f => <option key={f.name} value={f.class}>{f.name}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-[9px] mt-[9px]">
                  <label className="text-[12px] uppercase opacity-60">Color Neón</label>
                  <div className="flex gap-[9px]">
                      {['#00e5ff', 'var(--color-aura-green)', '#ff003c', '#ffffff', '#a855f7'].map(c => (
                        <button key={c} type="button" onClick={() => updateSlot({ neonColor: c })} className={`w-6 h-6 rounded-sm border-2 ${activeSlot?.neonColor === c ? 'border-white scale-110 shadow-[0_0_10px_currentColor]' : 'border-transparent'}`} style={{ backgroundColor: c, color: c }} />
                      ))}
                  </div>
                </div>
                <div className="border border-aura-cyan/30 bg-black/20 p-[14px] mt-[14px] flex flex-col gap-[14px]">
                  <h4 className="text-[10px] text-aura-cyan uppercase font-bold tracking-widest border-b border-aura-cyan/20 pb-1">Transformación Espacial</h4>
                  <div className="flex gap-[18px]">
                    <div className="flex flex-col items-center gap-2">
                      <label className="text-[10px] uppercase opacity-60 text-pink-400">Eje Y</label>
                      <input type="range" min="-150" max="150" value={activeSlot?.posY || 0} onChange={e => updateSlot({posY: parseInt(e.target.value)})} className="h-28 accent-pink-500 cursor-ns-resize" style={{ writingMode: 'vertical-lr', direction: 'rtl' }} />
                    </div>
                    <div className="flex flex-col justify-between flex-1 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase opacity-60 flex justify-between text-purple-400"><span>Eje X</span><span>{activeSlot?.posX || 0}px</span></label>
                        <input type="range" min="-200" max="200" value={activeSlot?.posX || 0} onChange={e => updateSlot({posX: parseInt(e.target.value)})} className="w-full accent-purple-500 cursor-ew-resize" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase opacity-60 flex justify-between text-green-400"><span>Rotación</span><span>{activeSlot?.rotation || 0}°</span></label>
                        <input type="range" min="-90" max="90" value={activeSlot?.rotation || 0} onChange={e => updateSlot({rotation: parseInt(e.target.value)})} className="w-full accent-green-500" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase opacity-60 flex justify-between text-blue-400"><span>Opacidad Fondo</span><span>{(activeSlot?.bgOpacity || 0) * 100}%</span></label>
                        <input type="range" min="0" max="1" step="0.1" value={activeSlot?.bgOpacity || 0} onChange={e => updateSlot({ bgOpacity: parseFloat(e.target.value) })} className="w-full accent-blue-500" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-[9px] mt-[14px]">
                  <label className="text-[12px] uppercase opacity-60">Etiqueta Promocional</label>
                  <select value={activeSlot?.sticker || ''} onChange={e => updateSlot({ sticker: e.target.value || null })} className="bg-aura-bg border-2 border-aura-dark text-[13px] p-[9px] text-aura-text outline-none focus:border-aura-cyan cursor-pointer">
                    <option value="">Ninguna</option>
                    <option value="2x1 PROMO">2x1 Promo</option>
                    <option value="NUEVO">Nuevo</option>
                    <option value="RECOMENDADO">Recomendado</option>
                    <option value="ESPECIAL">Especial</option>
                  </select>
                </div>
                {activeSlot?.sticker && (
                  <div className="flex flex-col gap-[9px] mt-[9px]">
                    <label className="text-[12px] uppercase opacity-60 flex justify-between"><span>Tamaño Etiqueta</span><span>{activeSlot?.stickerSize || 12}px</span></label>
                    <input type="range" min="8" max="32" step="2" value={activeSlot?.stickerSize || 12} onChange={e => updateSlot({ stickerSize: parseInt(e.target.value) })} className="w-full accent-aura-cyan" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* <--- FIN DE COLUMNA IZQUIERDA ---> */}


        {/* ------------------------------------------------------- */}
        {/* COLUMNA DERECHA (Lienzo Preview - 8 de 12 columnas)     */}
        {/* ------------------------------------------------------- */}
        <div className="w-full xl:col-span-8 flex flex-col min-w-0">
          
          <div className="flex justify-between items-center mb-[9px]">
            <h3 className="text-[12px] uppercase text-aura-green/60 font-bold tracking-widest">Previsualización (7" DSI Horizontal)</h3>
            <button onClick={() => setGridMode(!gridMode)} className={`text-[12px] px-2 py-1 border uppercase tracking-widest font-bold ${gridMode ? 'border-aura-cyan text-aura-cyan' : 'border-aura-dark text-aura-green/40 hover:text-aura-text'}`}>Magnetic Grid [ {gridMode ? 'ON' : 'OFF'} ]</button>
          </div>

          <div className="flex-1 bg-aura-inner border-2 border-aura-dark flex items-center justify-center p-[24px] relative overflow-hidden">
            <div className={`relative w-full max-w-[900px] aspect-[1024/600] bg-aura-black shadow-[0_0_50px_rgba(0,0,0,0.8)] border-[16px] border-[#0a0a0a] rounded-lg overflow-hidden flex flex-col ${gridMode ? 'sandbox-grid' : ''}`}>
              <div className="absolute inset-0 pointer-events-none z-50 opacity-10 mix-blend-overlay bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px]" />
              <div className="flex-1 p-[9px] sm:p-[18px] z-10 w-full h-full">
                {activePage.layout === 'full' && (
                  <SlotRender id="slot-0" catalog={catalog} config={activePage.slots['slot-0']} onSelect={() => setSelectedSlotId('slot-0')} isSelected={selectedSlotId === 'slot-0'} />
                )}
                {activePage.layout === 'split' && (
                  <div className="flex w-full h-full gap-[9px] sm:gap-[18px]">
                    <div className="flex-1"><SlotRender id="slot-0" catalog={catalog} config={activePage.slots['slot-0']} onSelect={() => setSelectedSlotId('slot-0')} isSelected={selectedSlotId === 'slot-0'} /></div>
                    <div className="flex-1"><SlotRender id="slot-1" catalog={catalog} config={activePage.slots['slot-1']} onSelect={() => setSelectedSlotId('slot-1')} isSelected={selectedSlotId === 'slot-1'} /></div>
                  </div>
                )}
                {activePage.layout === 'focus' && (
                  <div className="flex w-full h-full gap-[9px] sm:gap-[18px]">
                    <div className="flex-[2]"><SlotRender id="slot-0" catalog={catalog} config={activePage.slots['slot-0']} onSelect={() => setSelectedSlotId('slot-0')} isSelected={selectedSlotId === 'slot-0'} /></div>
                    <div className="flex-1 flex flex-col gap-[9px] sm:gap-[18px]">
                      <div className="flex-1"><SlotRender id="slot-1" catalog={catalog} config={activePage.slots['slot-1']} onSelect={() => setSelectedSlotId('slot-1')} isSelected={selectedSlotId === 'slot-1'} /></div>
                      <div className="flex-1"><SlotRender id="slot-2" catalog={catalog} config={activePage.slots['slot-2']} onSelect={() => setSelectedSlotId('slot-2')} isSelected={selectedSlotId === 'slot-2'} /></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-[9px] mt-[18px] shrink-0">
             {pages.map(p => (
               <button key={p.id} onClick={() => { setSelectedPageId(p.id); setSelectedSlotId('slot-0'); }} className={`flex-1 py-3 text-[13px] font-bold transition-colors ${selectedPageId === p.id ? 'border-2 border-aura-cyan text-aura-cyan shadow-[0_0_15px_rgba(0,229,255,0.2)]' : 'border-2 border-aura-dark text-aura-green/40 hover:border-aura-green/50'}`}>
                 PÁGINA {p.id}
               </button>
             ))}
          </div>
        </div>
        {/* <--- FIN DE COLUMNA DERECHA ---> */}

      </div> 
      {/* <--- FIN DEL 3️⃣ ÁREA DE TRABAJO ---> */}

    </div> 
    /* <--- FIN DEL CONTENEDOR PRINCIPAL ---> */
  );
};