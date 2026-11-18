"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.seedNERData = seedNERData;

var _LandslideRiskZone = require("../models/LandslideRiskZone");
var _HistoricalLandslide = require("../models/HistoricalLandslide");
var _SoilMoistureSensor = require("../models/SoilMoistureSensor");
var _Shelter = require("../models/Shelter");
var _RoadRisk = require("../models/RoadRisk");
var _User = require("../models/User");
var _logger = require("../utils/logger");

// ═══════════════════════════════════════════
// NER LANDSLIDE RISK ZONES — 8 States
// ═══════════════════════════════════════════
const NER_RISK_ZONES = [
  {
    zoneId: 'NER-AS-001',
    name: 'Haflong–Dima Hasao Corridor',
    state: 'Assam',
    district: 'Dima Hasao',
    location: { type: 'Point', coordinates: [93.02, 25.17] },
    riskLevel: 'HIGH',
    probability: 68,
    confidence: 72,
    terrain: { avgSlope: 32, maxSlope: 48, avgElevation: 680, aspect: 'SE', geologyType: 'Sedimentary', landCoverType: 'Dense Forest', soilType: 'Laterite' },
    riskDrivers: { rainfall: 18, soilMoisture: 15, slope: 14, historicalSusceptibility: 9, satelliteChange: 4, citizenReports: 2, elevation: 3, landCover: 2, geology: 1 },
    currentConditions: { rainfall24h: 85, rainfall72h: 190, rainfallIntensity: 'HEAVY', soilMoisture: 72, soilMoistureTrend: 'INCREASING' },
    affectedVillages: [{ name: 'Haflong', population: 22000, distance: 0 }, { name: 'Jatinga', population: 3500, distance: 8 }, { name: 'Maibang', population: 6000, distance: 25 }],
    affectedRoads: [{ name: 'NH-54 (Lumding–Silchar)', roadType: 'NATIONAL_HIGHWAY', riskStatus: 'AT_RISK' }],
    dataSource: 'DEMO', status: 'MONITORING'
  },
  {
    zoneId: 'NER-AR-001',
    name: 'Itanagar–Papum Pare Hillslope',
    state: 'Arunachal Pradesh',
    district: 'Papum Pare',
    location: { type: 'Point', coordinates: [93.62, 27.10] },
    riskLevel: 'CRITICAL',
    probability: 82,
    confidence: 65,
    terrain: { avgSlope: 38, maxSlope: 55, avgElevation: 1200, aspect: 'S', geologyType: 'Metamorphic', landCoverType: 'Sparse Forest', soilType: 'Sandy Loam' },
    riskDrivers: { rainfall: 22, soilMoisture: 18, slope: 16, historicalSusceptibility: 10, satelliteChange: 6, citizenReports: 3, elevation: 3, landCover: 2, geology: 2 },
    currentConditions: { rainfall24h: 145, rainfall72h: 310, rainfallIntensity: 'VERY_HEAVY', soilMoisture: 85, soilMoistureTrend: 'RAPIDLY_INCREASING' },
    affectedVillages: [{ name: 'Itanagar', population: 67000, distance: 0 }, { name: 'Naharlagun', population: 32000, distance: 10 }, { name: 'Banderdewa', population: 4500, distance: 15 }],
    affectedRoads: [{ name: 'NH-415 (Trans-Arunachal)', roadType: 'NATIONAL_HIGHWAY', riskStatus: 'AT_RISK' }],
    dataSource: 'DEMO', status: 'ACTIVE'
  },
  {
    zoneId: 'NER-ML-001',
    name: 'Cherrapunji–Sohra Escarpment',
    state: 'Meghalaya',
    district: 'East Khasi Hills',
    location: { type: 'Point', coordinates: [91.72, 25.28] },
    riskLevel: 'HIGH',
    probability: 74,
    confidence: 78,
    terrain: { avgSlope: 35, maxSlope: 52, avgElevation: 1484, aspect: 'SW', geologyType: 'Sedimentary', landCoverType: 'Scrubland', soilType: 'Laterite' },
    riskDrivers: { rainfall: 24, soilMoisture: 14, slope: 13, historicalSusceptibility: 8, satelliteChange: 5, citizenReports: 3, elevation: 3, landCover: 2, geology: 2 },
    currentConditions: { rainfall24h: 210, rainfall72h: 450, rainfallIntensity: 'EXTREME', soilMoisture: 78, soilMoistureTrend: 'INCREASING' },
    affectedVillages: [{ name: 'Cherrapunji (Sohra)', population: 11000, distance: 0 }, { name: 'Mawsynram', population: 5000, distance: 16 }, { name: 'Laitlyngkot', population: 3000, distance: 8 }],
    affectedRoads: [{ name: 'NH-40 (Shillong-Dawki)', roadType: 'NATIONAL_HIGHWAY', riskStatus: 'AT_RISK' }],
    dataSource: 'DEMO', status: 'MONITORING'
  },
  {
    zoneId: 'NER-MN-001',
    name: 'Imphal–Senapati Mountain Pass',
    state: 'Manipur',
    district: 'Senapati',
    location: { type: 'Point', coordinates: [93.93, 25.27] },
    riskLevel: 'ELEVATED',
    probability: 52,
    confidence: 60,
    terrain: { avgSlope: 28, maxSlope: 42, avgElevation: 1100, aspect: 'E', geologyType: 'Sedimentary', landCoverType: 'Agriculture', soilType: 'Clay' },
    riskDrivers: { rainfall: 14, soilMoisture: 12, slope: 10, historicalSusceptibility: 6, satelliteChange: 3, citizenReports: 2, elevation: 2, landCover: 2, geology: 1 },
    currentConditions: { rainfall24h: 55, rainfall72h: 120, rainfallIntensity: 'MODERATE', soilMoisture: 58, soilMoistureTrend: 'STABLE' },
    affectedVillages: [{ name: 'Mao Gate', population: 8000, distance: 0 }, { name: 'Kangpokpi', population: 15000, distance: 20 }],
    affectedRoads: [{ name: 'NH-2 (Imphal-Dimapur)', roadType: 'NATIONAL_HIGHWAY', riskStatus: 'SAFE' }],
    dataSource: 'DEMO', status: 'MONITORING'
  },
  {
    zoneId: 'NER-MZ-001',
    name: 'Aizawl–Lunglei Highway Corridor',
    state: 'Mizoram',
    district: 'Aizawl',
    location: { type: 'Point', coordinates: [92.72, 23.73] },
    riskLevel: 'HIGH',
    probability: 65,
    confidence: 68,
    terrain: { avgSlope: 30, maxSlope: 45, avgElevation: 920, aspect: 'W', geologyType: 'Sedimentary', landCoverType: 'Sparse Forest', soilType: 'Sandy Loam' },
    riskDrivers: { rainfall: 16, soilMoisture: 14, slope: 12, historicalSusceptibility: 8, satelliteChange: 5, citizenReports: 3, elevation: 3, landCover: 2, geology: 2 },
    currentConditions: { rainfall24h: 95, rainfall72h: 200, rainfallIntensity: 'HEAVY', soilMoisture: 70, soilMoistureTrend: 'INCREASING' },
    affectedVillages: [{ name: 'Aizawl', population: 293000, distance: 0 }, { name: 'Serchhip', population: 25000, distance: 60 }],
    affectedRoads: [{ name: 'NH-306 (Aizawl-Lunglei)', roadType: 'NATIONAL_HIGHWAY', riskStatus: 'AT_RISK' }],
    dataSource: 'DEMO', status: 'MONITORING'
  },
  {
    zoneId: 'NER-NL-001',
    name: 'Kohima–Dimapur Foothill Zone',
    state: 'Nagaland',
    district: 'Kohima',
    location: { type: 'Point', coordinates: [94.11, 25.67] },
    riskLevel: 'MODERATE',
    probability: 38,
    confidence: 55,
    terrain: { avgSlope: 22, maxSlope: 36, avgElevation: 1444, aspect: 'NE', geologyType: 'Metamorphic', landCoverType: 'Dense Forest', soilType: 'Clay Loam' },
    riskDrivers: { rainfall: 10, soilMoisture: 8, slope: 8, historicalSusceptibility: 4, satelliteChange: 2, citizenReports: 2, elevation: 2, landCover: 1, geology: 1 },
    currentConditions: { rainfall24h: 35, rainfall72h: 80, rainfallIntensity: 'MODERATE', soilMoisture: 48, soilMoistureTrend: 'STABLE' },
    affectedVillages: [{ name: 'Kohima', population: 99000, distance: 0 }, { name: 'Dimapur', population: 122000, distance: 74 }],
    affectedRoads: [{ name: 'NH-29 (Kohima-Dimapur)', roadType: 'NATIONAL_HIGHWAY', riskStatus: 'SAFE' }],
    dataSource: 'DEMO', status: 'MONITORING'
  },
  {
    zoneId: 'NER-TR-001',
    name: 'Agartala–Jampui Hills',
    state: 'Tripura',
    district: 'North Tripura',
    location: { type: 'Point', coordinates: [92.20, 24.32] },
    riskLevel: 'MODERATE',
    probability: 35,
    confidence: 62,
    terrain: { avgSlope: 20, maxSlope: 32, avgElevation: 450, aspect: 'NW', geologyType: 'Alluvial', landCoverType: 'Agriculture', soilType: 'Alluvial' },
    riskDrivers: { rainfall: 10, soilMoisture: 8, slope: 6, historicalSusceptibility: 4, satelliteChange: 2, citizenReports: 1, elevation: 2, landCover: 1, geology: 1 },
    currentConditions: { rainfall24h: 40, rainfall72h: 90, rainfallIntensity: 'MODERATE', soilMoisture: 52, soilMoistureTrend: 'STABLE' },
    affectedVillages: [{ name: 'Kanchanpur', population: 20000, distance: 0 }],
    affectedRoads: [{ name: 'NH-44 (Agartala-Sabroom)', roadType: 'NATIONAL_HIGHWAY', riskStatus: 'SAFE' }],
    dataSource: 'DEMO', status: 'MONITORING'
  },
  {
    zoneId: 'NER-SK-001',
    name: 'Gangtok–Nathula Highway',
    state: 'Sikkim',
    district: 'East Sikkim',
    location: { type: 'Point', coordinates: [88.62, 27.33] },
    riskLevel: 'CRITICAL',
    probability: 78,
    confidence: 70,
    terrain: { avgSlope: 40, maxSlope: 60, avgElevation: 1650, aspect: 'S', geologyType: 'Metamorphic', landCoverType: 'Bare Rock', soilType: 'Rocky Debris' },
    riskDrivers: { rainfall: 20, soilMoisture: 16, slope: 17, historicalSusceptibility: 10, satelliteChange: 5, citizenReports: 3, elevation: 3, landCover: 2, geology: 2 },
    currentConditions: { rainfall24h: 120, rainfall72h: 280, rainfallIntensity: 'VERY_HEAVY', soilMoisture: 80, soilMoistureTrend: 'RAPIDLY_INCREASING' },
    affectedVillages: [{ name: 'Gangtok', population: 100000, distance: 0 }, { name: 'Pakyong', population: 5000, distance: 32 }, { name: 'Singtam', population: 25000, distance: 28 }],
    affectedRoads: [{ name: 'NH-10 (Gangtok-Siliguri)', roadType: 'NATIONAL_HIGHWAY', riskStatus: 'AT_RISK' }, { name: 'NH-310 (Gangtok-Nathula)', roadType: 'NATIONAL_HIGHWAY', riskStatus: 'BLOCKED' }],
    criticalInfrastructure: [{ name: 'Teesta Bridge', infraType: 'BRIDGE', distance: 15 }],
    dataSource: 'DEMO', status: 'ACTIVE'
  }
];

