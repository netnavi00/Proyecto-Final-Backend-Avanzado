import fs from 'fs';

let sandbox = fs.readFileSync('src/components/SandboxModule.tsx', 'utf-8');

// Add specific classes to AP-UNIT
sandbox = sandbox.replace(/<div className="border border-aura-green\/40[^>]*ap-unit-device[^>]*>/, (match) => match); // keep it if already there
if (!sandbox.includes('ap-unit-device')) {
  sandbox = sandbox.replace(
    /<div className="border border-aura-green\/40 p-2 rounded-xl relative shadow-\[0_0_30px_color-mix\(in_srgb,_var\(--color-aura-green\)_5%,_transparent\)\] w-full max-w-\[550px\] aspect-\[16\/9\] flex flex-col bg-aura-bg overflow-hidden">/,
    '<div className="ap-unit-device border border-aura-green/40 p-2 rounded-xl relative shadow-[0_0_30px_color-mix(in_srgb,_var(--color-aura-green)_5%,_transparent)] w-full max-w-[550px] aspect-[16/9] flex flex-col bg-aura-bg overflow-hidden">'
  );
}

if (!sandbox.includes('ap-unit-notch')) {
  sandbox = sandbox.replace(
    /<div className="absolute top-0 left-1\/2 -translate-x-1\/2 w-24 h-4 bg-aura-green\/20 rounded-b-lg border-b border-x border-aura-green\/40 z-20" \/>/,
    '<div className="ap-unit-notch absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-aura-green/20 rounded-b-lg border-b border-x border-aura-green/40 z-20" />'
  );
}

if (!sandbox.includes('ap-unit-screen')) {
  sandbox = sandbox.replace(
    /<div className="flex-1 rounded-lg border border-aura-green\/20 overflow-hidden relative shadow-\[inset_0_0_20px_color-mix\(in_srgb,_var\(--color-aura-green\)_10%,_transparent\)\] flex flex-col items-center text-center bg-aura-black">/,
    '<div className="ap-unit-screen flex-1 rounded-lg border border-aura-green/20 overflow-hidden relative shadow-[inset_0_0_20px_color-mix(in_srgb,_var(--color-aura-green)_10%,_transparent)] flex flex-col items-center text-center bg-aura-black">'
  );
}

// Update Inputs
sandbox = sandbox.replace(/bg-aura-black border border-aura-dark text-aura-text/g, 'bg-aura-input border border-aura-dark text-aura-text');
sandbox = sandbox.replace(/bg-aura-black border border-aura-green\/30 text-aura-green/g, 'bg-aura-input border border-aura-dark text-aura-text');
sandbox = sandbox.replace(/focus:border-aura-green/g, 'focus:border-aura-green focus:shadow-[0_0_0_1px_var(--color-aura-green)]');


fs.writeFileSync('src/components/SandboxModule.tsx', sandbox);

let app = fs.readFileSync('src/App.tsx', 'utf-8');

// Global Push specific classes
if (!app.includes('global-push-btn')) {
  app = app.replace(
    /className={`relative z-10 w-40 h-40 rounded-full flex flex-col items-center justify-center font-black uppercase tracking-widest shadow-\[0_0_40px_color-mix\(in_srgb,_var\(--color-aura-red\)_40%,_transparent\)\] \$\{isPushing \? 'bg-aura-red\/50 text-white cursor-wait animate-pulse' : 'bg-aura-red text-white hover:bg-red-500 hover:shadow-\[0_0_60px_color-mix\(in_srgb,_var\(--color-aura-red\)_60%,_transparent\)\]'\} transition-all`}/,
    'className={`global-push-btn relative z-10 w-40 h-40 rounded-full flex flex-col items-center justify-center font-black uppercase tracking-widest shadow-[0_0_40px_color-mix(in_srgb,_var(--color-aura-red)_40%,_transparent)] ${isPushing ? \'bg-aura-red/50 text-white cursor-wait pushing\' : \'bg-aura-red text-white hover:bg-aura-red/90 hover:shadow-[0_0_60px_color-mix(in_srgb,_var(--color-aura-red)_60%,_transparent)]\'} transition-all`}'
  );
  // Also match the current one that has the text-white fix
  app = app.replace(
    /className={`relative z-10 w-40 h-40 rounded-full flex flex-col items-center justify-center font-black uppercase tracking-widest shadow-\[0_0_40px_color-mix\(in_srgb,_var\(--color-aura-red\)_40%,_transparent\)\] \$\{isPushing \? 'bg-aura-red\/50 text-white cursor-wait' : 'bg-aura-red text-white hover:bg-red-500 hover:shadow-\[0_0_60px_color-mix\(in_srgb,_var\(--color-aura-red\)_60%,_transparent\)\]'\} transition-all`}/,
    'className={`global-push-btn relative z-10 w-40 h-40 rounded-full flex flex-col items-center justify-center font-black uppercase tracking-widest shadow-[0_0_40px_color-mix(in_srgb,_var(--color-aura-red)_40%,_transparent)] ${isPushing ? \'bg-aura-red/50 text-white cursor-wait pushing\' : \'bg-aura-red text-white hover:bg-aura-red/90 hover:shadow-[0_0_60px_color-mix(in_srgb,_var(--color-aura-red)_60%,_transparent)]\'} transition-all`}'
  );
}

// Replace some other borders
app = app.replace(/border-aura-green\/30/g, 'border-aura-dark/50');
app = app.replace(/bg-aura-bg border border-aura-dark text-xs p-2 text-aura-text/g, 'bg-aura-input border border-aura-dark text-xs p-2 text-aura-text');
app = app.replace(/bg-aura-inner border border-aura-dark/g, 'aura-panel-container bg-aura-inner border border-aura-dark shadow-sm rounded-sm');

fs.writeFileSync('src/App.tsx', app);

let css = fs.readFileSync('src/index.css', 'utf-8');

// Insert --theme-aura-input variable
if (!css.includes('--theme-aura-input')) {
  css = css.replace(/:root {/, `:root {
  --theme-aura-input: #000000;`);
}

// Replace the existing .light-mode entirely
let newLightMode = `.light-mode {
  --theme-aura-bg: #F8FAFC; /* Blanco Humo */
  --theme-aura-green: #1E40AF; /* Azul Industrial Profundo */
  --theme-aura-cyan: #1E40AF; 
  --theme-aura-red: #DC2626; /* Rojo solido elegante */
  --theme-aura-dark: #CBD5E1; /* Borde delgado (slate-300) */
  --theme-aura-panel: #F1F5F9; /* Contenedores secundarios (slate-100) */
  --theme-aura-inner: #FFFFFF; /* Paneles blancos limpios */
  --theme-aura-text: #334155; /* Texto oscuro carbón */
  --theme-aura-black: #FFFFFF; /* White fallback */
  --theme-aura-input: #E2E8F0; /* Field backgrounds */
}`;
css = css.replace(/\.light-mode \{[\s\S]*?\}/, newLightMode);

// Appends specific rules for light mode to avoid glows and fix ap unit styles
const specificRules = `
@theme {
  --color-aura-input: var(--theme-aura-input);
}

.light-mode [class*="shadow-[0_0_"] {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1) !important;
}

.light-mode [class*="drop-shadow"] {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1)) !important;
}

.light-mode .aura-panel-container {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05) !important;
  border-radius: 8px !important;
  border: 1px solid #CBD5E1 !important;
}

.light-mode .scada-grid, .light-mode .sandbox-grid {
  background-color: #F8FAFC !important;
  background-image: 
    linear-gradient(rgba(148, 163, 184, 0.15) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.15) 1px, transparent 1px) !important;
  background-size: 20px 20px !important;
}

.light-mode .ap-unit-device {
  background-color: #F1F5F9 !important;
  border: 1px solid #CBD5E1 !important;
  border-radius: 24px !important;
  padding: 16px !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.05) !important;
}

.light-mode .ap-unit-notch {
  background-color: #E2E8F0 !important;
  border: 1px solid #CBD5E1 !important;
  border-top: none !important;
  border-radius: 0 0 12px 12px !important;
  height: 16px !important;
  width: 100px !important;
}

.light-mode .ap-unit-screen {
  background-color: #FFFFFF !important;
  border: 8px solid #0F172A !important; 
  box-shadow: inset 0 4px 6px -1px rgba(0,0,0,0.1) !important;
  border-radius: 12px !important;
}

.light-mode button.commit-btn {
  background-color: #FFFFFF !important;
  color: #1E40AF !important;
  border: 1px solid #1E40AF !important;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
  border-radius: 4px !important;
}
.light-mode button.commit-btn:hover {
  background-color: #F1F5F9 !important;
}

.light-mode .global-push-btn {
  background-color: #DC2626 !important;
  color: #FFFFFF !important;
  border: none !important;
  box-shadow: 0 10px 15px -3px rgba(220, 38, 38, 0.4), 0 4px 6px -4px rgba(220, 38, 38, 0.4) !important;
}
.light-mode .global-push-btn.pushing {
  animation: light-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite !important;
}

@keyframes light-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(0.98);
  }
}
`;

if (!css.includes('.global-push-btn')) {
  css += specificRules;
}

fs.writeFileSync('src/index.css', css);

console.log("Updated UI for Light Mode");
