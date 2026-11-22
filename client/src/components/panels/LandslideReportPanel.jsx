import React, { useState } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { useLocationStore } from '../../stores/locationStore';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, MapPin, Send, AlertTriangle, CheckSquare, Square } from 'lucide-react';
import api from '../../services/api';

export const LandslideReportPanel = () => {
  const { activePanel, setActivePanel } = useUIStore();
  const { userLocation } = useLocationStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('MEDIUM');
  const [obs, setObs] = useState({
    groundCracks: false,
    tiltedTreesOrPoles: false,
    soilMovement: false,
    roadBlockage: false,
    waterSeepage: false,
    bouldersRolling: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const toggleObs = (key) => {
    setObs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userLocation) {
      setError('Please enable browser location services first.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.post('/disasters/reports', {
        type: 'LANDSLIDE',
        title,
        description,
        location: {
          type: 'Point',
          coordinates: [userLocation[0], userLocation[1]]
        },
        severity,
        landslideObservations: obs
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setActivePanel(null);
        setTitle('');
        setDescription('');
        setObs({
          groundCracks: false,
          tiltedTreesOrPoles: false,
          soilMovement: false,
          roadBlockage: false,
          waterSeepage: false,
          bouldersRolling: false
        });
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit report.');
    }
    setIsSubmitting(false);
  };

  if (activePanel !== 'report') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 320, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 320, scale: 0.95 }}
        className="fixed left-2 sm:left-auto right-2 sm:right-3 top-14 bottom-16 sm:bottom-20 z-50 w-auto sm:w-[360px] md:w-[420px] glass-panel-strong border border-[var(--color-dx-cyan)]/30 rounded-xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
      >
        {/* Header */}
        <div className="bg-[rgba(0,240,255,0.08)] px-4 py-3 border-b border-[rgba(0,240,255,0.15)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[rgba(0,240,255,0.15)] text-[var(--color-dx-cyan)]">
              <FileText size={20} />
            </div>
            <div>
              <span className="font-bold text-sm text-white tracking-wide font-mono">
                FIELD RISK REPORT
              </span>
              <div className="text-[10px] font-mono text-gray-400">
                Submit Citizen Landslide Observation
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

        {/* Content stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-black/20">
          {success ? (
            <div className="p-8 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 text-green-500">
                <Send size={24} />
              </div>
              <h3 className="text-base font-bold text-white font-mono">REPORT TRANSMITTED</h3>
              <p className="text-xs text-gray-400 font-sans leading-relaxed">
                Thank you! Your field observation has been sent. It will be verified by our credibility engines and displayed.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded text-xs font-mono">
                  {error}
                </div>
              )}

              {/* Position Check */}
              <div className="flex items-center gap-2.5 p-3 rounded bg-black/35 border border-white/5 text-xs font-mono">
                <MapPin size={16} className={userLocation ? 'text-green-500 animate-pulse' : 'text-gray-500'} />
                <div className="flex-1">
                  {userLocation ? (
                    <span className="text-white">GPS Verified: {userLocation[1].toFixed(4)}°, {userLocation[0].toFixed(4)}°</span>
                  ) : (
                    <span className="text-red-400">Location required to report.</span>
                  )}
                </div>
                {!userLocation && (
                  <button
                    type="button"
                    onClick={() => useLocationStore.getState().requestLocation(false).catch(err => setError(err.message))}
                    className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/50 text-blue-300 text-xs font-mono font-bold hover:bg-blue-500/30 transition-all shrink-0"
                  >
                    GET GPS
                  </button>
                )}
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">Event Title</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g., Active soil movement near highway slope"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--color-dx-cyan)]/50 focus:ring-1 focus:ring-[var(--color-dx-cyan)]/30 font-sans"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">Description Details</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Describe slope condition, approximate length, or road block details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--color-dx-cyan)]/50 focus:ring-1 focus:ring-[var(--color-dx-cyan)]/30 font-sans resize-none"
                />
              </div>

              {/* Severity */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">Observed Severity</label>
                <div className="grid grid-cols-4 gap-1.5 font-mono">
                  {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(sev => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setSeverity(sev)}
                      className={`py-1.5 rounded border text-[10px] font-bold transition-all ${
                        severity === sev 
                          ? 'bg-[var(--color-dx-cyan)]/25 border-[var(--color-dx-cyan)] text-white shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                          : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/30'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specific Observations */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">Indicators / Observations</label>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-gray-300">
                  {Object.entries(obs).map(([key, val]) => (
                    <div 
                      key={key}
                      onClick={() => toggleObs(key)}
                      className={`p-2 rounded border cursor-pointer flex items-center gap-2 select-none transition-all ${
                        val ? 'bg-white/10 border-[var(--color-dx-cyan)]/40 text-white' : 'bg-black/30 border-white/5 text-gray-400 hover:border-white/15'
                      }`}
                    >
                      {val ? <CheckSquare size={14} className="text-[var(--color-dx-cyan)]" /> : <Square size={14} />}
                      <span className="text-[10px] capitalize leading-none">{key.replace(/([A-Z])/g, ' $1')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !userLocation}
                className="w-full py-3 bg-[var(--color-dx-cyan)]/20 border border-[var(--color-dx-cyan)]/40 text-[var(--color-dx-cyan)] hover:bg-[var(--color-dx-cyan)] hover:text-black font-mono font-bold text-xs tracking-widest rounded transition-all disabled:opacity-30 flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.15)]"
              >
                <Send size={14} /> TRANSMIT FIELD REPORT
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
export default LandslideReportPanel;