// ═══════════════════════════════════════════
// HISTORICAL LANDSLIDE EVENTS (NER)
// ═══════════════════════════════════════════
const NER_HISTORICAL_EVENTS = [
  {
    location: { type: 'Point', coordinates: [93.02, 25.17] },
    state: 'Assam', district: 'Dima Hasao',
    eventDate: new Date('2022-05-14'),
    title: 'Dima Hasao Railway Corridor Landslide',
    description: 'Massive landslides along the Haflong–Badarpur railway section destroyed multiple bridges and buried tracks under debris.',
    severity: 'CATASTROPHIC', landslideType: 'DEBRIS_FLOW',
    affectedVillages: ['Haflong', 'Maibang', 'Jatinga'],
    affectedRoads: ['NH-54'],
    casualties: { fatalities: 8, injured: 25, missing: 3, displaced: 50000 },
    damage: { housesDestroyed: 120, housesDamaged: 450, roadsBlocked: 5, bridgesDamaged: 3 },
    conditions: { rainfall24h: 220, rainfall72h: 520, antecedentRainfall: 680 },
    source: 'NDMA', sourceReliability: 'OFFICIAL'
  },
  {
    location: { type: 'Point', coordinates: [88.62, 27.33] },
    state: 'Sikkim', district: 'East Sikkim',
    eventDate: new Date('2023-10-04'),
    title: 'South Lhonak Lake GLOF & Teesta Valley Landslides',
    description: 'Glacial Lake Outburst Flood triggered catastrophic debris flows along the Teesta Valley, washing away the Chungthang Dam.',
    severity: 'CATASTROPHIC', landslideType: 'DEBRIS_FLOW',
    affectedVillages: ['Chungthang', 'Lachen', 'Mangan', 'Singtam'],
    affectedRoads: ['NH-10', 'NH-310'],
    casualties: { fatalities: 40, injured: 60, missing: 80, displaced: 12000 },
    damage: { housesDestroyed: 250, housesDamaged: 800, roadsBlocked: 8, bridgesDamaged: 7, estimatedLossINR: 250000000000 },
    conditions: { rainfall24h: 150, rainfall72h: 380 },
    source: 'GSI', sourceReliability: 'OFFICIAL'
  },
  {
    location: { type: 'Point', coordinates: [91.72, 25.28] },
    state: 'Meghalaya', district: 'East Khasi Hills',
    eventDate: new Date('2022-06-22'),
    title: 'Sohra (Cherrapunji) Multiple Landslides',
    description: 'Record monsoon rainfall triggered dozens of landslides along the Sohra escarpment, blocking NH-40 for days.',
    severity: 'MAJOR', landslideType: 'MUDSLIDE',
    affectedVillages: ['Sohra', 'Laitlyngkot', 'Mawsynram'],
    affectedRoads: ['NH-40'],
    casualties: { fatalities: 5, injured: 18, missing: 0, displaced: 3000 },
    damage: { housesDestroyed: 30, housesDamaged: 150, roadsBlocked: 3 },
    conditions: { rainfall24h: 350, rainfall72h: 780, antecedentRainfall: 1200 },
    source: 'SDMA', sourceReliability: 'OFFICIAL'
  },
  {
    location: { type: 'Point', coordinates: [93.93, 25.27] },
    state: 'Manipur', district: 'Noney',
    eventDate: new Date('2022-06-29'),
    title: 'Noney Railway Construction Camp Landslide',
    description: 'A massive landslide engulfed a Territorial Army camp and railway construction site near Tupul, Noney district.',
    severity: 'CATASTROPHIC', landslideType: 'DEBRIS_FLOW',
    affectedVillages: ['Tupul', 'Noney'],
    affectedRoads: ['NH-37'],
    casualties: { fatalities: 61, injured: 20, missing: 14, displaced: 1500 },
    damage: { housesDestroyed: 40, roadsBlocked: 2, bridgesDamaged: 1 },
    conditions: { rainfall24h: 180, rainfall72h: 420 },
    source: 'NDMA', sourceReliability: 'OFFICIAL'
  },
  {
    location: { type: 'Point', coordinates: [92.72, 23.73] },
    state: 'Mizoram', district: 'Aizawl',
    eventDate: new Date('2023-07-12'),
    title: 'Aizawl Hill Slope Failure',
    description: 'Multiple slope failures reported in Aizawl city after continuous monsoon rainfall, several houses damaged.',
    severity: 'MAJOR', landslideType: 'ROTATIONAL',
    affectedVillages: ['Aizawl', 'Zemabawk'],
    casualties: { fatalities: 3, injured: 12, displaced: 800 },
    damage: { housesDestroyed: 15, housesDamaged: 60, roadsBlocked: 4 },
    conditions: { rainfall24h: 160, rainfall72h: 350 },
    source: 'SDMA', sourceReliability: 'OFFICIAL'
  }
];

