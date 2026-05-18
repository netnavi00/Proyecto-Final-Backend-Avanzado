import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tv, Layers, Plus, Move, LayoutGrid, ZoomIn, ZoomOut, Cpu, Activity, Disc } from 'lucide-react';
import { supabase } from '../../services/supabase';
import type { TableData, StaffData } from '../../App';

interface LayoutElement {
  id: string;
  name: string;
  type: 'mesa' | 'barra';
  grid_x: number;
  grid_y: number;
  width: number;
  height: number;
}

// 🚀 ENFOQUE SCADA: Tipado robusto para la simulación del Canvas de la Pi Zero 2W
interface TelemetryComponent {
  id: string;
  type: 'text' | 'progress' | 'status_grid' | 'alert';
  label: string;
  value: string | number;
  status?: 'success' | 'warning' | 'danger' | 'info';
}

interface LiveTelemetry {
  mode: 'SYSTEM_OS' | 'INTERACTIVE' | 'MEDIA_PLAYER' | 'DIAGNOSTIC' | 'IDLE';
  state: 'STANDBY' | 'RUNNING' | 'ERROR' | 'PAUSED' | 'UPDATING';
  current_item: string;
  runtime_seconds: number;
  hardware: {
    cpu_temp: number;
    sys_volt: number;
    fps: number;
    wifi_signal: number;
  };
  components: TelemetryComponent[];
}

