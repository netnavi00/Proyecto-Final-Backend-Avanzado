import React, { useState, useEffect } from 'react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, AlertTriangle, ShieldCheck, UserPlus, X, CheckCircle2 } from 'lucide-react';
import { supabase, SUPABASE_URL } from '../../services/supabase';
import { AuraLogo } from '../ui/AuraLogo';

interface LoginModuleProps {
  onLoginSuccess: (establishmentId: string) => void;
}

export default function LoginModule({ onLoginSuccess }: LoginModuleProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [isRegLoading, setIsRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState(false);

  // 🚀 MOTOR DE RECUPERACIÓN: Detecta un registro
  useEffect(() => {
    const pendingSuccess = sessionStorage.getItem('aura_registration_complete');
    if (pendingSuccess === 'true') {
      setIsSignUpModalOpen(true);
      setRegSuccess(true);
      sessionStorage.removeItem('aura_registration_complete'); // Limpiamos el testigo
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (SUPABASE_URL === 'https://mock-project.supabase.co') {
        await new Promise(r => setTimeout(r, 1500));
        onLoginSuccess('MOCK_ESTABLISHMENT_ID');
        return;
      }
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      if (data.user) {
        const { data: establishment } = await supabase.from('establishments').select('id').eq('owner_id', data.user.id).maybeSingle();
        onLoginSuccess(establishment?.id || 'SUPERADMIN_ROOT_NODE');
      }
    } catch (err: any) {
      setError(`[SYSTEM_FAILURE: ${err.message?.toUpperCase()}]`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegLoading(true);
    setRegError(null);

    // ⬛ INYECTAMOS EL TELÓN NEGRO
    const blackout = document.createElement('div');
    blackout.id = 'aura-blackout-curtain';
    blackout.className = 'fixed inset-0 z-[99999] bg-[#050505] flex flex-col items-center justify-center font-mono transition-opacity duration-700';
    blackout.innerHTML = `
      <div class="w-16 h-16 border-4 border-[#00e5ff] border-t-transparent rounded-full animate-spin mb-8 shadow-[0_0_15px_rgba(0,229,255,0.5)]"></div>
      <div class="text-[#00e5ff] text-xl font-black tracking-[0.4em] uppercase animate-pulse">REBOOTING SECURE PROTOCOLS</div>
      <div class="text-[#00e5ff] text-[10px] opacity-40 tracking-[0.2em] mt-4 font-bold">[ SYSTEM_OVERRIDE_ACTIVE ]</div>
    `;
    document.body.appendChild(blackout);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
      });

      if (authError) throw authError;

      if (data.session) {
        // 💾 GUARDAMOS EL TESTIGO DE SUPERVIVENCIA
        sessionStorage.setItem('aura_registration_complete', 'true');
        
        // Cerramos la sesión que Supabase abrió a la fuerza
        await supabase.auth.signOut();
        
        // Esperamos a que la App de React termine su "baile" de abrir y cerrar
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        // Si no hubo sesión automática (confirmación de email activa), solo mostramos éxito
        setRegSuccess(true);
      }
      
    } catch (err: any) {
      setRegError(`[SYS_ERROR: ${err.message?.toUpperCase()}]`);
      // Si hubo error, quitamos el telón de inmediato
      const curtain = document.getElementById('aura-blackout-curtain');
      if (curtain) document.body.removeChild(curtain);
    } finally {
      setIsRegLoading(false);
      // El telón se quita solo si NO hubo sesión automática. 
      // Si hubo sesión, el componente LoginModule morirá y volverá a nacer,
      // activando el useEffect de arriba para quitar el telón.
      const curtain = document.getElementById('aura-blackout-curtain');
      if (curtain) {
        curtain.style.opacity = '0';
        setTimeout(() => { if (document.body.contains(curtain)) document.body.removeChild(curtain); }, 700);
      }
    }
  };

  const closeSignUpModal = () => {
    setIsSignUpModalOpen(false);
    setTimeout(() => { setRegEmail(''); setRegPassword(''); setRegError(null); setRegSuccess(false); }, 300);
  };

  return (
    <div className="min-h-screen bg-aura-bg text-aura-green font-mono flex items-center justify-center p-6 relative overflow-hidden select-none">
      <style dangerouslySetInnerHTML={{__html: `input:-webkit-autofill { -webkit-box-shadow: 0 0 0 50px #050505 inset !important; -webkit-text-fill-color: #00ff41 !important; }`}} />
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(var(--color-aura-green) 1px, transparent 1px), linear-gradient(90deg, var(--color-aura-green) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="z-10 w-full max-w-xl bg-aura-black border-4 border-aura-dark p-10 relative">
        <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-aura-green"></div>
        <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-aura-green"></div>
        <div className="flex flex-col items-center mb-12 text-center">
          <AuraLogo size={60} className="mb-4 text-aura-green" />
          <h1 className="text-3xl font-black tracking-[0.2em] uppercase">AURA <span className="font-thin">Command</span></h1>
          <p className="text-[10px] tracking-[0.4em] opacity-50 mt-2">ADMINISTRATIVE ACCESS ONLY</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-10">
          <div className="space-y-2 group">
            <label className="text-[10px] uppercase tracking-widest text-aura-green/50 font-bold group-focus-within:text-aura-green transition-colors">Owner Protocol ID</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="ENTER_ADMIN_EMAIL" className="w-full bg-aura-bg border-b-2 border-aura-dark px-2 py-3 text-lg text-aura-text focus:border-aura-green outline-none transition-all placeholder:opacity-10" />
          </div>
          <div className="space-y-2 group">
            <label className="text-[10px] uppercase tracking-widest text-aura-green/50 font-bold group-focus-within:text-aura-green transition-colors">Encrypted Key</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="w-full bg-aura-bg border-b-2 border-aura-dark px-2 py-3 text-lg text-aura-text focus:border-aura-green outline-none transition-all placeholder:opacity-10" />
          </div>
          <div className="pt-2">
            <button type="submit" disabled={isLoading} className="w-full border-2 border-aura-green text-aura-green py-5 text-sm font-black uppercase tracking-[0.3em] hover:bg-aura-green hover:text-black transition-all disabled:opacity-20 flex items-center justify-center gap-3">
              {isLoading ? <ShieldCheck className="animate-spin" /> : <Lock size={20} />}
              {isLoading ? 'ESTABLISHING LINK...' : '[ INITIALIZE_SYSTEM ]'}
            </button>
            <button type="button" onClick={() => setIsSignUpModalOpen(true)} className="w-full mt-6 text-[10px] uppercase tracking-[0.2em] text-aura-green/40 hover:text-aura-cyan transition-colors font-bold text-center">&gt;&gt; REQUEST NEW CLEARANCE (SIGN UP)</button>
          </div>
        </form>
      </motion.div>

      <AnimatePresence>
        {isSignUpModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeSignUpModal} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-[#050505] border-2 border-aura-cyan p-8 z-10">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-aura-cyan"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-aura-cyan"></div>
              <button onClick={closeSignUpModal} className="absolute top-4 right-4 text-aura-cyan/50 hover:text-aura-cyan"><X size={20} /></button>

              {regSuccess ? (
                <div className="flex flex-col items-center text-center py-8">
                  <CheckCircle2 size={48} className="text-aura-cyan mb-4 animate-pulse" />
                  <h3 className="text-lg font-bold text-aura-cyan mb-2 tracking-widest uppercase">REGISTRO EXITOSO</h3>
                  <p className="text-[11px] text-aura-cyan/60 mb-8 uppercase tracking-wider">Credenciales inyectadas. Revisa tu email para verificar tu señal y autorizar el acceso.</p>
                  <button onClick={closeSignUpModal} className="w-full border-2 border-aura-cyan text-aura-cyan py-3 text-sm font-black uppercase tracking-widest hover:bg-aura-cyan hover:text-black">[ CLOSE_PROTOCOL ]</button>
                </div>
              ) : (
                <form onSubmit={handleSignUp} className="space-y-6">
                  <div className="flex items-center gap-3 mb-4"><UserPlus className="text-aura-cyan" size={24} /><h2 className="text-xl font-black text-aura-cyan tracking-widest uppercase">NEW NODE</h2></div>
                  {regError && <div className="border border-aura-cyan bg-aura-cyan/10 p-3 text-aura-cyan text-[10px] font-bold uppercase">{regError}</div>}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase text-aura-cyan/50 font-bold">New Admin Email</label>
                    <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required className="w-full bg-aura-black border-b border-aura-cyan/30 p-2 text-aura-text outline-none focus:border-aura-cyan" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase text-aura-cyan/50 font-bold">Secure Password</label>
                    <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required minLength={6} className="w-full bg-aura-black border-b border-aura-cyan/30 p-2 text-aura-text outline-none focus:border-aura-cyan" />
                  </div>
                  <button type="submit" disabled={isRegLoading} className="w-full border-2 border-aura-cyan text-aura-cyan py-4 font-black uppercase tracking-widest hover:bg-aura-cyan hover:text-black disabled:opacity-30 flex items-center justify-center gap-2">
                    {isRegLoading ? <ShieldCheck className="animate-spin" /> : <UserPlus size={18} />}
                    {isRegLoading ? 'INJECTING...' : '[ INJECT CREDENTIALS ]'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}