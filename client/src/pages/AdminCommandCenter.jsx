import React, { useEffect, useState } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { useWarningStore } from '../stores/warningStore';
import { useLandslideStore } from '../stores/landslideStore';
import { useSensorStore } from '../stores/sensorStore';
import { ShieldAlert, Cpu, Activity, Sliders, Users, FileText } from 'lucide-react';
import api from '../services/api';
import { RiskLevelBadge } from '../components/common/RiskLevelBadge';
import { DataSourceLabel } from '../components/common/DataSourceLabel';

export const AdminCommandCenter = () => {
  const { warnings, fetchActiveWarnings } = useWarningStore();
  const { zones, fetchZones } = useLandslideStore();
  const { sensors, fetchSensors } = useSensorStore();
  
  const [priorityQueue, setPriorityQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchActiveWarnings();
    fetchZones();
    fetchSensors();

    const fetchQueue = async () => {
      try {
        const res = await api.get('/landslide/priority/sos');
        setPriorityQueue(res.data.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchQueue();
  }, []);

  const triggerManualEvaluation = async () => {
    setIsLoading(true);
    try {
      await api.post('/landslide/evaluate');
      fetchZones();
      fetchActiveWarnings();
      alert('Risk recalculation and warning check successfully triggered!');
    } catch (e) {
      alert('Evaluation trigger failed.');
    }
    setIsLoading(false);
  };

  return (
    <div className="h-screen w-screen bg-[var(--color-dx-bg)] flex flex-col overflow-hidden text-white font-mono">
      <TopBar />
      
      {/* Admin dashboard layout */}
      <div className="flex-1 p-6 mt-12 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-6 custom-scrollbar">
        {/* Left Column - Active Warnings List */}
        <div className="glass-panel-strong p-4 flex flex-col h-[calc(100vh-100px)] overflow-hidden">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10 shrink-0">
            <span className="font-bold text-sm text-[var(--color-dx-cyan)] flex items-center gap-2">
              <ShieldAlert size={18} />
              ACTIVE WARNING LOG
            </span>
            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
              {warnings.length} alerts
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
            {warnings.map(w => (
              <div key={w._id} className="p-3 rounded bg-white/5 border border-white/10 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded">
                    {w.warningLevel}
                  </span>
                  <DataSourceLabel source={w.dataSources?.[0]} />
                </div>
                <h4 className="text-xs font-bold text-white">{w.zone?.name || `${w.district}, ${w.state}`}</h4>
                <p className="text-[11px] text-gray-400 font-sans leading-relaxed">{w.reason}</p>
                <div className="text-[9px] text-gray-500 pt-1 border-t border-white/5 flex justify-between">
                  <span>Prob: {w.probability}%</span>
                  <span>Issued: {new Date(w.issuedAt).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Column - Risk Zones Priority Triage */}
        <div className="glass-panel-strong p-4 flex flex-col h-[calc(100vh-100px)] overflow-hidden">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10 shrink-0">
            <span className="font-bold text-sm text-[var(--color-dx-cyan)] flex items-center gap-2">
              <Activity size={18} />
              RISK TRIAGE STATUS
            </span>
            <button 
              onClick={triggerManualEvaluation}
              disabled={isLoading}
              className="text-xs bg-[var(--color-dx-cyan)]/20 border border-[var(--color-dx-cyan)]/40 hover:bg-[var(--color-dx-cyan)] hover:text-black px-3 py-1 rounded transition-all"
            >
              {isLoading ? 'CALCULATING...' : 'FORCE RECALC'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
            {zones.map(zone => (
              <div key={zone._id} className="p-3 rounded bg-white/5 border border-white/10 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-white">{zone.name}</h4>
                  <span className="text-[9px] text-gray-500">{zone.district}, {zone.state}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-orange-400 block">{zone.probability}%</span>
                  <RiskLevelBadge level={zone.riskLevel} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Dispatch Priority Queue */}
        <div className="glass-panel-strong p-4 flex flex-col h-[calc(100vh-100px)] overflow-hidden">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10 shrink-0">
            <span className="font-bold text-sm text-[var(--color-dx-cyan)] flex items-center gap-2">
              <Users size={18} />
              DISPATCH PRIORITY QUEUE
            </span>
            <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded">
              {priorityQueue.length} pending
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
            {priorityQueue.map((item, idx) => (
              <div key={item._id} className="p-3 rounded bg-white/5 border border-red-500/25 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-red-400 font-bold">Rank #{idx+1}</span>
                  <span className="text-[10px] text-red-400 font-bold">Score: {item.priorityScore}</span>
                </div>
                <p className="text-[11px] text-gray-300 font-sans">{item.description || 'Emergency SOS signal received'}</p>
                <div className="flex justify-between text-[9px] text-gray-500 pt-1 border-t border-white/5">
                  <span>People: {item.numberOfPeople}</span>
                  <span>Coords: {item.location.coordinates[1].toFixed(4)}, {item.location.coordinates[0].toFixed(4)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminCommandCenter;
