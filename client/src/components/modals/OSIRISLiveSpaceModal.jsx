import React, { useState } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { 
  X, 
  Satellite, 
  Globe, 
  Radio, 
  ExternalLink, 
  RefreshCw, 
  Layers, 
  Compass, 
  Eye, 
  Activity 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SPACE_MODES = [
  {
    id: 'live-satellite',
    title: 'Geostationary Live Satellite (Earth from Space)',
    subtitle: 'Real-time geostationary infrared & visible satellite imagery',
    type: 'radar',
    embedUrl: 'https://embed.windy.com/embed2.html?lat=25&lon=92&zoom=3&level=surface&overlay=satellite&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1',
    directUrl: 'https://www.star.nesdis.noaa.gov/GOES/'
  },
  {
    id: 'nasa-tv',
    title: 'NASA TV Official Live Broadcast',
    subtitle: 'Continuous NASA mission control & space operations broadcast',
    type: 'youtube',
    embedUrl: 'https://www.youtube-nocookie.com/embed/21X5lGlDOfg?autoplay=1&mute=1&controls=1&rel=0',
    directUrl: 'https://www.nasa.gov/live'
  },
  {
    id: 'sen-4k',
    title: 'Sen 4K Live Earth Views (ISS)',
    subtitle: 'High-resolution continuous Earth orbit footage from space',
    type: 'youtube',
    embedUrl: 'https://www.youtube-nocookie.com/embed/fO9e9jnhYK8?autoplay=1&mute=1&controls=1&rel=0',
    directUrl: 'https://sen.com'
  }
];

export const OSIRISLiveSpaceModal = () => {
  const activePanel = useUIStore((s) => s.activePanel);
  const setActivePanel = useUIStore((s) => s.setActivePanel);
  const [selectedMode, setSelectedMode] = useState(SPACE_MODES[0]);
  const [refreshKey, setRefreshKey] = useState(0);

  if (activePanel !== 'live_space') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md"
      >
        <div className="w-full max-w-4xl rounded-2xl bg-[#050a14] border border-[#00f0ff]/40 p-4 shadow-[0_0_50px_rgba(0,240,255,0.25)] font-mono flex flex-col gap-3">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-[#070e18] border border-[#00f0ff]/50 flex items-center justify-center text-[#00f0ff] glow-cyan-sm">
                <Satellite size={20} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white tracking-wider font-osiris">
                    LIVE FROM SPACE • REAL-TIME EARTH OBSERVATION
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-emerald-500 text-black font-mono">
                    LIVE ORBIT
                  </span>
                </div>
                <span className="text-[10px] text-[#94a3b8]">
                  GEOSTATIONARY SATELLITE RADAR & ORBITAL TELEMETRY MATRIX
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setRefreshKey(k => k + 1)}
                title="Refresh Stream"
                className="p-1.5 rounded text-[#94a3b8] hover:text-[#00f0ff] hover:bg-white/10 transition-colors"
              >
                <RefreshCw size={17} />
              </button>
              <button
                onClick={() => setActivePanel(null)}
                className="p-1.5 rounded text-[#64748b] hover:text-[#00f0ff] hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {SPACE_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode)}
                className={`p-2 rounded-lg border text-left transition-all text-xs ${
                  selectedMode.id === mode.id
                    ? 'bg-[#00f0ff]/15 border-[#00f0ff] text-white shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="font-bold text-[11px] truncate text-[#00f0ff]">{mode.title}</div>
                <div className="text-[9px] text-[#94a3b8] truncate mt-0.5">{mode.subtitle}</div>
              </button>
            ))}
          </div>

          {/* Video / Satellite Player Container */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 bg-black shadow-inner">
            <iframe
              key={`${selectedMode.id}-${refreshKey}`}
              src={selectedMode.embedUrl}
              title={selectedMode.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
            <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded border border-white/10 text-[9px] text-gray-300 pointer-events-none flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>ACTIVE FEED: {selectedMode.title}</span>
            </div>
          </div>

          {/* Telemetry Footer */}
          <div className="flex flex-wrap items-center justify-between px-3 py-2 rounded bg-[#03060a] border border-white/10 text-[11px] gap-2">
            <div className="flex items-center gap-4 text-[#94a3b8]">
              <div>
                <span className="text-[#64748b]">ALTITUDE:</span> <span className="text-[#00f0ff] font-bold">422 KM</span>
              </div>
              <div>
                <span className="text-[#64748b]">ORBIT SPEED:</span> <span className="text-[#00ff66] font-bold">27,580 KM/H</span>
              </div>
              <div>
                <span className="text-[#64748b]">INCLINATION:</span> <span className="text-[#e5b849] font-bold">51.64°</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={selectedMode.directUrl}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded bg-[#00f0ff]/15 border border-[#00f0ff]/40 text-[#00f0ff] hover:bg-[#00f0ff]/25 text-[10px] inline-flex items-center gap-1.5 transition-colors font-bold"
              >
                <span>OPEN OFFICIAL PORTAL</span>
                <ExternalLink size={12} />
              </a>
              <a
                href="https://www.nasa.gov/live"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded bg-white/5 border border-white/15 text-gray-300 hover:text-white hover:bg-white/10 text-[10px] inline-flex items-center gap-1.5 transition-colors"
              >
                <span>NASA LIVE HUB</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};
