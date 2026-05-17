import React, { useState } from 'react';
import { supabase } from '../services/supabase'; 
import { LogIn, Lock, Mail, ShieldAlert } from 'lucide-react';

interface LoginModuleProps {
  onLoginSuccess: (role: string) => void; // Ajustado al prop real de tu App.tsx
}

export function LoginModule({ onLoginSuccess }: LoginModuleProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Ajustado a tu estado real
  const [error, setError] = useState('');             // Ajustado a tu estado real

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 1. Autenticación en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) throw authError;

      const user = authData?.user;
      if (!user) throw new Error("No user payload returned from uplink.");

      console.log("Sesión iniciada. Identificando establecimiento por Owner ID...");

      // 2. Consulta segura sin arrojar errores hostiles
      const { data: est, error: estError } = await supabase
        .from('establishments')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle(); 

      if (estError) {
        console.error("Error al consultar establecimientos:", estError.message);
      }

      // 3. Deducción automática de rango
      let assignedRole = 'superadmin';
      
      if (est) {
        assignedRole = 'admin';
        console.log(`[UPLINK_OK]: Nodo detectado -> ${est.name}. Rango asignado: ADMIN.`);
      } else {
        console.log("[UPLINK_OK]: Ningún nodo vinculado detectado. Rango asignado: SUPERADMIN raíz.");
      }

      // 4. Mandamos el rol de regreso a App.tsx de forma exitosa
      onLoginSuccess(assignedRole);

    } catch (err: any) {
      console.error("Authentication failed:", err.message);
      setError(err.message || "AUTH_GATEWAY_REJECTED");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-mono select-none">
      
      <div className="w-full max-w-sm border-2 border-[#a855f7]/30 bg-zinc-950 p-6 relative shadow-[0_0_40px_rgba(168,85,247,0.15)]">
        
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#a855f7] to-aura-cyan" />

        {/* ENCABEZADO */}
        <div className="text-center mb-8 pt-2">
          <h1 className="text-2xl font-black text-[#a855f7] tracking-[0.25em] uppercase flex items-center justify-center gap-2">
            AURA <span className="text-white">PLAY</span>
          </h1>
          <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">Uplink Authentication Gateway</p>
        </div>

        {/* ALERTA ROJA DE ERROR */}
        {error && (
          <div className="mb-4 bg-red-950/20 border border-red-500/40 p-3 text-xs text-red-400 flex items-start gap-2 animate-pulse">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <div>
              <div className="font-bold uppercase text-[10px]">Security_Alert:</div>
              <div className="opacity-80 uppercase text-[11px]">{error}</div>
            </div>
          </div>
        )}

        {/* FORMULARIO */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Identity_Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-zinc-600" size={14} />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@auraplay.com"
                disabled={isLoading}
                className="w-full bg-black border border-zinc-800 p-3 pl-9 text-xs text-white uppercase outline-none focus:border-[#a855f7] transition-colors disabled:opacity-40 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Security_Cipher</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-zinc-600" size={14} />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isLoading}
                className="w-full bg-black border border-zinc-800 p-3 pl-9 text-xs text-white outline-none focus:border-[#a855f7] transition-colors disabled:opacity-40 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#a855f7] hover:brightness-110 active:scale-[0.98] text-white text-xs font-black py-3 uppercase tracking-widest transition-all mt-6 disabled:opacity-40 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
          >
            <LogIn size={14} />
            {isLoading ? 'Establishing Uplink...' : 'Authorize Session'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-zinc-900 pt-4">
          <span className="text-[9px] text-zinc-600 tracking-wider font-mono uppercase">[ SECURE_CHANNEL_ACTIVE ]</span>
        </div>

      </div>
    </div>
  );
}

export default LoginModule;