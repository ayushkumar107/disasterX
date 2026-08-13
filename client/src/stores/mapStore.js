import { create } from 'zustand';
export const useMapStore = create(set => ({
  center: [0, 20],
  zoom: 2.5,
  showLayers: {
    disasters: true,
    shelters: true,
    sos: true,
    rescueTeams: true,
    weather: false,
    safeZones: false,
    userLocation: true
  },
  setCenter: center => set({
    center
  }),
  setZoom: zoom => set({
    zoom
  }),
  toggleLayer: layer => set(state => ({
    showLayers: {
      ...state.showLayers,
      [layer]: !state.showLayers[layer]
    }
  })),
  flyTo: (lng, lat, zoom = 10) => set({
    center: [lng, lat],
    zoom
  })
}));
