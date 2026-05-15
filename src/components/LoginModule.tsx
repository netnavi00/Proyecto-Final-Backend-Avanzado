import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, AlertTriangle, ShieldCheck, UserPlus } from 'lucide-react';
import { supabase, SUPABASE_URL } from '../services/supabase';
import { AuraLogo } from './AuraLogo';

interface LoginModuleProps {
  onLoginSuccess: (establishmentId: string) => void;
}

export default function LoginModule({ onLoginSuccess }: LoginModuleProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // --- MODO REGISTRO ---
      if (isRegistering) {
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;

        // Éxito en el registro: Detenemos el flujo aquí para que el Superadmin haga su parte
        setError('[ NODE_REGISTERED: AWAITING_SUPERADMIN_CLEARANCE ]');
        setEmail('');
        setPassword('');
        setIsLoading(false);
        return; 
      }

      // --- MODO LOGIN ---
      // 1. Bypass para Entorno de Desarrollo (Mock)
      if (SUPABASE_URL === 'https://mock-project.supabase.co') {
        await new Promise(r => setTimeout(r, 1500));
        if (email && password) {
          onLoginSuccess('MOCK_ESTABLISHMENT_ID');
          return;
        }
      }

      // 2. Autenticación con Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        console.log("Sesión iniciada. Identificando establecimiento por Owner ID...");

        // 3. Verificación de Propiedad del Establecimiento
        const { data: establishment, error: dbError } = await supabase
          .from('establishments')
          .select('id')
          .eq('owner_id', data.user.id)
          .single() as { data: { id: string } | null, error: any };

        if (dbError) {
          console.error("Error al consultar establecimientos:", dbError);
          throw new Error("NO_ESTABLISHMENT_FOUND_FOR_THIS_OWNER");
        }

        if (establishment?.id) {
          console.log("Acceso concedido al establecimiento:", establishment.id);
          onLoginSuccess(establishment.id);
        } else {
          setError('[ACCESS_DENIED: NO_LINKED_ESTABLISHMENT]');
        }
      }
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message?.toUpperCase() || 'SYSTEM_ACCESS_DENIED';
      
      if (err.message?.includes('Failed to fetch')) {
        errMsg = 'CONNECTION_ERROR - CHECK_NETWORK_STATUS';
      }
      
      setError(`[SYSTEM_FAILURE: ${errMsg}]`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-aura-bg text-aura-green font-mono flex items-center justify-center p-6 relative overflow-hidden select-none">
      <style dangerouslySetInnerHTML={{__html: `
        input:-webkit-autofill {
            -webkit-box-shadow: 0 0 0 50px #050505 inset !important;
            -webkit-text-fill-color: #00ff41 !important;
        }
      `}} />
      
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(var(--color-aura-green) 1px, transparent 1px), linear-gradient(90deg, var(--color-aura-green) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-xl bg-aura-black border-4 border-aura-dark p-10 relative"
      >
        <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-aura-green"></div>
        <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-aura-green"></div>
        
        <div className="flex flex-col items-center mb-12 text-center">
          <AuraLogo size={60} className="mb-4 text-aura-green" />
          <h1 className="text-3xl font-black tracking-[0.2em] uppercase">
            AURA <span className="font-thin">Command</span>
          </h1>
          <p className="text-[10px] tracking-[0.4em] opacity-50 mt-2">
            {isRegistering ? 'NEW NODE REGISTRATION' : 'ADMINISTRATIVE ACCESS ONLY'}
          </p>
        </div>

        {error && (
          <div className={`mb-8 border-2 p-4 flex items-center gap-3 text-xs font-bold uppercase ${error.includes('REGISTERED') ? 'border-aura-green bg-aura-green/10 text-aura-green' : 'border-aura-red bg-aura-red/10 text-aura-red'}`}>
            {error.includes('REGISTERED') ? <ShieldCheck size={18} /> : <AlertTriangle size={18} />}
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-10">
          <div className="space-y-2 group">
            <label className="text-[10px] uppercase tracking-widest text-aura-green/50 font-bold group-focus-within:text-aura-green transition-colors">
              {isRegistering ? 'New Owner Protocol ID' : 'Owner Protocol ID'}
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="ENTER_ADMIN_EMAIL"
              className="w-full bg-aura-bg border-b-2 border-aura-dark px-2 py-3 text-lg text-aura-text focus:border-aura-green outline-none transition-all placeholder:opacity-10"
            />
          </div>

          <div className="space-y-2 group">
            <label className="text-[10px] uppercase tracking-widest text-aura-green/50 font-bold group-focus-within:text-aura-green transition-colors">
              {isRegistering ? 'Set Encrypted Key' : 'Encrypted Key'}
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-aura-bg border-b-2 border-aura-dark px-2 py-3 text-lg text-aura-text focus:border-aura-green outline-none transition-all placeholder:opacity-10"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full border-2 border-aura-green text-aura-green py-5 text-sm font-black uppercase tracking-[0.3em] hover:bg-aura-green hover:text-black transition-all disabled:opacity-20 flex items-center justify-center gap-3"
          >
            {isLoading ? <ShieldCheck className="animate-spin" /> : (isRegistering ? <UserPlus size={20} /> : <Lock size={20} />)}
            {isLoading ? 'ESTABLISHING LINK...' : (isRegistering ? '[ REGISTER_NODE ]' : '[ INITIALIZE_SYSTEM ]')}
          </button>
        </form>

        <div className="mt-8 flex justify-center z-20 relative">
          <button 
            type="button"
            onClick={() => { setIsRegistering(!isRegistering); setError(null); setPassword(''); }}
            className="text-[10px] uppercase tracking-[0.2em] text-aura-green/40 hover:text-aura-green transition-colors border-b border-transparent hover:border-aura-green pb-1"
          >
            {isRegistering ? '< RETURN TO LOGIN PROTOCOL' : 'REQUEST NEW NODE REGISTRATION >'}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t-[1px] border-dashed border-aura-dark flex justify-between items-center text-[10px] opacity-30">
           <span>SYSTEM_STABLE</span>
           <span className="uppercase">Aura Play Command Center</span>
        </div>
      </motion.div>
    </div>
  );
}