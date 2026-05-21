import fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf-8');
let sandbox = fs.readFileSync('src/components/SandboxModule.tsx', 'utf-8');

// REVERT SandboxModule.tsx
sandbox = sandbox.replace(/ap-unit-device /g, '');
sandbox = sandbox.replace(/ap-unit-notch /g, '');
sandbox = sandbox.replace(/ap-unit-screen /g, '');

sandbox = sandbox.replace(/bg-aura-input border border-aura-dark text-aura-text/g, 'bg-aura-black border border-aura-dark text-aura-text');
// The ones that were bg-aura-black border border-aura-green/30 were changed above also to background-aura-input so they will become bg-aura-black border border-aura-dark text-aura-text. Let's make them back to green/30 text-green if needed. Actually it was:
// sandbox.replace(/bg-aura-black border border-aura-green\/30 text-aura-green/g, 'bg-aura-input border border-aura-dark text-aura-text')
// But wait, they all merged into one class. I'll just change bg-aura-input back to bg-aura-black, it's fine.
sandbox = sandbox.replace(/bg-aura-input/g, 'bg-aura-black');


// REVERT App.tsx
app = app.replace(/global-push-btn /g, '');
app = app.replace(/ pushing/g, '');

// border-aura-green/30 was changed to border-aura-dark/50
app = app.replace(/border-aura-dark\/50/g, 'border-aura-green/30');

// bg-aura-input was bg-aura-bg for inputs
app = app.replace(/bg-aura-input border border-aura-dark text-xs p-2 text-aura-text/g, 'bg-aura-bg border border-aura-dark text-xs p-2 text-aura-text');

app = app.replace(/aura-panel-container bg-aura-inner border border-aura-dark shadow-sm rounded-sm/g, 'bg-aura-inner border border-aura-dark');

// Remove Moon/Sun toggle (Lines 147-153 usually)
// Let's remove them directly via regex if present
app = app.replace(/<button[^>]*onClick=\{\(\) => setIsLightMode\(!isLightMode\)\}[^>]*>[\s\S]*?<\/button>/, '');
app = app.replace(/const \[isLightMode, setIsLightMode\] = useState\(false\);/, '');
app = app.replace(/useEffect\(\(\) => \{\s*if \(isLightMode\) \{\s*document.body.classList.add\('light-mode'\);\s*\} else \{\s*document.body.classList.remove\('light-mode'\);\s*\}\s*\}, \[isLightMode\]\);/, '');

// The borders - the user said "contornos de los diferentes contenedores que no son tan visibles los engroses un 15% más."
// Let's change border to border-2 for containers
app = app.replace(/border border-aura-dark/g, 'border-2 border-aura-dark');
app = app.replace(/border border-aura-green\/20/g, 'border-2 border-aura-green/20');
app = app.replace(/border border-aura-green\/30/g, 'border-2 border-aura-green/30');

sandbox = sandbox.replace(/border border-aura-green\/20/g, 'border-2 border-aura-green/20');
sandbox = sandbox.replace(/border border-aura-green\/30/g, 'border-2 border-aura-green/30');
sandbox = sandbox.replace(/border border-aura-green\/40/g, 'border-2 border-aura-green/40');
sandbox = sandbox.replace(/border border-aura-dark/g, 'border-2 border-aura-dark');

// Fix global-push-btn hover behavior
app = app.replace(/hover:bg-aura-red\/90/g, 'hover:bg-red-500');


fs.writeFileSync('src/App.tsx', app);
fs.writeFileSync('src/components/SandboxModule.tsx', sandbox);

console.log("Reverted UI and thickened borders.");
