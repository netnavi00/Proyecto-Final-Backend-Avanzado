import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '../../services/supabase';

/* --- CREATIVE LAB TYPES & MOCK --- */
export type LayoutType = 'full' | 'split' | 'focus';

export interface CatalogItem {
  id: string;
  type: 'product' | 'marketing';
  name: string;
  price?: number;
  imageUrl: string;
}

export const DEFAULT_CATALOG: CatalogItem[] = [
  { id: 'p1', type: 'product', name: 'NEON LAGER', price: 5.00, imageUrl: 'https://loremflickr.com/300/300/lager,beer?lock=1' },
  { id: 'p2', type: 'product', name: 'CYBER WINGS', price: 12.50, imageUrl: 'https://loremflickr.com/300/300/chicken,wings?lock=2' },
  { id: 'p3', type: 'product', name: 'VIP PROTOCOL', price: 50.00, imageUrl: 'https://loremflickr.com/300/300/champagne,vip?lock=3' },
  { id: 'p4', type: 'product', name: 'MATRIX SHOT', price: 8.50, imageUrl: 'https://loremflickr.com/300/300/shot,drink?lock=4' },
  { id: 'p5', type: 'product', name: 'EMP BURGER', price: 16.00, imageUrl: 'https://loremflickr.com/300/300/burger?lock=5' },
  { id: 'p6', type: 'product', name: 'GLITCH PIZZA', price: 18.00, imageUrl: 'https://loremflickr.com/300/300/pizza?lock=6' },
  { id: 'p7', type: 'product', name: 'QUANTUM SODA', price: 4.50, imageUrl: 'https://loremflickr.com/300/300/soda,can?lock=7' },
  { id: 'p8', type: 'product', name: 'NEBULA DESSERT', price: 9.00, imageUrl: 'https://loremflickr.com/300/300/dessert?lock=8' },
  { id: 'p9', type: 'product', name: 'SYNTH COCKTAIL', price: 14.00, imageUrl: 'https://loremflickr.com/300/300/cocktail,neon?lock=9' },
  { id: 'p10', type: 'product', name: 'DARK MATTER STOUT', price: 7.50, imageUrl: 'https://loremflickr.com/300/300/stout,beer?lock=10' },
  { id: 'p11', type: 'product', name: 'PLASMA WINGS', price: 14.00, imageUrl: 'https://loremflickr.com/300/300/spicy,wings?lock=11' },
  { id: 'p12', type: 'product', name: 'HOLOGRAPHIC DONUT', price: 6.00, imageUrl: 'https://loremflickr.com/300/300/donut?lock=12' },
  { id: 'p13', type: 'product', name: 'MECH TACOS', price: 11.00, imageUrl: 'https://loremflickr.com/300/300/tacos?lock=13' },
  { id: 'p14', type: 'product', name: 'OVERCLOCK FRIES', price: 5.50, imageUrl: 'https://loremflickr.com/300/300/fries?lock=14' },
  { id: 'p15', type: 'product', name: 'NANO ICE CREAM', price: 7.00, imageUrl: 'https://loremflickr.com/300/300/ice-cream?lock=15' },
  { id: 'p16', type: 'product', name: 'IPA BIOS', price: 8.00, imageUrl: 'https://loremflickr.com/300/300/ipa,beer?lock=16' },
  { id: 'm1', type: 'marketing', name: 'LIVE DJ SET', imageUrl: 'https://loremflickr.com/300/300/dj,club?lock=17' },
  { id: 'm2', type: 'marketing', name: 'KARAOKE MONDAYS', imageUrl: 'https://loremflickr.com/300/300/karaoke?lock=18' },
  { id: 'm3', type: 'marketing', name: 'NEON PARTY', imageUrl: 'https://loremflickr.com/300/300/neon,party?lock=19' },
  { id: 'm4', type: 'marketing', name: 'SYSTEM REBOOT', imageUrl: 'https://loremflickr.com/300/300/cyberpunk,city?lock=20' },
  { id: 'm5', type: 'marketing', name: 'LADIES NIGHT', imageUrl: 'https://loremflickr.com/300/300/party,girls?lock=21' },
];

