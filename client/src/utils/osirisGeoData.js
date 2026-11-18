/**
 * OSIRIS Tactical GeoJSON Data Generators
 * Provides Submarine Optic Fiber Cables, Global Incidents, Maritime Chokepoints,
 * Air Traffic Routes, and Day/Night Solar Terminator Polygon calculations.
 */

// 1. Submarine Fiber Optic Cables GeoJSON Network
export const SUBSEA_CABLES_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    // Europe - Middle East - India - Southeast Asia - East Asia (SEA-ME-WE 5 & AAE-1)
    {
      type: 'Feature',
      properties: { name: 'SEA-ME-WE 5 (Marseille - Suez - Mumbai - Singapore)', status: 'ACTIVE', capacity: '24 Tbps' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [5.37, 43.29],    // Marseille, France
          [14.51, 35.89],   // Malta
          [29.91, 31.20],   // Alexandria, Egypt
          [32.55, 29.97],   // Suez Canal
          [38.00, 20.00],   // Red Sea Central
          [43.25, 12.60],   // Bab el-Mandeb Strait
          [50.00, 12.00],   // Gulf of Aden
          [72.87, 19.07],   // Mumbai, India
          [80.27, 13.08],   // Chennai, India
          [95.32, 5.55],    // Banda Aceh / Malacca Entrance
          [103.82, 1.35],   // Strait of Malacca / Singapore
          [114.16, 22.28],  // Hong Kong
          [121.56, 25.03],  // Taiwan Strait / Taipei
          [139.69, 35.68]   // Tokyo, Japan
        ]
      }
    },
    // Transatlantic Express (New York - London / Lisbon)
    {
      type: 'Feature',
      properties: { name: 'TAT-14 Transatlantic Express', status: 'ACTIVE', capacity: '60 Tbps' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-74.00, 40.71],  // New York, USA
          [-45.00, 45.00],  // Mid Atlantic North
          [-9.14, 38.72],   // Lisbon, Portugal
          [-0.12, 51.50]    // London, UK
        ]
      }
    },
    // Transpacific Gateway (Los Angeles - Hawaii - Tokyo / Taipei)
    {
      type: 'Feature',
      properties: { name: 'TGN-Pacific (LA - Tokyo)', status: 'ACTIVE', capacity: '40 Tbps' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-118.24, 34.05], // Los Angeles, USA
          [-157.85, 21.30], // Honolulu, Hawaii
          [170.00, 30.00],  // International Date Line
          [140.00, 35.00],  // Near Japan
          [139.69, 35.68]   // Tokyo, Japan
        ]
      }
    },
    // Persian Gulf Link (Strait of Hormuz to Mumbai)
    {
      type: 'Feature',
      properties: { name: 'FALCON Persian Gulf Cable', status: 'ACTIVE', capacity: '10 Tbps' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [47.97, 29.37],   // Kuwait
          [50.58, 26.22],   // Bahrain
          [56.33, 26.55],   // Strait of Hormuz
          [58.59, 23.61],   // Muscat, Oman
          [72.87, 19.07]    // Mumbai, India
        ]
      }
    },
    // Africa West Coast (Lisbon to Cape Town)
    {
      type: 'Feature',
      properties: { name: 'WACS West Africa Cable System', status: 'ACTIVE', capacity: '14.5 Tbps' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-9.14, 38.72],   // Lisbon, Portugal
          [-17.46, 14.69],  // Dakar, Senegal
          [3.37, 6.45],     // Lagos, Nigeria
          [8.78, -0.49],    // Gabon
          [18.42, -33.92]   // Cape Town, South Africa
        ]
      }
    }
  ]
};

