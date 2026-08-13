import React, { useEffect } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { BottomNav } from '../components/layout/BottomNav';
import { LeftPanel } from '../components/layout/LeftPanel';
import { RightPanel } from '../components/layout/RightPanel';
import { GlobalMap } from '../components/map/GlobalMap';
import { ProximityAlert } from '../components/common/ProximityAlert';
import { SOSModal } from '../components/modals/SOSModal';
import { NavigationPanel } from '../components/common/NavigationPanel';
import { WeatherPanel } from '../components/common/WeatherPanel';
import { AIAssistantPanel } from '../components/panels/AIAssistantPanel';
import { useDisasterStore } from '../stores/disasterStore';
import { useUIStore } from '../stores/uiStore';

const HomePage = () => {
  const fetchDisasters = useDisasterStore((s) => s.fetchDisasters);
  const setOnline = useUIStore((s) => s.setOnline);

  useEffect(() => {
    fetchDisasters();

    // Online/offline detection
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Refresh disaster data every 5 minutes
    const interval = setInterval(fetchDisasters, 5 * 60 * 1000);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [fetchDisasters, setOnline]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[var(--color-dx-bg)]">
      <TopBar />
      <GlobalMap />
      <LeftPanel />
      <RightPanel />
      <BottomNav />
      <NavigationPanel />
      <WeatherPanel />
      <AIAssistantPanel />
      <ProximityAlert />
      <SOSModal />
    </div>
  );
};

export default HomePage;
