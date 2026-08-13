import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, MapPin } from 'lucide-react';
import { useLocationStore } from '../../stores/locationStore';
import { GlassPanel } from './GlassPanel';

export const ProximityAlert = () => {
  const proximityWarnings = useLocationStore((s) => s.proximityWarnings);

  if (!proximityWarnings || proximityWarnings.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md pointer-events-none"
      >
        <div className="px-4">
          <div className="bg-[var(--color-dx-critical)] bg-opacity-20 backdrop-blur-xl border border-[var(--color-dx-critical)] rounded-lg p-4 shadow-[0_0_30px_rgba(255,51,102,0.3)] animate-pulse-border pointer-events-auto">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[var(--color-dx-critical)] rounded-full text-white animate-pulse">
                <AlertTriangle size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-mono text-[var(--color-dx-critical)] font-bold tracking-wider mb-1">
                  CRITICAL PROXIMITY ALERT
                </h3>
                <p className="text-sm text-gray-200 mb-2">
                  You are within the danger zone of {proximityWarnings.length} active disaster{proximityWarnings.length > 1 ? 's' : ''}.
                </p>
                
                <div className="flex flex-col gap-2">
                  {proximityWarnings.slice(0, 2).map((warning) => (
                    <div key={warning.id} className="bg-black/30 rounded p-2 text-xs border border-white/10">
                      <div className="font-semibold text-[var(--color-dx-white)]">{warning.title}</div>
                      <div className="flex items-center gap-1 text-[var(--color-dx-muted)] mt-1">
                        <MapPin size={10} />
                        <span>{(warning.distance).toFixed(1)} km away</span>
                      </div>
                    </div>
                  ))}
                  {proximityWarnings.length > 2 && (
                    <div className="text-xs text-center text-[var(--color-dx-muted)]">
                      + {proximityWarnings.length - 2} more...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
