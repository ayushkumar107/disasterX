import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../stores/uiStore';
import { useDisasterStore } from '../../stores/disasterStore';
import { useMapStore } from '../../stores/mapStore';
import { useWeatherStore } from '../../stores/weatherStore';
import { DISASTER_TYPE_CONFIG, SEVERITY_CONFIG } from '../../types/disaster';
import { Layers, Filter, Eye, EyeOff, MapPin, Shield, CloudRain, Home, Radio, Users, Cpu, Route } from 'lucide-react';
import { useLocationStore } from '../../stores/locationStore';
import { useLandslideStore } from '../../stores/landslideStore';
import { useWarningStore } from '../../stores/warningStore';

export const LeftPanel = () => {
  const leftPanelOpen = useUIStore(s => s.leftPanelOpen);
  const {
    filters,
    toggleTypeFilter,
    toggleSeverityFilter
  } = useDisasterStore();
  const {
    showLayers,
    toggleLayer
  } = useMapStore();
  const disasters = useDisasterStore(s => s.disasters);
  const zones = useLandslideStore(s => s.zones);
  const warnings = useWarningStore(s => s.warnings);
  
  const activeCount = warnings.filter(w => w.status === 'ACTIVE').length;
  
  const layers = [{
    key: 'disasters',
    icon: <Radio size={14} />,
    label: 'Disasters',
    color: 'var(--color-dx-red)'
  }, {
    key: 'landslideRiskZones',
    icon: <Shield size={14} />,
    label: 'Landslide Risk Zones',
    color: 'var(--color-dx-orange)'
  }, {
    key: 'rainfallObservations',
    icon: <CloudRain size={14} />,
    label: 'Rainfall Analytics',
    color: 'var(--color-dx-cyan)'
  }, {
    key: 'soilSensors',
    icon: <Cpu size={14} />,
    label: 'Soil IoT Sensors',
    color: 'var(--color-dx-yellow)'
  }, {
    key: 'roadRisks',
    icon: <Route size={14} />,
    label: 'Highway Risk Segments',
    color: 'var(--color-dx-red)'
  }, {
    key: 'shelters',
    icon: <Home size={14} />,
    label: 'Shelters',
    color: 'var(--color-dx-green)'
  }, {
    key: 'sos',
    icon: <Shield size={14} />,
    label: 'SOS Alerts',
    color: 'var(--color-dx-orange)'
  }, {
    key: 'rescueTeams',
    icon: <Users size={14} />,
    label: 'Rescue Teams',
    color: 'var(--color-dx-blue)'
  }, {
    key: 'userLocation',
    icon: <MapPin size={14} />,
    label: 'My Location',
    color: 'var(--color-dx-green)'
  }];
  const toggleWeatherPanel = useWeatherStore((s) => s.togglePanel);
  const flyTo = useMapStore((s) => s.flyTo);

  const handleLayerClick = (key) => {
    toggleLayer(key);
    if (key === 'weather') {
      toggleWeatherPanel();
    }
    if (key === 'userLocation') {
      const userLoc = useLocationStore.getState().userLocation || [92.73, 25.17];
      flyTo(userLoc[0], userLoc[1], 14);
    }
  };

  return <AnimatePresence>
      {leftPanelOpen && <motion.div initial={{
      x: -320,
      opacity: 0
    }} animate={{
      x: 0,
      opacity: 1
    }} exit={{
      x: -320,
      opacity: 0
    }} transition={{
      type: 'spring',
      damping: 25,
      stiffness: 300
    }} className="fixed left-16 top-16 bottom-12 z-40 w-[280px] overflow-y-auto
            glass-panel-strong border-[#e5b849]/30 p-4 flex flex-col gap-4">
          {/* Global Status */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Radio size={14} className="text-[var(--color-dx-cyan)]" />
              <span className="telemetry-label">NER LANDSLIDE STATUS</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[var(--color-dx-bg)] rounded-lg p-2.5 border border-[var(--color-dx-border)]">
                <div className="telemetry-label mb-1">Active Warnings</div>
                <div className="font-mono text-lg text-[var(--color-dx-red)]">{activeCount}</div>
              </div>
              <div className="bg-[var(--color-dx-bg)] rounded-lg p-2.5 border border-[var(--color-dx-border)]">
                <div className="telemetry-label mb-1">Monitoring Zones</div>
                <div className="font-mono text-lg text-[var(--color-dx-cyan)]">
                  {zones.length}
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-[var(--color-dx-border)]" />

          {/* Map Layers */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layers size={14} className="text-[var(--color-dx-cyan)]" />
              <span className="telemetry-label">MAP LAYERS</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {layers.map(layer => <button key={layer.key} onClick={() => handleLayerClick(layer.key)} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all
                    ${showLayers[layer.key] ? 'bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.15)] text-[var(--color-dx-white)]' : 'border border-transparent text-[var(--color-dx-muted)] hover:bg-[var(--color-dx-surface-hover)]'}`}>
                  {showLayers[layer.key] ? <Eye size={13} style={{
              color: layer.color
            }} /> : <EyeOff size={13} />}
                  <span className="flex-1 text-left">{layer.label}</span>
                  <span className="w-2 h-2 rounded-full" style={{
              background: showLayers[layer.key] ? layer.color : 'var(--color-dx-muted)',
              opacity: showLayers[layer.key] ? 1 : 0.3
            }} />
                </button>)}
            </div>
          </div>

          <div className="h-px bg-[var(--color-dx-border)]" />

          {/* Disaster Type Filters */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Filter size={14} className="text-[var(--color-dx-cyan)]" />
              <span className="telemetry-label">DISASTER FILTERS</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(DISASTER_TYPE_CONFIG).map(([type, config]) => {
            const isActive = filters.types.length === 0 || filters.types.includes(type);
            return <button key={type} onClick={() => toggleTypeFilter(type)} className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium
                      transition-all border
                      ${isActive ? 'border-opacity-30 text-white' : 'border-transparent text-[var(--color-dx-muted)] opacity-40 hover:opacity-70'}`} style={{
              borderColor: isActive ? config.color + '4d' : 'transparent',
              background: isActive ? config.color + '1a' : 'transparent'
            }}>
                    <span>{config.icon}</span>
                    <span>{config.label}</span>
                  </button>;
          })}
            </div>
          </div>

          <div className="h-px bg-[var(--color-dx-border)]" />

          {/* Severity Filter */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield size={14} className="text-[var(--color-dx-cyan)]" />
              <span className="telemetry-label">SEVERITY</span>
            </div>
            <div className="flex gap-1.5">
              {Object.entries(SEVERITY_CONFIG).map(([sev, config]) => {
            const isActive = filters.severities.length === 0 || filters.severities.includes(sev);
            return <button key={sev} onClick={() => toggleSeverityFilter(sev)} className={`flex-1 py-1.5 rounded-md text-[10px] font-bold tracking-wider
                      transition-all border
                      ${isActive ? '' : 'opacity-30'}`} style={{
              color: config.color,
              background: isActive ? config.bg : 'transparent',
              borderColor: isActive ? config.color + '4d' : 'transparent'
            }}>
                    {config.label}
                  </button>;
          })}
            </div>
          </div>
        </motion.div>}
    </AnimatePresence>;
};
