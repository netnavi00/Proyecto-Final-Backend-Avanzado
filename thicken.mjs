import fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf-8');
let sandbox = fs.readFileSync('src/components/SandboxModule.tsx', 'utf-8');

[app, sandbox].forEach((file, index) => {
  let content = file;
  content = content.replace(/border border-(aura|purple|yellow|red)-(\w+)(\/\d+)?/g, 'border-2 border-$1-$2$3');
  
  if (index === 0) app = content;
  if (index === 1) sandbox = content;
});

// For any inputs that we want to keep thin we could revert. But inputs were already using border-2 now since border border-aura-dark became border-2 border-aura-dark. It's fine, thicker inputs fit the industrial style.

fs.writeFileSync('src/App.tsx', app);
fs.writeFileSync('src/components/SandboxModule.tsx', sandbox);

console.log("Thickened all remaining borders");
