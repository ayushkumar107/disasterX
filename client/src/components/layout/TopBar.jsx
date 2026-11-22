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
  Navigation,
  ShieldCheck,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false);

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
    <header className="fixed top-0 left-0 right-0 z-50 h-14 px-2 sm:px-3 flex items-center justify-between
      bg-[#03060a]/90 backdrop-blur-md border-b border-[#00f0ff]/20 shadow-2xl">
      
      {/* Left Branding: Logo & Title */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <button
          onClick={toggleLeftPanel}
          className="p-1.5 rounded text-[#94a3b8] hover:text-[#00f0ff] hover:bg-white/5 transition-colors"
          title="Toggle Drawer"
        >
          {leftPanelOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2.5 group cursor-pointer" onClick={() => navigate('/')}>
          {/* Tactical Logo Icon */}
          <div className="relative w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded bg-[#070e18] border border-[#00f0ff]/50 shadow-[0_0_12px_rgba(0,240,255,0.3)] shrink-0">
            <Globe size={16} className="text-[#00f0ff] animate-pulse sm:w-[18px] sm:h-[18px]" />
            <div className="absolute inset-0 rounded border border-[#00f0ff]/20 scale-110 animate-ping opacity-25" />
          </div>

          <div className="flex flex-col leading-tight">
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="font-osiris font-black text-xs sm:text-base text-[#00f0ff] tracking-[0.1em] sm:tracking-[0.2em] drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]">
                DISASTERLINK
              </span>
              <span className="text-[8px] sm:text-[10px] font-mono font-bold px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded bg-[#e5b849]/15 text-[#e5b849] border border-[#e5b849]/30">
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
      <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
        {/* Safest Route to Nearest Shelter Button */}
        <button
          onClick={routeToNearestShelter}
          className={`osiris-btn px-1.5 sm:px-2.5 py-1 text-[10px] sm:text-[11px] transition-all ${
            activeRoute 
              ? 'border-[#00ff66] text-[#00ff66] bg-[#00ff66]/20 shadow-[0_0_15px_rgba(0,255,102,0.4)]' 
              : 'border-[#00ff66]/50 text-[#00ff66] hover:bg-[#00ff66]/15'
          }`}
          title="Show safest driving & evacuation direction to nearest emergency shelter"
        >
          <Navigation size={13} className={activeRoute ? 'text-[#00ff66] animate-pulse' : 'text-[#00ff66]'} />
          <span className="font-bold hidden sm:inline">{activeRoute ? 'END ROUTE' : 'SHELTER'}</span>
        </button>

        {/* Emergency Chat Button */}
        <button
          onClick={toggleChat}
          className="osiris-btn px-1.5 sm:px-2.5 py-1 text-[10px] sm:text-[11px] border-[#00f0ff]/50 text-[#00f0ff] hover:bg-[#00f0ff]/15 relative"
          title="Emergency Community Chat"
        >
          <MessageSquare size={13} className="text-[#00f0ff]" />
          <span className="hidden sm:inline">CHAT</span>
          {unreadCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse ml-0.5" />
          )}
        </button>

        <button className="hidden sm:inline-flex osiris-btn">
          <LifeBuoy size={13} className="text-[#e5b849]" />
          <span>SUPPORT</span>
        </button>

        {/* Desktop Auth Controls (≥ 640px) */}
        <div className="hidden sm:flex items-center">
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
                onClick={async () => {
                  await logout();
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
        </div>

        {/* Mobile Account Trigger (< 640px) */}
        <div className="flex sm:hidden items-center">
          {isAuthenticated ? (
            <button
              onClick={() => setMobileAccountOpen(!mobileAccountOpen)}
              className="flex items-center gap-1 px-1.5 py-1 rounded bg-[#070e18] border border-[#00f0ff]/40 text-[#00f0ff] hover:border-[#00f0ff] transition-all"
              title="Account & Session"
              aria-label="Account & Session"
            >
              <User size={13} className="text-[#00f0ff]" />
              <span className="text-[9px] font-mono font-bold text-[#e5b849] max-w-[42px] truncate">
                {user?.role || 'USER'}
              </span>
            </button>
          ) : (
            <button
              onClick={() => setMobileAccountOpen(!mobileAccountOpen)}
              className="px-2 py-1 rounded bg-[#e5b849]/15 border border-[#e5b849]/50 text-[#e5b849] text-[10px] font-mono font-bold hover:bg-[#e5b849]/25 transition-all"
              title="Sign In / Register"
              aria-label="Sign In / Register"
            >
              AUTH
            </button>
          )}
        </div>

        {/* Telemetry Toggle Panel */}
        <button
          onClick={toggleRightPanel}
          className="p-1.5 rounded text-[#94a3b8] hover:text-[#00f0ff] hover:bg-white/5 transition-colors"
          title="Toggle Telemetry Panel"
        >
          {rightPanelOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
        </button>
      </div>

      {/* Mobile Account Dropdown Menu */}
      <AnimatePresence>
        {mobileAccountOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs sm:hidden"
              onClick={() => setMobileAccountOpen(false)}
            />

            {/* Account Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-2 top-14 z-50 w-72 rounded-xl bg-[#050a14]/95 backdrop-blur-xl border border-[#00f0ff]/40 p-3.5 shadow-[0_0_30px_rgba(0,240,255,0.25)] font-mono sm:hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/10">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-[#00f0ff]" />
                  <span className="text-xs font-bold text-[#00f0ff] tracking-wider uppercase font-osiris">
                    Tactical Account
                  </span>
                </div>
                <button
                  onClick={() => setMobileAccountOpen(false)}
                  className="p-1 rounded text-[#94a3b8] hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {isAuthenticated ? (
                <div className="space-y-3">
                  {/* User Profile Card */}
                  <div className="p-2.5 rounded-lg bg-[#070e18] border border-white/10 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/40 flex items-center justify-center shrink-0">
                          <User size={15} className="text-[#00f0ff]" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-[#e2e8f0] truncate max-w-[130px]">
                            {user?.name || 'Operator'}
                          </span>
                          <span className="text-[10px] text-[#94a3b8] truncate max-w-[130px]">
                            {user?.email}
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#e5b849]/20 text-[#e5b849] border border-[#e5b849]/40 font-bold uppercase shrink-0">
                        {user?.role || 'OPERATOR'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
                      <span className="text-[#64748b]">SECURITY STATUS</span>
                      <span className="text-[#00ff66] font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-pulse" />
                        ACTIVE SESSION
                      </span>
                    </div>
                  </div>

                  {/* Admin Command Center Link if ADMIN */}
                  {user?.role === 'ADMIN' && (
                    <button
                      onClick={() => {
                        setMobileAccountOpen(false);
                        navigate('/admin');
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/40 text-[#00f0ff] hover:bg-[#00f0ff]/20 text-xs font-bold tracking-wider transition-colors"
                    >
                      <span>ADMIN COMMAND CENTER</span>
                    </button>
                  )}

                  {/* Logout Button */}
                  <button
                    onClick={async () => {
                      setMobileAccountOpen(false);
                      await logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-red-950/40 border border-red-500/50 text-red-400 hover:bg-red-900/50 hover:text-red-300 text-xs font-bold tracking-wider transition-colors shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                  >
                    <LogOut size={15} />
                    <span>LOGOUT OF DISASTERLINK</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <p className="text-[11px] text-[#94a3b8] leading-relaxed">
                    Sign in to access emergency broadcast alerts, field reporting, and dispatch routing.
                  </p>

                  <button
                    onClick={() => {
                      setMobileAccountOpen(false);
                      navigate('/login');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#e5b849] hover:bg-[#f6c85c] text-black font-bold text-xs tracking-wider transition-colors shadow-[0_0_15px_rgba(229,184,73,0.3)]"
                  >
                    <User size={14} />
                    <span>SIGN IN</span>
                  </button>

                  <button
                    onClick={() => {
                      setMobileAccountOpen(false);
                      navigate('/register');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#070e18] border border-[#00f0ff]/40 text-[#00f0ff] hover:bg-[#00f0ff]/10 font-bold text-xs tracking-wider transition-colors"
                  >
                    <span>REGISTER ACCOUNT</span>
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
