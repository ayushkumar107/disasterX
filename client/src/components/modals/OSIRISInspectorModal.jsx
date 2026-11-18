import React from 'react';
import { useMapStore } from '../../stores/mapStore';
import { 
  X, 
  ShieldAlert, 
  Activity, 
  MapPin, 
  ExternalLink, 
  Radio, 
  Globe, 
  Zap, 
  Cpu, 
  FileText,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const OSIRISInspectorModal = () => {
  const { selectedEntity, setSelectedEntity } = useMapStore();

  if (!selectedEntity) return null;

  const isIncident = selectedEntity.category === 'conflict' || selectedEntity.level;
  const isCable = selectedEntity.capacity || selectedEntity.properties?.capacity;
  const isEarthquake = selectedEntity.type === 'EARTHQUAKE' || selectedEntity.metadata?.magnitude;

  const riskScore = selectedEntity.riskScore || selectedEntity.confidence || (isEarthquake ? Math.min(100, Math.round((selectedEntity.metadata?.magnitude || 5) * 15)) : 75);

  const getRiskColor = (score) => {
    if (score >= 85) return 'text-red-400 bg-red-500/20 border-red-500/40';
    if (score >= 60) return 'text-orange-400 bg-orange-500/20 border-orange-500/40';
    return 'text-cyan-400 bg-cyan-500/20 border-cyan-500/40';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed right-6 bottom-14 z-50 w-[360px] rounded-xl bg-[#050a14]/95 backdrop-blur-xl border border-[#e5b849]/40 p-4 shadow-[0_0_40px_rgba(0,0,0,0.8)] font-mono"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#070e18] border border-[#e5b849]/40 flex items-center justify-center text-[#e5b849]">
              {isCable ? <Zap size={18} /> : isEarthquake ? <Radio size={18} /> : <AlertTriangle size={18} />}
            </div>
            <div>
              <div className="text-[10px] text-[#94a3b8] uppercase tracking-wider">
                {selectedEntity.source || selectedEntity.category || 'TACTICAL ENTITY INSPECTOR'}
              </div>
              <h3 className="text-sm font-bold text-[#e2e8f0] font-osiris leading-tight">
                {selectedEntity.title || selectedEntity.name || selectedEntity.properties?.name || 'Tactical Target'}
              </h3>
            </div>
          </div>

          <button
            onClick={() => setSelectedEntity(null)}
            className="p-1 rounded text-[#64748b] hover:text-[#e5b849] hover:bg-white/5 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-3 text-xs">
          
          {/* Coordinates & Location */}
          <div className="bg-[#03060a] p-2.5 rounded border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-[#00f0ff]" />
              <span className="text-[#94a3b8]">Coordinates</span>
            </div>
            <span className="text-[#00f0ff] font-bold">
              {Array.isArray(selectedEntity.coords) 
                ? `${selectedEntity.coords[1].toFixed(4)}, ${selectedEntity.coords[0].toFixed(4)}`
                : selectedEntity.location?.coordinates 
                  ? `${selectedEntity.location.coordinates[1].toFixed(4)}, ${selectedEntity.location.coordinates[0].toFixed(4)}`
                  : 'Global Sector'}
            </span>
          </div>

          {/* Risk Score & Alert Level */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#03060a] p-2.5 rounded border border-white/10">
              <span className="text-[9px] text-[#64748b] block mb-1">RISK SCORE</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-[#e5b849]">{riskScore}</span>
                <span className="text-[10px] text-[#64748b]">/100</span>
              </div>
            </div>

            <div className="bg-[#03060a] p-2.5 rounded border border-white/10">
              <span className="text-[9px] text-[#64748b] block mb-1">STATUS LEVEL</span>
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getRiskColor(riskScore)}`}>
                {selectedEntity.level || selectedEntity.severity || 'ACTIVE'}
              </span>
            </div>
          </div>

          {/* Machine Assessment / AI intel */}
          <div className="bg-[#03060a] p-2.5 rounded border border-white/10">
            <div className="flex items-center gap-1.5 mb-1.5 text-[#00f0ff]">
              <Cpu size={12} />
              <span className="text-[10px] font-bold tracking-wider">MACHINE ASSESSMENT</span>
            </div>
            <p className="text-[11px] text-[#94a3b8] leading-relaxed">
              {selectedEntity.details || selectedEntity.description || selectedEntity.properties?.details || 'Real-time telemetry parsed via OSIRIS ingestion pipeline. Signal confidence nominal.'}
            </p>
          </div>

          {/* Source Link */}
          {(selectedEntity.sourceUrl || selectedEntity.metadata?.url || selectedEntity.link) && (
            <a
              href={selectedEntity.sourceUrl || selectedEntity.metadata?.url || selectedEntity.link}
              target="_blank"
              rel="noreferrer"
              className="osiris-btn w-full justify-center glow-gold"
            >
              <span>VIEW ORIGINAL SOURCE</span>
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
