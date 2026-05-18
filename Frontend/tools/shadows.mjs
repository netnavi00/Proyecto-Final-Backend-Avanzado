import fs from 'fs';

let sandbox = fs.readFileSync('src/components/SandboxModule.tsx', 'utf-8');

sandbox = sandbox.replace(/rgba\(0,255,0,0\.05\)/g, 'color-mix(in srgb, var(--color-aura-green) 5%, transparent)');
sandbox = sandbox.replace(/rgba\(0,255,0,0\.1\)/g, 'color-mix(in srgb, var(--color-aura-green) 10%, transparent)');
sandbox = sandbox.replace(/rgba\(0,255,0,0\.2\)/g, 'color-mix(in srgb, var(--color-aura-green) 20%, transparent)');
sandbox = sandbox.replace(/rgba\(0,255,0,0\.3\)/g, 'color-mix(in srgb, var(--color-aura-green) 30%, transparent)');
sandbox = sandbox.replace(/rgba\(0,255,0,0\.4\)/g, 'color-mix(in srgb, var(--color-aura-green) 40%, transparent)');
sandbox = sandbox.replace(/rgba\(0,255,0,0\.8\)/g, 'color-mix(in srgb, var(--color-aura-green) 80%, transparent)');
sandbox = sandbox.replace(/border-4 border-black/g, 'border-4 border-aura-bg'); // Make sure spinner center adapts to light mode background

fs.writeFileSync('src/components/SandboxModule.tsx', sandbox);

let app = fs.readFileSync('src/App.tsx', 'utf-8');
// Fix Red shadows to adapt if we change --color-aura-red
app = app.replace(/rgba\(255,0,60,0\.4\)/g, 'color-mix(in srgb, var(--color-aura-red) 40%, transparent)');
app = app.replace(/rgba\(255,0,60,0\.5\)/g, 'color-mix(in srgb, var(--color-aura-red) 50%, transparent)');
app = app.replace(/rgba\(255,0,60,0\.6\)/g, 'color-mix(in srgb, var(--color-aura-red) 60%, transparent)');

fs.writeFileSync('src/App.tsx', app);

console.log("Processed shadows with color-mix");
