import fs from 'fs';

const files = ['src/App.tsx', 'src/components/SandboxModule.tsx', 'src/components/EventHorizon.tsx'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');

  // Bump text-[Xpx]
  content = content.replace(/text-\[8px\]/g, 'text-[9px]');
  content = content.replace(/text-\[9px\]/g, 'text-[10px]');
  content = content.replace(/text-\[10px\]/g, 'text-[11px]');
  content = content.replace(/text-\[11px\]/g, 'text-[12px]');
  content = content.replace(/text-xs\b/g, 'text-[13px]');
  content = content.replace(/text-sm\b/g, 'text-[15px]');

  // Bump padding of containers
  content = content.replace(/\bp-4\b/g, 'p-[18px]');
  content = content.replace(/\bp-6\b/g, 'p-[26px]');
  content = content.replace(/\bp-3\b/g, 'p-[14px]');
  content = content.replace(/\bp-2\b/g, 'p-[9px]');

  fs.writeFileSync(file, content);
});

console.log("Bumped typography and padding classes");