export const PRESETS_MARKETING_IMAGES = [
  { name: 'Fondo Neon Grid', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=500&auto=format&fit=crop' },
  { name: 'Pizza Humante', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=500&auto=format&fit=crop' },
  { name: 'Cerveza Helada', url: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=500&auto=format&fit=crop' },
  { name: 'Alitas de Pollo Fuego', url: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=500&auto=format&fit=crop' },
  { name: 'Cóctel Cyberpunk', url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=500&auto=format&fit=crop' }
];

/* --- COMBOS DE DISEÑO (ESTILOS PRECONFIGURADOS) --- */
export const DESIGN_PRESETS: Record<string, Partial<SlotConfig>> = {
  ofertaFlash: {
    customTextSize: 32,
    neonColor: '#ff003c', // Rojo intenso
    sticker: '2x1 PROMO',
    stickerSize: 14,
    bgOpacity: 0.9
  },
  cyberPremium: {
    customTextSize: 28,
    neonColor: '#00e5ff', // Cyan firma
    sticker: 'RECOMMENDED',
    stickerSize: 11,
    bgOpacity: 0.7
  },
  minimalista: {
    customTextSize: 22,
    neonColor: '#ffffff', // Blanco limpio
    sticker: null,
    stickerSize: 12,
    bgOpacity: 0.5
  }
};

export interface SlotConfig {
  boundItemId: string | null;
  customText: string | null;
  customTextSize: number;
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

export const DEFAULT_SLOT: SlotConfig = { boundItemId: null, customText: null, customTextSize: 24, neonColor: '#00e5ff', sticker: null, stickerSize: 12, bgOpacity: 0.8 };

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
          {/* Background Image */}
          <div className="absolute inset-0 bg-cover bg-center mix-blend-screen" 
               style={{ backgroundImage: `url(${item.imageUrl})`, opacity: config.bgOpacity }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-60" />
          
          <div className="relative z-10 flex flex-col items-center justify-center text-center p-[9px]">
             <h3 
               className="text-aura-text font-black uppercase leading-tight tracking-widest drop-shadow-lg"
               style={{ fontSize: `${config.customTextSize || 24}px` }}
             >
               {config.customText || item.name}
             </h3>
             {item.type === 'product' && typeof item.price === 'number' && (
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
  const [catalogTab, setCatalogTab] = useState<'product' | 'marketing'>('product');
  const [pages, setPages] = useState<PageConfig[]>([
    { id: 1, layout: 'full', slots: { 'slot-0': { ...DEFAULT_SLOT } } },
    { id: 2, layout: 'split', slots: { 'slot-0': { ...DEFAULT_SLOT }, 'slot-1': { ...DEFAULT_SLOT } } },
    { id: 3, layout: 'focus', slots: { 'slot-0': { ...DEFAULT_SLOT }, 'slot-1': { ...DEFAULT_SLOT }, 'slot-2': { ...DEFAULT_SLOT } } },
    { id: 4, layout: 'full', slots: { 'slot-0': { ...DEFAULT_SLOT } } }
  ]);
  const [selectedPageId, setSelectedPageId] = useState(1);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('slot-0');
  const [gridMode, setGridMode] = useState(false);

  const activePage = pages.find(p => p.id === selectedPageId)!;
  const activeSlot = activePage.slots[selectedSlotId];

  // Helper to update active page
  const updatePage = (updates: Partial<PageConfig>) => {
    setPages(prev => prev.map(p => p.id === selectedPageId ? { ...p, ...updates } : p));
  };

  // Helper to update active slot
  const updateSlot = (updates: Partial<SlotConfig>) => {
    updatePage({
      slots: { ...activePage.slots, [selectedSlotId]: { ...activePage.slots[selectedSlotId], ...updates } }
    });
  };

  // Change layout resets slots for simplicity
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
          price: catalogTab === 'product' ? 0.00 : undefined,
          imageUrl: dataUrl
        };
        setCatalog(prev => [newItem, ...prev]);
        updateSlot({ boundItemId: newItem.id }); // Automatically bind it to current slot
      };
      reader.readAsDataURL(file);
    }
  };

  const exportRecipe = () => {
    const payload = {
      pages
    };
    alert("Recipe Exported! Check console.");
    console.log("THE RECIPE:", JSON.stringify(payload, null, 2));
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-[13px] font-bold mb-[18px] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-[9px]">
          <span className="w-1 h-3 bg-aura-cyan"></span>
          CREATIVE LAB
        </div>
        <button 
          onClick={exportRecipe}
          className="text-[12px] bg-aura-cyan text-black px-3 py-1 uppercase tracking-widest font-bold hover:brightness-110"
        >
          Export Recipe
        </button>
      </h2>
      
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-[26px] max-w-7xl mx-auto w-full items-stretch min-h-0 min-w-0">
        
        {/* LEFT PANEL: CATALOG */}
        <div className="w-full xl:col-span-3 flex flex-col gap-[18px] border-2 border-aura-dark bg-aura-inner p-[18px] overflow-y-auto min-h-0">
          <h3 className="text-[12px] uppercase text-aura-green/60 font-bold tracking-widest border-b border-aura-dark pb-2">Data Binding Catalog</h3>
          <p className="text-[12px] text-aura-green/40">Select a slot in the canvas, then select an item to bind.</p>

          <div className="flex gap-[9px]">
            <button 
              onClick={() => setCatalogTab('product')}
              className={`flex-1 py-2 text-[12px] font-bold uppercase transition-colors ${catalogTab === 'product' ? 'bg-aura-cyan text-black' : 'border-2 border-aura-dark text-aura-green/40 hover:border-aura-green/50'}`}
            >
              Products
            </button>
            <button 
              onClick={() => setCatalogTab('marketing')}
              className={`flex-1 py-2 text-[12px] font-bold uppercase transition-colors ${catalogTab === 'marketing' ? 'bg-purple-500 text-aura-text' : 'border-2 border-aura-dark text-aura-green/40 hover:border-purple-500/50 hover:text-purple-400'}`}
            >
              Marketing
            </button>
          </div>
          
          <div className="flex flex-col gap-[9px]">
            <label className={`border border-dashed p-[18px] flex flex-col items-center justify-center cursor-pointer transition-colors gap-[9px] ${catalogTab === 'product' ? 'border-aura-cyan/50 hover:bg-aura-cyan/10 text-aura-cyan' : 'border-purple-500/50 hover:bg-purple-500/10 text-purple-400'}`}>
              <span className="text-[12px] uppercase tracking-widest font-bold">Upload Custom Image</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>

          <div className="flex flex-col gap-[14px]">
            {catalog.filter(i => i.type === catalogTab).map(item => (
              <div 
                key={item.id}
                onClick={() => updateSlot({ boundItemId: item.id })}
                className={`flex items-center gap-[14px] p-[9px] border cursor-pointer transition-colors ${activeSlot?.boundItemId === item.id ? (item.type === 'product' ? 'border-aura-cyan bg-aura-cyan/10' : 'border-purple-500 bg-purple-500/10') : 'border-aura-dark hover:border-aura-green/50 bg-aura-bg hover:bg-aura-panel'}`}
              >
                <div className="w-12 h-12 bg-cover bg-center border-2 border-aura-dark" style={{ backgroundImage: `url(${item.imageUrl})` }} />
                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="text-[13px] font-bold text-aura-text truncate">{item.name}</span>
                  {item.type === 'product' && typeof item.price === 'number' && (
                    <span className="text-[12px] text-aura-green font-mono">${item.price.toFixed(2)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER PANEL: CANVAS TWIN */}
        <div className="w-full xl:col-span-5 flex flex-col min-w-0">
          <div className="flex justify-between items-center mb-[9px]">
            <h3 className="text-[12px] uppercase text-aura-green/60 font-bold tracking-widest">Digital Twin Canvas</h3>
            <button 
              onClick={() => setGridMode(!gridMode)}
              className={`text-[12px] px-2 py-1 border uppercase tracking-widest font-bold ${gridMode ? 'border-aura-cyan text-aura-cyan' : 'border-aura-dark text-aura-green/40 hover:text-aura-text'}`}
            >
              Magnetic Grid [ {gridMode ? 'ON' : 'OFF'} ]
            </button>
          </div>

          <div className="flex-1 bg-aura-inner border-2 border-aura-dark flex items-center justify-center p-[18px] relative">
            {/* The Screen */}
            <div className={`relative w-full aspect-video bg-aura-black shadow-[0_0_50px_rgba(0,0,0,0.8)] border-4 border-aura-dark overflow-hidden flex flex-col ${gridMode ? 'sandbox-grid' : ''}`}>
              
              {/* Scanlines Filter */}
              <div className="absolute inset-0 pointer-events-none z-50 opacity-10 mix-blend-overlay bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px]" />
              
              {/* Slot Area */}
              <div className="flex-1 p-[9px] sm:p-[18px] z-10 w-full h-full">
                {activePage.layout === 'full' && (
                  <SlotRender id="slot-0" catalog={catalog} config={activePage.slots['slot-0']} onSelect={() => setSelectedSlotId('slot-0')} isSelected={selectedSlotId === 'slot-0'} />
                )}
                {activePage.layout === 'split' && (
                  <div className="flex w-full h-full gap-[9px] sm:gap-[18px]">
                    <div className="flex-1">
                      <SlotRender id="slot-0" catalog={catalog} config={activePage.slots['slot-0']} onSelect={() => setSelectedSlotId('slot-0')} isSelected={selectedSlotId === 'slot-0'} />
                    </div>
                    <div className="flex-1">
                      <SlotRender id="slot-1" catalog={catalog} config={activePage.slots['slot-1']} onSelect={() => setSelectedSlotId('slot-1')} isSelected={selectedSlotId === 'slot-1'} />
                    </div>
                  </div>
                )}
                {activePage.layout === 'focus' && (
                  <div className="flex w-full h-full gap-[9px] sm:gap-[18px]">
                    <div className="flex-[2]">
                      <SlotRender id="slot-0" catalog={catalog} config={activePage.slots['slot-0']} onSelect={() => setSelectedSlotId('slot-0')} isSelected={selectedSlotId === 'slot-0'} />
                    </div>
                    <div className="flex-1 flex flex-col gap-[9px] sm:gap-[18px]">
                      <div className="flex-1">
                        <SlotRender id="slot-1" catalog={catalog} config={activePage.slots['slot-1']} onSelect={() => setSelectedSlotId('slot-1')} isSelected={selectedSlotId === 'slot-1'} />
                      </div>
                      <div className="flex-1">
                        <SlotRender id="slot-2" catalog={catalog} config={activePage.slots['slot-2']} onSelect={() => setSelectedSlotId('slot-2')} isSelected={selectedSlotId === 'slot-2'} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-[9px] mt-[18px] shrink-0">
             {pages.map(p => (
               <button 
                 key={p.id}
                 onClick={() => { setSelectedPageId(p.id); setSelectedSlotId('slot-0'); }}
                 className={`flex-1 py-3 text-[13px] font-bold transition-colors ${selectedPageId === p.id ? 'border-2 border-aura-cyan text-aura-cyan shadow-[0_0_15px_rgba(0,229,255,0.2)]' : 'border-2 border-aura-dark text-aura-green/40 hover:border-aura-green/50'}`}
               >
                 PG {p.id}
               </button>
             ))}
          </div>
        </div>

        {/* RIGHT PANEL: PROPERTIES */}
        <div className="w-full xl:col-span-4 flex flex-col gap-[26px] overflow-y-auto pr-1 min-h-0">
          
          {/* CONTROL: CANVAS OPTIONS */}
          <div className="flex flex-col gap-[14px] p-[18px] border-2 border-aura-dark bg-aura-inner shrink-0">
            <h3 className="text-[12px] uppercase text-aura-green/60 font-bold tracking-widest border-b border-aura-dark pb-2 mb-[9px]">Canvas Options</h3>
            <div className="flex flex-col gap-1 mt-[9px]">
              <label className="text-[12px] uppercase opacity-60">Page Layout Engine</label>
              <div className="grid grid-cols-3 gap-[9px]">
                 {(['full', 'split', 'focus'] as LayoutType[]).map(l => (
                   <button 
                     key={l}
                     onClick={() => handleLayoutChange(l)}
                     className={`py-2 text-[12px] uppercase font-bold transition-colors ${activePage.layout === l ? 'border-2 border-aura-green bg-aura-green/10 text-aura-text' : 'border-2 border-aura-dark text-aura-green/40 hover:border-aura-green/50'}`}
                   >
                     {l}
                   </button>
                 ))}
              </div>
            </div>
          </div>

          {/* CONTROL: PLANTILLAS DE ESTILO RÁPIDAS */}
          <div className="flex flex-col gap-[14px] p-[18px] border-2 border-purple-500/30 bg-aura-inner shrink-0">
            <h3 className="text-[12px] uppercase text-purple-400 font-bold tracking-widest border-b border-purple-500/30 pb-2 mb-[9px]">
              ⚡ Estilos Rápidos
            </h3>
            <p className="text-[11px] text-aura-green/40">Aplica combinaciones estéticas preconfiguradas con un solo clic:</p>
            
            <div className="flex flex-col gap-[9px]">
              <button
                type="button"
                onClick={() => updateSlot(DESIGN_PRESETS.ofertaFlash)}
                className="w-full text-left py-2 px-3 text-[11px] font-bold uppercase bg-red-950/40 border border-red-500/40 hover:bg-red-500/20 text-red-400 flex justify-between items-center"
              >
                <span>🔥 Oferta Flash Camicace</span>
                <span className="text-[9px] border border-red-500/30 px-1 font-mono">ROJO / 2X1</span>
              </button>

              <button
                type="button"
                onClick={() => updateSlot(DESIGN_PRESETS.cyberPremium)}
                className="w-full text-left py-2 px-3 text-[11px] font-bold uppercase bg-cyan-950/40 border border-aura-cyan/40 hover:bg-cyan-950/20 text-aura-cyan flex justify-between items-center"
              >
                <span>🔮 Cyberpunk Premium</span>
                <span className="text-[9px] border border-aura-cyan/30 px-1 font-mono">CYAN / RECOM</span>
              </button>

              <button
                type="button"
                onClick={() => updateSlot(DESIGN_PRESETS.minimalista)}
                className="w-full text-left py-2 px-3 text-[11px] font-bold uppercase bg-slate-950/40 border border-slate-500/40 hover:bg-slate-500/20 text-slate-300 flex justify-between items-center"
              >
                <span>🏳️ Elegante Minimal</span>
                <span className="text-[9px] border border-slate-500/30 px-1 font-mono">BLANCO / LIMPIO</span>
              </button>
            </div>
          </div>

          {/* CONTROL: BIBLIOTECA PREDISEÑADA DE STOCK */}
          <div className="flex flex-col gap-[14px] p-[18px] border-2 border-aura-dark bg-aura-inner shrink-0">
            <h3 className="text-[12px] uppercase text-aura-green/60 font-bold tracking-widest border-b border-aura-dark pb-2 mb-[9px]">
              🖼️ Biblioteca Prediseñada de Stock
            </h3>
            <p className="text-[11px] text-aura-green/40">¿No tienes imágenes? Selecciona un activo pre-cargado de alta calidad:</p>
            
            <div className="grid grid-cols-2 gap-[9px]">
              {PRESETS_MARKETING_IMAGES.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const stockId = `stock-${idx}`;
                    if (!catalog.some(c => c.id === stockId)) {
                      const stockItem: CatalogItem = {
                        id: stockId,
                        type: 'marketing',
                        name: img.name.toUpperCase(),
                        imageUrl: img.url
                      };
                      setCatalog(prev => [stockItem, ...prev]);
                    }
                    updateSlot({ boundItemId: stockId });
                  }}
                  className="group relative h-16 border border-aura-dark hover:border-aura-cyan overflow-hidden flex items-end p-1"
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform group-hover:scale-110" 
                    style={{ backgroundImage: `url(${img.url})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-80" />
                  <span className="relative z-10 text-[9px] font-bold uppercase tracking-tighter text-white truncate w-full text-left">
                    {img.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* CONTROL: ESTÉTICA SELECCIONADA */}
          <div className="flex flex-col gap-[14px] p-[18px] border-2 border-aura-cyan/30 bg-aura-inner/80 shadow-[0_0_20px_rgba(0,229,255,0.05)] shrink-0">
            <h3 className="text-[12px] uppercase text-aura-cyan font-bold tracking-widest border-b border-aura-cyan/30 pb-2 mb-[9px]">Estética Seleccionada [{selectedSlotId}]</h3>
            
            <div className="flex flex-col gap-[9px]">
              <label className="text-[12px] uppercase opacity-60">Custom Headline Text (Optional)</label>
              <input 
                type="text" 
                value={activeSlot?.customText || ''}
                onChange={e => updateSlot({ customText: e.target.value || null })}
                className="bg-aura-bg border-2 border-aura-dark text-[13px] p-[9px] text-aura-text outline-none focus:border-aura-cyan"
                placeholder="Override default text..."
              />
            </div>
            
            <div className="flex flex-col gap-[9px] mt-[9px]">
               <label className="text-[12px] uppercase opacity-60 flex justify-between">
                 <span>Headline Text Size</span>
                 <span>{activeSlot?.customTextSize || 24}px</span>
               </label>
               <input 
                 type="range" 
                 min="12" max="72" step="2"
                 value={activeSlot?.customTextSize || 24}
                 onChange={e => updateSlot({ customTextSize: parseInt(e.target.value) })}
                 className="w-full accent-aura-cyan"
               />
            </div>

            <div className="flex flex-col gap-[9px] mt-[9px]">
               <label className="text-[12px] uppercase opacity-60">Neon Glow Color</label>
               <div className="flex gap-[9px]">
                  {['#00e5ff', 'var(--color-aura-green)', '#ff003c', '#ffffff', '#a855f7'].map(c => (
                    <button 
                      key={c}
                      type="button"
                      onClick={() => updateSlot({ neonColor: c })}
                      className={`w-6 h-6 rounded-sm border-2 ${activeSlot?.neonColor === c ? 'border-white scale-110 shadow-[0_0_10px_currentColor]' : 'border-transparent'}`}
                      style={{ backgroundColor: c, color: c }}
                    />
                  ))}
               </div>
            </div>

            <div className="flex flex-col gap-[9px] mt-[9px]">
               <label className="text-[12px] uppercase opacity-60">Status Sticker</label>
               <select 
                 value={activeSlot?.sticker || ''}
                 onChange={e => updateSlot({ sticker: e.target.value || null })}
                 className="bg-aura-bg border-2 border-aura-dark text-[13px] p-[9px] text-aura-text outline-none focus:border-aura-cyan cursor-pointer"
               >
                 <option value="">None</option>
                 <option value="2x1 PROMO">2x1 Promo</option>
                 <option value="NEW">New</option>
                 <option value="RECOMMENDED">Recommended</option>
                 <option value="SPECIAL">Special</option>
               </select>
            </div>

            {activeSlot?.sticker && (
              <div className="flex flex-col gap-[9px] mt-[9px]">
                 <label className="text-[12px] uppercase opacity-60 flex justify-between">
                   <span>Sticker Text Size</span>
                   <span>{activeSlot?.stickerSize || 12}px</span>
                 </label>
                 <input 
                   type="range" 
                   min="8" max="32" step="2"
                   value={activeSlot?.stickerSize || 12}
                   onChange={e => updateSlot({ stickerSize: parseInt(e.target.value) })}
                   className="w-full accent-aura-cyan"
                 />
              </div>
            )}

            <div className="flex flex-col gap-[9px] mt-[9px]">
               <label className="text-[12px] uppercase opacity-60 flex justify-between">
                 <span>Background Opacity</span>
                 <span>{(activeSlot?.bgOpacity || 0) * 100}%</span>
               </label>
               <input 
                 type="range" 
                 min="0" max="1" step="0.1"
                 value={activeSlot?.bgOpacity || 0}
                 onChange={e => updateSlot({ bgOpacity: parseFloat(e.target.value) })}
                 className="w-full accent-aura-cyan"
               />
            </div>
            
            <div className="mt-[9px] text-[12px] text-aura-green/50 flex space-x-1 items-start bg-aura-black/40 p-[9px] border-2 border-aura-dark">
               <AlertTriangle size={12} className="text-aura-cyan shrink-0" />
               <span>Prices are bound to the catalog. Aesthetic changes applied immediately.</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}