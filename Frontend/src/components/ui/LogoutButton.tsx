import React from 'react';
import { LogOut, Power } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { motion } from 'motion/react';

interface LogoutButtonProps {
  onLogout: () => void;
}

export const LogoutButton = ({ onLogout }: LogoutButtonProps) => {
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log("SESSION_TERMINATED: Connection closed safely.");
      onLogout(); // Esto limpia el estado en tu App.tsx
    } catch (err) {
      console.error("Error during session termination:", err);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleLogout}
      className="flex items-center gap-3 px-6 py-2 border-2 border-aura-red bg-aura-red/5 text-aura-red font-mono text-sm uppercase tracking-widest hover:bg-aura-red hover:text-black transition-all group shadow-[0_0_15px_rgba(255,0,0,0.1)]"
    >
      <Power size={18} className="group-hover:animate-pulse" />
      <span>[ TERMINATE_SESSION ]</span>
    </motion.button>
  );
};