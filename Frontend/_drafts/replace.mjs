import fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf-8');
// For Recharts colors, we can literally use 'var(--color-aura-green)' inside the JS strings.
app = app.replace(/\'#00ff41\'/g, '\'var(--color-aura-green)\'');
app = app.replace(/\'#050505\'/g, '\'var(--color-aura-bg)\'');
app = app.replace(/#00e5ff1a/g, 'rgba(var(--color-aura-cyan-rgb), 0.1)'); // Need to extract rgb if we do this, or just leave it for now (cyan doesn't change)
fs.writeFileSync('src/App.tsx', app);

let sandbox = fs.readFileSync('src/components/SandboxModule.tsx', 'utf-8');
sandbox = sandbox.replace(/bg-\[\#050505\]/g, 'bg-aura-bg');
fs.writeFileSync('src/components/SandboxModule.tsx', sandbox);

console.log('Replaced colors');
