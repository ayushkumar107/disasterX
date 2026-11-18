import React from 'react';
import { useUIStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import { useSOSStore } from '../../stores/sosStore';
import { useLocationStore } from '../../stores/locationStore';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CloudRain, 
  Cpu, 
  FileWarning, 
  ListOrdered,
  Navigation
} from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  {
    id: 'sos',
    icon: <AlertTriangle size={18} />,
    label: 'SOS Beacon',
    danger: true,
    requiresAuth: true,
    action: 'modal'
  },
  {
    id: 'route',
    icon: <Navigation size={17} className="text-[#00ff66]" />,
    label: 'Safe Shelter',
    danger: false,
    highlight: true
  },
  {
    id: 'warnings',
    icon: <ShieldAlert size={16} />,
    label: 'Warnings',
    panel: 'warnings'
  },
  {
    id: 'rainfall',
    icon: <CloudRain size={16} />,
    label: 'Rainfall',
    panel: 'rainfall'
  },
  {
    id: 'sensors',
    icon: <Cpu size={16} />,
    label: 'Soil Sensors',
    panel: 'sensors'
  },
  {
    id: 'report',
    icon: <FileWarning size={16} />,
    label: 'Field Report',
    panel: 'report',
    requiresAuth: true
  },
  {
    id: 'priority',
    icon: <ListOrdered size={16} />,
    label: 'Dispatch',
    panel: 'priority',
    requiresAuth: true
  }
];

export const BottomNav = () => {
  const { activePanel, setActivePanel } = useUIStore();
  const setSOSModalOpen = useSOSStore((s) => s.setModalOpen);
  const routeToNearestShelter = useLocationStore((s) => s.routeToNearestShelter);
  const activeRoute = useLocationStore((s) => s.activeRoute);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);

  const handleClick = (item) => {
    if (item.requiresAuth && !isAuthenticated) return;
    if (item.id === 'sos') {
      setSOSModalOpen(true);
    } else if (item.id === 'route') {
      routeToNearestShelter();
    } else if (item.panel) {
      setActivePanel(item.panel);
    }
  };

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40">
      <div className="glass-panel-strong border-[#00f0ff]/30 px-2 py-1.5 flex items-center gap-1 shadow-2xl">
        {navItems.map(item => {
          const isActive = item.id === 'route' ? activeRoute !== null : (activePanel === item.panel && item.panel !== undefined);
          const isDisabled = item.requiresAuth && !isAuthenticated;
          return (
            <motion.button 
              key={item.id} 
              whileHover={{ scale: isDisabled ? 1 : 1.05 }} 
              whileTap={{ scale: isDisabled ? 1 : 0.95 }} 
              onClick={() => handleClick(item)} 
              disabled={isDisabled} 
              className={`relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg
                  transition-all duration-200 min-w-[62px]
                  ${isDisabled 
                    ? 'opacity-30 cursor-not-allowed' 
                    : item.danger 
                      ? isActive 
                        ? 'bg-[rgba(239,68,68,0.2)] border border-[rgba(239,68,68,0.4)] text-[var(--color-dx-critical)]' 
                        : 'hover:bg-[rgba(239,68,68,0.1)] text-[var(--color-dx-muted)] hover:text-[var(--color-dx-critical)]' 
                      : item.highlight && activeRoute
                        ? 'bg-[#00ff66]/20 border border-[#00ff66]/60 text-[#00ff66] shadow-[0_0_12px_rgba(0,255,102,0.4)]'
                        : isActive 
                          ? 'bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] text-[var(--color-dx-cyan)]' 
                          : 'hover:bg-[var(--color-dx-surface-hover)] text-[var(--color-dx-muted)] hover:text-[var(--color-dx-white)]'}
                  ${!isActive && !item.danger ? 'border border-transparent' : ''}`}
            >
              {item.danger && !isDisabled && <span className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--color-dx-critical)] rounded-full animate-blink" />}
              {item.highlight && activeRoute && <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#00ff66] rounded-full animate-ping" />}
              {item.icon}
              <span className="text-[9px] font-medium tracking-wide">{item.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
