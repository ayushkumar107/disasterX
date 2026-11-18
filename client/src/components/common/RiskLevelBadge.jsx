import React from 'react';
import { RISK_LEVEL_CONFIG } from '../../types/disaster';

export const RiskLevelBadge = ({ level }) => {
  const config = RISK_LEVEL_CONFIG[level] || { label: level, color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' };
  
  return (
    <span 
      className="px-2 py-0.5 rounded text-[10px] font-semibold border"
      style={{
        backgroundColor: config.bg,
        color: config.color,
        borderColor: `${config.color}33`
      }}
    >
      {config.label}
    </span>
  );
};
