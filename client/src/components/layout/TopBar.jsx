import React from 'react';
import { UTCClock } from '../common/UTCClock';
import { ConnectionStatus } from '../common/ConnectionStatus';
import { useAuthStore } from '../../stores/authStore';
import { useDisasterStore } from '../../stores/disasterStore';
import { useUIStore } from '../../stores/uiStore';
import { Shield, Bell, User, PanelLeftOpen, PanelRightOpen, PanelLeftClose, PanelRightClose, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
export const TopBar = () => {
  const {
    user,
    isAuthenticated,
    logout
  } = useAuthStore();
  const disasters = useDisasterStore(s => s.disasters);
  const {
    leftPanelOpen,
    rightPanelOpen,
    toggleLeftPanel,
    toggleRightPanel
  } = useUIStore();
  const navigate = useNavigate();
  const activeDisasters = disasters.filter(d => d.status === 'ACTIVE');
  const criticalCount = activeDisasters.filter(d => d.severity === 'CRITICAL').length;
  return <div className="fixed top-0 left-0 right-0 z-50 h-12 flex items-center justify-between px-4
      bg-[rgba(5,10,18,0.9)] backdrop-blur-xl border-b border-[var(--color-dx-border)]">

      {/* Left section */}
      <div className="flex items-center gap-3">
        <button onClick={toggleLeftPanel} className="p-1.5 rounded-md hover:bg-[var(--color-dx-surface-hover)] transition-colors">
          {leftPanelOpen ? <PanelLeftClose size={16} className="text-[var(--color-dx-muted)]" /> : <PanelLeftOpen size={16} className="text-[var(--color-dx-muted)]" />}
        </button>

        <div className="flex items-center gap-2">
          <Shield size={20} className="text-[var(--color-dx-cyan)]" />
          <span className="font-bold text-sm tracking-wider text-[var(--color-dx-white)]">
            DISASTER<span className="text-[var(--color-dx-cyan)]">-X</span>
          </span>
        </div>

        <div className="h-4 w-px bg-[var(--color-dx-border)] mx-1" />

        {/* Telemetry counters */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="telemetry-label">Active</span>
            <span className="font-mono text-xs text-[var(--color-dx-cyan)]">{activeDisasters.length}</span>
          </div>
          {criticalCount > 0 && <motion.div className="flex items-center gap-1.5" animate={{
          opacity: [1, 0.5, 1]
        }} transition={{
          duration: 1.5,
          repeat: Infinity
        }}>
              <span className="telemetry-label text-[var(--color-dx-critical)]">CRITICAL</span>
              <span className="font-mono text-xs text-[var(--color-dx-critical)]">{criticalCount}</span>
            </motion.div>}
        </div>
      </div>

      {/* Center - UTC Clock */}
      <div className="hidden sm:block">
        <UTCClock />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        <ConnectionStatus />

        {isAuthenticated ? <>
            <button className="relative p-1.5 rounded-md hover:bg-[var(--color-dx-surface-hover)] transition-colors">
              <Bell size={16} className="text-[var(--color-dx-muted)]" />
              {criticalCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[var(--color-dx-critical)]
                  rounded-full text-[8px] flex items-center justify-center font-bold animate-blink">
                  {criticalCount}
                </span>}
            </button>

            <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-[var(--color-dx-surface)]
              border border-[var(--color-dx-border)] cursor-pointer hover:border-[var(--color-dx-border-bright)] transition-colors">
              <User size={14} className="text-[var(--color-dx-cyan)]" />
              <span className="text-xs text-[var(--color-dx-muted)] hidden md:inline">{user?.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[rgba(0,212,255,0.1)]
                text-[var(--color-dx-cyan)] border border-[rgba(0,212,255,0.2)]">
                {user?.role}
              </span>
            </div>

            <button onClick={() => {
          logout();
          navigate('/login');
        }} className="p-1.5 rounded-md hover:bg-[rgba(239,68,68,0.1)] transition-colors" title="Logout">
              <LogOut size={14} className="text-[var(--color-dx-muted)] hover:text-[var(--color-dx-critical)]" />
            </button>
          </> : <button onClick={() => navigate('/login')} className="btn-primary text-xs">
            Sign In
          </button>}

        <button onClick={toggleRightPanel} className="p-1.5 rounded-md hover:bg-[var(--color-dx-surface-hover)] transition-colors">
          {rightPanelOpen ? <PanelRightClose size={16} className="text-[var(--color-dx-muted)]" /> : <PanelRightOpen size={16} className="text-[var(--color-dx-muted)]" />}
        </button>
      </div>
    </div>;
};
