import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X, MapPin, Users, Activity, Send } from 'lucide-react';
import { useSOSStore } from '../../stores/sosStore';
import { useLocationStore } from '../../stores/locationStore';
import { GlassPanel } from '../common/GlassPanel';

export const SOSModal = () => {
  const { isModalOpen, setModalOpen, triggerSOS, isLoading, error } = useSOSStore();
  const userLocation = useLocationStore((s) => s.userLocation);
  
  const [severity, setSeverity] = useState('HIGH');
  const [description, setDescription] = useState('');
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [success, setSuccess] = useState(false);

  if (!isModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userLocation) {
      alert("Please enable location services first.");
      return;
    }

    try {
      await triggerSOS({
        lng: userLocation[0],
        lat: userLocation[1],
        severity,
        description,
        numberOfPeople
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setModalOpen(false);
      }, 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="w-full max-w-md"
        >
          <GlassPanel strong className="overflow-hidden border-[var(--color-dx-critical)] border-opacity-50">
            {/* Header */}
            <div className="bg-[var(--color-dx-critical)] p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <ShieldAlert size={20} className="animate-pulse" />
                <h2 className="font-mono font-bold text-lg tracking-wider m-0">EMERGENCY SOS</h2>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {success ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-dx-critical)]/20 text-[var(--color-dx-critical)] mb-4">
                  <Send size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">SOS BEACON SENT</h3>
                <p className="text-[var(--color-dx-muted)]">
                  Rescue teams have been notified of your location. Stay calm and wait for assistance.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm">
                    {error}
                  </div>
                )}

                {/* Location Status */}
                <div className="flex items-center gap-3 p-3 bg-black/30 rounded border border-white/10">
                  <MapPin size={18} className={userLocation ? 'text-[var(--color-dx-green)]' : 'text-[var(--color-dx-muted)]'} />
                  <div className="flex-1 text-sm">
                    {userLocation ? (
                      <span className="text-white">Location Acquired ({userLocation[1].toFixed(4)}, {userLocation[0].toFixed(4)})</span>
                    ) : (
                      <span className="text-[var(--color-dx-muted)]">Waiting for location...</span>
                    )}
                  </div>
                </div>

                {/* Severity */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-mono text-[var(--color-dx-muted)] mb-2">
                    <Activity size={14} /> EMERGENCY SEVERITY
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['MEDIUM', 'HIGH', 'CRITICAL'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSeverity(s)}
                        className={`py-2 px-1 text-xs font-bold rounded border transition-all ${
                          severity === s 
                            ? s === 'CRITICAL' ? 'bg-[var(--color-dx-critical)] border-[var(--color-dx-critical)] text-white' 
                              : 'bg-[var(--color-dx-high)] border-[var(--color-dx-high)] text-white'
                            : 'bg-black/40 border-white/10 text-[var(--color-dx-muted)] hover:border-white/30'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* People Count */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-mono text-[var(--color-dx-muted)] mb-2">
                    <Users size={14} /> NUMBER OF PEOPLE
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={numberOfPeople}
                    onChange={(e) => setNumberOfPeople(parseInt(e.target.value) || 1)}
                    className="w-full bg-black/40 border border-white/10 rounded p-2 text-white focus:border-[var(--color-dx-cyan)] focus:outline-none transition-colors"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-mono text-[var(--color-dx-muted)] mb-2">
                    SITUATION DETAILS (OPTIONAL)
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Injuries? Hazards? Trapped?"
                    className="w-full bg-black/40 border border-white/10 rounded p-2 text-white text-sm focus:border-[var(--color-dx-cyan)] focus:outline-none transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !userLocation}
                  className="w-full py-4 mt-2 bg-[var(--color-dx-critical)] hover:bg-red-600 text-white font-bold font-mono tracking-widest rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? 'TRANSMITTING...' : 'TRANSMIT SOS'}
                </button>
              </form>
            )}
          </GlassPanel>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
