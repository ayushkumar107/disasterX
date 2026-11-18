import React from 'react';
import { useWarningStore } from '../../stores/warningStore';
import { AlertTriangle, X } from 'lucide-react';
import { WARNING_LEVEL_CONFIG } from '../../types/disaster';

export const WarningBanner = () => {
  const { warnings } = useWarningStore();
  const activeWarning = warnings.find(w => w.status === 'ACTIVE' && w.warningLevel === 'CRITICAL_WARNING');

  if (!activeWarning) return null;

  const config = WARNING_LEVEL_CONFIG[activeWarning.warningLevel];

  return (
    <div 
      className="fixed top-12 left-0 right-0 z-50 px-4 py-2 flex items-center justify-between text-xs font-mono border-b animate-pulse"
      style={{
        backgroundColor: 'rgba(239, 68, 68, 0.95)',
        color: '#ffffff',
        borderColor: '#ef4444'
      }}
    >
      <div className="flex items-center gap-2">
        <AlertTriangle size={16} />
        <span className="font-bold">CRITICAL WARNING:</span>
        <span>{activeWarning.reason}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded">
          Probability: {activeWarning.probability}%
        </span>
      </div>
    </div>
  );
};
export default WarningBanner;
