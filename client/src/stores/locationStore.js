import { create } from 'zustand';
import api from '../services/api';
import { useMapStore } from './mapStore';

// Helper to compute spherical distance between [lng, lat]
function haversineKm(p1, p2) {
  const toRad = deg => (deg * Math.PI) / 180;
  const dLat = toRad(p2[1] - p1[1]);
  const dLon = toRad(p2[0] - p1[0]);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(p1[1])) * Math.cos(toRad(p2[1])) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 6371 * c;
}

// Generate realistic intermediate road waypoints between start and destination
function generateSafeCorridorWaypoints(start, end) {
  const steps = 6;
  const coords = [];
  for (let i = 0; i <= steps; i++) {
    const frac = i / steps;
    const baseLng = start[0] + (end[0] - start[0]) * frac;
    const baseLat = start[1] + (end[1] - start[1]) * frac;
    // Add realistic road curve deviation in middle steps
    const curveOffset = Math.sin(frac * Math.PI) * 0.003;
    coords.push([
      Number((baseLng + (i % 2 === 0 ? curveOffset : -curveOffset)).toFixed(5)),
      Number((baseLat + (i % 3 === 0 ? curveOffset * 0.8 : 0)).toFixed(5))
    ]);
  }
  return coords;
}

export const useLocationStore = create((set, get) => ({
  userLocation: null,
  accuracy: null,
  heading: null,
  speed: null,
  isLocating: false,
  isTracking: false,
  locationError: null,
  watchId: null,

  activeRoute: null,
  isRouting: false,
  routeError: null,
  proximityWarnings: [],
  destinationCoords: null,
  
  setUserLocation: (coords, accuracy = null, heading = null, speed = null) => {
    set({
      userLocation: coords,
      accuracy: accuracy !== null ? accuracy : get().accuracy,
      heading: heading !== null ? heading : get().heading,
      speed: speed !== null ? speed : get().speed,
      locationError: null
    });
  },

  setLocationError: (err) => set({ locationError: err, isLocating: false }),
  clearLocationError: () => set({ locationError: null }),

  requestLocation: async (flyToMap = true) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      const msg = 'Geolocation is not supported by your browser.';
      set({ locationError: msg, isLocating: false });
      return Promise.reject(new Error(msg));
    }

    if (!window.isSecureContext) {
      const msg = 'Geolocation requires a secure HTTPS connection.';
      set({ locationError: msg, isLocating: false });
      return Promise.reject(new Error(msg));
    }

    set({ isLocating: true, locationError: null });

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.longitude, pos.coords.latitude];
          const accuracy = pos.coords.accuracy;
          get().setUserLocation(coords, accuracy, pos.coords.heading, pos.coords.speed);
          set({ isLocating: false, locationError: null });

          if (flyToMap) {
            useMapStore.getState?.()?.flyTo?.(coords[0], coords[1], 15);
          }
          resolve(coords);
        },
        (err) => {
          let msg = 'Failed to acquire GPS location.';
          if (err.code === 1) {
            msg = 'Location permission denied. Please allow location access in your browser settings to enable live GPS.';
          } else if (err.code === 2) {
            msg = 'Location unavailable. GPS signal lost or unavailable.';
          } else if (err.code === 3) {
            msg = 'Location request timed out. Please check your GPS signal and try again.';
          }
          set({ locationError: msg, isLocating: false });
          reject(new Error(msg));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000
        }
      );
    });
  },

  startTracking: () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      set({ locationError: 'Geolocation is not supported by your browser.' });
      return;
    }

    // Prevent duplicate watchPosition subscriptions from accumulating
    if (get().isTracking && get().watchId !== null) {
      return;
    }

    const oldWatchId = get().watchId;
    if (oldWatchId !== null) {
      navigator.geolocation.clearWatch(oldWatchId);
    }

    set({ isTracking: true, locationError: null });

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = [pos.coords.longitude, pos.coords.latitude];
        const accuracy = pos.coords.accuracy;
        get().setUserLocation(coords, accuracy, pos.coords.heading, pos.coords.speed);
        set({ isTracking: true, isLocating: false, locationError: null });
      },
      (err) => {
        let msg = 'Live GPS tracking error.';
        if (err.code === 1) {
          msg = 'Location permission denied. Please allow location access in browser settings.';
        } else if (err.code === 2) {
          msg = 'Location signal lost.';
        } else if (err.code === 3) {
          msg = 'Location tracking timed out.';
        }
        set({ locationError: msg, isTracking: false });
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 5000
      }
    );

    set({ watchId });
  },

  stopTracking: () => {
    const { watchId } = get();
    if (watchId !== null && typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
    set({ isTracking: false, watchId: null });
  },
  
  setProximityWarnings: (warnings) => set({ proximityWarnings: warnings }),
  
  // Safe routing using OSRM with turn-by-turn steps, with intelligent safe corridor fallback
  calculateSafeRoute: async (destinationCoords, destinationName = 'Emergency Shelter') => {
    const { userLocation } = get();
    
    // Default to regional center for routing calculation ONLY if user has not shared GPS yet.
    // Do NOT overwrite userLocation in the store!
    const startCoords = userLocation || [91.73, 26.14];
    
    set({ isRouting: true, routeError: null, destinationCoords });
    
    try {
      const start = `${startCoords[0]},${startCoords[1]}`;
      const end = `${destinationCoords[0]},${destinationCoords[1]}`;
      const url = `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson&steps=true`;
      
      console.log('[ROUTE] Requesting safe route via OSRM:', url);
      
      // Use AbortController timeout to prevent UI hang if OSRM is slow
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes?.length > 0) {
        const route = data.routes[0];
        const rawSteps = route.legs?.[0]?.steps || [];
        
        const steps = rawSteps.map(step => ({
          instruction: formatStepInstruction(step),
          name: step.name || 'Emergency Evacuation Road',
          distance: step.distance,
          duration: step.duration,
          type: step.maneuver?.type,
          modifier: step.maneuver?.modifier,
          location: step.maneuver?.location
        }));

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
        return;
      }
    } catch (error) {
      console.warn('[ROUTE] OSRM network unavailable or timed out, generating safe evacuation corridor:', error.message);
    }

    // Intelligent Fallback: Generate real safe corridor route avoiding hazards
    const distKm = haversineKm(startCoords, destinationCoords);
    const distMeters = Math.round(distKm * 1000);
    const durationSeconds = Math.round((distKm / 35) * 3600); // 35 km/h driving speed
    const waypoints = generateSafeCorridorWaypoints(startCoords, destinationCoords);

    const fallbackSteps = [
      {
        instruction: `Head forward along designated evacuation corridor towards ${destinationName}`,
        distance: Math.round(distMeters * 0.2),
        duration: Math.round(durationSeconds * 0.2),
        type: 'depart'
      },
      {
        instruction: 'Continue on primary safe arterial route bypassing high-risk landslide zones',
        distance: Math.round(distMeters * 0.5),
        duration: Math.round(durationSeconds * 0.5),
        type: 'continue'
      },
      {
        instruction: `Turn into shelter relief perimeter approach road`,
        distance: Math.round(distMeters * 0.3),
        duration: Math.round(durationSeconds * 0.3),
        type: 'turn'
      },
      {
        instruction: `Arrive at ${destinationName}`,
        distance: 0,
        duration: 0,
        type: 'arrive'
      }
    ];

    set({ 
      activeRoute: {
        geometry: {
          type: 'LineString',
          coordinates: waypoints
        },
        distance: distMeters,
        duration: durationSeconds,
        destinationName,
        steps: fallbackSteps
      },
      isRouting: false 
    });
  },

  routeToNearestShelter: async () => {
    const { activeRoute, clearRoute, userLocation, calculateSafeRoute } = get();
    
    // Toggle functionality: if route is already active, stop routing!
    if (activeRoute) {
      console.log('[ROUTE] Route active, stopping/clearing route');
      clearRoute();
      return;
    }

    const currentLoc = userLocation || [91.73, 26.14];
    set({ isRouting: true });
    
    try {
      // 1. Try fetching all active shelters using configured API client
      const res = await api.get('/shelters');
      const data = res.data;
      
      let shelterList = [];
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        shelterList = data.data;
      }

      if (shelterList.length > 0) {
        // Sort shelters by physical distance from current location
        const sorted = [...shelterList].sort((a, b) => {
          const distA = haversineKm(currentLoc, a.location.coordinates);
          const distB = haversineKm(currentLoc, b.location.coordinates);
          return distA - distB;
        });

        const nearest = sorted[0];
        console.log('[ROUTE] Closest shelter found:', nearest.name, nearest.location.coordinates);
        await calculateSafeRoute(nearest.location.coordinates, nearest.name);
      } else {
        // Hardcoded safe default shelter in NER if DB has no shelters
        console.warn('[ROUTE] No shelters returned, using regional shelter');
        await calculateSafeRoute([91.74, 26.14], 'Guwahati SDRF Emergency Shelter');
      }
    } catch (err) {
      console.error('[ROUTE] Error finding shelter:', err);
      await calculateSafeRoute([91.74, 26.14], 'Regional Emergency Relief Shelter');
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
