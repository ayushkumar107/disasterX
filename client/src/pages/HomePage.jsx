import React, { useEffect } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { OSIRISDock } from '../components/layout/OSIRISDock';
import { BottomTicker } from '../components/layout/BottomTicker';
import { BottomNav } from '../components/layout/BottomNav';
import { LeftPanel } from '../components/layout/LeftPanel';
import { RightPanel } from '../components/layout/RightPanel';
import { GlobalMap } from '../components/map/GlobalMap';
import { ProximityAlert } from '../components/common/ProximityAlert';
import { SOSModal } from '../components/modals/SOSModal';
import { OSIRISInspectorModal } from '../components/modals/OSIRISInspectorModal';
import { OSIRISSystemDrawer } from '../components/layout/OSIRISSystemDrawer';
import { OSIRISLiveSpaceModal } from '../components/modals/OSIRISLiveSpaceModal';
import { OSIRISCCTVModal } from '../components/modals/OSIRISCCTVModal';
import { CommunityChatModal } from '../components/chat/CommunityChatModal';
import { NavigationPanel } from '../components/common/NavigationPanel';
import { WeatherPanel } from '../components/common/WeatherPanel';
import { AIAssistantPanel } from '../components/panels/AIAssistantPanel';
import { EarlyWarningPanel } from '../components/panels/EarlyWarningPanel';
import { SoilMoisturePanel } from '../components/panels/SoilMoisturePanel';
import { RainfallIntelligencePanel } from '../components/panels/RainfallIntelligencePanel';
import { RiskZoneDetailPanel } from '../components/panels/RiskZoneDetailPanel';
import { LandslideReportPanel } from '../components/panels/LandslideReportPanel';
import { ResponsePriorityPanel } from '../components/panels/ResponsePriorityPanel';
import { WarningBanner } from '../components/common/WarningBanner';
import { useDisasterStore } from '../stores/disasterStore';
import { useLandslideStore } from '../stores/landslideStore';
import { useWarningStore } from '../stores/warningStore';
import { useUIStore } from '../stores/uiStore';
import { useAuthStore } from '../stores/authStore';
import { useSocketStore } from '../stores/socketStore';

const HomePage = () => {
  const fetchDisasters = useDisasterStore((s) => s.fetchDisasters);
  const fetchZones = useLandslideStore((s) => s.fetchZones);
  const fetchRoads = useLandslideStore((s) => s.fetchRoads);
  const fetchTerrain = useLandslideStore((s) => s.fetchTerrain);
  const fetchActiveWarnings = useWarningStore((s) => s.fetchActiveWarnings);
  const setOnline = useUIStore((s) => s.setOnline);
  
  const { connectSocket, disconnectSocket } = useSocketStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    fetchDisasters();
    fetchZones();
    fetchRoads();
    fetchTerrain();
    fetchActiveWarnings();

    // Socket.IO real-time connection
    const token = localStorage.getItem('accessToken');
    connectSocket(token);

    // Online/offline detection
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Refresh telemetry every 3 minutes
    const interval = setInterval(() => {
      fetchDisasters();
      fetchZones();
      fetchRoads();
      fetchActiveWarnings();
    }, 3 * 60 * 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
      disconnectSocket();
    };
  }, [fetchDisasters, fetchZones, fetchRoads, fetchTerrain, fetchActiveWarnings, setOnline, connectSocket, disconnectSocket, isAuthenticated]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#03060a]">
      <WarningBanner />
      <TopBar />
      <OSIRISDock />
      <GlobalMap />
      <LeftPanel />
      <RightPanel />
      <BottomNav />
      <BottomTicker />
      <NavigationPanel />
      <WeatherPanel />
      <AIAssistantPanel />
      <EarlyWarningPanel />
      <SoilMoisturePanel />
      <RainfallIntelligencePanel />
      <RiskZoneDetailPanel />
      <LandslideReportPanel />
      <ResponsePriorityPanel />
      <ProximityAlert />
      <SOSModal />
      <OSIRISInspectorModal />
      <OSIRISSystemDrawer />
      <OSIRISLiveSpaceModal />
      <OSIRISCCTVModal />
      <CommunityChatModal />
    </div>
  );
};

export default HomePage;
