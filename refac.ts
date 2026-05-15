import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Insert imports
content = content.replace(
  "import { AuraLogo } from './components/AuraLogo';",
  "import { AuraLogo } from './components/AuraLogo';\nimport { TacticalGrid } from './components/TacticalGrid';\nimport { CreativeLab } from './components/CreativeLab';\nimport { Orchester } from './components/Orchester';\nimport { StaffManagement } from './components/StaffManagement';"
);

// Remove TacticalGrid, CreativeLab, Orchester
const mod1Start = content.indexOf('/* --- MÓDULO 1: Tactical Grid --- */');
const liveMirrorStart = content.indexOf('function LiveMirrorDrawer');
if (mod1Start !== -1 && liveMirrorStart !== -1) {
  content = content.slice(0, mod1Start) + content.slice(liveMirrorStart);
}

// Remove CustomChartTooltip
const tooltipStart = content.indexOf('const CustomChartTooltip =');
const tooltipEnd = content.indexOf('/* --- REUSABLE UI COMPONENTS --- */');
if (tooltipStart !== -1 && tooltipEnd !== -1) {
  content = content.slice(0, tooltipStart) + content.slice(tooltipEnd);
}

// Remove StaffManagement
const mod4Start = content.indexOf('/* --- MÓDULO 4: Staff & NFC Management --- */');
if (mod4Start !== -1) {
  content = content.slice(0, mod4Start);
}

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx refactored!');
