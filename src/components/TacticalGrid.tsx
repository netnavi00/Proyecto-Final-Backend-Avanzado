import React from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import type { TableData, StaffData } from '../App';
import { supabase } from '../services/supabase';

export function TacticalGrid({ tables, staffList, onTableSelect, onAddTable, onRemoveTable }: { tables: TableData[], staffList: StaffData[], onTableSelect: (id: string) => void, onAddTable: () => void, onRemoveTable: (id: string) => void }) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-[18px] shrink-0">
        <h2 className="text-[13px] font-bold flex items-center gap-[9px]">
          <span className="w-1 h-3 bg-aura-green"></span>
          TACTICAL ARRAY
          <button onClick={onAddTable} className="ml-4 px-2 py-1 text-[12px] border-2 border-aura-green text-aura-green hover:bg-aura-green/20 uppercase tracking-widest transition-colors">
            + Add Node
          </button>
        </h2>
        <div className="flex gap-[18px] text-[12px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-aura-green"></span> ONLINE</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-aura-red"></span> ALERT</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-aura-cyan"></span> PROMO</span>
        </div>
      </div>
      
      <div className="scada-grid grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-[35px] flex-1 p-[18px] overflow-y-auto">
        {tables.map(table => (
          <TableNode 
            key={table.id} 
            table={table} 
            staff={staffList.find(s => s.id === table.staffId)}
            onSelect={() => onTableSelect(table.id)} 
            onRemove={() => onRemoveTable(table.id)}
          />
        ))}
      </div>
    </div>
  );
}

export const TableNode: React.FC<{ table: TableData, staff?: StaffData, onSelect: () => void, onRemove: () => void }> = ({ table, staff, onSelect, onRemove }) => {
  let ringClasses = "border-aura-green";
  let OuterRingMotion = {};
  let colorValue = "var(--color-aura-green)";

  if (table.status === 'alert') {
    ringClasses = "border-aura-red";
    OuterRingMotion = { opacity: [1, 0.2, 1], transition: { repeat: Infinity, duration: 0.8 } };
    colorValue = "var(--color-aura-red)";
  } else if (table.status === 'promo') {
    ringClasses = "border-aura-cyan";
    colorValue = "var(--color-aura-cyan)";
  } else if (table.status === 'admin') {
    ringClasses = "border-purple-500 overflow-hidden";
    colorValue = "#a855f7";
  }

  // Use base border for offline (though mocked data uses online/promo/alert)
  if (table.status === 'offline') {
    ringClasses = "border-aura-dark";
    colorValue = "var(--color-aura-dark)";
  }

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length > 1) return parts[0][0] + parts[1][0];
    return parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <div className="relative group cursor-pointer w-[75%] mx-auto" onClick={onSelect}>
      <button 
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute -top-3 -right-3 z-30 p-1 bg-aura-dark border-2 border-aura-red text-aura-red opacity-0 group-hover:opacity-100 transition-opacity hover:bg-aura-red hover:text-aura-text rounded-full"
      >
        <X size={10} />
      </button>

      {staff && (
        <div className="absolute -bottom-3 -left-3 z-30 w-6 h-6 rounded-full bg-aura-panel border-2 border-aura-cyan/50 flex items-center justify-center text-[12px] font-bold text-aura-cyan shadow-[0_0_10px_rgba(0,229,255,0.2)]">
          {getInitials(staff.name)}
        </div>
      )}

      <motion.div 
        className={`absolute -inset-1 rounded-lg border-2 ${ringClasses} opacity-80 overflow-hidden`}
        animate={OuterRingMotion}
      >
        {table.status === 'admin' && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="absolute -inset-8 bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,rgba(168,85,247,0.8)_360deg)] pointer-events-none"
          />
        )}
      </motion.div>
      <div className="bg-aura-bg p-[9px] h-full flex flex-col items-center justify-center gap-1 relative z-10 transition-colors hover:brightness-125 min-h-[70px]">
        <span className={`text-[12px] opacity-40 uppercase ${table.status === 'admin' ? 'text-purple-500' : table.status === 'promo' ? 'text-aura-cyan' : ''}`}>
          {table.status === 'admin' ? 'ADMIN MODE' : table.status === 'promo' ? 'PROMO ACTIVE' : (staff?.name || 'UNASSIGNED')}
        </span>
        <span className={`text-[22px] font-bold ${table.status === 'offline' ? 'text-aura-dark' : 'text-aura-text'}`}>
          {table.name}
        </span>
        <div 
          className="w-1 h-1 rounded-full mt-1" 
          style={{ backgroundColor: colorValue, boxShadow: `0 0 5px ${colorValue}` }} 
        />
      </div>
    </div>
  );
}