// 2. Global Conflict & Tactical Incident Hotspots (matching OSIRIS screenshot)
export const GLOBAL_INCIDENTS = [
  {
    id: 'inc-red-sea',
    title: 'RED SEA THREAT',
    subtitle: 'Maritime Conflict & Missile Attacks',
    category: 'conflict',
    riskScore: 94,
    coords: [42.12, 14.80],
    level: 'CRITICAL',
    details: 'Houthi anti-ship ballistic missile alerts & naval interceptor ops active in Red Sea shipping lanes.'
  },
  {
    id: 'inc-turkish-straits',
    title: 'Turkish Straits',
    subtitle: 'Bosporus & Dardanelles Maritime Control',
    category: 'maritime',
    riskScore: 79,
    coords: [28.97, 41.00],
    level: 'MEDIUM',
    details: 'Black Sea naval traffic management & Montreux Convention transit regulation.'
  },
  {
    id: 'inc-suez-canal',
    title: 'Suez Canal',
    subtitle: 'Global Maritime Trade Route',
    category: 'maritime',
    riskScore: 81,
    coords: [32.34, 30.58],
    level: 'MEDIUM',
    details: 'North-South convoy escort operations & canal security radar network active.'
  },
  {
    id: 'inc-malacca',
    title: 'Strait of Malacca',
    subtitle: 'Indo-Pacific Maritime Transit Hub',
    category: 'maritime',
    riskScore: 82,
    coords: [101.40, 2.50],
    level: 'MEDIUM',
    details: 'Joint trilateral naval patrol patrols monitoring oil tanker traffic corridors.'
  },
  {
    id: 'inc-bab-el-mandeb',
    title: 'Bab el-Mandeb',
    subtitle: 'Strategic Maritime Chokepoint Alert',
    category: 'maritime',
    riskScore: 88,
    coords: [43.34, 12.58],
    level: 'HIGH',
    details: 'Commercial tanker escort zone active; high electronic warfare interference reported.'
  },
  {
    id: 'inc-yemen',
    title: 'YEMEN WAR',
    subtitle: 'Active Armed Conflict',
    category: 'conflict',
    riskScore: 91,
    coords: [44.20, 15.35],
    level: 'CRITICAL',
    details: 'Air defense alerts & drone strike warnings active across Hodeidah & Sanaa sectors.'
  },
  {
    id: 'inc-sudan',
    title: 'SUDAN CIVIL WAR',
    subtitle: 'Heavy Armed Engagement',
    category: 'conflict',
    riskScore: 96,
    coords: [32.53, 15.50],
    level: 'CRITICAL',
    details: 'Khartoum urban fighting & Darfur humanitarian displacement corridor monitored by satellite SAR.'
  },
  {
    id: 'inc-sahel',
    title: 'SAHEL INSTABILITY',
    subtitle: 'Insurgency & Border Tensions',
    category: 'conflict',
    riskScore: 82,
    coords: [2.00, 16.00],
    level: 'HIGH',
    details: 'Mali-Niger border security alerts & convoy reconnaissance patrols.'
  },
  {
    id: 'inc-syria',
    title: 'SYRIA',
    subtitle: 'Cross-Border Kinetic Strikes',
    category: 'conflict',
    riskScore: 89,
    coords: [36.29, 33.51],
    level: 'HIGH',
    details: 'Artillery exchanges & air strike alerts across Idlib and Euphrates river line.'
  },
  {
    id: 'inc-iraq',
    title: 'IRAQ INSTABILITY',
    subtitle: 'Base Security Alerts',
    category: 'conflict',
    riskScore: 78,
    coords: [44.36, 33.31],
    level: 'MEDIUM',
    details: 'Air defense readiness level elevated around western Al-Anbar & Erbil facilities.'
  },
  {
    id: 'inc-hormuz',
    title: 'Strait of Hormuz',
    subtitle: 'Naval Inspection & Seizure Warnings',
    category: 'maritime',
    riskScore: 85,
    coords: [56.45, 26.55],
    level: 'HIGH',
    details: 'Naval patrol vessel density high; oil tanker speed corridors monitored.'
  },
  {
    id: 'inc-taiwan',
    title: 'Taiwan Strait',
    subtitle: 'Air Defense Identification Zone Patrols',
    category: 'naval',
    riskScore: 87,
    coords: [119.80, 24.00],
    level: 'HIGH',
    details: 'Naval taskforce maneuvers & fighter aircraft sorties tracked in central median line.'
  },
  {
    id: 'inc-myanmar',
    title: 'MYANMAR CONFLICT',
    subtitle: 'Border & Civil Clashes',
    category: 'conflict',
    riskScore: 84,
    coords: [96.19, 16.86],
    level: 'HIGH',
    details: 'Armed clashes near Shan State & Sagaing region boundaries.'
  }
];

// 3. Solar Terminator (Day/Night Shadow Overlay Calculation)
export function getSolarTerminatorGeoJSON() {
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const declination = -23.44 * Math.cos((2 * Math.PI / 365) * (dayOfYear + 10)); // Solar declination deg
  const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
  const sunLng = 180 - (utcHours * 15);

  const points = [];
  for (let lon = -180; lon <= 180; lon += 4) {
    const radLon = (lon - sunLng) * (Math.PI / 180);
    const radDec = declination * (Math.PI / 180);
    const lat = Math.atan(-Math.cos(radLon) / Math.tan(radDec)) * (180 / Math.PI);
    points.push([lon, lat]);
  }

  // Construct night hemisphere polygon
  const nightPolygon = [
    ...points,
    [180, declination >= 0 ? -90 : 90],
    [-180, declination >= 0 ? -90 : 90],
    points[0]
  ];

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { type: 'NIGHT_HEMISPHERE' },
        geometry: {
          type: 'Polygon',
          coordinates: [nightPolygon]
        }
      }
    ]
  };
}
