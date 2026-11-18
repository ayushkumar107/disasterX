import React, { useEffect } from 'react';
import { useWeatherStore } from '../../stores/weatherStore';
import { useLocationStore } from '../../stores/locationStore';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudSun, Wind, Thermometer, Droplets, X, RefreshCw, AlertCircle, ShieldAlert } from 'lucide-react';

export const WeatherPanel = () => {
  const { isPanelOpen, setPanelOpen, weatherData, isLoading, fetchWeather, error } = useWeatherStore();
  const userLocation = useLocationStore((s) => s.userLocation);

  useEffect(() => {
    if (isPanelOpen && (!weatherData || userLocation)) {
      const lat = userLocation ? userLocation[1] : 26.84;
      const lng = userLocation ? userLocation[0] : 80.94;
      fetchWeather(lat, lng);
    }
  }, [isPanelOpen, userLocation, fetchWeather]);

  if (!isPanelOpen) return null;

  const current = weatherData?.current;
  const daily = weatherData?.daily || [];

  const getRiskAssessment = (current) => {
    if (!current) return { label: 'NORMAL TELEMETRY', color: 'text-[var(--color-dx-cyan)]' };
    if (current.weathercode >= 95) return { label: 'THUNDERSTORM HAZARD WARNING', color: 'text-[var(--color-dx-critical)]' };
    if (current.windspeed > 40) return { label: 'HIGH WIND HAZARD ADVISORY', color: 'text-amber-400' };
    if (current.weathercode >= 80) return { label: 'HEAVY PRECIPITATION ALERT', color: 'text-amber-400' };
    return { label: 'ATMOSPHERIC TELEMETRY STABLE', color: 'text-[var(--color-dx-green)]' };
  };

  const risk = getRiskAssessment(current);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -20, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -20, scale: 0.95 }}
        className="fixed top-14 sm:top-16 left-2 sm:left-4 right-2 sm:right-auto z-40 w-auto sm:w-80 md:w-96 max-h-[85vh] overflow-y-auto glass-panel-strong border border-[var(--color-dx-cyan)]/30 rounded-xl shadow-2xl overflow-hidden backdrop-blur-md"
      >
        {/* Header Bar */}
        <div className="bg-[rgba(0,240,255,0.08)] px-4 py-3 border-b border-[rgba(0,240,255,0.15)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[rgba(0,240,255,0.15)] text-[var(--color-dx-cyan)]">
              <CloudSun size={18} />
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest text-[var(--color-dx-cyan)] uppercase">
                ATMOSPHERIC TELEMETRY
              </div>
              <div className="text-xs font-semibold text-white">
                Live & 5-Day Location Weather
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const lat = userLocation ? userLocation[1] : 26.84;
                const lng = userLocation ? userLocation[0] : 80.94;
                fetchWeather(lat, lng);
              }}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
              title="Refresh Weather"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setPanelOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Hazard Risk Banner */}
        <div className="px-4 py-2 bg-black/40 border-b border-white/5 flex items-center gap-2 font-mono text-[10px]">
          <ShieldAlert size={14} className={risk.color} />
          <span className={`font-semibold ${risk.color}`}>{risk.label}</span>
        </div>

        {/* Current Weather Card */}
        {isLoading ? (
          <div className="p-8 text-center font-mono text-xs text-[var(--color-dx-cyan)] animate-pulse">
            Fetching satellite meteorological feed...
          </div>
        ) : error ? (
          <div className="p-6 text-center text-xs text-red-400 font-mono">
            {error}
          </div>
        ) : current ? (
          <div className="p-4 bg-gradient-to-br from-[rgba(0,240,255,0.05)] to-transparent border-b border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold font-mono text-white tracking-tight">
                  {current.temperature}°C
                </div>
                <div className="text-xs font-medium text-[var(--color-dx-cyan)] mt-1">
                  {current.condition}
                </div>
              </div>
              <div className="text-5xl">{current.icon}</div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/10 text-xs font-mono">
              <div className="flex items-center gap-2 text-gray-300">
                <Wind size={14} className="text-[var(--color-dx-cyan)]" />
                <span>Wind: {current.windspeed} km/h</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Thermometer size={14} className="text-[var(--color-dx-green)]" />
                <span>Sensor: Active</span>
              </div>
            </div>
          </div>
        ) : null}

        {/* 5-Day Forecast Section */}
        {daily.length > 0 && (
          <div className="p-4 bg-black/40">
            <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-3">
              5-Day Meteorological Forecast
            </div>
            <div className="grid grid-cols-5 gap-1 text-center">
              {daily.slice(0, 5).map((item, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-lg bg-white/5 border border-white/5 hover:border-[var(--color-dx-cyan)]/30 transition-all"
                >
                  <div className="text-[10px] font-mono text-gray-300 truncate">{item.date}</div>
                  <div className="text-lg my-1">{item.icon}</div>
                  <div className="text-[11px] font-mono font-bold text-white">
                    {item.maxTemp}°
                  </div>
                  <div className="text-[9px] font-mono text-gray-400">
                    {item.minTemp}°
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-2 bg-black/60 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-gray-400">
          <span>Source: Open-Meteo Satellite</span>
          <span>Coords: {weatherData?.latitude?.toFixed(2)}°, {weatherData?.longitude?.toFixed(2)}°</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
