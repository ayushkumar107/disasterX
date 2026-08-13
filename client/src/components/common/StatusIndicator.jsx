import React from 'react';
import { SEVERITY_CONFIG } from '../../types/disaster';
export const StatusIndicator = ({
  severity,
  label,
  pulse = false,
  size = 'md'
}) => {
  const config = SEVERITY_CONFIG[severity];
  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };
  const textSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm'
  };
  return <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${textSizes[size]} font-medium tracking-wide`} style={{
    color: config.color,
    background: config.bg,
    border: `1px solid ${config.color}33`
  }}>
      <span className={`${dotSizes[size]} rounded-full ${pulse ? 'animate-blink' : ''}`} style={{
      background: config.color
    }} />
      {label || config.label}
    </span>;
};
