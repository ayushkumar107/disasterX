import React, { useEffect, useState } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X, AlertTriangle, Users, Clock, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { DataSourceLabel } from '../common/DataSourceLabel';

export const ResponsePriorityPanel = () => {
  const { activePanel, setActivePanel } = useUIStore();
  const [priorityQueue, setPriorityQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const isOpen = activePanel === 'priority';

  const fetchQueue = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/landslide/priority/sos');
      setPriorityQueue(response.data.data);
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchQueue();
    }
  }, [isOpen]);

  if (activePanel !== 'priority') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 320, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 320, scale: 0.95 }}
        className="fixed right-3 top-14 bottom-20 z-50 w-[340px] md:w-[420px] glass-panel-strong border border-[var(--color-dx-cyan)]/30 rounded-xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
      >
        {/* Header */}
        <div className="bg-[rgba(0,240,255,0.08)] px-4 py-3 border-b border-[rgba(0,240,255,0.15)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[rgba(239,68,68,0.15)] text-[var(--color-dx-critical)] border border-red-500/30">
              <ShieldAlert size={20} className="animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-sm text-white tracking-wide font-mono">
                DISPATCH PRIORITY QUEUE
              </span>
              <div className="text-[10px] font-mono text-gray-400">
                Rescue Triage Ranking System
              </div>
            </div>
          </div>
          <button
            onClick={() => setActivePanel(null)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-black/20">
          {isLoading ? (
            <div className="text-center font-mono text-xs text-[var(--color-dx-cyan)] py-8 animate-pulse">
              RANKING ACTIVE SOS BEACONS...
            </div>
          ) : priorityQueue.length === 0 ? (
            <div className="text-center py-8 font-mono text-xs text-gray-500">
              ✅ ALL SOS BEACONS CLEAR / HANDLED
            </div>
          ) : (
            priorityQueue.map((item, idx) => (
              <div 
                key={item._id}
                className="p-3.5 rounded-xl bg-white/5 border border-red-500/25 space-y-3"
              >
                {/* Ranking Title */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-red-500/20 text-red-400 flex items-center justify-center text-xs font-mono font-bold">
                      #{idx + 1}
                    </span>
                    <h4 className="text-xs font-bold text-white font-mono">{item.user?.name || 'Anonymous User'}</h4>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                    Score: {item.priorityScore}
                  </span>
                </div>

                <p className="text-xs text-gray-300 font-sans">
                  {item.description || 'Emergency SOS broadcast triggered. Immediate triage requested.'}
                </p>

                {/* Details */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Users size={12} className="text-red-400" />
                    <span>People: {item.numberOfPeople}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} className="text-red-400" />
                    <span>Status: {item.status}</span>
                  </div>
                </div>

                {/* Action button */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-[9px] font-mono text-gray-500">
                    Location: {item.location.coordinates[1].toFixed(4)}, {item.location.coordinates[0].toFixed(4)}
                  </span>
                  <button className="flex items-center gap-1 text-[10px] font-mono text-[var(--color-dx-cyan)] hover:text-white uppercase tracking-wider">
                    <span>Dispatch</span>
                    <ArrowRight size={10} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
export default ResponsePriorityPanel;
