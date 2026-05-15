import fs from 'fs';

let sandbox = fs.readFileSync('src/components/SandboxModule.tsx', 'utf-8');
sandbox = sandbox.replace(/color-mix\(in srgb, var\(--color-aura-green\) (\d+)%, transparent\)/g, 'color-mix(in_srgb,_var(--color-aura-green)_$1%,_transparent)');
fs.writeFileSync('src/components/SandboxModule.tsx', sandbox);

let app = fs.readFileSync('src/App.tsx', 'utf-8');
app = app.replace(/color-mix\(in srgb, var\(--color-aura-red\) (\d+)%, transparent\)/g, 'color-mix(in_srgb,_var(--color-aura-red)_$1%,_transparent)');
fs.writeFileSync('src/App.tsx', app);

console.log("Fixed shadow syntax for tailwind");
