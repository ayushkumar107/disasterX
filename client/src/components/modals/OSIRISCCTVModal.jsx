import React, { useState } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { 
  X, 
  Camera, 
  Globe, 
  MapPin, 
  RefreshCw, 
  ExternalLink, 
  Radio, 
  ShieldAlert,
  Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CCTV_CAMERAS = [
  {
    id: 'cctv-town-square',
    title: 'Town Square Public CCTV (Jackson Hole)',
    region: 'Jackson Hole, WY, USA',
    coords: [-110.7624, 43.4799],
    embedUrl: 'https://www.youtube-nocookie.com/embed/1EiC9bvVGnk?autoplay=1&mute=1&controls=1&rel=0',
    directUrl: 'https://www.youtube.com/watch?v=1EiC9bvVGnk',
    description: 'Active 24/7 street-level optical surveillance of municipal intersection and pedestrian traffic.'
  },
  {
    id: 'cctv-nyc-radar',
    title: 'New York Metro Doppler & Traffic Matrix',
    region: 'New York, USA',
    coords: [-74.0060, 40.7128],
    embedUrl: 'https://embed.windy.com/embed2.html?lat=40.71&lon=-74.00&zoom=8&level=surface&overlay=radar&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1',
    directUrl: 'https://webcams.nyctmc.org/',
    description: 'Real-time urban surveillance radar with access to over 900+ municipal traffic feeds.'
  },
  {
    id: 'cctv-tokyo-metro',
    title: 'Tokyo Metropolitan Transit Matrix',
    region: 'Tokyo, Japan',
    coords: [139.6917, 35.6895],
    embedUrl: 'https://embed.windy.com/embed2.html?lat=35.68&lon=139.75&zoom=8&level=surface&overlay=radar&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1',
    directUrl: 'https://www.jartic.or.jp/',
    description: 'High-density urban transit radar covering Tokyo Expressway and central districts.'
  },
  {
    id: 'cctv-london-matrix',
    title: 'London Greater Metropolitan Radar',
    region: 'London, UK',
    coords: [-0.1276, 51.5074],
    embedUrl: 'https://embed.windy.com/embed2.html?lat=51.50&lon=-0.12&zoom=8&level=surface&overlay=radar&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1',
    directUrl: 'https://www.tfl.gov.uk/traffic/status/',
    description: 'Metropolitan transport surveillance monitoring London orbital arterial corridors.'
  }
];

export const OSIRISCCTVModal = () => {
  const activePanel = useUIStore((s) => s.activePanel);
  const setActivePanel = useUIStore((s) => s.setActivePanel);
  const [selectedCam, setSelectedCam] = useState(CCTV_CAMERAS[0]);
  const [refreshKey, setRefreshKey] = useState(0);

  if (activePanel !== 'cctv') return null;

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
                <Camera size={20} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#00f0ff] tracking-wider font-osiris">
                    SURVEILLANCE • MUNICIPAL & TRAFFIC CCTV FEEDS
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-emerald-500 text-black">
                    STREAM ONLINE
                  </span>
                </div>
                <span className="text-[10px] text-[#94a3b8]">
                  REAL-TIME OPTICAL CAMERAS & URBAN SURVEILLANCE SENSORS
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

          {/* Camera Selector Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {CCTV_CAMERAS.map((cam) => (
              <button
                key={cam.id}
                onClick={() => setSelectedCam(cam)}
                className={`p-2 rounded-lg border text-left transition-all text-xs ${
                  selectedCam.id === cam.id
                    ? 'bg-[#00f0ff]/15 border-[#00f0ff] text-white shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="font-bold text-[11px] truncate text-[#e2e8f0]">{cam.title}</div>
                <div className="text-[9px] text-[#00f0ff] mt-0.5">{cam.region}</div>
              </button>
            ))}
          </div>

          {/* Video / Camera Player */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 bg-black shadow-inner">
            <iframe
              key={`${selectedCam.id}-${refreshKey}`}
              src={selectedCam.embedUrl}
              title={selectedCam.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
            <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded border border-white/10 text-[9px] text-gray-300 pointer-events-none flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>ONLINE: {selectedCam.title}</span>
            </div>
          </div>

          {/* Camera Telemetry & Portals Footer */}
          <div className="flex flex-wrap items-center justify-between px-3 py-2 rounded bg-[#03060a] border border-white/10 text-[11px] gap-2">
            <div className="flex items-center gap-4 text-[#94a3b8]">
              <div className="flex items-center gap-1.5">
                <MapPin size={13} className="text-[#00f0ff]" />
                <span className="text-[#e2e8f0] font-bold">{selectedCam.region}</span>
              </div>
              <div>
                <span className="text-[#64748b]">LAT/LNG:</span> <span className="text-[#00f0ff] font-bold">{selectedCam.coords[1]}, {selectedCam.coords[0]}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={selectedCam.directUrl}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded bg-[#00f0ff]/15 border border-[#00f0ff]/40 text-[#00f0ff] hover:bg-[#00f0ff]/25 text-[10px] inline-flex items-center gap-1.5 transition-colors font-bold"
              >
                <span>OPEN OFFICIAL PORTAL</span>
                <ExternalLink size={12} />
              </a>
              <a
                href="https://webcams.nyctmc.org/"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded bg-white/5 border border-white/15 text-gray-300 hover:text-white hover:bg-white/10 text-[10px] inline-flex items-center gap-1.5 transition-colors hidden sm:inline-flex"
              >
                <span>NYC TRAFFIC MATRIX</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};
