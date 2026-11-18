import React from 'react';

export const DataSourceLabel = ({ source = 'SIMULATED' }) => {
  const configs = {
    LIVE: { label: 'LIVE DATA', color: '#00cc66', bg: 'rgba(0, 204, 102, 0.15)' },
    SIMULATED: { label: 'SIMULATED', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
    HISTORICAL: { label: 'HISTORICAL', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
    DEMO: { label: 'DEMO ONLY', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)' },
    UNAVAILABLE: { label: 'OFFLINE', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' }
  };

  const config = configs[source] || configs.SIMULATED;

  return (
    <span 
      className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider border align-middle inline-block"
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
export default DataSourceLabel;