// ═══════════════════════════════════════════
// SOIL MOISTURE SENSORS (Simulated)
// ═══════════════════════════════════════════
const NER_SENSORS = [
  { sensorId: 'SMS-AS-001', name: 'Haflong Ridge Sensor', location: { type: 'Point', coordinates: [93.01, 25.16] }, state: 'Assam', district: 'Dima Hasao', currentMoisture: 72, currentStatus: 'WARNING', depth: 30, dataSource: 'SIMULATED' },
  { sensorId: 'SMS-AS-002', name: 'Jatinga Valley Sensor', location: { type: 'Point', coordinates: [93.05, 25.19] }, state: 'Assam', district: 'Dima Hasao', currentMoisture: 65, currentStatus: 'NORMAL', depth: 50, dataSource: 'SIMULATED' },
  { sensorId: 'SMS-AR-001', name: 'Itanagar Hill Sensor', location: { type: 'Point', coordinates: [93.61, 27.09] }, state: 'Arunachal Pradesh', district: 'Papum Pare', currentMoisture: 86, currentStatus: 'CRITICAL', depth: 25, dataSource: 'SIMULATED' },
  { sensorId: 'SMS-ML-001', name: 'Cherrapunji Escarpment Sensor', location: { type: 'Point', coordinates: [91.71, 25.27] }, state: 'Meghalaya', district: 'East Khasi Hills', currentMoisture: 78, currentStatus: 'WARNING', depth: 35, dataSource: 'SIMULATED' },
  { sensorId: 'SMS-MN-001', name: 'Senapati Pass Sensor', location: { type: 'Point', coordinates: [93.92, 25.26] }, state: 'Manipur', district: 'Senapati', currentMoisture: 55, currentStatus: 'NORMAL', depth: 40, dataSource: 'SIMULATED' },
  { sensorId: 'SMS-MZ-001', name: 'Aizawl Slope Sensor', location: { type: 'Point', coordinates: [92.71, 23.72] }, state: 'Mizoram', district: 'Aizawl', currentMoisture: 68, currentStatus: 'NORMAL', depth: 30, dataSource: 'SIMULATED' },
  { sensorId: 'SMS-NL-001', name: 'Kohima Foothill Sensor', location: { type: 'Point', coordinates: [94.10, 25.66] }, state: 'Nagaland', district: 'Kohima', currentMoisture: 48, currentStatus: 'NORMAL', depth: 45, dataSource: 'SIMULATED' },
  { sensorId: 'SMS-SK-001', name: 'Gangtok Highway Sensor', location: { type: 'Point', coordinates: [88.61, 27.32] }, state: 'Sikkim', district: 'East Sikkim', currentMoisture: 82, currentStatus: 'CRITICAL', depth: 20, dataSource: 'SIMULATED' },
  { sensorId: 'SMS-SK-002', name: 'Teesta Bridge Sensor', location: { type: 'Point', coordinates: [88.55, 27.28] }, state: 'Sikkim', district: 'East Sikkim', currentMoisture: 75, currentStatus: 'WARNING', depth: 30, dataSource: 'SIMULATED' }
];

