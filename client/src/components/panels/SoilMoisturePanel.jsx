import React, { useEffect, useState } from 'react';
import { useSensorStore } from '../../stores/sensorStore';
import { useUIStore } from '../../stores/uiStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, X, Battery, Activity, ShieldAlert, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { DataSourceLabel } from '../common/DataSourceLabel';

export const SoilMoisturePanel = () => {
  const { activePanel, setActivePanel } = useUIStore();
  const { sensors, fetchSensors, fetchSensorReadings, selectedSensorHistory, isLoading } = useSensorStore();
  const [activeSensorId, setActiveSensorId] = useState(null);

  const isOpen = activePanel === 'sensors';

  useEffect(() => {
    if (isOpen) {
      fetchSensors();
    }
  }, [isOpen, fetchSensors]);

  useEffect(() => {
    if (activeSensorId) {
      fetchSensorReadings(activeSensorId, 24);
    }
  }, [activeSensorId, fetchSensorReadings]);

  if (activePanel !== 'sensors') return null;

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
              <Cpu size={20} />
            </div>
            <div>
              <span className="font-bold text-sm text-white tracking-wide font-mono">
                SOIL MOISTURE SENSORS
              </span>
              <div className="text-[10px] font-mono text-gray-400">
                IoT Ground Saturation Network
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
              CONNECTING TO IoT GATEWAYS...
            </div>
          ) : sensors.length === 0 ? (
            <div className="text-center py-8 font-mono text-xs text-gray-500">
              NO IoT SENSORS DETECTED
            </div>
          ) : (
            sensors.map(sensor => {
              const isSelected = activeSensorId === sensor.sensorId;
              const isCritical = sensor.currentStatus === 'CRITICAL';
              const isWarning = sensor.currentStatus === 'WARNING';
              const statusColor = isCritical ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-green-500';

              return (
                <div 
                  key={sensor._id}
                  onClick={() => setActiveSensorId(isSelected ? null : sensor.sensorId)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-3 ${
                    isSelected ? 'bg-white/10 border-[var(--color-dx-cyan)]' : 'bg-white/5 border-white/10 hover:bg-white/8.5'
                  }`}
                >
                  {/* Top line */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white font-mono">{sensor.name}</h4>
                      <span className="text-[9px] font-mono text-gray-400 mt-0.5">{sensor.sensorId} | Depth: {sensor.depth}cm</span>
                    </div>
                    <DataSourceLabel source={sensor.dataSource} />
                  </div>

                  {/* Telemetry dashboard */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded bg-black/35 border border-white/5">
                      <span className="text-[9px] font-mono text-gray-400 block">Moisture</span>
                      <span className={`text-sm font-mono font-bold ${statusColor}`}>{sensor.currentMoisture}%</span>
                    </div>
                    <div className="p-2 rounded bg-black/35 border border-white/5">
                      <span className="text-[9px] font-mono text-gray-400 block">Trend</span>
                      <span className="text-xs font-mono font-bold text-white flex items-center justify-center gap-0.5 mt-0.5">
                        {sensor.trend === 'INCREASING' || sensor.trend === 'RAPIDLY_INCREASING' ? (
                          <TrendingUp size={12} className="text-red-400" />
                        ) : (
                          <TrendingDown size={12} className="text-green-400" />
                        )}
                        <span className="text-[10px]">{sensor.trend.replace('_', ' ')}</span>
                      </span>
                    </div>
                    <div className="p-2 rounded bg-black/35 border border-white/5">
                      <span className="text-[9px] font-mono text-gray-400 block">Status</span>
                      <span className={`text-[10px] font-bold uppercase font-mono ${statusColor} block mt-0.5`}>
                        {sensor.currentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Recharts Chart */}
                  {isSelected && (
                    <div className="pt-3 border-t border-white/10 space-y-2">
                      <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">24h Moisture Level History</div>
                      {selectedSensorHistory?.readings ? (
                        <div className="h-28 w-full font-mono text-[9px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={selectedSensorHistory.readings.slice().reverse()}>
                              <XAxis 
                                dataKey="readingAt" 
                                tickFormatter={(str) => new Date(str).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                stroke="#4a5568"
                              />
                              <YAxis domain={[0, 100]} stroke="#4a5568" width={20} />
                              <Tooltip 
                                contentStyle={{ background: '#0d1626', border: '1px solid rgba(0,240,255,0.3)', borderRadius: '6px' }}
                                labelFormatter={(label) => new Date(label).toLocaleString()}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="moisture" 
                                stroke="var(--color-dx-cyan)" 
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="text-center text-[10px] font-mono text-gray-500 py-4 animate-pulse">
                          Fetching IoT logs...
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer status line */}
                  <div className="flex items-center justify-between text-[9px] font-mono text-gray-500 pt-1 border-t border-white/5">
                    <span className="flex items-center gap-1">
                      <Battery size={10} className="text-green-500" /> Battery: {sensor.batteryLevel || 100}%
                    </span>
                    <span>Last reading: {sensor.lastReading ? new Date(sensor.lastReading).toLocaleTimeString() : 'Unknown'}</span>
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
export default SoilMoisturePanel;
