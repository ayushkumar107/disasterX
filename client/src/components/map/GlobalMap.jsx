import React, { useRef, useEffect, useCallback, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapStore } from '../../stores/mapStore';
import { useDisasterStore } from '../../stores/disasterStore';
import { useLocationStore } from '../../stores/locationStore';
import { useShelterStore } from '../../stores/shelterStore';
import { DISASTER_TYPE_CONFIG, SEVERITY_CONFIG } from '../../types/disaster';
import { distance, point } from '@turf/turf';
const MAP_STYLE = {
  version: 8,
  sources: {
    'raster-tiles': {
      type: 'raster',
      tiles: [
        'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      attribution: 'Map data © Esri',
      maxzoom: 16
    }
  },
  layers: [
    {
      id: 'simple-tiles',
      type: 'raster',
      source: 'raster-tiles',
      minzoom: 0,
      maxzoom: 22
    }
  ]
};
export const GlobalMap = () => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef(new Map());
  const {
    center,
    zoom,
    showLayers
  } = useMapStore();
  const {
    disasters,
    setSelectedDisaster,
    filters
  } = useDisasterStore();
  const {
    userLocation,
    setUserLocation,
    setProximityWarnings,
    activeRoute,
    destinationCoords
  } = useLocationStore();
  
  const { shelters, fetchShelters } = useShelterStore();
  const shelterMarkersRef = useRef(new Map());
  const routeMarkerRef = useRef(null);
  const [routePathD, setRoutePathD] = useState('');

  // Fetch shelters on mount
  useEffect(() => {
    fetchShelters();
  }, [fetchShelters]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: center,
      zoom: zoom,
      minZoom: 2,
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
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    });

    geolocate.on('geolocate', (e) => {
      setUserLocation([e.coords.longitude, e.coords.latitude]);
    });

    map.addControl(geolocate, 'bottom-right');
    
    map.on('load', () => {
      geolocate.trigger();
    });
    
    const resizeObserver = new ResizeObserver(() => {
      if (map) map.resize();
    });
    resizeObserver.observe(mapContainer.current);
    
    mapRef.current = map;

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

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

    // Wait for map to be fully ready before drawing
    if (map.loaded()) {
      console.log('[MAP] Map already loaded, drawing now');
      drawRoute();
    } else {
      console.log('[MAP] Map not loaded yet, waiting for load event');
      map.once('load', () => {
        console.log('[MAP] Map loaded, drawing now');
        drawRoute();
      });
    }
  }, [activeRoute, destinationCoords]);

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
    const el = document.createElement('div');
    el.className = 'disaster-marker';
    el.style.cssText = `
      position: relative;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease;
    `;

    // Snapchat Map Style Danger Zone Heat Aura
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
    el.appendChild(snapchatAura);

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
      el.appendChild(ring);
      if (isCritical) {
        const ring2 = document.createElement('div');
        ring2.style.cssText = ring.style.cssText + 'animation-delay: 0.7s;';
        el.appendChild(ring2);
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
    el.appendChild(dot);

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
      el.appendChild(icon);
    }

    // Hover effect
    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.3)';
      el.style.zIndex = '10';
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1)';
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
        element: el
      }).setLngLat(disaster.location.coordinates).setPopup(popup).addTo(mapRef.current);
      el.addEventListener('click', () => {
        setSelectedDisaster(disaster);
      });
      markersRef.current.set(disaster._id, marker);
    });
  }, [disasters, filters, showLayers.disasters, createMarkerElement, createPopupContent, setSelectedDisaster]);

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
          <div style="padding: 10px;">
            <h3 style="margin:0 0 5px; color:#00cc66; font-size:14px;">${shelter.name}</h3>
            <p style="margin:0 0 5px; font-size:11px; color:#a0aec0;">${shelter.address}</p>
            <p style="margin:0; font-size:12px; font-weight:bold;">
              Capacity: ${shelter.currentOccupancy} / ${shelter.capacity}
            </p>
          </div>
        `);
        
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(shelter.location.coordinates)
        .setPopup(popup)
        .addTo(mapRef.current);
        
      shelterMarkersRef.current.set(shelter._id, marker);
    });
  }, [shelters, showLayers.shelters]);
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ top: '48px' }}>
      <div ref={mapContainer} className="w-full h-full" />
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
