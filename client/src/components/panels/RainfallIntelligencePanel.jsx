import React, { useEffect, useState } from 'react';
import { useRainfallStore } from '../../stores/rainfallStore';
import { useUIStore } from '../../stores/uiStore';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudRain, X, AlertTriangle, Compass, Thermometer, Droplets } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DataSourceLabel } from '../common/DataSourceLabel';

export const RainfallIntelligencePanel = () => {
  const { activePanel, setActivePanel } = useUIStore();
  const { rainfallData, fetchRainfallData, fetchRainfallHistory, history, isLoading } = useRainfallStore();
  const [activeZoneId, setActiveZoneId] = useState(null);

  const isOpen = activePanel === 'rainfall';

  useEffect(() => {
    if (isOpen) {
      fetchRainfallData();
    }
  }, [isOpen, fetchRainfallData]);

  useEffect(() => {
    if (activeZoneId) {
      fetchRainfallHistory(activeZoneId, 48);
    }
  }, [activeZoneId, fetchRainfallHistory]);

  if (activePanel !== 'rainfall') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 320, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 320, scale: 0.95 }}
        className="fixed left-2 sm:left-auto right-2 sm:right-3 top-14 bottom-16 sm:bottom-20 z-50 w-auto sm:w-[360px] md:w-[420px] glass-panel-strong border border-[var(--color-dx-cyan)]/30 rounded-xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
      >
        {/* Header */}
        <div className="bg-[rgba(0,240,255,0.08)] px-4 py-3 border-b border-[rgba(0,240,255,0.15)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[rgba(0,240,255,0.15)] text-[var(--color-dx-cyan)]">
              <CloudRain size={20} />
            </div>
            <div>
              <span className="font-bold text-sm text-white tracking-wide font-mono">
                RAINFALL INTELLIGENCE
              </span>
              <div className="text-[10px] font-mono text-gray-400">
                IMD & Open-Meteo Telemetry
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

        {/* Content stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-black/20">
          {isLoading ? (
            <div className="text-center font-mono text-xs text-[var(--color-dx-cyan)] py-8 animate-pulse">
              COLLECTING METEOROLOGICAL TELEMETRY...
            </div>
          ) : rainfallData.length === 0 ? (
            <div className="text-center py-8 font-mono text-xs text-gray-500">
              NO METEOROLOGICAL DATA AVAILABLE
            </div>
          ) : (
            rainfallData.map(obs => {
              const isSelected = activeZoneId === obs.riskZone;
              const isCritical = obs.intensity === 'EXTREME' || obs.intensity === 'VERY_HEAVY';
              const isWarning = obs.intensity === 'HEAVY';
              const intensityColor = isCritical ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-cyan-400';

              return (
                <div 
                  key={obs._id}
                  onClick={() => setActiveZoneId(isSelected ? null : obs.riskZone)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-3 ${
                    isSelected ? 'bg-white/10 border-[var(--color-dx-cyan)]' : 'bg-white/5 border-white/10 hover:bg-white/8.5'
                  }`}
                >
                  {/* Top Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white font-mono">{obs.stationName}</h4>
                      <span className="text-[9px] font-mono text-gray-400 mt-0.5">{obs.district}, {obs.state}</span>
                    </div>
                    <DataSourceLabel source={obs.dataSource} />
                  </div>

                  {/* Rainfall Metrics Summary */}
                  <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
                    <div className="p-1.5 rounded bg-black/35 border border-white/5">
                      <span className="text-[8px] text-gray-400 block">1h</span>
                      <span className="text-xs font-bold text-white">{obs.rainfall1h || 0}mm</span>
                    </div>
                    <div className="p-1.5 rounded bg-black/35 border border-white/5">
                      <span className="text-[8px] text-gray-400 block">6h</span>
                      <span className="text-xs font-bold text-white">{obs.rainfall6h || 0}mm</span>
                    </div>
                    <div className="p-1.5 rounded bg-black/35 border border-white/5">
                      <span className="text-[8px] text-gray-400 block">24h</span>
                      <span className="text-xs font-bold text-white">{obs.rainfall24h || 0}mm</span>
                    </div>
                    <div className="p-1.5 rounded bg-black/35 border border-white/5">
                      <span className="text-[8px] text-gray-400 block">72h</span>
                      <span className="text-xs font-bold text-white">{obs.rainfall72h || 0}mm</span>
                    </div>
                  </div>

                  {/* Info details */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-gray-300">Intensity: <span className={`font-bold font-mono ${intensityColor}`}>{obs.intensity}</span></span>
                    <span className="text-gray-400 font-mono text-[10px]">
                      Temp: {obs.temperature || '--'}°C | Hum: {obs.humidity || '--'}%
                    </span>
                  </div>

                  {/* Historical Comparison Chart */}
                  {isSelected && (
                    <div className="pt-3 border-t border-white/10 space-y-2">
                      <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">48h Accumulation Trend</div>
                      {history && history.length > 0 ? (
                        <div className="h-28 w-full font-mono text-[9px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={history.slice().reverse()}>
                              <XAxis 
                                dataKey="observedAt" 
                                tickFormatter={(str) => new Date(str).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                stroke="#4a5568"
                              />
                              <YAxis stroke="#4a5568" width={20} />
                              <Tooltip 
                                contentStyle={{ background: '#0d1626', border: '1px solid rgba(0,240,255,0.3)', borderRadius: '6px' }}
                                labelFormatter={(label) => new Date(label).toLocaleString()}
                              />
                              <Bar 
                                dataKey="currentRainfall" 
                                fill="var(--color-dx-cyan)" 
                                name="Rainfall (mm/hr)"
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="text-center text-[10px] font-mono text-gray-500 py-4 animate-pulse">
                          Loading historical rainfall logs...
                        </div>
                      )}
                    </div>
                  )}

                  {/* Anomaly Warning Banner */}
                  {obs.anomaly > 30 && (
                    <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-[10px] text-amber-300 font-mono leading-relaxed">
                      <AlertTriangle size={14} className="shrink-0 animate-bounce" />
                      <span>Rainfall is {obs.anomaly}% above historical monsoon baseline limits!</span>
                    </div>
                  )}

                  {/* Provider label */}
                  <div className="flex items-center justify-between text-[9px] font-mono text-gray-500 pt-1 border-t border-white/5">
                    <span>Source: {obs.provider}</span>
                    <span>Observation: {new Date(obs.observedAt).toLocaleTimeString()}</span>
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
export default RainfallIntelligencePanel;
