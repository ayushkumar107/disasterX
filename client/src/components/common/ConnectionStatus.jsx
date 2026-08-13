import React from 'react';
import { useUIStore } from '../../stores/uiStore';
import { Wifi, WifiOff } from 'lucide-react';
export const ConnectionStatus = () => {
  const isOnline = useUIStore(s => s.isOnline);
  return <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-mono tracking-wider
      ${isOnline ? 'text-[var(--color-dx-green)] bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)]' : 'text-[var(--color-dx-critical)] bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)]'}`}>
      {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
      <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
    </div>;
};
