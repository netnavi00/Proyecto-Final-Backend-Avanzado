import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase'; 
import { Database, Plus, RefreshCw, Trash2, Edit3, Terminal, Code, BookOpen, TriangleAlert } from 'lucide-react';

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
  
  const [availableTables, setAvailableTables] = useState<string[]>([
    'devices', 'establishments', 'profiles', 'device_telemetry', 'staff'
  ]);
  const [showManual, setShowManual] = useState(false);
  const [rawJson, setRawJson] = useState('{\n  "columna": "valor"\n}');

  // Motor de Auto-Detección de Tablas
  useEffect(() => {
    const scanDatabase = async () => {
      const { data, error } = await supabase.rpc('get_all_tables');
      if (!error && data) {
        setAvailableTables(data);
      }
    };
    scanDatabase();
  }, []);

  const addLog = (message: string, data?: any, type: 'success' | 'error' | 'info' | 'action' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [{ timestamp, message, data, type }, ...prev]);
  };

  const handleTablePreset = (table: string) => {
    setTableName(table);
    setPrimaryId('');
    if (table === 'devices') {
      setRawJson('{\n  "name": "NODO-TERRAZA",\n  "status": "offline",\n  "establishment_id": "UUID_DEL_LOCAL"\n}');
    } else if (table === 'establishments') {
      setRawJson('{\n  "name": "Cyber Bar VIP",\n  "tier": "PREMIUM",\n  "owner_id": "UUID_DEL_DUEÑO"\n}');
    } else if (table === 'profiles') {
      setRawJson('{\n  "id": "UUID_AUTH",\n  "full_name": "NOMBRE_COMPLETO",\n  "role": "admin"\n}');
    } else {
      setRawJson('{\n  \n}');
    }
    addLog(`🔄 TARGET_CHANGED: Apuntando a [${table.toUpperCase()}]`);
  };

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
     CRUD UNIVERSAL
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
        <div className="flex gap-2 items-center">
          <select 
            value={availableTables.includes(tableName) ? tableName : ''}
            onChange={(e) => {
              if(e.target.value) handleTablePreset(e.target.value);
            }}
            className="bg-black border border-zinc-700 text-aura-cyan px-2 py-1 text-[11px] outline-none focus:border-aura-cyan font-bold uppercase cursor-pointer"
          >
            <option value="" disabled>-- SELECCIONA TABLA --</option>
            {availableTables.map(table => (
              <option key={table} value={table}>{table}</option>
            ))}
          </select>
          <span className="text-zinc-600">/</span>
          <input 
            value={tableName} 
            onChange={(e) => setTableName(e.target.value.toLowerCase())}
            placeholder="Otra tabla..."
            className="bg-black border border-zinc-700 text-white px-2 py-1 text-[11px] w-28 outline-none focus:border-aura-cyan font-bold"
          />
        </div>
      </div>

      {/* BOTÓN TOGGLE MANUAL */}
      <div className="flex justify-end -mt-2">
        <button 
          onClick={() => setShowManual(!showManual)}
          className="flex items-center gap-1.5 text-[10px] font-bold text-aura-cyan hover:text-black transition-colors bg-aura-cyan/10 hover:bg-aura-cyan px-2 py-1 border border-aura-cyan/30"
        >
          <BookOpen size={12} />
          {showManual ? '[X] CERRAR_MANUAL' : '[?] LEER_MANUAL_OPERADOR'}
        </button>
      </div>

      {/* PANEL DEL MANUAL CON EJEMPLOS DE PAYLOADS */}
      {showManual && (
        <div className="bg-zinc-950 border border-zinc-800 p-4 text-[10.5px] text-zinc-400 space-y-4 shadow-lg mb-4">
          <h3 className="text-white font-bold tracking-widest border-b border-zinc-800 pb-1 flex items-center gap-2">
            <TriangleAlert size={14} className="text-amber-500" /> OPERATOR MANUAL & RAW PAYLOAD TEMPLATES
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p><strong className="text-purple-400">[GET] LISTAR:</strong> Descarga todos los registros de la tabla destino. <br/><span className="text-zinc-500">Ignora el UUID y el Payload JSON.</span></p>
              <p><strong className="text-emerald-400">[POST] INSERTAR:</strong> Inyecta un nuevo registro. <br/><span className="text-zinc-500">Requiere un JSON Payload válido. Ignora el campo UUID (Supabase lo auto-genera).</span></p>
            </div>
            <div className="space-y-2">
              <p><strong className="text-amber-400">[PATCH] ACTUALIZAR:</strong> Modifica un registro existente. <br/><span className="text-zinc-500"><strong>Obligatorio:</strong> Ingresar el UUID en "Target_Record_ID" y solo los campos a cambiar en el JSON Payload.</span></p>
              <p><strong className="text-red-400">[DELETE] PURGAR:</strong> Elimina un registro permanentemente. <br/><span className="text-zinc-500"><strong>Obligatorio:</strong> Ingresar el UUID en "Target_Record_ID". Ignora el Payload JSON.</span></p>
            </div>
          </div>

          {/* SECCIÓN DE PLANTILLAS RAPIDAS */}
          <div className="border-t border-zinc-900 pt-3 space-y-2">
            <span className="text-zinc-300 font-bold block uppercase tracking-wider">📋 Ejemplos Estrictos para copiar (POST / PATCH):</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 font-mono text-[10px]">
              <div className="bg-black p-2 border border-zinc-800">
                <span className="text-aura-cyan block mb-1">// Tabla: devices</span>
                <pre className="text-emerald-500">{"{\n  \"name\": \"NODO-BARRA\",\n  \"status\": \"offline\",\n  \"establishment_id\": \"UUID_AQUI\"\n}"}</pre>
              </div>
              <div className="bg-black p-2 border border-zinc-800">
                <span className="text-aura-cyan block mb-1">// Tabla: establishments</span>
                <pre className="text-emerald-500">{"{\n  \"name\": \"Cyber Bar X\",\n  \"tier\": \"PREMIUM\",\n  \"owner_id\": \"UUID_AQUI\"\n}"}</pre>
              </div>
              <div className="bg-black p-2 border border-zinc-800">
                <span className="text-aura-cyan block mb-1">// Inserción Múltiple (Array)</span>
                <pre className="text-emerald-500">{"[\n  { \"name\": \"MESA-1\" },\n  { \"name\": \"MESA-2\" }\n]"}</pre>
              </div>
            </div>
          </div>

          <div className="bg-black p-2 border border-zinc-800 flex items-start gap-2 mt-2">
            <span className="text-red-500 font-bold">⚠️ REGLA CRÍTICA SINTAXIS:</span>
            <span>Las claves (columnas) y los valores de texto <strong>deben usar comillas dobles obligatoriamente</strong>. Evita dejar comas colgantes al final del último parámetro.</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* PANEL ADAPTATIVO */}
        <div className="space-y-3">
          <form onSubmit={handleCreate} className="space-y-3 bg-zinc-950 p-3.5 border border-zinc-800">
            
            {/* ID FILTRO */}
            <div>
              <label className="text-[9px] text-zinc-500 uppercase block mb-0.5 font-bold">Target_Record_ID (UUID para PATCH / DELETE)</label>
              <input 
                placeholder="00000000-0000-0000-..." 
                value={primaryId} onChange={e => setPrimaryId(e.target.value)}
                className="w-full bg-black border border-zinc-800 p-2 text-xs text-white outline-none focus:border-aura-cyan tracking-wider"
              />
            </div>

            {/* CAJA DE TEXTO PAYLOAD JSON */}
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