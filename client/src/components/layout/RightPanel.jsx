import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../stores/uiStore';
import { useDisasterStore } from '../../stores/disasterStore';
import { useMapStore } from '../../stores/mapStore';
import { DISASTER_TYPE_CONFIG } from '../../types/disaster';
import { StatusIndicator } from '../common/StatusIndicator';
import { useWarningStore } from '../../stores/warningStore';
import { useLandslideStore } from '../../stores/landslideStore';
import { Activity, MapPin, Clock, ChevronRight, Zap, Cpu, HardDrive, Gauge, Shield, X } from 'lucide-react';
export const RightPanel = () => {
  const rightPanelOpen = useUIStore(s => s.rightPanelOpen);
  const toggleRightPanel = useUIStore(s => s.toggleRightPanel);
  const disasters = useDisasterStore(s => s.disasters);
  const setSelectedDisaster = useDisasterStore(s => s.setSelectedDisaster);
  const flyTo = useMapStore(s => s.flyTo);
  const warnings = useWarningStore(s => s.warnings);
  const zones = useLandslideStore(s => s.zones);
  const setSelectedZone = useLandslideStore(s => s.setSelectedZone);

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

  const activeWarnings = warnings.filter(w => w.status === 'ACTIVE');

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
    }} className="fixed right-2 sm:right-3 top-14 sm:top-16 bottom-16 sm:bottom-12 z-40 w-[calc(100vw-1rem)] sm:w-[300px] max-w-sm overflow-y-auto
            glass-panel-strong border-[#e5b849]/30 p-3 sm:p-4 flex flex-col gap-4">
          {/* Active warnings and alerts */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-[var(--color-dx-critical)]" />
                <span className="telemetry-label">EARLY WARNING ALERTS</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[var(--color-dx-cyan)]">
                  {activeWarnings.length}
                </span>
                <button
                  onClick={toggleRightPanel}
                  className="sm:hidden p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white"
                  title="Close Drawer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto custom-scrollbar">
              {activeWarnings.length === 0 ? (
                <div className="text-center py-4 text-[var(--color-dx-muted)] text-xs font-mono">
                  NO ACTIVE WARNINGS
                </div>
              ) : (
                activeWarnings.map(w => (
                  <button 
                    key={w._id}
                    onClick={() => {
                      if (w.location?.coordinates) {
                        flyTo(w.location.coordinates[0], w.location.coordinates[1], 10);
                      }
                    }}
                    className="flex flex-col gap-1 p-2 rounded bg-white/5 border border-red-500/20 text-left hover:bg-white/10 transition-all"
                  >
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-red-400 font-bold">{w.warningLevel}</span>
                      <span className="text-gray-500">{new Date(w.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <span className="text-xs text-white font-mono truncate">{w.zone?.name || `${w.district}, ${w.state}`}</span>
                    <span className="text-[10px] text-gray-400 line-clamp-1">{w.reason}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="h-px bg-[var(--color-dx-border)]" />

          {/* Active Risk Zones */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-[var(--color-dx-cyan)]" />
                <span className="telemetry-label">NER RISK ZONES</span>
              </div>
              <span className="font-mono text-xs text-[var(--color-dx-cyan)]">{zones.length}</span>
            </div>

            <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto custom-scrollbar">
              {zones.length === 0 ? (
                <div className="text-center py-4 text-[var(--color-dx-muted)] text-xs font-mono">
                  NO RISK ZONES LOADED
                </div>
              ) : (
                zones.map(zone => {
                  const color = zone.riskLevel === 'CRITICAL' ? 'text-red-400' : zone.riskLevel === 'HIGH' ? 'text-orange-400' : 'text-cyan-400';
                  return (
                    <button
                      key={zone._id}
                      onClick={() => {
                        setSelectedZone(zone);
                        flyTo(zone.location.coordinates[0], zone.location.coordinates[1], 10);
                      }}
                      className="flex items-start justify-between p-2 rounded bg-white/5 border border-white/5 hover:bg-white/10 text-left transition-all group"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-white block truncate">{zone.name}</span>
                        <span className="text-[9px] font-mono text-gray-500 block">{zone.district}, {zone.state}</span>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <span className={`text-xs font-mono font-bold ${color}`}>{zone.probability}%</span>
                        <span className="text-[8px] font-mono text-gray-500 block uppercase">{zone.riskLevel}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="h-px bg-[var(--color-dx-border)]" />

          {/* Landslide System Telemetry */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Cpu size={14} className="text-[var(--color-dx-cyan)]" />
              <span className="telemetry-label">NER IOT NETWORK</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[{
                label: 'IoT SENSORS',
                value: '9/9 ACTIVE',
                icon: <Activity size={10} />,
                color: 'var(--color-dx-green)'
              }, {
                label: 'IMD STATIONS',
                value: 'ONLINE',
                icon: <Cpu size={10} />,
                color: 'var(--color-dx-cyan)'
              }, {
                label: 'SAR SATELLITE',
                value: '10m RES',
                icon: <HardDrive size={10} />,
                color: 'var(--color-dx-green)'
              }, {
                label: 'RISK RUNS',
                value: '15m INTERVAL',
                icon: <Gauge size={10} />,
                color: 'var(--color-dx-teal)'
              }].map(item => (
                <div key={item.label} className="bg-[var(--color-dx-bg)] rounded-lg p-2 border border-[var(--color-dx-border)]">
                  <div className="flex items-center gap-1 mb-1">
                    {item.icon}
                    <span className="telemetry-label">{item.label}</span>
                  </div>
                  <span className="font-mono text-xs" style={{ color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>}
    </AnimatePresence>;
};
