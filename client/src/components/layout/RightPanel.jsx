import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../stores/uiStore';
import { useDisasterStore } from '../../stores/disasterStore';
import { useMapStore } from '../../stores/mapStore';
import { DISASTER_TYPE_CONFIG } from '../../types/disaster';
import { StatusIndicator } from '../common/StatusIndicator';
import { Activity, MapPin, Clock, ChevronRight, Zap, Cpu, HardDrive, Gauge } from 'lucide-react';
export const RightPanel = () => {
  const rightPanelOpen = useUIStore(s => s.rightPanelOpen);
  const disasters = useDisasterStore(s => s.disasters);
  const setSelectedDisaster = useDisasterStore(s => s.setSelectedDisaster);
  const flyTo = useMapStore(s => s.flyTo);
  const activeDisasters = disasters.filter(d => d.status === 'ACTIVE').sort((a, b) => {
    const sevOrder = {
      CRITICAL: 0,
      HIGH: 1,
      MEDIUM: 2,
      LOW: 3
    };
    return (sevOrder[a.severity] ?? 4) - (sevOrder[b.severity] ?? 4);
  }).slice(0, 15);
  const typeDistribution = disasters.reduce((acc, d) => {
    acc[d.type] = (acc[d.type] || 0) + 1;
    return acc;
  }, {});
  return <AnimatePresence>
      {rightPanelOpen && <motion.div initial={{
      x: 320,
      opacity: 0
    }} animate={{
      x: 0,
      opacity: 1
    }} exit={{
      x: 320,
      opacity: 0
    }} transition={{
      type: 'spring',
      damping: 25,
      stiffness: 300
    }} className="fixed right-3 top-14 bottom-20 z-40 w-[300px] overflow-y-auto
            glass-panel-strong p-4 flex flex-col gap-4">
          {/* Active Disasters */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-[var(--color-dx-critical)]" />
                <span className="telemetry-label">ACTIVE DISASTERS</span>
              </div>
              <span className="font-mono text-xs text-[var(--color-dx-cyan)]">{activeDisasters.length}</span>
            </div>

            <div className="flex flex-col gap-1.5 max-h-[280px] overflow-y-auto">
              {activeDisasters.length === 0 ? <div className="text-center py-6 text-[var(--color-dx-muted)] text-xs">
                  No active disasters detected
                </div> : activeDisasters.map(disaster => {
            const typeConfig = DISASTER_TYPE_CONFIG[disaster.type];
            return <button key={disaster._id} onClick={() => {
              setSelectedDisaster(disaster);
              flyTo(disaster.location.coordinates[0], disaster.location.coordinates[1], 8);
            }} className="flex items-start gap-2.5 p-2.5 rounded-lg text-left transition-all
                        hover:bg-[var(--color-dx-surface-hover)] border border-transparent
                        hover:border-[var(--color-dx-border)] group">
                      <span className="text-base mt-0.5">{typeConfig.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-[var(--color-dx-white)] truncate flex-1">
                            {disaster.title}
                          </span>
                          <StatusIndicator severity={disaster.severity} size="sm" />
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-[var(--color-dx-muted)]">
                          <span className="flex items-center gap-1">
                            <MapPin size={9} />
                            {disaster.location.coordinates[1].toFixed(2)}°, {disaster.location.coordinates[0].toFixed(2)}°
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={9} />
                            {new Date(disaster.startDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-[var(--color-dx-muted)] opacity-0
                        group-hover:opacity-100 transition-opacity mt-1" />
                    </button>;
          })}
            </div>
          </div>

          <div className="h-px bg-[var(--color-dx-border)]" />

          {/* Type Distribution */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap size={14} className="text-[var(--color-dx-cyan)]" />
              <span className="telemetry-label">TYPE DISTRIBUTION</span>
            </div>
            <div className="space-y-1.5">
              {Object.entries(typeDistribution).sort(([, a], [, b]) => b - a).slice(0, 6).map(([type, count]) => {
            const config = DISASTER_TYPE_CONFIG[type];
            const max = Math.max(...Object.values(typeDistribution));
            return <div key={type} className="flex items-center gap-2">
                      <span className="text-xs w-16 truncate" style={{
                color: config?.color
              }}>
                        {config?.icon} {config?.label}
                      </span>
                      <div className="flex-1 h-1.5 bg-[var(--color-dx-bg)] rounded-full overflow-hidden">
                        <motion.div initial={{
                  width: 0
                }} animate={{
                  width: `${count / max * 100}%`
                }} className="h-full rounded-full" style={{
                  background: config?.color
                }} />
                      </div>
                      <span className="font-mono text-[10px] text-[var(--color-dx-muted)] w-6 text-right">{count}</span>
                    </div>;
          })}
            </div>
          </div>

          <div className="h-px bg-[var(--color-dx-border)]" />

          {/* System Telemetry */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Cpu size={14} className="text-[var(--color-dx-cyan)]" />
              <span className="telemetry-label">SYSTEM TELEMETRY</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[{
            label: 'DATA FEEDS',
            value: '3/3',
            icon: <Activity size={10} />,
            color: 'var(--color-dx-green)'
          }, {
            label: 'AI SERVICE',
            value: 'READY',
            icon: <Cpu size={10} />,
            color: 'var(--color-dx-cyan)'
          }, {
            label: 'DB STATUS',
            value: 'CONN',
            icon: <HardDrive size={10} />,
            color: 'var(--color-dx-green)'
          }, {
            label: 'LATENCY',
            value: '42ms',
            icon: <Gauge size={10} />,
            color: 'var(--color-dx-teal)'
          }].map(item => <div key={item.label} className="bg-[var(--color-dx-bg)] rounded-lg p-2 border border-[var(--color-dx-border)]">
                  <div className="flex items-center gap-1 mb-1">
                    {item.icon}
                    <span className="telemetry-label">{item.label}</span>
                  </div>
                  <span className="font-mono text-xs" style={{
              color: item.color
            }}>{item.value}</span>
                </div>)}
            </div>
          </div>
        </motion.div>}
    </AnimatePresence>;
};
