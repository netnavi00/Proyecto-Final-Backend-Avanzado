import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

/* * SYS.KERNEL: CONFIGURACIÓN DE COMPILACIÓN (VITE)
 * El motor principal define las reglas de empaquetado estático y la resolución 
 * de rutas para el despliegue a producción en la nube.
 */
export default defineConfig({
  // Se inicializan los módulos de renderizado de React y el procesador de estilos TailwindCSS.
  plugins: [
    react(), 
    tailwindcss()
  ],
  
  // El motor de rutas establece alias absolutos (ej. '@/') para asegurar 
  // la integridad de las importaciones y evitar rutas frágiles (../../../).
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  }
});