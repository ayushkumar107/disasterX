import React from 'react';
import { useUIStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import { useSOSStore } from '../../stores/sosStore';
import { AlertTriangle, MessageCircle, Bot, FileWarning, Route } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  {
    id: 'sos',
    icon: <AlertTriangle size={20} />,
    label: 'SOS',
    danger: true,
    requiresAuth: true,
    action: 'modal'
  },
  {
    id: 'chat',
    icon: <MessageCircle size={18} />,
    label: 'Nearby Chat',
    panel: 'chat',
    requiresAuth: true
  },
  {
    id: 'ai',
    icon: <Bot size={18} />,
    label: 'AI Assistant',
    panel: 'ai'
  },
  {
    id: 'report',
    icon: <FileWarning size={18} />,
    label: 'Report',
    panel: 'report',
    requiresAuth: true
  },
  {
    id: 'route',
    icon: <Route size={18} />,
    label: 'Safe Route',
    panel: 'route'
  }
];

import { useLocationStore } from '../../stores/locationStore';

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
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="glass-panel-strong px-2 py-2 flex items-center gap-1">
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
                  transition-all duration-200 min-w-[60px]
                  ${isDisabled 
                    ? 'opacity-30 cursor-not-allowed' 
                    : item.danger 
                      ? isActive 
                        ? 'bg-[rgba(239,68,68,0.2)] border border-[rgba(239,68,68,0.4)] text-[var(--color-dx-critical)]' 
                        : 'hover:bg-[rgba(239,68,68,0.1)] text-[var(--color-dx-muted)] hover:text-[var(--color-dx-critical)]' 
                      : isActive 
                        ? 'bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] text-[var(--color-dx-cyan)]' 
                        : 'hover:bg-[var(--color-dx-surface-hover)] text-[var(--color-dx-muted)] hover:text-[var(--color-dx-white)]'}
                  ${!isActive && !item.danger ? 'border border-transparent' : ''}`}
            >
              {item.danger && !isDisabled && <span className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--color-dx-critical)] rounded-full animate-blink" />}
              {item.icon}
              <span className="text-[9px] font-medium tracking-wide">{item.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
