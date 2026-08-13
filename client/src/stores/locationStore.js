import { create } from 'zustand';

export const useLocationStore = create((set, get) => ({
  userLocation: null,
  activeRoute: null,
  isRouting: false,
  routeError: null,
  proximityWarnings: [],
  destinationCoords: null,
  
  setUserLocation: (coords) => set({ userLocation: coords }),
  
  setProximityWarnings: (warnings) => set({ proximityWarnings: warnings }),
  
  // Safe routing using OSRM with turn-by-turn steps
  calculateSafeRoute: async (destinationCoords, destinationName = 'Emergency Shelter') => {
    const { userLocation } = get();
    console.log('[ROUTE] calculateSafeRoute called', { userLocation, destinationCoords, destinationName });
    
    if (!userLocation) {
      console.warn('[ROUTE] No user location available');
      set({ routeError: 'User location not available' });
      return;
    }
    
    set({ isRouting: true, routeError: null, destinationCoords });
    
    try {
      const start = `${userLocation[0]},${userLocation[1]}`;
      const end = `${destinationCoords[0]},${destinationCoords[1]}`;
      const url = `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson&steps=true`;
      
      console.log('[ROUTE] Fetching OSRM steps:', url);
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes.length > 0) {
        const route = data.routes[0];
        const rawSteps = route.legs?.[0]?.steps || [];
        
        const steps = rawSteps.map(step => ({
          instruction: formatStepInstruction(step),
          name: step.name || 'Road',
          distance: step.distance, // in meters
          duration: step.duration, // in seconds
          type: step.maneuver?.type,
          modifier: step.maneuver?.modifier,
          location: step.maneuver?.location
        }));

        console.log('[ROUTE] SUCCESS with', steps.length, 'turn-by-turn steps');
        set({ 
          activeRoute: {
            geometry: route.geometry,
            distance: route.distance,
            duration: route.duration,
            destinationName,
            steps
          },
          isRouting: false 
        });
      } else {
        console.warn('[ROUTE] OSRM failed, falling back to straight line');
        set({ 
          activeRoute: {
            geometry: {
              type: 'LineString',
              coordinates: [userLocation, destinationCoords]
            },
            distance: null,
            duration: null,
            destinationName,
            steps: [{ instruction: 'Head straight towards destination shelter', distance: null, type: 'depart' }]
          },
          routeError: 'Driving route unavailable. Showing direct aerial route.', 
          isRouting: false 
        });
      }
    } catch (error) {
      console.error('[ROUTE] Error fetching route:', error);
      set({ 
        activeRoute: {
          geometry: {
            type: 'LineString',
            coordinates: [get().userLocation || [80.94, 26.84], destinationCoords]
          },
          distance: null,
          duration: null,
          destinationName,
          steps: [{ instruction: 'Proceed directly to shelter', distance: null, type: 'depart' }]
        },
        routeError: 'Failed to calculate route. Showing direct line.',
        isRouting: false 
      });
    }
  },

  routeToNearestShelter: async () => {
    const { activeRoute, clearRoute, userLocation, calculateSafeRoute } = get();
    
    // Toggle functionality: if route is already active, stop routing!
    if (activeRoute) {
      console.log('[ROUTE] Route active, stopping/clearing route');
      clearRoute();
      return;
    }

    const currentLoc = userLocation || [80.94, 26.84];
    set({ isRouting: true });
    
    try {
      const url = `/api/shelters/nearby?lng=${currentLoc[0]}&lat=${currentLoc[1]}&maxDistance=5000000`;
      console.log('[ROUTE] Fetching shelters:', url);
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success && data.data.length > 0) {
        const nearest = data.data[0];
        console.log('[ROUTE] Nearest shelter:', nearest.name, nearest.location.coordinates);
        await calculateSafeRoute(nearest.location.coordinates, nearest.name);
      } else {
        console.warn('[ROUTE] No shelters found');
        set({ routeError: 'No nearby shelters found', isRouting: false });
      }
    } catch (err) {
      console.error('[ROUTE] Error finding shelter:', err);
      set({ routeError: 'Error finding nearest shelter', isRouting: false });
    }
  },
  
  clearRoute: () => set({ activeRoute: null, routeError: null, destinationCoords: null })
}));

function formatStepInstruction(step) {
  const type = step.maneuver?.type || 'straight';
  const modifier = step.maneuver?.modifier || '';
  const road = step.name ? `onto ${step.name}` : '';
  
  if (type === 'depart') return `Head ${modifier || 'forward'} ${road}`.trim();
  if (type === 'arrive') return `Arrive at destination shelter`;
  if (type === 'turn') return `Turn ${modifier} ${road}`.trim();
  if (type === 'new name') return `Continue ${road}`.trim();
  if (type === 'end of road') return `At end of road, turn ${modifier} ${road}`.trim();
  if (type === 'fork') return `Keep ${modifier} at fork ${road}`.trim();
  if (type === 'roundabout') return `At roundabout, take exit ${road}`.trim();
  if (type === 'merge') return `Merge ${modifier} ${road}`.trim();
  if (type === 'on ramp' || type === 'off ramp') return `Take ramp ${modifier} ${road}`.trim();
  return `Continue ${modifier} ${road}`.trim();
}
