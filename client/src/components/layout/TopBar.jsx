import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useDisasterStore } from '../../stores/disasterStore';
import { useUIStore } from '../../stores/uiStore';
import { useMapStore } from '../../stores/mapStore';
import { useChatStore } from '../../stores/chatStore';
import { useLocationStore } from '../../stores/locationStore';
import { 
  Eye, 
  PanelLeftOpen, 
  PanelLeftClose, 
  PanelRightOpen, 
  PanelRightClose, 
  User, 
  LogOut, 
  DollarSign, 
  LifeBuoy,
  Flame,
  Globe,
  Layers,
  Shield,
  Activity,
  MessageSquare,
  Navigation
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const TopBar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const disasters = useDisasterStore((s) => s.disasters);
  const showLayers = useMapStore((s) => s.showLayers);
  const { leftPanelOpen, rightPanelOpen, toggleLeftPanel, toggleRightPanel } = useUIStore();
  const { toggleOpen: toggleChat, unreadCount } = useChatStore();
  const routeToNearestShelter = useLocationStore((s) => s.routeToNearestShelter);
  const activeRoute = useLocationStore((s) => s.activeRoute);
  const navigate = useNavigate();

  const [zuluTime, setZuluTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      const ms = String(now.getUTCMilliseconds()).padStart(3, '0');
      setZuluTime(`${hours}:${minutes}:${seconds}:${ms}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 100);
    return () => clearInterval(interval);
  }, []);

  const activeLayerCount = Object.values(showLayers).filter(Boolean).length;
  const totalEntities = disasters.length + 1420; // real + telemetry estimation

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 px-3 flex items-center justify-between
      bg-[#03060a]/90 backdrop-blur-md border-b border-[#00f0ff]/20 shadow-2xl">
      
      {/* Left Branding: Logo & Title */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={toggleLeftPanel}
          className="p-1.5 rounded text-[#94a3b8] hover:text-[#00f0ff] hover:bg-white/5 transition-colors"
          title="Toggle Drawer"
        >
          {leftPanelOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>

        <div className="flex items-center gap-2 sm:gap-2.5 group cursor-pointer" onClick={() => navigate('/')}>
          {/* Tactical Logo Icon */}
          <div className="relative w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded bg-[#070e18] border border-[#00f0ff]/50 shadow-[0_0_12px_rgba(0,240,255,0.3)]">
            <Globe size={16} className="text-[#00f0ff] animate-pulse sm:w-[18px] sm:h-[18px]" />
            <div className="absolute inset-0 rounded border border-[#00f0ff]/20 scale-110 animate-ping opacity-25" />
          </div>

          <div className="flex flex-col leading-tight">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-osiris font-black text-sm sm:text-base text-[#00f0ff] tracking-[0.15em] sm:tracking-[0.2em] drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]">
                DISASTERLINK
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono font-bold px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded bg-[#e5b849]/15 text-[#e5b849] border border-[#e5b849]/30">
                NER
              </span>
            </div>
            <span className="hidden sm:inline text-[8px] font-mono text-[#94a3b8] tracking-widest uppercase">
              LANDSLIDE INTELLIGENCE • REAL-TIME GLOBAL MONITORING
            </span>
          </div>
        </div>
      </div>

      {/* Middle Telemetry Bar */}
      <div className="hidden lg:flex items-center gap-4 text-[11px] font-mono tracking-wider">
        <div className="flex items-center gap-1.5 text-[#00f0ff]">
          <span className="text-[9px] text-[#64748b] font-bold">ZULU</span>
          <span className="font-bold text-[#00f0ff] drop-shadow-[0_0_6px_rgba(0,240,255,0.4)]">
            {zuluTime || '00:00:00:000'}
          </span>
        </div>

        <div className="h-3 w-px bg-white/10" />

        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-[#64748b]">TELEMETRY:</span>
          <span className="text-[#e2e8f0] font-bold">{totalEntities}</span>
          <span className="text-[9px] text-[#00ff66]">ACTIVE</span>
        </div>

        <div className="h-3 w-px bg-white/10" />

        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-[#64748b]">LAYERS:</span>
          <span className="text-[#00f0ff] font-bold">{activeLayerCount}</span>
          <span className="text-[9px] text-[#64748b]">ONLINE</span>
        </div>

        <div className="h-3 w-px bg-white/10" />

        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-[#64748b]">SOLAR:</span>
          <span className="text-[#00ff66] font-bold">Kp2</span>
          <span className="text-[9px] text-[#475569]">V.4.1</span>
        </div>
      </div>

      {/* Right Controls & Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Safest Route to Nearest Shelter Button */}
        <button
          onClick={routeToNearestShelter}
          className={`osiris-btn px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] transition-all ${
            activeRoute 
              ? 'border-[#00ff66] text-[#00ff66] bg-[#00ff66]/20 shadow-[0_0_15px_rgba(0,255,102,0.4)]' 
              : 'border-[#00ff66]/50 text-[#00ff66] hover:bg-[#00ff66]/15'
          }`}
          title="Show safest driving & evacuation direction to nearest emergency shelter"
        >
          <Navigation size={13} className={activeRoute ? 'text-[#00ff66] animate-pulse' : 'text-[#00ff66]'} />
          <span className="font-bold hidden xs:inline sm:inline">{activeRoute ? 'END ROUTE' : 'SHELTER'}</span>
        </button>

        {/* Emergency Chat Button */}
        <button
          onClick={toggleChat}
          className="osiris-btn px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] border-[#00f0ff]/50 text-[#00f0ff] hover:bg-[#00f0ff]/15 relative"
        >
          <MessageSquare size={13} className="text-[#00f0ff]" />
          <span className="hidden xs:inline sm:inline">CHAT</span>
          {unreadCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse ml-0.5" />
          )}
        </button>

        <button className="hidden sm:inline-flex osiris-btn">
          <LifeBuoy size={13} className="text-[#e5b849]" />
          <span>SUPPORT</span>
        </button>

        {isAuthenticated ? (
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#070e18] border border-[#00f0ff]/30 text-xs">
              <User size={13} className="text-[#00f0ff]" />
              <span className="text-[#e2e8f0] font-mono hidden md:inline">{user?.name}</span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#e5b849]/15 text-[#e5b849] font-bold">
                {user?.role}
              </span>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="p-1.5 rounded hover:bg-red-500/20 text-[#94a3b8] hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button onClick={() => navigate('/login')} className="osiris-btn glow-gold">
            SIGN IN
          </button>
        )}

        <button
          onClick={toggleRightPanel}
          className="p-1.5 rounded text-[#94a3b8] hover:text-[#00f0ff] hover:bg-white/5 transition-colors"
          title="Toggle Telemetry Panel"
        >
          {rightPanelOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
        </button>
      </div>
    </header>
  );
};
