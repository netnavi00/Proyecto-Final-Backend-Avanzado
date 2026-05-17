import React, { useState } from 'react';
import { supabase } from '../services/supabase'; 
import { Database, Plus, RefreshCw, Trash2, Edit3, Terminal, Code } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  message: string;
  data?: any;
  type: 'success' | 'error' | 'info' | 'action';
}

export function Endpoints() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [tableName, setTableName] = useState('devices');
  const [primaryId, setPrimaryId] = useState('');
  
  // 📝 UN SÓLO INPUT PARA TODO: Payload JSON crudo
  const [rawJson, setRawJson] = useState('{\n  "columna": "valor"\n}');

  const addLog = (message: string, data?: any, type: 'success' | 'error' | 'info' | 'action' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [{ timestamp, message, data, type }, ...prev]);
  };

  // Plantillas rápidas para facilitarte la vida al cambiar de tabla
  const handleTablePreset = (table: string) => {
    setTableName(table);
    setPrimaryId('');
    if (table === 'devices') {
      setRawJson('{\n  "id": "UUID_DEL_DISPOSITIVO",\n  "establishment_id": "UUID_DEL_LOCAL"\n}');
    } else if (table === 'establishments') {
      setRawJson('{\n  "name": "NUEVO_LOCAL",\n  "owner_id": "UUID_DEL_DUEÑO",\n  "tier": "BASIC"\n}');
    } else if (table === 'profiles') {
      setRawJson('{\n  "id": "UUID_AUTH",\n  "full_name": "NOMBRE_COMPLETO",\n  "role": "admin"\n}');
    } else {
      setRawJson('{\n  \n}');
    }
    addLog(`🔄 TARGET_CHANGED: Apuntando a [${table.toUpperCase()}]`);
  };

  // Validador y parseador de JSON incorporado
  const parsePayload = (): any | null => {
    try {
      return JSON.parse(rawJson);
    } catch (e: any) {
      alert("❌ ERROR_DE_SINTAXIS_JSON: Revisa las comas y comillas dobles.");
      addLog(`❌ Fallo al parsear JSON: ${e.message}`, null, 'error');
      return null;
    }
  };

  /* ==========================================
     CRUD UNIVERSAL (No importa qué columnas tengas)
     ========================================== */

  const handleRead = async () => {
    if (!tableName.trim()) return alert("Especifica la tabla");
    addLog(`📡 SELECT * FROM "${tableName.trim().toLowerCase()}"...`, null, 'action');
    
    const { data, error } = await supabase
      .from(tableName.trim().toLowerCase())
      .select('*');

    if (error) addLog(`❌ ERROR_READ: ${error.message}`, null, 'error');
    else addLog(`🟩 SUCCESS_READ [${tableName.toUpperCase()}]:`, data, 'success');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = parsePayload();
    if (!payload) return;

    addLog(`🚀 INSERT INTO "${tableName}"...`, null, 'action');
    const { data, error } = await supabase
      .from(tableName.trim().toLowerCase())
      .insert(Array.isArray(payload) ? payload : [payload])
      .select();

    if (error) addLog(`❌ ERROR_CREATE: ${error.message}`, null, 'error');
    else addLog(`🟩 SUCCESS_CREATE: Fila insertada`, data, 'success');
  };

  const handleUpdate = async () => {
    if (!primaryId) return alert("Para actualizar necesitas especificar el UUID en el campo superior.");
    const payload = parsePayload();
    if (!payload) return;

    addLog(`🎛️ UPDATE "${tableName}" WHERE id = ${primaryId}...`, null, 'action');
    const { data, error } = await supabase
      .from(tableName.trim().toLowerCase())
      .update(payload)
      .eq('id', primaryId.trim())
      .select();

    if (error) addLog(`❌ ERROR_UPDATE: ${error.message}`, null, 'error');
    else addLog(`🟩 SUCCESS_UPDATE: Registro modificado`, data, 'success');
  };

  const handleDelete = async () => {
    if (!primaryId) return alert("Especifica el ID del registro a eliminar.");
    addLog(`🚨 DELETE FROM "${tableName}" WHERE id = ${primaryId}...`, null, 'error');

    const { error } = await supabase
      .from(tableName.trim().toLowerCase())
      .delete()
      .eq('id', primaryId.trim());

    if (error) addLog(`❌ ERROR_DELETE: ${error.message}`, null, 'error');
    else addLog(`🟥 SUCCESS_DELETE: Registro ${primaryId} purgado de la red.`, null, 'success');
  };

  return (
    <div className="p-2 bg-black text-white font-mono space-y-4 text-[12px]">
      
      {/* SELECTOR ADAPTABLE O ENTRADA MANUAL */}
      <div className="bg-zinc-900 p-2.5 border border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Database size={13} className="text-aura-cyan" />
          <span className="text-zinc-400 font-bold uppercase">Tabla_Destino:</span>
        </div>
        <div className="flex gap-2">
          {/* Accesos rápidos */}
          <button onClick={() => handleTablePreset('devices')} type="button" className={`px-2 py-1 text-[10px] border ${tableName === 'devices' ? 'bg-aura-cyan/20 border-aura-cyan text-aura-cyan' : 'border-zinc-800 text-zinc-500'}`}>DEVICES</button>
          <button onClick={() => handleTablePreset('establishments')} type="button" className={`px-2 py-1 text-[10px] border ${tableName === 'establishments' ? 'bg-aura-cyan/20 border-aura-cyan text-aura-cyan' : 'border-zinc-800 text-zinc-500'}`}>ESTABLISHMENTS</button>
          <button onClick={() => handleTablePreset('profiles')} type="button" className={`px-2 py-1 text-[10px] border ${tableName === 'profiles' ? 'bg-aura-cyan/20 border-aura-cyan text-aura-cyan' : 'border-zinc-800 text-zinc-500'}`}>PROFILES</button>
          
          {/* Input manual por si creas una tabla nueva en el futuro */}
          <input 
            value={tableName} 
            onChange={(e) => setTableName(e.target.value.toLowerCase())}
            placeholder="Otra tabla..."
            className="bg-black border border-zinc-700 text-white px-2 py-0.5 text-[11px] w-28 outline-none focus:border-aura-cyan font-bold"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* PANEL ADAPTATIVO */}
        <div className="space-y-3">
          <form onSubmit={handleCreate} className="space-y-3 bg-zinc-950 p-3.5 border border-zinc-800">
            
            {/* ID FILTRO (Para Read específico, Updates y Deletes) */}
            <div>
              <label className="text-[9px] text-zinc-500 uppercase block mb-0.5 font-bold">Target_Record_ID (UUID para PATCH / DELETE)</label>
              <input 
                placeholder="00000000-0000-0000-..." 
                value={primaryId} onChange={e => setPrimaryId(e.target.value)}
                className="w-full bg-black border border-zinc-800 p-2 text-xs text-white outline-none focus:border-aura-cyan tracking-wider"
              />
            </div>

            {/* CAJA DE TEXTO PARA EL PAYLOAD JSON LIBRE */}
            <div>
              <label className="text-[9px] text-aura-cyan uppercase block mb-1 font-bold flex items-center gap-1">
                <Code size={11}/> Raw_Payload_JSON (Campos libres)
              </label>
              <textarea 
                rows={6}
                value={rawJson} 
                onChange={e => setRawJson(e.target.value)}
                className="w-full bg-black border border-zinc-800 p-2.5 font-mono text-[11px] text-emerald-400 outline-none focus:border-aura-cyan resize-none leading-relaxed"
                spellCheck={false}
              />
            </div>

            <button type="submit" className="w-full bg-aura-cyan/10 hover:bg-aura-cyan/20 text-aura-cyan border border-aura-cyan/40 text-xs py-2 uppercase font-bold flex items-center justify-center gap-2">
              <Plus size={14} /> [POST] Insertar Payload
            </button>
          </form>

          {/* ACCIONES DIRECTAS */}
          <div className="bg-zinc-950 p-3 border border-zinc-800 space-y-2">
            <button onClick={handleRead} type="button" className="w-full bg-purple-950/30 hover:bg-purple-950/50 text-purple-400 border border-purple-500/30 text-xs py-2 uppercase font-bold flex items-center justify-center gap-2">
              <RefreshCw size={14} /> [GET] Listar todo de: "{tableName.toUpperCase()}"
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleUpdate} type="button" className="bg-amber-950/20 hover:bg-amber-950/40 text-amber-400 border border-amber-500/30 text-[11px] py-2.5 uppercase font-bold flex items-center justify-center gap-1">
                <Edit3 size={12} /> [PATCH] Actualizar
              </button>
              <button onClick={handleDelete} type="button" className="bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-500/30 text-[11px] py-2.5 uppercase font-bold flex items-center justify-center gap-1">
                <Trash2 size={12} /> [DELETE] Purgar
              </button>
            </div>
          </div>
        </div>

        {/* MONITOR DE LA TERMINAL DE RESPUESTA */}
        <div className="flex flex-col h-[390px]">
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-1 mb-2 flex justify-between items-center">
            <span className="flex items-center gap-1.5"><Terminal size={11}/> Uplink Monitor Terminal</span>
            <button onClick={() => setLogs([])} type="button" className="text-[9px] text-zinc-600 hover:text-zinc-400 font-bold">[CLEAR]</button>
          </div>
          <div className="flex-1 bg-black border border-zinc-800 p-3 overflow-y-auto text-[11px] space-y-3 font-mono">
            {logs.length === 0 ? (
              <span className="text-zinc-700 italic">[READY_FOR_RAW_PAYLOADS...]</span>
            ) : (
              logs.map((log, i) => {
                let textColor = "text-zinc-400";
                if (log.type === 'success') textColor = "text-emerald-400";
                if (log.type === 'error') textColor = "text-red-400 animate-pulse";
                if (log.type === 'action') textColor = "text-aura-cyan";

                return (
                  <div key={i} className="border-b border-zinc-900 pb-2 space-y-1">
                    <div className={`${textColor} font-bold text-[10px]`}>
                      [{log.timestamp}] {log.message}
                    </div>
                    {log.data && (
                      <pre className="bg-zinc-950 p-2 rounded border border-zinc-900 text-zinc-300 font-mono text-[10px] whitespace-pre-wrap overflow-x-auto max-h-[220px] scrollbar-none">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}