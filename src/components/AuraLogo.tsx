import React from 'react';

export function AuraLogo({ className = "", size = 48 }: { className?: string; size?: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="6" 
      strokeLinecap="square" 
      strokeLinejoin="miter"
      className={className}
    >
      {/* Outer Hexagon */}
      <polygon points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" />
      
      {/* Center Vertical Line */}
      <line x1="50" y1="5" x2="50" y2="95" />
      
      {/* Internal Geometry simulating the logo */}
      <line x1="10" y1="27.5" x2="50" y2="50" />
      <line x1="25" y1="65" x2="50" y2="50" />
      <line x1="25" y1="20" x2="25" y2="65" />
      
      <line x1="90" y1="27.5" x2="50" y2="50" />
      <line x1="75" y1="35" x2="75" y2="80" />
      <line x1="90" y1="72.5" x2="50" y2="50" />
    </svg>
  );
}
