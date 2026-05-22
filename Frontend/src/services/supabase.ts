import { createClient } from '@supabase/supabase-js';

/* * SYS.CONFIG: SUPABASE CLIENT
 * El motor inicializa la conexión con la base de datos utilizando las variables
 * de entorno protegidas.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Instancia única del cliente para toda la aplicación.
export const supabase = createClient(supabaseUrl, supabaseKey);

// Alias de configuración exportado para módulos secundarios.
export const SUPABASE_URL = supabaseUrl;