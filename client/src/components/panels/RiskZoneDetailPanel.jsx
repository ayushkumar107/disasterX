import React, { useState, useEffect } from 'react';
import { useLandslideStore } from '../../stores/landslideStore';
import { useUIStore } from '../../stores/uiStore';
import { useSOSStore } from '../../stores/sosStore';
import { useDisasterStore } from '../../stores/disasterStore';
import { useWarningStore } from '../../stores/warningStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, X, MapPin, AlertCircle, Compass, Users, Clock, 
  Cpu, Activity, Sliders, Battery, FileText, Landmark, ShieldAlert
} from 'lucide-react';
import { RiskLevelBadge } from '../common/RiskLevelBadge';
import { DataSourceLabel } from '../common/DataSourceLabel';

export const RiskZoneDetailPanel = () => {
  const { selectedZone, setSelectedZone, simulateScenario } = useLandslideStore();
  const { activePanel, setActivePanel } = useUIStore();
  const { sosAlerts, fetchActiveSOS } = useSOSStore();
  const { disasters, fetchDisasters } = useDisasterStore();
  const { warnings, fetchActiveWarnings } = useWarningStore();

  const [rainIncrease, setRainIncrease] = useState(0);
  const [moistureIncrease, setMoistureIncrease] = useState(0);
  const [simulationResult, setSimulationResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const isOpen = selectedZone !== null;

  useEffect(() => {
    setSimulationResult(null);
    setRainIncrease(0);
    setMoistureIncrease(0);
    if (isOpen) {
      fetchActiveSOS();
      fetchDisasters();
      fetchActiveWarnings();
    }
  }, [selectedZone, isOpen]);

  if (!isOpen) return null;

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      const res = await simulateScenario(selectedZone._id, {
        rainfallIncrease: rainIncrease,
        soilMoistureIncrease: moistureIncrease
      });
      setSimulationResult(res);
    } catch (err) {
      console.error(err);
    }
    setIsSimulating(false);
  };

  const currentProb = simulationResult ? simulationResult.result.probability : selectedZone.probability;
  const currentRisk = simulationResult ? simulationResult.result.riskLevel : selectedZone.riskLevel;
  const currentDrivers = simulationResult ? simulationResult.result.riskDrivers : selectedZone.riskDrivers;

  // Dynamic Natural Language Explanation Generator
  const generateExplanation = () => {
    const factors = [];
    if (selectedZone.currentConditions?.rainfall24h > 60) {
      factors.push(`heavy 24h precipitation (${selectedZone.currentConditions.rainfall24h} mm)`);
    }
    if (selectedZone.currentConditions?.soilMoisture > 70) {
      factors.push(`highly saturated soil moisture (${selectedZone.currentConditions.soilMoisture}%)`);
    }
    if (selectedZone.terrain?.avgSlope > 30) {
      factors.push(`steep structural hillslope terrain (${selectedZone.terrain.avgSlope}°)`);
    }
    if (selectedZone.riskDrivers?.historicalSusceptibility > 5) {
      factors.push(`elevated historical landslide occurrences`);
    }

    if (factors.length === 0) {
      return "Current meteorological parameters and sensor observations indicate stable slope integrity under normal threshold levels.";
    }

    return `${factors.slice(0, -1).join(', ')} combined with ${factors.slice(-1)} is exerting significant gravitational shear stress on the local geological formations, increasing landslide vulnerability.`;
  };

  // Nearby active SOS & citizen reports matching coordinates
  const calculateDistance = (coord1, coord2) => {
    if (!coord1 || !coord2) return 999;
    const R = 6371;
    const dLat = (coord2[1] - coord1[1]) * Math.PI / 180;
    const dLng = (coord2[0] - coord1[0]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(coord1[1]*Math.PI/180) * Math.cos(coord2[1]*Math.PI/180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const nearbySOSCount = sosAlerts.filter(sos => {
    const dist = calculateDistance(selectedZone.location.coordinates, sos.location?.coordinates);
    return dist <= 10;
  }).length;

  const nearbyReports = disasters.filter(d => {
    const dist = calculateDistance(selectedZone.location.coordinates, d.location?.coordinates);
    return dist <= 10;
  });

  // Calculate Response Priority Score
  const calculateResponsePriority = () => {
    let score = 0;
    if (currentRisk === 'CRITICAL') score += 40;
    else if (currentRisk === 'HIGH') score += 30;
    else if (currentRisk === 'ELEVATED') score += 20;

    score += (selectedZone.affectedVillages?.length || 0) * 10;
    score += (selectedZone.affectedRoads?.length || 0) * 15;
    score += nearbySOSCount * 25;

    if (score >= 80) return { rank: 'CRITICAL PRIORITY', score };
    if (score >= 50) return { rank: 'HIGH PRIORITY', score };
    return { rank: 'ROUTINE MONITORING', score };
  };

  const responsePriority = calculateResponsePriority();

  // Find linked early warning record
  const activeWarningRecord = warnings.find(w => w.zone === selectedZone._id || w.zone?._id === selectedZone._id);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -320, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -320, scale: 0.95 }}
        className="fixed left-3 top-14 bottom-20 z-50 w-[340px] md:w-[420px] glass-panel-strong border border-[var(--color-dx-cyan)]/30 rounded-xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl text-white font-mono"
      >
        {/* Header */}
        <div className="bg-[rgba(0,240,255,0.08)] px-4 py-3 border-b border-[rgba(0,240,255,0.15)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[rgba(0,240,255,0.15)] text-[var(--color-dx-cyan)]">
              <Shield size={20} />
            </div>
            <div>
              <span className="font-bold text-sm text-white tracking-wide uppercase">
                RISK ZONE INTELLIGENCE
              </span>
              <div className="text-[10px] text-gray-400">
                Explainable Landslide Diagnostics
              </div>
            </div>
          </div>
          <button
            onClick={() => setSelectedZone(null)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-black/20">
          {/* Title Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-500 font-bold uppercase">{selectedZone.zoneId}</span>
              <DataSourceLabel source={selectedZone.dataSource} />
            </div>
            <h3 className="text-base font-bold text-white leading-tight">{selectedZone.name}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <MapPin size={12} className="text-[var(--color-dx-cyan)]" />
              <span>{selectedZone.district}, {selectedZone.state}</span>
            </div>
          </div>

          {/* Risk Level gauge */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest">LANDSLIDE RISK:</span>
              <RiskLevelBadge level={currentRisk} />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Probability:</span>
                <span className="font-bold text-white">{currentProb}%</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${currentProb}%`,
                    background: currentRisk === 'CRITICAL' ? 'var(--color-dx-red)' : currentRisk === 'HIGH' ? 'var(--color-dx-orange)' : 'var(--color-dx-cyan)'
                  }}
                />
              </div>
            </div>

            <div className="flex justify-between text-[9px] text-gray-500">
              <span>Confidence: {selectedZone.confidence || 75}% (Prototype estimate)</span>
              <span>Model: {selectedZone.assessmentModel || 'PROTOTYPE_V1'}</span>
            </div>
          </div>

          {/* WHY THIS AREA IS AT RISK */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
            <div className="text-[10px] text-[var(--color-dx-cyan)] uppercase tracking-widest font-bold">WHY IS THIS AREA AT RISK?</div>
            <p className="text-xs text-gray-300 font-sans leading-relaxed">
              {generateExplanation()}
            </p>
          </div>

          {/* Explainable AI breakdown */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
            <div className="text-[10px] text-gray-400 uppercase tracking-widest">Prototype risk contribution:</div>
            
            <div className="space-y-2">
              {currentDrivers && Object.entries(currentDrivers).map(([driver, val]) => (
                <div key={driver} className="space-y-1">
                  <div className="flex justify-between text-[10px] capitalize">
                    <span className="text-gray-400">{driver.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-white">+{val}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[var(--color-dx-cyan)]/60 rounded-full"
                      style={{ width: `${(val / 25) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rainfall Intelligence */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
            <div className="text-[10px] text-gray-400 uppercase tracking-widest">RAINFALL INTELLIGENCE</div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2 rounded bg-white/5">
                <span className="text-[9px] text-gray-500 block">24h Rainfall</span>
                <span className="text-white font-bold">{selectedZone.currentConditions?.rainfall24h || 0} mm</span>
              </div>
              <div className="p-2 rounded bg-white/5">
                <span className="text-[9px] text-gray-500 block">72h Cumulative</span>
                <span className="text-white font-bold">{selectedZone.currentConditions?.rainfall72h || 0} mm</span>
              </div>
              <div className="p-2 rounded bg-white/5">
                <span className="text-[9px] text-gray-500 block">Anomaly status</span>
                <span className="text-orange-400 font-bold">+126% anomaly</span>
              </div>
              <div className="p-2 rounded bg-white/5">
                <span className="text-[9px] text-gray-500 block">Intensity scale</span>
                <span className="text-white font-bold">{selectedZone.currentConditions?.rainfallIntensity || 'MODERATE'}</span>
              </div>
            </div>
          </div>

          {/* Soil Moisture sensor */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
            <div className="text-[10px] text-gray-400 uppercase tracking-widest">SOIL MOISTURE TELEMETRY</div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2 rounded bg-white/5">
                <span className="text-[9px] text-gray-500 block">Current moisture</span>
                <span className="text-white font-bold">{selectedZone.currentConditions?.soilMoisture || 0}%</span>
              </div>
              <div className="p-2 rounded bg-white/5">
                <span className="text-[9px] text-gray-500 block">Saturation trend</span>
                <span className="text-orange-400 font-bold">{selectedZone.currentConditions?.soilMoistureTrend || 'STABLE'}</span>
              </div>
            </div>
            <div className="text-[9px] text-gray-500">
              Telemetry Trend: 72% → 78% → 84% → {selectedZone.currentConditions?.soilMoisture || 0}%
            </div>
          </div>

          {/* Terrain & Geological details */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
            <div className="text-[10px] text-gray-400 uppercase tracking-widest">TERRAIN & GEOLOGY</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-[10px] text-gray-500">Slope:</span> <span className="text-white">{selectedZone.terrain?.avgSlope || 0}°</span></div>
              <div><span className="text-[10px] text-gray-500">Elevation:</span> <span className="text-white">{selectedZone.terrain?.avgElevation || 0} m</span></div>
              <div><span className="text-[10px] text-gray-500">Aspect:</span> <span className="text-white">{selectedZone.terrain?.aspect || 'N/A'}</span></div>
              <div><span className="text-[10px] text-gray-500">Geology:</span> <span className="text-white truncate block">{selectedZone.terrain?.geologyType || 'N/A'}</span></div>
            </div>
            <span className="text-[9px] text-gray-500 block border-t border-white/5 pt-1">DATA MODE: GIS DATABASE</span>
          </div>

          {/* Satellite Change Analysis */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
            <div className="text-[10px] text-gray-400 uppercase tracking-widest">SATELLITE ANALYSIS</div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">SAR Deformation:</span>
              <span className="text-orange-400 font-bold">DETECTED (12mm/mo)</span>
            </div>
            <span className="text-[9px] text-gray-500 block">SATELLITE DATA: SIMULATION (Sentinel-1 SAR)</span>
          </div>

          {/* Forecast Window */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
            <div className="text-[10px] text-gray-400 uppercase tracking-widest">PROTOTYPE RISK FORECAST</div>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-1 rounded bg-white/5">
                <span className="text-[8px] text-gray-500 block">Current</span>
                <span className="text-white font-bold">{currentProb}%</span>
              </div>
              <div className="p-1 rounded bg-white/5">
                <span className="text-[8px] text-gray-500 block">+12h</span>
                <span className="text-white font-bold">{Math.min(100, currentProb + 4)}%</span>
              </div>
              <div className="p-1 rounded bg-white/5">
                <span className="text-[8px] text-gray-500 block">+24h</span>
                <span className="text-white font-bold">{Math.min(100, currentProb + 8)}%</span>
              </div>
              <div className="p-1 rounded bg-white/5">
                <span className="text-[8px] text-gray-500 block">+48h</span>
                <span className="text-white font-bold">{Math.min(100, currentProb - 3)}%</span>
              </div>
            </div>
          </div>

          {/* Infrastructure exposure lists */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
            <div className="text-[10px] text-gray-400 uppercase tracking-widest">GEOSPATIAL EXPOSURE</div>
            
            {/* Villages */}
            <div className="space-y-1.5 border-b border-white/5 pb-2">
              <span className="text-[10px] text-[var(--color-dx-cyan)] block">VILLAGES POTENTIALLY EXPOSED:</span>
              {selectedZone.affectedVillages && selectedZone.affectedVillages.map(v => (
                <div key={v.name} className="flex justify-between text-xs">
                  <span className="text-white">{v.name}</span>
                  <span className="text-gray-400">Pop: {v.population} | Dist: {v.distance}km</span>
                </div>
              ))}
            </div>

            {/* Roads */}
            <div className="space-y-1.5 border-b border-white/5 pb-2">
              <span className="text-[10px] text-[var(--color-dx-cyan)] block">HIGHWAY SEGMENTS:</span>
              {selectedZone.affectedRoads && selectedZone.affectedRoads.map(r => (
                <div key={r.name} className="flex justify-between text-xs">
                  <span className="text-white">{r.name}</span>
                  <span className="text-orange-400 uppercase">{r.riskStatus || r.roadType}</span>
                </div>
              ))}
            </div>

            {/* Critical Infra */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-[var(--color-dx-cyan)] block">CRITICAL INFRASTRUCTURE:</span>
              {selectedZone.criticalInfrastructure && selectedZone.criticalInfrastructure.map(infra => (
                <div key={infra.name} className="flex justify-between text-xs">
                  <span className="text-white">{infra.name}</span>
                  <span className="text-gray-400">{infra.infraType || 'BRIDGE'} ({infra.distance}km)</span>
                </div>
              )) || <span className="text-xs text-gray-500">None detected within hazard boundary.</span>}
            </div>
          </div>

          {/* Response priority rank */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
            <div className="text-[10px] text-gray-400 uppercase tracking-widest">RESPONSE METRICS</div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Triage Rank:</span>
              <span className="text-red-400 font-bold uppercase">{responsePriority.rank} ({responsePriority.score} pts)</span>
            </div>
          </div>

          {/* Connected SOS list */}
          {nearbySOSCount > 0 && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 space-y-2">
              <div className="text-[10px] text-red-400 font-bold uppercase tracking-widest">⚠️ ACTIVE SOS ALERTS NEARBY</div>
              <div className="text-xs text-white">
                {nearbySOSCount} emergency beacon signal(s) active within 10km radius.
              </div>
            </div>
          )}

          {/* Citizen field reports */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
            <div className="text-[10px] text-gray-400 uppercase tracking-widest">CITIZEN FIELD REPORTS ({nearbyReports.length})</div>
            {nearbyReports.length === 0 ? (
              <div className="text-xs text-gray-500">No field reports submitted for this zone area.</div>
            ) : (
              <div className="space-y-2">
                {nearbyReports.map(rep => (
                  <div key={rep._id} className="p-2 rounded bg-white/5 space-y-1 text-xs">
                    <div className="flex justify-between text-[9px] text-gray-500">
                      <span>{new Date(rep.createdAt).toLocaleTimeString()}</span>
                      <span className="text-cyan-400">{rep.status}</span>
                    </div>
                    <p className="text-white font-bold">{rep.title}</p>
                    <p className="text-gray-400 text-[10px] line-clamp-2">{rep.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Warning link details */}
          {activeWarningRecord && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 space-y-2">
              <div className="text-[10px] text-red-400 font-bold uppercase tracking-widest">🚨 ACTIVE EARLY WARNING ALERT</div>
              <div className="text-xs space-y-1 font-sans">
                <p className="font-mono text-[10px] text-gray-400">Issued: {new Date(activeWarningRecord.issuedAt).toLocaleTimeString()}</p>
                <p className="text-white font-bold">{activeWarningRecord.reason}</p>
              </div>
            </div>
          )}

          {/* Decision support recommendations */}
          <div className="p-4 rounded-xl bg-black/40 border border-[var(--color-dx-cyan)]/25 space-y-3">
            <div className="text-[10px] text-[var(--color-dx-cyan)] uppercase tracking-widest font-bold">AI DECISION-SUPPORT RECOMMENDATIONS</div>
            <ul className="text-xs text-gray-300 space-y-1.5 list-disc pl-4 font-sans font-sans">
              <li>Deploy field geotechnical teams for slope visual audits.</li>
              <li>Pre-position local relief shelters and alert response staging hubs.</li>
              <li>Restrict heavy transport road movements across adjoining highways.</li>
              <li>Continuously pull telemetry metrics on IMD storm warnings.</li>
            </ul>
          </div>

          {/* Transparency Matrix */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2 font-mono text-[10px] text-gray-500">
            <div className="text-gray-400 uppercase tracking-widest border-b border-white/5 pb-1">DATA PROVENANCE MATRIX</div>
            <div className="flex justify-between"><span>Rainfall telemetry</span> <span className="text-orange-400">SIMULATED</span></div>
            <div className="flex justify-between"><span>Soil Saturation IoT</span> <span className="text-orange-400">SIMULATED</span></div>
            <div className="flex justify-between"><span>Terrain geology</span> <span className="text-cyan-400">GIS DATABASE</span></div>
            <div className="flex justify-between"><span>Historical logs</span> <span className="text-cyan-400">DATABASE</span></div>
            <div className="flex justify-between"><span>Satellite SAR index</span> <span className="text-orange-400">SIMULATED</span></div>
          </div>

          {/* Quick interaction buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button 
              onClick={() => setActivePanel('report')}
              className="py-2 text-center rounded bg-white/5 border border-white/10 hover:bg-white/10 text-xs transition-colors"
            >
              Report Condition
            </button>
            <button 
              onClick={() => setActivePanel('shelters')}
              className="py-2 text-center rounded bg-white/5 border border-white/10 hover:bg-white/10 text-xs transition-colors"
            >
              View Shelters
            </button>
          </div>

          {/* What-If simulation interface */}
          <div className="p-4 rounded-xl bg-black/40 border border-[var(--color-dx-cyan)]/25 space-y-3">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 uppercase tracking-widest">
              <Sliders size={14} className="text-[var(--color-dx-cyan)]" />
              <span>What-If Simulation Controls:</span>
            </div>

            <div className="space-y-3.5">
              {/* Rain slide */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Additional Rainfall:</span>
                  <span className="text-[var(--color-dx-cyan)]">+{rainIncrease}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={rainIncrease}
                  onChange={(e) => setRainIncrease(parseInt(e.target.value))}
                  className="w-full accent-[var(--color-dx-cyan)]"
                />
              </div>

              {/* Moisture slide */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Ground Soil Saturation:</span>
                  <span className="text-[var(--color-dx-cyan)]">+{moistureIncrease}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="50" 
                  value={moistureIncrease}
                  onChange={(e) => setMoistureIncrease(parseInt(e.target.value))}
                  className="w-full accent-[var(--color-dx-cyan)]"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSimulate}
                  disabled={isSimulating}
                  className="flex-1 py-2 rounded bg-[var(--color-dx-cyan)]/20 border border-[var(--color-dx-cyan)]/40 hover:bg-[var(--color-dx-cyan)] hover:text-black font-bold text-xs text-[var(--color-dx-cyan)] tracking-wider transition-all disabled:opacity-30"
                >
                  {isSimulating ? 'SIMULATING...' : 'RUN SCENARIO'}
                </button>
                {simulationResult && (
                  <button
                    onClick={() => setSimulationResult(null)}
                    className="px-3 py-2 rounded bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
export default RiskZoneDetailPanel;
