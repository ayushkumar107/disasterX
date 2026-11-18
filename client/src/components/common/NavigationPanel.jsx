import React, { useState } from 'react';
import { useLocationStore } from '../../stores/locationStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Navigation, 
  CornerUpRight, 
  CornerUpLeft, 
  ArrowUp, 
  Compass, 
  X, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  MapPin 
} from 'lucide-react';

export const NavigationPanel = () => {
  const { activeRoute, clearRoute } = useLocationStore();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!activeRoute) return null;

  const { steps = [], distance, duration, destinationName } = activeRoute;
  const currentStep = steps[0] || { instruction: 'Proceed to shelter', distance: 0 };

  // Formatting helpers
  const formatDistance = (meters) => {
    if (!meters) return '';
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
    return `${Math.round(meters)} m`;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.ceil(seconds / 60);
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      return `${hrs}h ${remMins}m`;
    }
    return `${mins} min`;
  };

  const getManeuverIcon = (type, modifier) => {
    if (type === 'arrive') return <MapPin size={22} className="text-[var(--color-dx-green)]" />;
    if (modifier?.includes('left')) return <CornerUpLeft size={22} className="text-[var(--color-dx-cyan)]" />;
    if (modifier?.includes('right')) return <CornerUpRight size={22} className="text-[var(--color-dx-cyan)]" />;
    return <ArrowUp size={22} className="text-[var(--color-dx-cyan)]" />;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="fixed top-14 sm:top-16 left-2 sm:left-auto right-2 sm:right-4 z-40 w-auto sm:w-80 md:w-96 max-h-[85vh] flex flex-col glass-panel-strong border border-[var(--color-dx-cyan)]/30 rounded-xl shadow-2xl overflow-hidden backdrop-blur-md"
      >
        {/* Header Bar */}
        <div className="bg-[rgba(0,240,255,0.08)] px-4 py-3 border-b border-[rgba(0,240,255,0.15)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[rgba(0,240,255,0.15)] text-[var(--color-dx-cyan)] animate-pulse">
              <Navigation size={18} />
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest text-[var(--color-dx-cyan)] uppercase">
                EMERGENCY SAFE ROUTE
              </div>
              <div className="text-xs font-semibold text-white truncate max-w-[200px]">
                {destinationName || 'Nearest Shelter'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
              title={isExpanded ? 'Collapse Directions' : 'Expand Directions'}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <button
              onClick={clearRoute}
              className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
              title="Stop Navigation"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* HUD Quick Stats Banner */}
        <div className="px-4 py-2.5 bg-black/40 flex items-center justify-between border-b border-white/5 font-mono text-xs">
          <div className="flex items-center gap-1.5 text-[var(--color-dx-cyan)]">
            <ShieldCheck size={14} />
            <span>DISTANCE:</span>
            <span className="font-bold text-white">{formatDistance(distance) || 'Direct'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--color-dx-green)]">
            <Compass size={14} />
            <span>EST. TIME:</span>
            <span className="font-bold text-white">{formatDuration(duration) || 'Immediate'}</span>
          </div>
        </div>

        {/* Current / Next Instruction Card */}
        <div className="p-4 flex items-start gap-3 bg-gradient-to-r from-[rgba(0,240,255,0.03)] to-transparent">
          <div className="p-3 rounded-xl bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.2)] shrink-0">
            {getManeuverIcon(currentStep.type, currentStep.modifier)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white leading-snug">
              {currentStep.instruction}
            </div>
            {currentStep.distance > 0 && (
              <div className="text-xs font-mono text-[var(--color-dx-cyan)] mt-1">
                In {formatDistance(currentStep.distance)}
              </div>
            )}
          </div>
        </div>

        {/* Expandable Step-by-Step Directions List */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-white/10 max-h-64 overflow-y-auto bg-black/60 custom-scrollbar"
            >
              <div className="px-4 py-2 text-[10px] font-mono text-gray-400 uppercase tracking-wider border-b border-white/5">
                Turn-by-Turn Directions ({steps.length} Steps)
              </div>
              <div className="divide-y divide-white/5">
                {steps.map((step, idx) => (
                  <div key={idx} className="px-4 py-2.5 flex items-start gap-3 hover:bg-white/5 transition-colors">
                    <div className="mt-0.5 shrink-0 opacity-80">
                      {getManeuverIcon(step.type, step.modifier)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-200">{step.instruction}</div>
                      {step.distance > 0 && (
                        <div className="text-[10px] font-mono text-gray-400 mt-0.5">
                          {formatDistance(step.distance)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Footer */}
        <div className="px-4 py-2 bg-black/40 border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] font-mono text-gray-400">
            Disaster-Aware Navigation Active
          </span>
          <button
            onClick={clearRoute}
            className="text-[10px] font-mono text-red-400 hover:text-red-300 underline uppercase tracking-wider"
          >
            End Route
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
