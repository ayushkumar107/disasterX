import React, { useEffect } from 'react';
import { useWarningStore } from '../../stores/warningStore';
import { useUIStore } from '../../stores/uiStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X, AlertTriangle, CheckCircle, Navigation, Users } from 'lucide-react';
import { WARNING_LEVEL_CONFIG } from '../../types/disaster';
import { DataSourceLabel } from '../common/DataSourceLabel';

export const EarlyWarningPanel = () => {
  const { activePanel, setActivePanel } = useUIStore();
  const { warnings, fetchActiveWarnings, isLoading } = useWarningStore();
  
  const isOpen = activePanel === 'warnings' || activePanel === 'route'; // also show during route operations if needed, but primary is warnings panel

  useEffect(() => {
    if (isOpen) {
      fetchActiveWarnings();
    }
  }, [isOpen, fetchActiveWarnings]);

  if (activePanel !== 'warnings') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 320, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 320, scale: 0.95 }}
        className="fixed right-3 top-14 bottom-20 z-50 w-[340px] md:w-[420px] glass-panel-strong border border-[var(--color-dx-cyan)]/30 rounded-xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
      >
        {/* Header */}
        <div className="bg-[rgba(0,240,255,0.08)] px-4 py-3 border-b border-[rgba(0,240,255,0.15)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[rgba(239,68,68,0.15)] text-[var(--color-dx-critical)] border border-red-500/30">
              <ShieldAlert size={20} className="animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-sm text-white tracking-wide font-mono">
                EARLY WARNING SYSTEM
              </span>
              <div className="text-[10px] font-mono text-gray-400">
                NER Real-Time Trigger Monitoring
              </div>
            </div>
          </div>
          <button
            onClick={() => setActivePanel(null)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-black/20">
          {isLoading ? (
            <div className="text-center font-mono text-xs text-[var(--color-dx-cyan)] py-8 animate-pulse">
              READING SENSOR THRESHOLDS & SIMULATING RUNS...
            </div>
          ) : warnings.length === 0 ? (
            <div className="text-center py-8 font-mono text-xs text-gray-500">
              ✅ NO ACTIVE WARNING TRIGGERS DETECTED
            </div>
          ) : (
            warnings.map(warning => {
              const config = WARNING_LEVEL_CONFIG[warning.warningLevel] || { color: '#ffffff', bg: 'rgba(255,255,255,0.1)' };
              return (
                <div 
                  key={warning._id}
                  className="p-4 rounded-xl bg-white/5 border hover:bg-white/10 transition-all space-y-3"
                  style={{ borderColor: `${config.color}40` }}
                >
                  {/* Warning Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span 
                        className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-mono border"
                        style={{ backgroundColor: config.bg, color: config.color, borderColor: `${config.color}33` }}
                      >
                        {warning.warningLevel.replace('_', ' ')}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1.5 font-mono">
                        {warning.zone?.name || `${warning.district}, ${warning.state}`}
                      </h4>
                    </div>
                    <DataSourceLabel source={warning.dataSources?.[0]} />
                  </div>

                  {/* Reason Text */}
                  <p className="text-xs text-gray-300 leading-relaxed font-sans">
                    {warning.reason}
                  </p>

                  {/* Triggers grid */}
                  {warning.triggers && warning.triggers.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Active Triggers:</div>
                      <div className="grid grid-cols-2 gap-2">
                        {warning.triggers.map((t, idx) => (
                          <div key={idx} className="p-2 rounded bg-black/30 border border-white/5 flex flex-col">
                            <span className="text-[9px] font-mono text-gray-400 capitalize">{t.factor}</span>
                            <span className="text-xs font-bold text-white mt-0.5">{t.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended actions */}
                  {warning.recommendedActions && warning.recommendedActions.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Action Protocol:</div>
                      <ul className="space-y-1">
                        {warning.recommendedActions.map((act, idx) => (
                          <li key={idx} className="text-xs text-gray-400 flex items-start gap-1.5">
                            <CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" />
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users size={10} /> Affected Pop: {warning.estimatedAffectedPopulation?.toLocaleString() || 'Unknown'}
                    </span>
                    <span>Valid: 24h</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
export default EarlyWarningPanel;