export function TacticalGrid({ 
  tables, 
  staffList, 
  onTableSelect, 
  fetchDevices,
  establishmentId,
  selectedTableId
}: { 
  tables: TableData[], 
  staffList: StaffData[], 
  onTableSelect: (id: string | null) => void, 
  fetchDevices: () => void,
  establishmentId: string | null,
  selectedTableId: string | null
}) {
  
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [layoutElements, setLayoutElements] = useState<LayoutElement[]>([]);
  const [activeToolboxTab, setActiveToolboxTab] = useState<'elements' | 'apunits'>('apunits'); 
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Estados para la edición en caliente del nombre del mueble
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  // Estado para la telemetría viva del Mirroring
  const [liveTelemetry, setLiveTelemetry] = useState<LiveTelemetry | null>(null);

  // Estado para controlar qué elemento está recibiendo un drag encima (efecto visual de hover al arrastrar)
  const [dragOverElementId, setDragOverElementId] = useState<string | null>(null);

  useEffect(() => {
    if (!constraintsRef.current) return;

    // Detecta cuando el contenedor cambia de tamaño (ej. cuando abres/cierras el sidebar)
    const resizeObserver = new ResizeObserver(() => {
      // Al ejecutarse, fuerza a las limitantes de Framer Motion a recalcularse sin mover las mesas
      console.log("📐 Contenedor ajustado por cambio de tamaño en Sidebar");
    });

    resizeObserver.observe(constraintsRef.current);
    return () => resizeObserver.disconnect();
  }, [constraintsRef]);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.15, 2));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.15, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  // Cargar elementos físicos (Mesas/Barras)
  const fetchLayoutElements = async () => {
    if (!establishmentId) return;
    const { data, error } = await supabase
      .from('layout_elements')
      .select('*')
      .eq('establishment_id', establishmentId);
    
    if (!error && data) {
      setLayoutElements(data);
    }
  };

  useEffect(() => {
    fetchLayoutElements();

    const channel = supabase
      .channel('layout-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'layout_elements' }, () => {
        fetchLayoutElements();
        fetchDevices();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [establishmentId]);

  // 🚀 REALTIME: Suscripción al nuevo canal de telemetría de alta frecuencia aislado de devices
  useEffect(() => {
    if (!selectedTableId) {
      setLiveTelemetry(null);
      return;
    }

    const fetchCurrentTelemetry = async () => {
      const { data, error } = await supabase
        .from('device_telemetry')
        .select('*')
        .eq('device_id', selectedTableId)
        .single();

      if (!error && data) {
        setLiveTelemetry({
          mode: data.mode,
          state: data.state,
          current_item: data.current_item,
          runtime_seconds: data.runtime_seconds,
          hardware: {
            cpu_temp: Number(data.cpu_temp),
            sys_volt: Number(data.sys_volt),
            fps: Number(data.fps),
            wifi_signal: data.wifi_signal
          },
          components: data.components || []
        });
      } else {
        setLiveTelemetry({
          mode: 'SYSTEM_OS',
          state: 'STANDBY',
          current_item: 'Aura Play Interactive Mode',
          runtime_seconds: 0,
          hardware: { cpu_temp: 45, sys_volt: 5.1, fps: 60, wifi_signal: 100 },
          components: []
        });
      }
    };

    fetchCurrentTelemetry();

    const telemetryChannel = supabase
      .channel(`live-telemetry-${selectedTableId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'device_telemetry', 
        filter: `device_id=eq.${selectedTableId}` 
      }, (payload: any) => {
        if (payload.new) {
          const raw = payload.new;
          setLiveTelemetry({
            mode: raw.mode,
            state: raw.state,
            current_item: raw.current_item,
            runtime_seconds: raw.runtime_seconds,
            hardware: {
              cpu_temp: Number(raw.cpu_temp),
              sys_volt: Number(raw.sys_volt),
              fps: Number(raw.fps),
              wifi_signal: raw.wifi_signal
            },
            components: raw.components || []
          });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(telemetryChannel); };
  }, [selectedTableId]);

  // Agregar mueble arquitectónico
  const handleAddLayoutElement = async (type: 'mesa' | 'barra') => {
    if (!establishmentId) return;
    
    const count = layoutElements.filter(e => e.type === type).length + 1;
    const label = type === 'mesa' ? `MESA ${String(count).padStart(2, '0')}` : `BARRA ${String(count).padStart(2, '0')}`;

    const { error } = await supabase
      .from('layout_elements')
      .insert([
        {
          establishment_id: establishmentId, 
          name: label,
          type: type,
          grid_x: 150,                       
          grid_y: 150,
          width: type === 'mesa' ? 120 : 160,
          height: 75
        }
      ]);

    if (error) console.error("❌ Error creando mueble arquitectónico:", error.message);
  };

  const handleRemoveElement = async (id: string) => {
    await supabase.from('layout_elements').delete().eq('id', id);
  };

  // FUNCIÓN: DESVINCULAR AP-UNIT (Retorno al banco de espera)
  const handleUnlinkDevice = async (deviceId: string) => {
    console.log(`🔌 Retornando AP-Unit ${deviceId} al banco de espera...`);
    
    const { error } = await supabase
      .from('devices')
      .update({ assigned_element_id: null }) 
      .eq('id', deviceId);

    if (error) {
      console.error("❌ Error al desvincular el dispositivo:", error.message);
    } else {
      if (selectedTableId === deviceId) {
        onTableSelect(null);
      }
      fetchDevices(); 
    }
  };

  // MANEJADORES DE DRAG N' DROP DESDE EL BANCO IZQUIERDO
  const handleBankDragStart = (e: React.DragEvent, deviceId: string) => {
    e.dataTransfer.setData("text/plain", deviceId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleMesaDragOver = (e: React.DragEvent, elementId: string) => {
    e.preventDefault(); 
    setDragOverElementId(elementId);
  };

  const handleMesaDragLeave = () => {
    setDragOverElementId(null);
  };

  const handleMesaDrop = async (e: React.DragEvent, elementId: string) => {
    e.preventDefault();
    setDragOverElementId(null);
    
    const deviceId = e.dataTransfer.getData("text/plain");
    if (!deviceId) return;

    console.log(`🎯 Vinculando por Drop Inalámbrico: AP-Unit ${deviceId} -> Mueble ${elementId}`);

    const targetMueble = layoutElements.find(le => le.id === elementId);
    const offsetX = targetMueble ? targetMueble.grid_x + 5 : 150;
    const offsetY = targetMueble ? targetMueble.grid_y + 20 : 150;

    const { error } = await supabase
      .from('devices')
      .update({ 
        assigned_element_id: elementId,
        grid_x: offsetX,
        grid_y: offsetY
      }) 
      .eq('id', deviceId);

    if (error) {
      console.error("❌ Error al acoplar desde el banco:", error.message);
    } else {
      fetchDevices();
    }
  };

  // Persistencia de arrastre de muebles con calibración por offset
  const handleElementDragEnd = async (id: string, info: any) => {
    const currentElement = layoutElements.find(e => e.id === id);
    if (!currentElement) return;

    const deltaX = info.offset.x / zoomLevel;
    const deltaY = info.offset.y / zoomLevel;

    const calculatedX = Math.round(currentElement.grid_x + deltaX);
    const calculatedY = Math.round(currentElement.grid_y + deltaY);

    const newX = Math.max(10, Math.min(calculatedX, 2000 - currentElement.width - 10));
    const newY = Math.max(10, Math.min(calculatedY, 2000 - currentElement.height - 10));

    console.log(`💾 Guardando coordenadas rígidas en Supabase: [X: ${newX}, Y: ${newY}]`);

    setLayoutElements(prev => prev.map(e => e.id === id ? { ...e, grid_x: newX, grid_y: newY } : e));

    await supabase
      .from('layout_elements')
      .update({ grid_x: newX, grid_y: newY })
      .eq('id', id);
  };

  const handleRenameElement = async (id: string) => {
    if (!editingName.trim()) {
      setEditingElementId(null);
      return;
    }

    const cleanName = editingName.trim().toUpperCase();
    const { error } = await supabase
      .from('layout_elements')
      .update({ name: cleanName })
      .eq('id', id);

    if (!error) {
      setLayoutElements(prev => prev.map(e => e.id === id ? { ...e, name: cleanName } : e));
    }
    setEditingElementId(null);
  };

  // Filtrado de las unidades disponibles en el banco izquierdo
  const floatingAPUnits = tables.filter(t => !t.assigned_element_id);
  const targetDevice = tables.find(t => t.id === selectedTableId);

  return (
    <div className="h-full flex gap-4 overflow-hidden p-2 relative">
      
      {/* 🛠️ LEFT: TOOLBOX & AP-UNITS BANK */}
      <div className="w-64 bg-aura-inner border-2 border-aura-dark flex flex-col shrink-0 rounded-lg p-3 z-20 justify-between">
        <div className="flex-1 flex flex-col min-h-0">
          <h3 className="text-[11px] font-bold text-aura-green uppercase tracking-widest border-b border-aura-dark/60 pb-2 mb-3 flex items-center gap-2">
            <LayoutGrid size={14} className="text-aura-cyan" /> Aura Control Panel
          </h3>

          {/* Tabs de Navegación */}
          <div className="flex gap-1 mb-4 shrink-0">
            <button 
              onClick={() => setActiveToolboxTab('apunits')}
              className={`flex-1 py-1.5 text-[10px] uppercase font-bold tracking-wider border transition-colors ${activeToolboxTab === 'apunits' ? 'border-aura-cyan bg-aura-cyan/10 text-aura-cyan' : 'border-aura-dark text-aura-green/40'}`}
            >
              Banco AP-Units ({floatingAPUnits.length})
            </button>
            <button 
              onClick={() => setActiveToolboxTab('elements')}
              className={`flex-1 py-1.5 text-[10px] uppercase font-bold tracking-wider border transition-colors ${activeToolboxTab === 'elements' ? 'border-aura-green bg-aura-green/10 text-aura-text' : 'border-aura-dark text-aura-green/40'}`}
            >
              Estructuras
            </button>
          </div>

          {/* Vista A: Banco de Unidades Disponibles */}
          {activeToolboxTab === 'apunits' && (
            <div className="flex-1 flex flex-col gap-2 overflow-y-auto min-h-0 pr-1">
              <p className="text-[9px] opacity-40 uppercase tracking-tighter mb-1">Arrastra una unidad al plano:</p>
              {floatingAPUnits.length === 0 ? (
                <div className="text-center p-6 border border-dashed border-aura-dark/40 text-[10px] opacity-30 uppercase font-mono rounded">
                  Todo el hardware en piso
                </div>
              ) : (
                floatingAPUnits.map(unit => (
                  <div 
                    key={unit.id} 
                    draggable 
                    onDragStart={(e) => handleBankDragStart(e, unit.id)}
                    className="border border-aura-cyan/40 bg-aura-black p-2 rounded flex flex-col gap-1 shadow-md cursor-grab active:cursor-grabbing hover:border-aura-cyan transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-white truncate max-w-[75%]">{unit.name}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${unit.status === 'online' ? 'bg-aura-green shadow-[0_0_4px_#00ff66]' : 'bg-red-500'}`} />
                    </div>
                    <div className="flex justify-between items-center text-[8px] font-mono opacity-40">
                      <span className="truncate">ID: {unit.id.slice(0,8)}</span>
                      <span className="uppercase">{unit.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Vista B: Toolbox */}
          {activeToolboxTab === 'elements' && (
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
              <p className="text-[10px] opacity-40 uppercase tracking-tighter">Instanciar mobiliario físico:</p>
              <button 
                onClick={() => handleAddLayoutElement('mesa')}
                className="w-full py-2.5 bg-aura-black border border-dashed border-aura-green/40 hover:border-aura-green hover:bg-aura-green/5 text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
              >
                <Plus size={12} /> + Añadir Mesa
              </button>
              <button 
                onClick={() => handleAddLayoutElement('barra')}
                className="w-full py-2.5 bg-aura-black border border-dashed border-purple-500/40 hover:border-purple-500 hover:bg-purple-500/5 text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
              >
                <Plus size={12} /> + Añadir Barra
              </button>
            </div>
          )}
        </div>

        {/* 🚀 NUEVA SECCIÓN DE ZOOM UNIFICADA DENTRO DEL CONTENEDOR */}
        <div className="border-t border-aura-dark/60 pt-3 mt-3 shrink-0 flex flex-col gap-2">
          <p className="text-[9px] opacity-40 uppercase tracking-tighter font-mono">Calibración de Viewport:</p>
          <div className="bg-aura-black border border-aura-dark/80 p-2 rounded flex items-center justify-between gap-3 font-mono">
            <div className="flex flex-col items-center gap-2 py-1">
              <button onClick={handleZoomIn} className="p-1 text-aura-green/70 hover:text-aura-green hover:bg-aura-green/10 transition-all rounded" title="Acercar"><ZoomIn size={14} /></button>
              <button onClick={handleZoomOut} className="p-1 text-aura-green/70 hover:text-aura-green hover:bg-aura-green/10 transition-all rounded" title="Alejar"><ZoomOut size={14} /></button>
            </div>
            
            <div className="flex-1 flex items-center px-1">
              <input 
                type="range" 
                min="0.5" 
                max="2.0" 
                step="0.05" 
                value={zoomLevel}
                onChange={(e) => setZoomLevel(parseFloat(e.target.value))} 
                className="accent-aura-green cursor-pointer w-full h-1 bg-aura-dark rounded-lg appearance-none"
              />
            </div>

            <div className="flex flex-col items-end shrink-0 border-l border-aura-dark/60 pl-2 min-w-[45px]">
              <button onClick={handleResetZoom} className="text-[9px] text-center text-aura-cyan border border-aura-cyan/20 px-1 py-0.5 rounded font-bold tracking-tighter hover:bg-aura-cyan/10 transition-colors">
                {Math.round(zoomLevel * 100)}%
              </button>
              <span className="text-[7px] text-aura-text/30 uppercase mt-0.5 tracking-widest">RESET</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🌌 CAPA REAL: VIEWPORT DEL MAPA */}
      <div 
        ref={constraintsRef} 
        className="absolute inset-0 overflow-auto select-none"
        style={{ 
          backgroundImage: 'radial-gradient(var(--color-aura-dark) 1px, transparent 1px)', 
          backgroundSize: '24px 24px',
          scrollBehavior: 'auto' 
        }}
      >

        {/* CONTENEDOR GRID */}
        <div
          style={{ 
            transform: `scale(${zoomLevel})`, 
            width: '2000px', 
            height: '2000px', 
            transformOrigin: 'top left' 
          }}
          className="absolute top-0 left-0 p-10"
        >
          {/* A. RENDER DE ESTRUCTURAS FÍSICAS */}
          {layoutElements.map(element => {
            const isBarra = element.type === 'barra';
            const dockedDevice = tables.find(t => t.assigned_element_id === element.id);
            const isCurrentlyEditing = editingElementId === element.id;
            const isDraggingOverMe = dragOverElementId === element.id;

            return (
              <motion.div
                key={element.id}
                drag={!isCurrentlyEditing}
                dragMomentum={false}
                dragElastic={0}
                dragTransition={{ power: 0, timeConstant: 0 }}
                
                onDragOver={(e) => handleMesaDragOver(e, element.id)}
                onDragLeave={handleMesaDragLeave}
                onDrop={(e) => handleMesaDrop(e, element.id)}
                
                style={{ x: element.grid_x, y: element.grid_y, width: element.width, height: element.height, transformOrigin: 'top left' }}
                className={`absolute p-2 rounded-lg border-2 bg-aura-bg/80 backdrop-blur-sm group flex flex-col justify-between z-10 cursor-grab active:cursor-grabbing ${isDraggingOverMe ? 'border-aura-cyan bg-aura-cyan/20 scale-[1.03] shadow-[0_0_25px_rgba(0,255,242,0.3)]' : isBarra ? 'border-purple-600/50 shadow-[0_0_15px_rgba(168,85,247,0.05)]' : 'border-aura-green/40'}`}
              >
                {/* Botonera de Control del mueble */}
                <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                  <button 
                    onClick={() => handleRemoveElement(element.id)}
                    className="p-0.5 bg-aura-dark border border-aura-red text-aura-red rounded-full cursor-pointer hover:scale-110 transition-transform"
                    title="Eliminar mueble del layout"
                  >
                    <X size={10} />
                  </button>
                </div>

                {/* Nombre del Mueble */}
                <div className="flex justify-between items-center w-full min-h-[20px]">
                  {isCurrentlyEditing ? (
                    <input
                      autoFocus type="text" value={editingName} onChange={e => setEditingName(e.target.value)}
                      onBlur={() => handleRenameElement(element.id)}
                      onKeyDown={e => { if (e.key === 'Enter') handleRenameElement(element.id); if (e.key === 'Escape') setEditingElementId(null); }}
                      className="bg-aura-black text-[10px] text-white font-bold font-mono border-b border-aura-cyan outline-none w-[80%] uppercase px-1 py-0"
                    />
                  ) : (
                    <span 
                      onDoubleClick={() => { setEditingElementId(element.id); setEditingName(element.name); }}
                      className={`text-[10px] uppercase tracking-wider font-bold cursor-edit select-none truncate pr-2 w-[85%] ${isBarra ? 'text-purple-400' : 'text-aura-green/60'}`}
                    >
                      {element.name}
                    </span>
                  )}
                  <Move size={10} className="opacity-20 group-hover:opacity-60 transition-opacity text-white shrink-0" />
                </div>

                {/* Espacio del AP-Unit dentro de la mesa */}
                <div className="flex-1 flex items-center justify-center border border-dashed border-aura-dark/60 rounded bg-aura-black/40 mt-1 p-1 min-h-[36px]">
                  {dockedDevice ? (
                    <div 
                      onClick={e => { e.stopPropagation(); onTableSelect(dockedDevice.id); }}
                      className={`w-full h-full flex items-center justify-between px-2 bg-aura-panel/90 border text-[11px] font-bold text-white rounded cursor-pointer hover:brightness-125 transition-all relative group/unit ${selectedTableId === dockedDevice.id ? 'border-aura-cyan shadow-[0_0_8px_rgba(0,255,242,0.4)] bg-aura-cyan/10' : 'border-aura-cyan'}`}
                    >
                      <div className="flex items-center gap-1.5 truncate max-w-[70%]">
                        <Tv size={11} className={dockedDevice.status === 'online' ? "text-aura-green" : "text-slate-500"} />
                        <span className="truncate">{dockedDevice.name}</span>
                      </div>
                      
                      {/* Botón X de desacople */}
                      <button 
                        onClick={e => { 
                          e.stopPropagation(); 
                          handleUnlinkDevice(dockedDevice.id); 
                        }}
                        className="absolute -top-1.5 -right-1.5 p-0.5 bg-aura-black border border-aura-cyan text-aura-cyan rounded-full opacity-0 group-hover/unit:opacity-100 hover:bg-aura-cyan hover:text-black transition-all z-40 scale-90"
                        title="Desacoplar unidad"
                      >
                        <X size={8} />
                      </button>

                      <span className={`w-1.5 h-1.5 rounded-full ${dockedDevice.status === 'online' ? 'bg-aura-green shadow-[0_0_6px_#00ff66]' : 'bg-red-500'} group-hover/unit:opacity-0 transition-opacity`} />
                    </div>
                  ) : (
                    <span className="text-[9px] uppercase tracking-tighter opacity-20 font-mono">
                      {isDraggingOverMe ? "¡Suelta Aquí!" : "Slot Libre"}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}