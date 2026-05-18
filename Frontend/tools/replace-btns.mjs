import fs from 'fs';

let sandbox = fs.readFileSync('src/components/SandboxModule.tsx', 'utf-8');

// Commit Database Button
sandbox = sandbox.replace(
  /className="bg-aura-green\/10 border border-aura-green px-4 py-2 text-xs flex items-center gap-2 hover:bg-aura-green\/20 hover:shadow-\[0_0_15px_rgba\(0,255,0,0\.3\)\] transition-all font-bold tracking-widest uppercase disabled:opacity-50"/g,
  'className="commit-btn bg-aura-green/10 border border-aura-green px-4 py-2 text-xs flex items-center gap-2 hover:bg-aura-green/20 hover:shadow-[0_0_15px_rgba(0,255,0,0.3)] transition-all font-bold tracking-widest uppercase disabled:opacity-50"'
);

// SYNC TO PREVIEW buttons
sandbox = sandbox.replace(
  /className="mt-2 text-\[9px\] uppercase border border-aura-green\/30 hover:bg-aura-green\/10 py-1"/g,
  'className="commit-btn w-full mt-2 text-[9px] uppercase border border-aura-green/30 hover:bg-aura-green/10 py-1"'
);

sandbox = sandbox.replace(
  /className="w-full mt-2 text-\[9px\] uppercase border border-aura-green\/30 hover:bg-aura-green\/10 py-1"/g,
  'className="commit-btn w-full mt-2 text-[9px] uppercase border border-aura-green/30 hover:bg-aura-green/10 py-1"'
);

sandbox = sandbox.replace(
  /h-full w-full flex flex-col font-mono text-\[\#00ff00\] bg-black/g,
  'sandbox-grid h-full w-full flex flex-col font-mono text-aura-green bg-aura-bg'
);

sandbox = sandbox.replace(
  /h-full w-full flex flex-col font-mono text-aura-green bg-aura-black relative overflow-hidden"/g,
  'sandbox-grid h-full w-full flex flex-col font-mono text-aura-green bg-aura-bg relative overflow-hidden"'
);

fs.writeFileSync('src/components/SandboxModule.tsx', sandbox);
console.log("Processed SandboxModule");
