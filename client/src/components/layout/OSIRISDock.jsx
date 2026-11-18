import React from 'react';
import { useUIStore } from '../../stores/uiStore';
import { useMapStore } from '../../stores/mapStore';
import { useWeatherStore } from '../../stores/weatherStore';
import { useSOSStore } from '../../stores/sosStore';
import { useAuthStore } from '../../stores/authStore';
import { useChatStore } from '../../stores/chatStore';
import { useLocationStore } from '../../stores/locationStore';
import { 
  Layers, 
  Activity, 
  Radio, 
  Bot, 
  CloudRain, 
  Cpu, 
  FileWarning, 
  AlertTriangle, 
  Globe, 
  Camera, 
  Video,
  Rss, 
  Anchor, 
  Zap,
  Shield,
  MessageSquare,
  Navigation
} from 'lucide-react';
import { motion } from 'framer-motion';

export const OSIRISDock = () => {
  const { activePanel, setActivePanel, leftPanelOpen, toggleLeftPanel } = useUIStore();
  const { showLayers, toggleLayer } = useMapStore();
  const toggleWeatherPanel = useWeatherStore((s) => s.togglePanel);
  const setSOSModalOpen = useSOSStore((s) => s.setModalOpen);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { isOpen: isChatOpen, toggleOpen: toggleChat, unreadCount } = useChatStore();
  const routeToNearestShelter = useLocationStore((s) => s.routeToNearestShelter);
  const activeRoute = useLocationStore((s) => s.activeRoute);

  const dockButtons = [
    {
      id: 'system_menu',
      icon: <Globe size={18} />,
      label: 'DisasterLink Intelligence Menu',
      active: activePanel === 'system_drawer',
      onClick: () => setActivePanel(activePanel === 'system_drawer' ? null : 'system_drawer'),
      badge: 'MENU'
    },
    {
      id: 'shelter_route',
      icon: <Navigation size={18} className={activeRoute ? 'text-[#00ff66] animate-pulse' : 'text-[#00ff66]'} />,
      label: activeRoute ? 'Stop Safe Shelter Navigation' : '🧭 Safest Route to Nearest Shelter',
      active: activeRoute !== null,
      onClick: () => routeToNearestShelter(),
      badge: activeRoute ? 'ACTIVE' : 'ROUTE'
    },
    {
      id: 'chat',
      icon: <MessageSquare size={18} className="text-[#00f0ff]" />,
      label: 'Emergency & Community Chat',
      active: isChatOpen,
      onClick: () => toggleChat(),
      badge: unreadCount > 0 ? `${unreadCount}` : 'LIVE'
    },
    {
      id: 'live_space',
      icon: <Video size={18} />,
      label: 'LIVE FROM SPACE (NASA ISS Views)',
      active: activePanel === 'live_space',
      onClick: () => setActivePanel('live_space')
    },
    {
      id: 'cctv',
      icon: <Camera size={18} />,
      label: 'Surveillance CCTV Feeds',
      active: activePanel === 'cctv',
      onClick: () => setActivePanel('cctv')
    },
    {
      id: 'layers',
      icon: <Layers size={18} />,
      label: 'Map Layers Drawer',
      active: leftPanelOpen,
      onClick: () => toggleLeftPanel()
    },
    {
      id: 'earthquakes',
      icon: <Radio size={18} />,
      label: 'Live Earthquakes & Incidents',
      active: showLayers.disasters,
      onClick: () => toggleLayer('disasters'),
      badge: 'LIVE'
    },
    {
      id: 'weather',
      icon: <CloudRain size={18} />,
      label: 'Weather & Severe Storms',
      active: showLayers.weather,
      onClick: () => {
        toggleLayer('weather');
        toggleWeatherPanel();
      }
    },
    {
      id: 'cables',
      icon: <Zap size={18} />,
      label: 'Subsea Cables & Net Lines',
      active: showLayers.roadRisks,
      onClick: () => toggleLayer('roadRisks')
    },
    {
      id: 'sensors',
      icon: <Cpu size={18} />,
      label: 'IoT Soil & Geotechnical Sensors',
      active: activePanel === 'sensors',
      onClick: () => setActivePanel('sensors')
    },
    {
      id: 'warnings',
      icon: <Shield size={18} />,
      label: 'Early Warnings & Risk Zones',
      active: activePanel === 'warnings',
      onClick: () => setActivePanel('warnings')
    },
    {
      id: 'ai',
      icon: <Bot size={18} />,
      label: 'AI Tactical Assistant',
      active: activePanel === 'ai',
      onClick: () => setActivePanel('ai')
    },
    {
      id: 'report',
      icon: <FileWarning size={18} />,
      label: 'Submit Field Incident Report',
      active: activePanel === 'report',
      onClick: () => setActivePanel('report'),
      requiresAuth: true
    },
    {
      id: 'sos',
      icon: <AlertTriangle size={18} />,
      label: 'EMERGENCY SOS BEACON',
      danger: true,
      onClick: () => setSOSModalOpen(true),
      requiresAuth: true
    }
  ];

  return (
    <aside className="fixed left-3 top-20 z-40 flex flex-col items-center gap-1.5 p-1.5 
      rounded-xl bg-[#050912]/85 backdrop-blur-xl border border-[#00f0ff]/25 shadow-2xl">
      {dockButtons.map((btn) => {
        const isDisabled = btn.requiresAuth && !isAuthenticated;
        return (
          <button
            key={btn.id}
            onClick={btn.onClick}
            disabled={isDisabled}
            title={btn.label}
            className={`osiris-dock-item group relative ${btn.active ? 'active' : ''} ${
              isDisabled ? 'opacity-30 cursor-not-allowed' : ''
            } ${btn.danger ? 'text-red-400 hover:text-red-300 hover:bg-red-500/20' : ''}`}
          >
            {btn.icon}

            {/* Tooltip Popup */}
            <span className="absolute left-12 px-2.5 py-1 rounded bg-[#070e18] border border-[#00f0ff]/40 
              text-[10px] font-mono text-[#00f0ff] whitespace-nowrap opacity-0 group-hover:opacity-100 
              pointer-events-none transition-opacity duration-150 shadow-xl z-50">
              {btn.label}
            </span>

            {/* Badge pill */}
            {btn.badge && (
              <span className={`absolute -top-1 -right-1 px-1 py-0.2 text-[7px] font-mono font-bold rounded ${
                btn.id === 'shelter_route' ? 'bg-emerald-500 text-black' : 'bg-cyan-500 text-black'
              } animate-pulse`}>
                {btn.badge}
              </span>
            )}
          </button>
        );
      })}
    </aside>
  );
};
