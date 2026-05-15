import fs from 'fs';

const files = ['src/App.tsx', 'src/components/SandboxModule.tsx', 'src/components/EventHorizon.tsx'];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf-8');

  // Bump gaps and margins
  content = content.replace(/\bgap-2\b/g, 'gap-[9px]');
  content = content.replace(/\bgap-3\b/g, 'gap-[14px]');
  content = content.replace(/\bgap-4\b/g, 'gap-[18px]');
  content = content.replace(/\bgap-6\b/g, 'gap-[26px]');
  content = content.replace(/\bgap-8\b/g, 'gap-[35px]');

  content = content.replace(/\bmt-2\b/g, 'mt-[9px]');
  content = content.replace(/\bmt-3\b/g, 'mt-[14px]');
  content = content.replace(/\bmt-4\b/g, 'mt-[18px]');
  content = content.replace(/\bmb-2\b/g, 'mb-[9px]');
  content = content.replace(/\bmb-3\b/g, 'mb-[14px]');
  content = content.replace(/\bmb-4\b/g, 'mb-[18px]');

  fs.writeFileSync(file, content);
});

console.log("Bumped gaps and margins");
