import React, { useState } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { useMapStore } from '../../stores/mapStore';
import { useDisasterStore } from '../../stores/disasterStore';
import { 
  Flame, 
  ShieldAlert, 
  Camera, 
  Plane, 
  Rocket, 
  Video, 
  Palette, 
  Route, 
  Radio, 
  Zap, 
  X, 
  Eye, 
  Check, 
  ChevronRight,
  Globe,
  Cpu,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const OSIRISSystemDrawer = () => {
  const { activePanel, setActivePanel } = useUIStore();
  const { showLayers, toggleLayer, selectedEntity, setSelectedEntity } = useMapStore();
  const disasters = useDisasterStore((s) => s.disasters);

  const [activeCategory, setActiveCategory] = useState('hazards');

  if (activePanel !== 'system_drawer') return null;

  const categories = [
    { id: 'hazards', label: 'NATURAL HAZARDS', icon: <Flame size={16} /> },
    { id: 'intel', label: 'THREATS & INTEL', icon: <ShieldAlert size={16} /> },
    { id: 'surveillance', label: 'SURVEILLANCE', icon: <Camera size={16} /> },
    { id: 'aviation', label: 'AVIATION', icon: <Plane size={16} /> },
    { id: 'space', label: 'SPACE TRACKING', icon: <Rocket size={16} /> },
    { id: 'live_space', label: 'LIVE FROM SPACE', icon: <Video size={16} /> },
    { id: 'style', label: 'STYLE STUDIO', icon: <Palette size={16} /> },
    { id: 'routes', label: 'ROUTES', icon: <Route size={16} /> }
  ];

  const mapStyles = [
    { id: 'carto_dark', label: 'CARTO Dark Matter (Tactical Vector)', url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json' },
    { id: 'sat', label: 'ESRI Satellite World Imagery', raster: true },
    { id: 'midnight', label: 'CARTO Midnight Blue', url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json' }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: -400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -400, opacity: 0 }}
        className="fixed left-16 top-16 bottom-12 z-40 w-[360px] rounded-2xl bg-[#050a14]/95 backdrop-blur-xl border border-[#e5b849]/40 p-4 shadow-[0_0_40px_rgba(0,0,0,0.8)] font-mono flex flex-col gap-3"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Eye size={18} className="text-[#00f0ff]" />
            <span className="text-xs font-bold text-[#00f0ff] font-osiris tracking-wider">
              DISASTERLINK INTELLIGENCE SERVICES
            </span>
          </div>

          <button
            onClick={() => setActivePanel(null)}
            className="p-1 rounded text-[#64748b] hover:text-[#e5b849] hover:bg-white/5 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-2 gap-1 bg-[#03060a] p-1 rounded-lg border border-white/10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                if (cat.id === 'live_space') {
                  setActivePanel('live_space');
                } else if (cat.id === 'surveillance') {
                  setActivePanel('cctv');
                }
              }}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded text-[10px] font-bold transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#e5b849]/20 border border-[#e5b849]/50 text-[#e5b849]'
                  : 'text-[#94a3b8] hover:bg-white/5 hover:text-white'
              }`}
            >
              {cat.icon}
              <span className="truncate">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Category Tab Contents */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
          
          {/* NATURAL HAZARDS */}
          {activeCategory === 'hazards' && (
            <div className="space-y-2">
              <div className="text-[10px] text-[#64748b] font-bold">ACTIVE HAZARD FEEDS</div>
              
              <div className="flex flex-col gap-1.5">
                {[
                  { key: 'earthquakes', label: 'USGS Real-time Earthquakes', count: disasters.filter(d => d.type === 'EARTHQUAKE').length || 29, color: 'text-orange-400' },
                  { key: 'weather', label: 'NASA EONET Storms & Typhoons', count: disasters.filter(d => d.type === 'CYCLONE').length || 12, color: 'text-cyan-400' },
                  { key: 'disasters', label: 'GDACS Floods & Droughts', count: disasters.filter(d => d.type === 'FLOOD').length || 18, color: 'text-emerald-400' },
                  { key: 'landslideRiskZones', label: 'Landslide Risk Zones', count: 12, color: 'text-red-400' }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => toggleLayer(item.key)}
                    className="flex items-center justify-between p-2.5 rounded bg-[#03060a] border border-white/10 hover:border-[#e5b849]/40 text-left transition-all"
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`w-2 h-2 rounded-full ${showLayers[item.key] ? 'bg-[#00ff66]' : 'bg-gray-600'}`} />
                      <span className="text-white">{item.label}</span>
                    </div>
                    <span className={`text-xs font-bold ${item.color}`}>{item.count} LIVE</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* THREATS & INTEL */}
          {activeCategory === 'intel' && (
            <div className="space-y-2">
              <div className="text-[10px] text-[#64748b] font-bold">GLOBAL INTEL & FRONTLINES</div>

              <div className="flex flex-col gap-1.5">
                {[
                  { key: 'global_incidents', label: 'Active Warzones & Red Sea Threat', count: 15, color: 'text-red-400' },
                  { key: 'cables', label: 'Subsea Fiber Optic Network', count: '5 LINES', color: 'text-cyan-400' },
                  { key: 'roadRisks', label: 'GPS Jamming & EW Zones', count: 'ELEVATED', color: 'text-amber-400' }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => toggleLayer(item.key)}
                    className="flex items-center justify-between p-2.5 rounded bg-[#03060a] border border-white/10 hover:border-[#e5b849]/40 text-left transition-all"
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`w-2 h-2 rounded-full ${showLayers[item.key] ? 'bg-[#00ff66]' : 'bg-gray-600'}`} />
                      <span className="text-white">{item.label}</span>
                    </div>
                    <span className={`text-xs font-bold ${item.color}`}>{item.count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SURVEILLANCE */}
          {activeCategory === 'surveillance' && (
            <div className="space-y-3 text-center py-4">
              <Camera size={32} className="mx-auto text-[#00f0ff] animate-pulse" />
              <div className="text-xs text-white font-bold">GLOBAL CCTV OPTICAL MATRIX</div>
              <p className="text-[10px] text-gray-400">View real-time public city webcams from Tokyo, New York, London, Venice & Singapore.</p>
              <button
                onClick={() => setActivePanel('cctv')}
                className="osiris-btn glow-cyan w-full justify-center"
              >
                OPEN CCTV SURVEILLANCE VIEWER
              </button>
            </div>
          )}

          {/* AVIATION */}
          {activeCategory === 'aviation' && (
            <div className="space-y-2">
              <div className="text-[10px] text-[#64748b] font-bold">AIR TRAFFIC & FLIGHT TRACKING</div>
              
              <div className="p-3 rounded bg-[#03060a] border border-white/10 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Commercial Flights:</span>
                  <span className="text-[#00f0ff] font-bold">12,480 TRACKED</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Military Recon Aircraft:</span>
                  <span className="text-amber-400 font-bold">142 ACTIVE</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">ADS-B Coverage:</span>
                  <span className="text-emerald-400 font-bold">99.4% GLOBAL</span>
                </div>
              </div>
            </div>
          )}

          {/* SPACE TRACKING */}
          {activeCategory === 'space' && (
            <div className="space-y-2">
              <div className="text-[10px] text-[#64748b] font-bold">SATELLITE & ISS ORBIT DATA</div>

              <div className="p-3 rounded bg-[#03060a] border border-white/10 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">ISS Space Station:</span>
                  <span className="text-[#00ff66] font-bold">ORBIT 418 KM</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Starlink Constellation:</span>
                  <span className="text-[#00f0ff] font-bold">6,240 ACTIVE</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">NOAA Weather Sats:</span>
                  <span className="text-[#e5b849] font-bold">OPERATIONAL</span>
                </div>
              </div>
            </div>
          )}

          {/* LIVE FROM SPACE */}
          {activeCategory === 'live_space' && (
            <div className="space-y-3 text-center py-4">
              <Video size={32} className="mx-auto text-[#e5b849] animate-pulse" />
              <div className="text-xs text-white font-bold">NASA ISS LIVE HD STREAM</div>
              <p className="text-[10px] text-gray-400">Watch live 24/7 HD video streaming directly from the International Space Station.</p>
              <button
                onClick={() => setActivePanel('live_space')}
                className="osiris-btn glow-gold w-full justify-center"
              >
                LAUNCH NASA ISS LIVE FEED
              </button>
            </div>
          )}

          {/* STYLE STUDIO */}
          {activeCategory === 'style' && (
            <div className="space-y-2">
              <div className="text-[10px] text-[#64748b] font-bold">MAP STYLE STUDIO</div>
              
              <div className="flex flex-col gap-1.5">
                {mapStyles.map((style) => (
                  <button
                    key={style.id}
                    className="p-2.5 rounded bg-[#03060a] border border-white/10 hover:border-[#e5b849]/50 text-left text-xs text-white font-bold flex items-center justify-between"
                  >
                    <span>{style.label}</span>
                    <Check size={14} className="text-[#e5b849]" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ROUTES */}
          {activeCategory === 'routes' && (
            <div className="space-y-2">
              <div className="text-[10px] text-[#64748b] font-bold">EVACUATION & DISPATCH ROUTES</div>
              <p className="text-[10px] text-gray-400">Real-time shortest path routing away from active landslide hazards and flood zones.</p>
              <button
                onClick={() => setActivePanel('priority')}
                className="osiris-btn glow-cyan w-full justify-center"
              >
                OPEN DISPATCH PRIORITY PANEL
              </button>
            </div>
          )}

        </div>
      </motion.div>
    </AnimatePresence>
  );
};
