import React, { useRef, useEffect, useCallback, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapStore } from '../../stores/mapStore';
import { useDisasterStore } from '../../stores/disasterStore';
import { useLocationStore } from '../../stores/locationStore';
import { useShelterStore } from '../../stores/shelterStore';
import { useLandslideStore } from '../../stores/landslideStore';
import { useSensorStore } from '../../stores/sensorStore';
import { useRainfallStore } from '../../stores/rainfallStore';
import { DISASTER_TYPE_CONFIG, SEVERITY_CONFIG, RISK_LEVEL_CONFIG } from '../../types/disaster';
import { distance, point } from '@turf/turf';
import { SUBSEA_CABLES_GEOJSON, GLOBAL_INCIDENTS, getSolarTerminatorGeoJSON } from '../../utils/osirisGeoData';
const DARK_MAP_STYLE = {
  version: 8,
  sources: {
    'esri-dark-base': {
      type: 'raster',
      tiles: [
        'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      maxzoom: 16,
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, HERE, Garmin, &copy; OpenStreetMap contributors, and the GIS user community'
    },
    'esri-dark-ref': {
      type: 'raster',
      tiles: [
        'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      maxzoom: 16
    }
  },
  layers: [
    {
      id: 'esri-dark-base-layer',
      type: 'raster',
      source: 'esri-dark-base',
      minzoom: 0,
      maxzoom: 22
    },
    {
      id: 'esri-dark-ref-layer',
      type: 'raster',
      source: 'esri-dark-ref',
      minzoom: 0,
      maxzoom: 22
    }
  ]
};

const CARTO_DARK_STYLE = DARK_MAP_STYLE;

const SATELLITE_STYLE = {
  version: 8,
  sources: {
    'satellite-tiles': {
      type: 'raster',
      tiles: [
        'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a>'
    }
  },
  layers: [
    {
      id: 'satellite-layer',
      type: 'raster',
      source: 'satellite-tiles',
      minzoom: 0,
      maxzoom: 22
    }
  ]
};

const addCustomTacticalLayers = (map) => {
  if (!map) return;

  // 1. Add Subsea Fiber Optic Cables Layer
  if (!map.getSource('osiris-cables')) {
    map.addSource('osiris-cables', {
      type: 'geojson',
      data: SUBSEA_CABLES_GEOJSON
    });

    map.addLayer({
      id: 'osiris-cables-glow',
      type: 'line',
      source: 'osiris-cables',
      paint: {
        'line-color': '#00f0ff',
        'line-width': 4,
        'line-opacity': 0.35
      }
    });

    map.addLayer({
      id: 'osiris-cables-line',
      type: 'line',
      source: 'osiris-cables',
      paint: {
        'line-color': '#00a8ff',
        'line-width': 1.5,
        'line-opacity': 0.8
      }
    });
  }

  // 2. Add Solar Day/Night Shadow Terminator Overlay
  if (!map.getSource('osiris-terminator')) {
    map.addSource('osiris-terminator', {
      type: 'geojson',
      data: getSolarTerminatorGeoJSON()
    });

    map.addLayer({
      id: 'osiris-terminator-layer',
      type: 'fill',
      source: 'osiris-terminator',
      paint: {
        'fill-color': '#02050c',
        'fill-opacity': 0.45
      }
    });
  }
};
export const GlobalMap = () => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef(new Map());
  
  // UI map projection states - 2D Mercator ensures rock-solid marker anchoring during zoom
  const [projectionMode, setProjectionMode] = useState('2D'); // '2D' or '3D'
  const [tileMode, setTileMode] = useState('MAP'); // 'MAP' or 'SAT'
  const [cursorPos, setCursorPos] = useState({ lat: 25.17, lng: 92.73, location: 'North Eastern Region, India' });

  const {
    center,
    zoom,
    showLayers,
    setSelectedEntity
  } = useMapStore();
  const {
    disasters,
    setSelectedDisaster,
    filters
  } = useDisasterStore();
  const {
    userLocation,
    setUserLocation,
    accuracy,
    isLocating,
    isTracking,
    locationError,
    setLocationError,
    clearLocationError,
    requestLocation,
    setProximityWarnings,
    activeRoute,
    destinationCoords,
    calculateSafeRoute
  } = useLocationStore();

  const userMarkerRef = useRef(null);
  const geolocateControlRef = useRef(null);

  useEffect(() => {
    window.__navigateToShelter = (coords, name) => {
      calculateSafeRoute(coords, name);
    };
    window.__triggerGeolocate = () => {
      if (geolocateControlRef.current) {
        geolocateControlRef.current.trigger();
      } else {
        requestLocation(true).catch(e => console.warn('[LOC]', e.message));
      }
    };
    return () => {
      delete window.__navigateToShelter;
      delete window.__triggerGeolocate;
    };
  }, [calculateSafeRoute, requestLocation]);
  
  const { shelters, fetchShelters } = useShelterStore();
  const shelterMarkersRef = useRef(new Map());

  const { zones, fetchZones, selectedZone, setSelectedZone, roads, fetchRoads } = useLandslideStore();
  const { sensors, fetchSensors } = useSensorStore();
  const { rainfallData, fetchRainfallData } = useRainfallStore();

  const zoneMarkersRef = useRef(new Map());
  const sensorMarkersRef = useRef(new Map());
  const rainfallMarkersRef = useRef(new Map());

  const routeMarkerRef = useRef(null);
  const [routePathD, setRoutePathD] = useState('');

  // Fetch shelters and landslide telemetry on mount
  useEffect(() => {
    fetchShelters();
    fetchZones();
    fetchRoads();
    fetchSensors();
    fetchRainfallData();
  }, [fetchShelters, fetchZones, fetchRoads, fetchSensors, fetchRainfallData]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const styleEl = document.createElement('style');
    styleEl.id = 'map-animation-styles';
    styleEl.innerHTML = `
      @keyframes landslideSlide {
        0% { transform: translateY(-4px) translateX(0) scale(1); opacity: 0; }
        20% { opacity: 1; }
        80% { opacity: 1; }
        100% { transform: translateY(8px) translateX(-5px) scale(0.6); opacity: 0; }
      }
      @keyframes raindropFall {
        0% { transform: translateY(-2px); opacity: 0; }
        20% { opacity: 1; }
        80% { opacity: 1; }
        100% { transform: translateY(10px); opacity: 0; }
      }
    `;
    document.head.appendChild(styleEl);

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: CARTO_DARK_STYLE,
      center: center,
      zoom: zoom,
      pitch: 0,
      bearing: 0,
      maxPitch: 85,
      projection: { type: 'mercator' },
      minZoom: 1.5,
      maxZoom: 18,
      attributionControl: true,
      antialias: true
    });
    map.addControl(new maplibregl.NavigationControl({
      showCompass: true
    }), 'bottom-right');
    map.addControl(new maplibregl.ScaleControl({
      maxWidth: 200
    }), 'bottom-left');

    // Add Geolocate Control for user's live location
    const geolocate = new maplibregl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000
      },
      trackUserLocation: true,
      showUserHeading: true,
      showAccuracyCircle: true
    });

    geolocate.on('geolocate', (e) => {
      setUserLocation(
        [e.coords.longitude, e.coords.latitude],
        e.coords.accuracy,
        e.coords.heading,
        e.coords.speed
      );
    });

    geolocate.on('error', (err) => {
      let msg = 'Failed to acquire GPS location.';
      if (err.code === 1) {
        msg = 'Location permission denied. Please allow location access in your browser settings to enable live GPS.';
      } else if (err.code === 2) {
        msg = 'Location unavailable. GPS signal lost or unavailable.';
      } else if (err.code === 3) {
        msg = 'Location request timed out. Please check your GPS signal and try again.';
      }
      setLocationError(msg);
    });

    geolocate.on('trackuserlocationstart', () => {
      useLocationStore.setState({ isTracking: true });
    });

    geolocate.on('trackuserlocationend', () => {
      useLocationStore.setState({ isTracking: false });
    });

    map.addControl(geolocate, 'bottom-right');
    geolocateControlRef.current = geolocate;
    
    map.on('style.load', () => {
      addCustomTacticalLayers(map);
    });

    map.on('load', () => {
      addCustomTacticalLayers(map);

      // Check if geolocation permission was previously granted before auto-triggering
      if (typeof navigator !== 'undefined' && navigator.permissions?.query) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          if (result.state === 'granted') {
            geolocate.trigger();
          }
        }).catch(() => {
          // Ignore permissions query failure
        });
      }

      map.on('click', 'osiris-cables-line', (e) => {
        if (e.features && e.features[0]) {
          const props = e.features[0].properties;
          setSelectedEntity({
            title: props.name || 'Submarine Optic Fiber Cable',
            category: 'cables',
            source: 'Subsea Intelligence Network',
            capacity: props.capacity || '40 Tbps',
            coords: [e.lngLat.lng, e.lngLat.lat],
            details: `High-capacity optical fiber cable route transmitting trans-oceanic telecommunications and cloud data traffic.`
          });
        }
      });

      // 3. Add Global Conflict & Strategic Incident Markers (matching OSIRIS UI screenshot)
      GLOBAL_INCIDENTS.forEach((inc) => {
        const el = document.createElement('div');
        el.className = 'cursor-pointer group flex flex-col items-center select-none';
        
        const isCritical = inc.level === 'CRITICAL';
        const colorClass = isCritical ? 'text-red-500 bg-red-950/80 border-red-500' : 'text-amber-400 bg-amber-950/80 border-amber-500';

        el.innerHTML = `
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-mono font-bold shadow-2xl backdrop-blur-md ${colorClass} group-hover:scale-110 transition-transform">
            <span className="w-1.5 h-1.5 rounded-full ${isCritical ? 'bg-red-500 animate-ping' : 'bg-amber-400'}"></span>
            <span>${inc.title}</span>
          </div>
          <div className="text-[8px] font-mono text-gray-400 group-hover:text-white uppercase tracking-tighter shadow-md">
            ${inc.subtitle}
          </div>
        `;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          setSelectedEntity(inc);
        });

        new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat(inc.coords)
          .addTo(map);
      });
    });

    // Track mouse coordinates for OSIRIS cursor bar
    map.on('mousemove', (e) => {
      setCursorPos({
        lat: e.lngLat.lat.toFixed(4),
        lng: e.lngLat.lng.toFixed(4),
        location: e.lngLat.lng > 88 && e.lngLat.lng < 97 && e.lngLat.lat > 21 && e.lngLat.lat > 30 ? 'North Eastern Region, India' : 'Global Coordinates'
      });
    });
    
    const resizeObserver = new ResizeObserver(() => {
      if (map) map.resize();
    });
    resizeObserver.observe(mapContainer.current);
    
    mapRef.current = map;

    return () => {
      resizeObserver.disconnect();
      useLocationStore.getState().stopTracking();
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      map.remove();
      mapRef.current = null;
      const style = document.getElementById('map-animation-styles');
      if (style) style.remove();
    };
  }, []);

  const currentTileModeRef = useRef('MAP');

  // Switch between CARTO Dark Matter and Satellite tiles dynamically
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (currentTileModeRef.current === tileMode) return;
    currentTileModeRef.current = tileMode;

    if (tileMode === 'SAT') {
      map.setStyle(SATELLITE_STYLE);
    } else {
      map.setStyle(CARTO_DARK_STYLE);
    }
  }, [tileMode]);

  // Switch between 3D Globe and 2D Mercator projection dynamically
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    try {
      if (projectionMode === '3D') {
        if (typeof map.setProjection === 'function') {
          map.setProjection({ type: 'globe' });
        }
        map.easeTo({ pitch: 45, bearing: -15, duration: 1000 });
      } else {
        if (typeof map.setProjection === 'function') {
          map.setProjection({ type: 'mercator' });
        }
        map.easeTo({ pitch: 0, bearing: 0, duration: 1000 });
      }
    } catch (err) {
      console.log('[MAP] Projection error:', err);
    }
  }, [projectionMode]);

  // Calculate proximity warnings
  useEffect(() => {
    if (!userLocation || disasters.length === 0) return;
    const userPt = point(userLocation);
    const warnings = [];

    disasters.forEach(d => {
      if (d.status !== 'ACTIVE') return;
      const dPt = point(d.location.coordinates);
      const dist = distance(userPt, dPt, { units: 'kilometers' });
      // If within affected radius (km)
      if (dist <= (d.affectedRadius || 50)) {
        warnings.push({ id: d._id, title: d.title, distance: dist });
      }
    });

    setProximityWarnings(warnings);
  }, [userLocation, disasters, setProximityWarnings]);

  // Handle active routes - draw the path line + destination marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      console.log('[MAP] No map ref yet, skipping route draw');
      return;
    }

    const drawRoute = () => {
      console.log('[MAP] drawRoute called, activeRoute:', !!activeRoute);

      // Clean up old destination marker
      if (routeMarkerRef.current) {
        routeMarkerRef.current.remove();
        routeMarkerRef.current = null;
      }

      // If no route, clear the source
      if (!activeRoute) {
        try {
          if (map.getLayer('safe-route-line')) map.removeLayer('safe-route-line');
          if (map.getLayer('safe-route-glow')) map.removeLayer('safe-route-glow');
          if (map.getSource('safe-route')) map.removeSource('safe-route');
        } catch (e) { /* ignore */ }
        return;
      }

      console.log('[MAP] Drawing route with', activeRoute.geometry.coordinates.length, 'coordinates');

      const geojsonData = {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          properties: {},
          geometry: activeRoute.geometry
        }]
      };

      try {
        // Remove old layers/source to avoid conflicts
        if (map.getLayer('safe-route-line')) map.removeLayer('safe-route-line');
        if (map.getLayer('safe-route-glow')) map.removeLayer('safe-route-glow');
        if (map.getSource('safe-route')) map.removeSource('safe-route');

        // Add fresh source + layers
        map.addSource('safe-route', { type: 'geojson', data: geojsonData });
        
        // Glow layer (wider, semi-transparent)
        map.addLayer({
          id: 'safe-route-glow',
          type: 'line',
          source: 'safe-route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#00ff66', 'line-width': 14, 'line-opacity': 0.4 }
        });
        
        // Main route line
        map.addLayer({
          id: 'safe-route-line',
          type: 'line',
          source: 'safe-route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#00ff66', 'line-width': 6, 'line-opacity': 1.0 }
        });

        // Force route layers to the very top
        map.moveLayer('safe-route-glow');
        map.moveLayer('safe-route-line');

        // Log all layers for debugging
        const allLayers = map.getStyle().layers.map(l => l.id);
        console.log('[MAP] All layers after adding route:', allLayers);
        console.log('[MAP] Route layers added successfully');
      } catch (err) {
        console.error('[MAP] Error adding route layers:', err);
        return;
      }

      // Add destination marker pin
      if (destinationCoords) {
        const destEl = document.createElement('div');
        destEl.innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;">
            <div style="width:32px;height:32px;background:#00f0ff;border-radius:50%;border:3px solid #fff;
                        box-shadow:0 0 20px rgba(0,240,255,0.8);display:flex;align-items:center;
                        justify-content:center;font-size:16px;">🏠</div>
            <div style="width:3px;height:12px;background:#00f0ff;margin-top:-2px;"></div>
            <div style="width:8px;height:4px;background:#00f0ff;border-radius:50%;opacity:0.5;"></div>
          </div>
        `;
        routeMarkerRef.current = new maplibregl.Marker({ element: destEl, anchor: 'bottom' })
          .setLngLat(destinationCoords)
          .addTo(map);
      }

      // Fit bounds to show entire route
      const coordinates = activeRoute.geometry.coordinates;
      if (coordinates && coordinates.length > 1) {
        const bounds = new maplibregl.LngLatBounds(coordinates[0], coordinates[0]);
        coordinates.forEach(coord => bounds.extend(coord));
        map.fitBounds(bounds, { padding: 100, duration: 2000 });
        console.log('[MAP] Fitted bounds to route');
      }
    };

    // Wait for map style to be fully ready before drawing
    if (map.isStyleLoaded && map.isStyleLoaded()) {
      drawRoute();
    } else {
      map.once('style.load', () => {
        drawRoute();
      });
    }
  }, [activeRoute, destinationCoords, tileMode]);

  // SVG route path projection for 100% reliable rendering
  const updateSvgPath = useCallback(() => {
    if (!mapRef.current || !activeRoute?.geometry?.coordinates) {
      setRoutePathD('');
      return;
    }
    const map = mapRef.current;
    const coords = activeRoute.geometry.coordinates;
    if (coords.length < 2) return;

    const points = coords.map(coord => {
      const pt = map.project(coord);
      return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    });
    setRoutePathD(`M ${points.join(' L ')}`);
  }, [activeRoute]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    updateSvgPath();

    map.on('move', updateSvgPath);
    map.on('zoom', updateSvgPath);
    map.on('resize', updateSvgPath);

    return () => {
      map.off('move', updateSvgPath);
      map.off('zoom', updateSvgPath);
      map.off('resize', updateSvgPath);
    };
  }, [updateSvgPath]);

  // Handle flyTo changes
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: center,
      zoom: zoom,
      duration: 1500,
      essential: true
    });
  }, [center, zoom]);

  // Create disaster marker element
  const createMarkerElement = useCallback(disaster => {
    const typeConfig = DISASTER_TYPE_CONFIG[disaster.type];
    const sevConfig = SEVERITY_CONFIG[disaster.severity];
    const isCritical = disaster.severity === 'CRITICAL';
    const isHigh = disaster.severity === 'HIGH';

    // Root marker container - zero width/height, perfectly centered, NO transition on transform!
    const el = document.createElement('div');
    el.className = 'disaster-marker';
    el.style.cssText = `
      position: relative;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 0px;
      height: 0px;
    `;

    // Inner wrapper that handles scaling/hover effects without overriding MapLibre's translate
    const inner = document.createElement('div');
    inner.style.cssText = `
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.15s ease-out;
      transform-origin: center center;
    `;
    el.appendChild(inner);

    // Danger Zone Heat Aura
    const snapchatAura = document.createElement('div');
    const auraSize = isCritical ? 64 : isHigh ? 50 : 38;
    snapchatAura.style.cssText = `
      position: absolute;
      width: ${auraSize}px;
      height: ${auraSize}px;
      border-radius: 50%;
      background: radial-gradient(circle, ${sevConfig.color}66 0%, ${sevConfig.color}22 55%, transparent 80%);
      border: 1.5px dashed ${sevConfig.color}aa;
      box-shadow: 0 0 20px ${sevConfig.color}88;
      animation: snapchatAuraPulse 2.5s ease-in-out infinite;
      pointer-events: none;
      z-index: 1;
    `;
    inner.appendChild(snapchatAura);

    // Pulse ring for critical/high severity
    if (isCritical || isHigh) {
      const ring = document.createElement('div');
      ring.style.cssText = `
        position: absolute;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 2px solid ${sevConfig.color};
        opacity: 0;
        animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      `;
      inner.appendChild(ring);
      if (isCritical) {
        const ring2 = document.createElement('div');
        ring2.style.cssText = ring.style.cssText + 'animation-delay: 0.7s;';
        inner.appendChild(ring2);
      }
    }

    // Main marker dot
    const dot = document.createElement('div');
    const size = isCritical ? 20 : isHigh ? 16 : disaster.severity === 'MEDIUM' ? 13 : 10;
    dot.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: ${typeConfig.color};
      border: 2px solid ${sevConfig.color};
      box-shadow: 0 0 ${isCritical ? 15 : 8}px ${typeConfig.color}80;
      position: relative;
      z-index: 2;
    `;
    inner.appendChild(dot);

    // Icon inside for larger markers
    if (size >= 16) {
      const icon = document.createElement('div');
      icon.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: ${size >= 20 ? 10 : 8}px;
        z-index: 3;
        line-height: 1;
      `;
      icon.textContent = typeConfig.icon;
      inner.appendChild(icon);
    }

    // Hover effect on inner wrapper to never touch MapLibre's root translation
    el.addEventListener('mouseenter', () => {
      inner.style.transform = 'scale(1.35)';
      el.style.zIndex = '100';
    });
    el.addEventListener('mouseleave', () => {
      inner.style.transform = 'scale(1)';
      el.style.zIndex = '1';
    });
    return el;
  }, []);

  // Create popup content
  const createPopupContent = useCallback(disaster => {
    const typeConfig = DISASTER_TYPE_CONFIG[disaster.type];
    const timeSince = getTimeSince(new Date(disaster.startDate));
    return `
      <div style="padding: 12px 14px; min-width: 220px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="font-size: 16px;">${typeConfig.icon}</span>
          <span style="font-size: 13px; font-weight: 600; color: #e8f0f8;">${disaster.title}</span>
        </div>
        <div style="display: flex; gap: 6px; margin-bottom: 8px;">
          <span style="font-size: 10px; padding: 2px 8px; border-radius: 4px; font-weight: 600;
            background: ${SEVERITY_CONFIG[disaster.severity].bg};
            color: ${SEVERITY_CONFIG[disaster.severity].color};
            border: 1px solid ${SEVERITY_CONFIG[disaster.severity].color}33;">
            ${disaster.severity}
          </span>
          <span style="font-size: 10px; padding: 2px 8px; border-radius: 4px;
            background: ${typeConfig.color}1a; color: ${typeConfig.color};
            border: 1px solid ${typeConfig.color}33;">
            ${typeConfig.label}
          </span>
        </div>
        ${disaster.description ? `<p style="font-size: 11px; color: #6b7fa3; margin: 0 0 6px; line-height: 1.4;">${disaster.description.slice(0, 120)}${disaster.description.length > 120 ? '...' : ''}</p>` : ''}
        <div style="display: flex; gap: 12px; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #6b7fa3;">
          <span>📍 ${disaster.location.coordinates[1].toFixed(3)}°, ${disaster.location.coordinates[0].toFixed(3)}°</span>
          <span>⏱ ${timeSince}</span>
        </div>
        ${disaster.estimatedAffected ? `<div style="margin-top: 6px; font-size: 10px; color: #f59e0b;">👥 ~${disaster.estimatedAffected.toLocaleString()} affected</div>` : ''}
        <div style="margin-top: 8px; font-size: 9px; color: #4a5568;">Source: ${disaster.source} | Confidence: ${disaster.confidence}%</div>
      </div>
    `;
  }, []);

  // Update markers when disasters or filters change
  useEffect(() => {
    if (!mapRef.current) return;

    // Filter disasters
    const filteredDisasters = disasters.filter(d => {
      if (!showLayers.disasters) return false;
      if (filters.types.length > 0 && !filters.types.includes(d.type)) return false;
      if (filters.severities.length > 0 && !filters.severities.includes(d.severity)) return false;
      if (filters.status.length > 0 && !filters.status.includes(d.status)) return false;
      return true;
    });
    const activeIds = new Set(filteredDisasters.map(d => d._id));

    // Remove markers no longer in view
    markersRef.current.forEach((marker, id) => {
      if (!activeIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Add/update markers
    filteredDisasters.forEach(disaster => {
      if (markersRef.current.has(disaster._id)) return;
      const el = createMarkerElement(disaster);
      const popup = new maplibregl.Popup({
        offset: 15,
        closeButton: true,
        closeOnClick: false,
        maxWidth: '300px'
      }).setHTML(createPopupContent(disaster));
      const marker = new maplibregl.Marker({
        element: el,
        anchor: 'center'
      }).setLngLat(disaster.location.coordinates).setPopup(popup).addTo(mapRef.current);
      el.addEventListener('click', () => {
        setSelectedDisaster(disaster);
      });
      markersRef.current.set(disaster._id, marker);
    });
  }, [disasters, filters, showLayers.disasters, createMarkerElement, createPopupContent, setSelectedDisaster]);

  // Render User Location Tactical Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clean up if layer hidden or no location
    if (!showLayers.userLocation || !userLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      return;
    }

    const [lng, lat] = userLocation;

    // If marker already exists, smoothly update its position
    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat([lng, lat]);
      return;
    }

    const el = document.createElement('div');
    el.className = 'user-tactical-marker cursor-pointer select-none';
    el.innerHTML = `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(0, 255, 102, 0.25); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background: rgba(0, 255, 102, 0.45); border: 1px solid rgba(0, 255, 102, 0.8);"></div>
        <div style="position: relative; width: 10px; height: 10px; border-radius: 50%; background: #00ff66; border: 2px solid #ffffff; box-shadow: 0 0 10px #00ff66, 0 0 20px #00ff66;"></div>
      </div>
    `;

    const accuracyText = accuracy ? `Accuracy: ±${Math.round(accuracy)}m` : 'Live GPS Verified';

    const popup = new maplibregl.Popup({
      offset: 18,
      closeButton: true,
      closeOnClick: false,
      maxWidth: '280px'
    }).setHTML(`
      <div style="padding: 10px; font-family: monospace; background: #070e18; color: #f8fafc; border: 1px solid rgba(0, 255, 102, 0.4); border-radius: 8px;">
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
          <span style="color: #00ff66; font-size: 14px;">📍</span>
          <span style="color: #00ff66; font-weight: bold; font-size: 12px; letter-spacing: 0.05em;">YOUR LIVE LOCATION</span>
        </div>
        <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">
          Coordinates: <strong style="color: #ffffff;">${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E</strong>
        </div>
        <div style="font-size: 10px; color: #00ff66; background: rgba(0, 255, 102, 0.1); padding: 2px 6px; border-radius: 4px; display: inline-block;">
          ${accuracyText}
        </div>
      </div>
    `);

    const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
      .setLngLat([lng, lat])
      .setPopup(popup)
      .addTo(map);

    userMarkerRef.current = marker;
  }, [userLocation, showLayers.userLocation, accuracy]);

  // Render shelter markers
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Clean up if layer hidden
    if (!showLayers.shelters) {
      shelterMarkersRef.current.forEach(marker => marker.remove());
      shelterMarkersRef.current.clear();
      return;
    }

    shelters.forEach(shelter => {
      if (shelterMarkersRef.current.has(shelter._id)) return;
      
      const el = document.createElement('div');
      el.className = 'shelter-marker';
      el.style.cssText = `
        width: 24px;
        height: 24px;
        background: #00cc66;
        border-radius: 50%;
        border: 2px solid #ffffff;
        box-shadow: 0 0 10px rgba(0,204,102,0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        cursor: pointer;
        z-index: 5;
      `;
      el.textContent = '🏠';
      
      const popup = new maplibregl.Popup({ offset: 15, closeButton: true })
        .setHTML(`
          <div style="padding: 10px; font-family: monospace;">
            <h3 style="margin:0 0 5px; color:#00cc66; font-size:13px; font-weight:bold;">${shelter.name}</h3>
            <p style="margin:0 0 5px; font-size:11px; color:#a0aec0;">${shelter.address}</p>
            <p style="margin:0 0 8px; font-size:11px; font-weight:bold; color:#e2e8f0;">
              Capacity: ${shelter.currentOccupancy} / ${shelter.capacity}
            </p>
            <button
              onclick="window.__navigateToShelter && window.__navigateToShelter([${shelter.location.coordinates[0]}, ${shelter.location.coordinates[1]}], '${shelter.name.replace(/'/g, "\\'")}')"
              style="width:100%; padding:5px 8px; background:rgba(0,255,102,0.15); border:1px solid #00ff66; border-radius:4px; color:#00ff66; font-size:10px; font-weight:bold; cursor:pointer;"
            >
              🧭 SAFE ROUTE TO SHELTER
            </button>
          </div>
        `);
        
      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(shelter.location.coordinates)
        .setPopup(popup)
        .addTo(mapRef.current);
        
      shelterMarkersRef.current.set(shelter._id, marker);
    });
  }, [shelters, showLayers.shelters]);

  // Render Landslide Risk Zones
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Clean up if layer hidden
    if (!showLayers.landslideRiskZones) {
      zoneMarkersRef.current.forEach(marker => marker.remove());
      zoneMarkersRef.current.clear();
      return;
    }

    zones.forEach(zone => {
      if (zoneMarkersRef.current.has(zone._id)) return;
      
      const config = RISK_LEVEL_CONFIG[zone.riskLevel] || { color: '#ffffff', bg: 'rgba(255,255,255,0.1)' };
      
      const el = document.createElement('div');
      el.className = 'zone-marker';
      el.style.cssText = `
        position: relative;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      `;

      // Snapchat style threat aura
      const aura = document.createElement('div');
      const size = zone.riskLevel === 'CRITICAL' ? 56 : zone.riskLevel === 'HIGH' ? 44 : 32;
      aura.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: radial-gradient(circle, ${config.color}55 0%, ${config.color}11 60%, transparent 80%);
        border: 1px dashed ${config.color}88;
        animation: snapchatAuraPulse 3s ease-in-out infinite;
        pointer-events: none;
      `;
      el.appendChild(aura);

      const animContainer = document.createElement('div');
      animContainer.className = 'landslide-anim';
      animContainer.style.cssText = `
        position: relative;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2;
      `;
      animContainer.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${config.color}" stroke-width="2">
          <path d="M3 20 L13 8 L17 13 L21 20 Z" fill="${config.color}22" />
          <path d="M11 10.5 L8 14" stroke="${config.color}" stroke-dasharray="2 2" />
        </svg>
        <div class="rock" style="position: absolute; width: 4px; height: 4px; background: ${config.color}; border-radius: 1px; animation: landslideSlide 1.5s infinite linear; top: 8px; left: 10px;"></div>
        <div class="rock" style="position: absolute; width: 3px; height: 3px; background: ${config.color}; border-radius: 1px; animation: landslideSlide 1.5s infinite linear; animation-delay: 0.5s; top: 10px; left: 12px;"></div>
        <div class="rock" style="position: absolute; width: 4.5px; height: 4.5px; background: ${config.color}; border-radius: 50%; animation: landslideSlide 1.5s infinite linear; animation-delay: 1.0s; top: 7px; left: 11px;"></div>
      `;
      el.appendChild(animContainer);

      const popup = new maplibregl.Popup({ offset: 15, closeButton: true })
        .setHTML(`
          <div style="padding: 10px; font-family: 'JetBrains Mono', monospace;">
            <h3 style="margin:0 0 5px; color:${config.color}; font-size:12px; font-weight:bold;">${zone.name}</h3>
            <p style="margin:0 0 5px; font-size:10px; color:#a0aec0;">ID: ${zone.zoneId} | ${zone.district}</p>
            <div style="display:flex; justify-content:space-between; font-size:11px; margin-top:5px;">
              <span>Probability:</span>
              <span style="font-weight:bold; color:${config.color};">${zone.probability}%</span>
            </div>
            <div style="font-size:9px; color:#718096; margin-top:5px;">Click to view explainable drivers</div>
          </div>
        `);

      el.addEventListener('click', () => {
        setSelectedZone(zone);
      });

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(zone.location.coordinates)
        .setPopup(popup)
        .addTo(mapRef.current);
        
      zoneMarkersRef.current.set(zone._id, marker);
    });
  }, [zones, showLayers.landslideRiskZones, setSelectedZone]);

  // Render Soil Moisture Sensors
  useEffect(() => {
    if (!mapRef.current) return;

    if (!showLayers.soilSensors) {
      sensorMarkersRef.current.forEach(marker => marker.remove());
      sensorMarkersRef.current.clear();
      return;
    }

    sensors.forEach(sensor => {
      if (sensorMarkersRef.current.has(sensor._id)) return;

      const isCritical = sensor.currentStatus === 'CRITICAL';
      const isWarning = sensor.currentStatus === 'WARNING';
      const color = isCritical ? '#ef4444' : isWarning ? '#f97316' : '#10b981';

      const el = document.createElement('div');
      el.className = 'sensor-marker';
      el.style.cssText = `
        width: 22px;
        height: 22px;
        background: #0d1626;
        border-radius: 6px;
        border: 2.5px solid ${color};
        box-shadow: 0 0 10px ${color}66;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        cursor: pointer;
        z-index: 4;
      `;
      el.textContent = '📟';

      const popup = new maplibregl.Popup({ offset: 15, closeButton: true })
        .setHTML(`
          <div style="padding: 10px; font-family: 'JetBrains Mono', monospace;">
            <h3 style="margin:0 0 5px; color:${color}; font-size:12px; font-weight:bold;">${sensor.name}</h3>
            <p style="margin:0; font-size:11px; color:#e2e8f0;">Soil Moisture: <b>${sensor.currentMoisture}%</b></p>
            <p style="margin:3px 0 0; font-size:10px; color:#a0aec0;">Trend: ${sensor.trend} | Depth: ${sensor.depth}cm</p>
          </div>
        `);

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(sensor.location.coordinates)
        .setPopup(popup)
        .addTo(mapRef.current);

      sensorMarkersRef.current.set(sensor._id, marker);
    });
  }, [sensors, showLayers.soilSensors]);

  // Render Rainfall Observations
  useEffect(() => {
    if (!mapRef.current) return;

    if (!showLayers.rainfallObservations) {
      rainfallMarkersRef.current.forEach(marker => marker.remove());
      rainfallMarkersRef.current.clear();
      return;
    }

    rainfallData.forEach(obs => {
      if (rainfallMarkersRef.current.has(obs._id)) return;

      const isHeavy = obs.intensity === 'HEAVY' || obs.intensity === 'VERY_HEAVY' || obs.intensity === 'EXTREME';
      const color = isHeavy ? '#ef4444' : '#3b82f6';

      const el = document.createElement('div');
      el.className = 'rainfall-marker';
      el.style.cssText = `
        position: relative;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 4;
      `;
      el.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" style="position: absolute; top: 0px; z-index: 2;">
          <path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.39 0-.76.07-1.1.2C13.9 8.2 10.7 6 7 6a7 7 0 0 0-7 7c0 2.52 1.34 4.73 3.33 6" fill="#0d1626" />
        </svg>
        <div class="drop" style="position: absolute; width: 1.5px; height: 5px; background: ${color}; border-radius: 1px; animation: raindropFall 0.8s infinite linear; left: 10px; top: 16px;"></div>
        <div class="drop" style="position: absolute; width: 1.5px; height: 5px; background: ${color}; border-radius: 1px; animation: raindropFall 0.8s infinite linear; animation-delay: 0.25s; left: 14px; top: 17px;"></div>
        <div class="drop" style="position: absolute; width: 1.5px; height: 5px; background: ${color}; border-radius: 1px; animation: raindropFall 0.8s infinite linear; animation-delay: 0.5s; left: 18px; top: 15px;"></div>
      `;

      const popup = new maplibregl.Popup({ offset: 15, closeButton: true })
        .setHTML(`
          <div style="padding: 10px; font-family: 'JetBrains Mono', monospace;">
            <h3 style="margin:0 0 5px; color:${color}; font-size:12px; font-weight:bold;">${obs.stationName}</h3>
            <p style="margin:0; font-size:11px; color:#e2e8f0;">24h Rainfall: <b>${obs.rainfall24h || 0}mm</b></p>
            <p style="margin:3px 0 0; font-size:10px; color:#a0aec0;">Intensity: ${obs.intensity} | Anomaly: ${obs.anomaly}%</p>
          </div>
        `);

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(obs.location.coordinates)
        .setPopup(popup)
        .addTo(mapRef.current);

      rainfallMarkersRef.current.set(obs._id, marker);
    });
  }, [rainfallData, showLayers.rainfallObservations]);

  // Render Highway Risk segments
  const roadMarkersRef = useRef(new Map());
  useEffect(() => {
    if (!mapRef.current) return;

    if (!showLayers.roadRisks) {
      roadMarkersRef.current.forEach(marker => marker.remove());
      roadMarkersRef.current.clear();
      return;
    }

    roads.forEach(road => {
      if (roadMarkersRef.current.has(road._id)) return;

      const isBlocked = road.riskStatus === 'BLOCKED';
      const isAtRisk = road.riskStatus === 'AT_RISK';
      const color = isBlocked ? '#ef4444' : isAtRisk ? '#f97316' : '#10b981';

      const el = document.createElement('div');
      el.className = 'road-marker';
      el.style.cssText = `
        padding: 2px 6px;
        background: #0d1626;
        border-radius: 4px;
        border: 2px solid ${color};
        box-shadow: 0 0 10px ${color}aa;
        color: #ffffff;
        font-family: 'JetBrains Mono', monospace;
        font-size: 8px;
        font-weight: bold;
        cursor: pointer;
        z-index: 6;
      `;
      el.textContent = road.roadNumber || road.name.split(' ')[0];

      const popup = new maplibregl.Popup({ offset: 15, closeButton: true })
        .setHTML(`
          <div style="padding: 10px; font-family: 'JetBrains Mono', monospace;">
            <h3 style="margin:0 0 5px; color:${color}; font-size:12px; font-weight:bold;">${road.name}</h3>
            <p style="margin:0; font-size:11px; color:#e2e8f0;">Status: <b style="color:${color}">${road.riskStatus}</b></p>
            <p style="margin:3px 0 0; font-size:10px; color:#a0aec0;">Risk Score: ${road.riskScore} | Connects: ${road.connectsVillages?.join(', ')}</p>
          </div>
        `);

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(road.startPoint.coordinates)
        .setPopup(popup)
        .addTo(mapRef.current);

      roadMarkersRef.current.set(road._id, marker);
    });
  }, [roads, showLayers.roadRisks]);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ top: '48px' }}>
      <div ref={mapContainer} className="w-full h-full" />

      {/* Location Error Alert Banner */}
      {locationError && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 max-w-md w-[calc(100vw-2rem)] p-2.5 rounded-lg bg-red-950/90 border border-red-500/50 backdrop-blur-md shadow-2xl flex items-center justify-between gap-2 text-xs font-mono text-red-200">
          <div className="flex items-center gap-2 truncate">
            <span className="text-red-400 font-bold shrink-0">⚠️ GPS:</span>
            <span className="truncate">{locationError}</span>
          </div>
          <button
            onClick={clearLocationError}
            className="px-2 py-0.5 rounded bg-red-500/20 hover:bg-red-500/30 text-white shrink-0 font-bold"
          >
            DISMISS
          </button>
        </div>
      )}
      <svg className="absolute inset-0 pointer-events-none z-10 w-full h-full overflow-visible">
        <defs>
          <filter id="routeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {routePathD && (
          <g filter="url(#routeGlow)">
            <path
              d={routePathD}
              fill="none"
              stroke="#00f0ff"
              strokeWidth="10"
              strokeOpacity="0.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={routePathD}
              fill="none"
              stroke="#00ff66"
              strokeWidth="5"
              strokeOpacity="0.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={routePathD}
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="10 10"
              style={{
                animation: 'routeFlowAnim 1s linear infinite'
              }}
            />
          </g>
        )}
      </svg>

      {/* Tactical Bottom Left Map Overlay Bar */}
      <div className="absolute bottom-24 sm:bottom-12 left-2 sm:left-16 z-30 flex flex-col gap-2 font-mono select-none">
        <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-lg bg-[#050a14]/90 backdrop-blur-md border border-[#e5b849]/30 shadow-2xl">
          <button
            onClick={() => {
              setProjectionMode('3D');
              if (mapRef.current) {
                mapRef.current.easeTo({ pitch: 45, bearing: -15 });
              }
            }}
            className={`osiris-pill flex items-center gap-1 text-[9px] sm:text-xs px-1.5 sm:px-2.5 py-1 ${projectionMode === '3D' ? 'active' : ''}`}
          >
            <span>🌐 3D</span>
          </button>

          <button
            onClick={() => {
              setProjectionMode('2D');
              if (mapRef.current) {
                mapRef.current.easeTo({ pitch: 0, bearing: 0 });
              }
            }}
            className={`osiris-pill flex items-center gap-1 text-[9px] sm:text-xs px-1.5 sm:px-2.5 py-1 ${projectionMode === '2D' ? 'active' : ''}`}
          >
            <span>👥 2D</span>
          </button>

          <div className="h-4 w-px bg-white/10 mx-0.5" />

          <button
            onClick={() => setTileMode('MAP')}
            className={`osiris-pill flex items-center gap-1 text-[9px] sm:text-xs px-1.5 sm:px-2.5 py-1 ${tileMode === 'MAP' ? 'active' : ''}`}
          >
            <span>🌙 MAP</span>
          </button>

          <button
            onClick={() => setTileMode('SAT')}
            className={`osiris-pill flex items-center gap-1 text-[9px] sm:text-xs px-1.5 sm:px-2.5 py-1 ${tileMode === 'SAT' ? 'active' : ''}`}
          >
            <span>📡 SAT</span>
          </button>

          <div className="h-4 w-px bg-white/10 mx-0.5" />

          <button
            onClick={() => {
              if (!userLocation) {
                if (typeof window !== 'undefined' && window.__triggerGeolocate) {
                  window.__triggerGeolocate();
                } else {
                  requestLocation(true).catch(e => console.warn('[LOC]', e.message));
                }
              } else {
                if (mapRef.current) {
                  mapRef.current.flyTo({ center: userLocation, zoom: 15, duration: 1200 });
                }
              }
            }}
            className={`osiris-pill flex items-center gap-1 text-[9px] sm:text-xs px-1.5 sm:px-2.5 py-1 ${userLocation ? 'border-[#00ff66]/60 text-[#00ff66]' : ''}`}
            title={userLocation ? 'Fly to Live Location' : 'Detect Live GPS Location'}
          >
            <span>📍</span>
            <span>{isLocating ? 'LOCATING...' : (userLocation ? 'MY GPS' : 'LOCATE')}</span>
          </button>
        </div>

        {/* Live Cursor Telemetry readout */}
        <div className="hidden sm:flex px-3 py-1 rounded-md bg-[#03060a]/90 border border-[#00f0ff]/20 text-[10px] text-[#94a3b8] items-center gap-3 backdrop-blur-md shadow-xl">
          <div>
            <span className="text-[#64748b]">CURSOR</span>{' '}
            <span className="text-[#00f0ff] font-bold">{cursorPos.lat}, {cursorPos.lng}</span>
          </div>
          <div className="h-3 w-px bg-white/10" />
          <div className="truncate max-w-[280px]">
            <span className="text-[#64748b]">LOCATION</span>{' '}
            <span className="text-[#e5b849] font-bold">{cursorPos.location}</span>
          </div>
          <div className="text-[9px] text-[#00ff66] font-bold">200M 3.0</div>
        </div>
      </div>
    </div>
  );
};
function getTimeSince(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