// ═══════════════════════════════════════════
// NER SHELTERS
// ═══════════════════════════════════════════
const NER_SHELTERS = [
  { name: 'Guwahati SDRF Emergency Shelter', location: { type: 'Point', coordinates: [91.74, 26.14] }, address: 'Dispur, Guwahati, Assam', capacity: 2000, currentOccupancy: 120, amenities: { water: true, food: true, medical: true, electricity: true, wifi: true }, contact: { phone: '+91-361-222-0100' }, status: 'OPEN' },
  { name: 'Itanagar Community Relief Center', location: { type: 'Point', coordinates: [93.61, 27.08] }, address: 'Capital Complex, Itanagar, Arunachal Pradesh', capacity: 800, currentOccupancy: 0, amenities: { water: true, food: true, medical: true, electricity: true, wifi: false }, contact: { phone: '+91-360-222-0200' }, status: 'OPEN' },
  { name: 'Shillong Emergency Shelter', location: { type: 'Point', coordinates: [91.88, 25.57] }, address: 'Police Bazaar, Shillong, Meghalaya', capacity: 1200, currentOccupancy: 65, amenities: { water: true, food: true, medical: true, electricity: true, wifi: true }, contact: { phone: '+91-364-222-0300' }, status: 'OPEN' },
  { name: 'Gangtok Disaster Relief Camp', location: { type: 'Point', coordinates: [88.61, 27.34] }, address: 'Deorali, Gangtok, Sikkim', capacity: 600, currentOccupancy: 180, amenities: { water: true, food: true, medical: true, electricity: false, wifi: false }, contact: { phone: '+91-359-222-0400' }, status: 'OPEN' },
  { name: 'Imphal SDMA Emergency Center', location: { type: 'Point', coordinates: [93.94, 24.81] }, address: 'Babupara, Imphal, Manipur', capacity: 1000, currentOccupancy: 40, amenities: { water: true, food: true, medical: true, electricity: true, wifi: false }, contact: { phone: '+91-385-222-0500' }, status: 'OPEN' },
  { name: 'Aizawl Relief Shelter', location: { type: 'Point', coordinates: [92.73, 23.74] }, address: 'Treasury Square, Aizawl, Mizoram', capacity: 500, currentOccupancy: 30, amenities: { water: true, food: true, medical: false, electricity: true, wifi: false }, contact: { phone: '+91-389-222-0600' }, status: 'OPEN' }
];

