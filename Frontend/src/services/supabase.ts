import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// 👇 AGREGA ESTA LÍNEA SOLO PARA DESARROLLO 👇
if (import.meta.env.DEV) {
  (window as any).sb = supabase;
}