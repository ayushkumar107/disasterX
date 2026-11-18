import React, { useState, useEffect } from 'react';
import { useDisasterStore } from '../../stores/disasterStore';
import { Radio, AlertTriangle, Globe, BookOpen, ShieldCheck } from 'lucide-react';
import api from '../../services/api';

export const BottomTicker = () => {
  const disasters = useDisasterStore((s) => s.disasters);
  const [newsFeed, setNewsFeed] = useState([]);

  useEffect(() => {
    // Fetch live intelligence news ticker
    api.get('/news?limit=15')
      .then(({ data }) => {
        if (data && data.data) {
          setNewsFeed(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const activeEarthquakes = disasters
    .filter((d) => d.type === 'EARTHQUAKE' || d.source?.includes('USGS') || d.source?.includes('OSIRIS'))
    .slice(0, 10);

  const activeWeather = disasters
    .filter((d) => d.type !== 'EARTHQUAKE')
    .slice(0, 10);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-8 bg-[#03060a]/95 backdrop-blur-md border-t border-[#e5b849]/20 flex items-center justify-between px-3 text-[10px] font-mono select-none shadow-2xl">
      
      {/* Left items: Docs & Quick Stats */}
      <div className="flex items-center gap-3 shrink-0 pr-3 border-r border-white/10 z-10 bg-[#03060a]">
        <a 
          href="/api/health" 
          target="_blank" 
          rel="noreferrer"
          className="flex items-center gap-1 text-[#94a3b8] hover:text-[#e5b849] transition-colors"
        >
          <BookOpen size={11} className="text-[#e5b849]" />
          <span className="font-bold">DOCS</span>
        </a>

        <div className="flex items-center gap-2 text-[#94a3b8]">
          <span className="text-[#00f0ff] font-bold">⚡ 2.4K</span>
          <span className="text-emerald-400">▲1.7%</span>
          <span className="text-[#e5b849] font-bold">$99.43</span>
          <span className="text-red-400">▼2.7%</span>
        </div>
      </div>

      {/* Center Scrolling Ticker */}
      <div className="flex-1 overflow-hidden relative mx-2 h-full flex items-center">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
          
          {/* Earthquakes Ticker Items */}
          {activeEarthquakes.map((eq, i) => (
            <div key={`eq-${i}`} className="inline-flex items-center gap-2 cursor-pointer hover:underline">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
              <span className="font-bold text-orange-400">
                {eq.title || `M4.${i+1} Earthquake`}
              </span>
              <span className="text-gray-400">
                {new Date(eq.startDate || Date.now()).toLocaleTimeString()}
              </span>
            </div>
          ))}

          {/* Weather & News Ticker Items */}
          {newsFeed.map((news, i) => (
            <div key={`news-${i}`} className="inline-flex items-center gap-2 cursor-pointer hover:underline">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]" />
              <span className="text-[#00f0ff] font-medium">{news.title}</span>
              <span className="text-gray-500">[{news.source}]</span>
            </div>
          ))}

          {/* Duplicate set for smooth infinite loop */}
          {activeEarthquakes.map((eq, i) => (
            <div key={`eq-dup-${i}`} className="inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="font-bold text-red-400">{eq.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Controls / System Status */}
      <div className="flex items-center gap-3 shrink-0 pl-3 border-l border-white/10 z-10 bg-[#03060a]">
        <span className="hidden xl:inline text-[#64748b] text-[9px]">
          Press for shortcuts: <span className="text-[#e5b849]">F</span> fullscreen • <span className="text-[#e5b849]">R</span> reset view
        </span>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>ONLINE</span>
        </div>
      </div>
    </div>
  );
};