// ═══════════════════════════════════════════
// NER ROAD RISK SEGMENTS
// ═══════════════════════════════════════════
const NER_ROADS = [
  { name: 'NH-54 Lumding–Silchar', roadType: 'NATIONAL_HIGHWAY', roadNumber: 'NH-54', state: 'Assam', district: 'Dima Hasao', startPoint: { type: 'Point', coordinates: [93.16, 25.75] }, riskStatus: 'AT_RISK', riskScore: 72, importance: 'CRITICAL', lengthKm: 200, connectsVillages: ['Lumding', 'Haflong', 'Maibang', 'Silchar'] },
  { name: 'NH-10 Gangtok–Siliguri', roadType: 'NATIONAL_HIGHWAY', roadNumber: 'NH-10', state: 'Sikkim', district: 'East Sikkim', startPoint: { type: 'Point', coordinates: [88.43, 27.15] }, riskStatus: 'AT_RISK', riskScore: 78, importance: 'CRITICAL', lengthKm: 120, connectsVillages: ['Gangtok', 'Singtam', 'Rangpo', 'Kalimpong'] },
  { name: 'NH-40 Shillong–Dawki', roadType: 'NATIONAL_HIGHWAY', roadNumber: 'NH-40', state: 'Meghalaya', district: 'East Khasi Hills', startPoint: { type: 'Point', coordinates: [91.88, 25.57] }, riskStatus: 'AT_RISK', riskScore: 65, importance: 'HIGH', lengthKm: 82, connectsVillages: ['Shillong', 'Cherrapunji', 'Dawki'] },
  { name: 'NH-415 Trans-Arunachal Highway', roadType: 'NATIONAL_HIGHWAY', roadNumber: 'NH-415', state: 'Arunachal Pradesh', district: 'Papum Pare', startPoint: { type: 'Point', coordinates: [93.62, 27.10] }, riskStatus: 'AT_RISK', riskScore: 80, importance: 'CRITICAL', lengthKm: 1600, connectsVillages: ['Itanagar', 'Bomdila', 'Tawang', 'Along'] },
  { name: 'NH-306 Aizawl–Lunglei', roadType: 'NATIONAL_HIGHWAY', roadNumber: 'NH-306', state: 'Mizoram', district: 'Aizawl', startPoint: { type: 'Point', coordinates: [92.72, 23.73] }, riskStatus: 'AT_RISK', riskScore: 60, importance: 'HIGH', lengthKm: 250, connectsVillages: ['Aizawl', 'Serchhip', 'Lunglei'] }
];


