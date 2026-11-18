import { create } from 'zustand';

export const useMapStore = create(set => ({
  center: [92.73, 25.17],
  zoom: 3.5,
  pitch: 45,
  bearing: -15,
  projection: 'globe', // 'globe' or 'mercator'
  showLayers: {
    maritime: true,
    cctv: true,
    live_news: true,
    earthquakes: true,
    global_incidents: true,
    day_night: true,
    cables: true,
    sdk_air: true,
    sdk_naval: true,
    disasters: true,
    shelters: true,
    sos: true,
    rescueTeams: true,
    weather: true,
    userLocation: true,
    landslideRiskZones: true,
    rainfallObservations: true,
    soilSensors: true,
    roadRisks: true
  },
  selectedEntity: null,
  setSelectedEntity: (entity) => set({ selectedEntity: entity }),
  setCenter: center => set({ center }),
  setZoom: zoom => set({ zoom }),
  setProjection: (proj) => set({ projection: proj }),
  toggleLayer: layer => set(state => {
    const updatedLayers = {
      ...state.showLayers,
      [layer]: !state.showLayers[layer]
    };

    // Sync active tactical layers with URL parameters: ?layers=maritime,cctv,earthquakes...
    try {
      const activeList = Object.entries(updatedLayers)
        .filter(([, active]) => active)
        .map(([k]) => k)
        .join(',');
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set('layers', activeList);
      window.history.replaceState(null, '', `${window.location.pathname}?${searchParams.toString()}`);
    } catch (e) {
      /* ignore */
    }

    return { showLayers: updatedLayers };
  }),
  flyTo: (lng, lat, zoom = 6) => set({
    center: [lng, lat],
    zoom
  })
}));