async function seedNERData() {
  try {
    _logger.logger.info('🏔️ Seeding NER Landslide Intelligence data...');

    const adminUser = await _User.User.findOne({ role: 'ADMIN' });

    // Seed Risk Zones
    for (const zone of NER_RISK_ZONES) {
      const existing = await _LandslideRiskZone.LandslideRiskZone.findOne({ zoneId: zone.zoneId });
      if (!existing) {
        await _LandslideRiskZone.LandslideRiskZone.create(zone);
      }
    }
    _logger.logger.info(`✅ Seeded ${NER_RISK_ZONES.length} NER risk zones`);

    // Seed Historical Events
    for (const event of NER_HISTORICAL_EVENTS) {
      const existing = await _HistoricalLandslide.HistoricalLandslide.findOne({ title: event.title });
      if (!existing) {
        await _HistoricalLandslide.HistoricalLandslide.create(event);
      }
    }
    _logger.logger.info(`✅ Seeded ${NER_HISTORICAL_EVENTS.length} NER historical events`);

    // Seed Sensors — link to risk zones
    for (const sensor of NER_SENSORS) {
      const existing = await _SoilMoistureSensor.SoilMoistureSensor.findOne({ sensorId: sensor.sensorId });
      if (!existing) {
        // Find matching risk zone
        const zonePrefix = sensor.sensorId.substring(0, 6); // e.g., 'SMS-AS'
        const stateCode = sensor.sensorId.split('-')[1];
        const zoneIdPrefix = `NER-${stateCode}`;
        const zone = await _LandslideRiskZone.LandslideRiskZone.findOne({ zoneId: { $regex: `^${zoneIdPrefix}` } });
        
        await _SoilMoistureSensor.SoilMoistureSensor.create({
          ...sensor,
          riskZone: zone?._id || null,
          lastReading: new Date(),
          trend: sensor.currentMoisture >= 80 ? 'RAPIDLY_INCREASING' : sensor.currentMoisture >= 65 ? 'INCREASING' : 'STABLE',
          recentReadings: Array.from({ length: 8 }, (_, i) => ({
            value: Math.max(10, sensor.currentMoisture - (Math.random() * 10) + (i * 1.5)),
            timestamp: new Date(Date.now() - (7 - i) * 3600000)
          }))
        });
      }
    }
    _logger.logger.info(`✅ Seeded ${NER_SENSORS.length} NER soil moisture sensors`);

    // Seed NER Shelters
    if (adminUser) {
      for (const shelter of NER_SHELTERS) {
        const existing = await _Shelter.Shelter.findOne({ name: shelter.name });
        if (!existing) {
          await _Shelter.Shelter.create({ ...shelter, createdBy: adminUser._id });
        }
      }
      _logger.logger.info(`✅ Seeded ${NER_SHELTERS.length} NER shelters`);
    }

    // Seed Road Risk Segments
    for (const road of NER_ROADS) {
      const existing = await _RoadRisk.RoadRisk.findOne({ name: road.name });
      if (!existing) {
        await _RoadRisk.RoadRisk.create(road);
      }
    }
    _logger.logger.info(`✅ Seeded ${NER_ROADS.length} NER road segments`);

    _logger.logger.info('🏔️ NER seeding complete!');
  } catch (error) {
    _logger.logger.error({ error }, 'NER seeding error');
  }
}
