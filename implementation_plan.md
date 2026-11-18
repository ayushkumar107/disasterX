# DISASTER-X → DISASTER-X NER: SIH 26001 Transformation

## Complete Codebase Audit & Implementation Plan

---

## 1. Current Architecture

```mermaid
graph TB
    subgraph Client["CLIENT — Vite + React 19"]
        R[Router] --> HP[HomePage]
        HP --> TB[TopBar]
        HP --> GM[GlobalMap — MapLibre]
        HP --> LP[LeftPanel]
        HP --> RP[RightPanel]
        HP --> BN[BottomNav]
        HP --> NP[NavigationPanel]
        HP --> WP[WeatherPanel]
        HP --> AI[AIAssistantPanel]
        HP --> PA[ProximityAlert]
        HP --> SM[SOSModal]
        R --> LI[LoginPage]
        R --> RE[RegisterPage]
    end

    subgraph Stores["ZUSTAND STORES"]
        AS[authStore]
        DS[disasterStore]
        LS[locationStore]
        MS[mapStore]
        WS[weatherStore]
        SS[shelterStore]
        SO[sosStore]
        US[uiStore]
    end

    subgraph Server["SERVER — Express 5 + MongoDB"]
        APP[app.js] --> RO[Routes]
        RO --> AR[/api/auth]
        RO --> DR[/api/disasters]
        RO --> SR[/api/shelters]
        RO --> SOS[/api/sos]
        RO --> HE[/api/health]
        
        AR --> AC[authController]
        DR --> DC[disasterController]
        SR --> SC[shelterController]
        SOS --> SOC[sosController]

        AC --> AS2[authService]
        DC --> DS2[disasterService]
        
        IS[IngestionService] --> BA[BaseAdapter]
        BA --> USGS[USGSAdapter]
        BA --> EONET[EONETAdapter]
        BA --> GDACS[GDACSAdapter]
    end

    subgraph Models["MONGOOSE MODELS"]
        UM[User]
        DM[Disaster]
        DRM[DisasterReport]
        SOSM[SOS]
        SHM[Shelter]
        RTM[RescueTeam + RescueMission]
        AIM[AIAnalysis]
        NM[Notification]
        CRM[ChatRoom + Message]
    end

    Client -->|axios /api| Server
    Server --> Models
```

---

## 2. Current Folder Structure

```
disasterLink/
├── .env                          # Root env vars
├── babel.config.json             # Babel (server transpiled)
├── client/
│   ├── index.html
│   ├── vite.config.js            # Vite + TailwindCSS v4 + proxy
│   ├── package.json              # React 19, MapLibre, Zustand, Framer Motion, Recharts
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css             # Design system (CSS vars, glass panels, animations)
│       ├── router/
│       │   ├── index.jsx         # BrowserRouter (/, /login, /register)
│       │   └── ProtectedRoute.jsx
│       ├── services/
│       │   └── api.js            # Axios interceptors with token refresh
│       ├── stores/
│       │   ├── authStore.js      # JWT auth state
│       │   ├── disasterStore.js  # Disaster CRUD + filters
│       │   ├── locationStore.js  # Geolocation + OSRM routing
│       │   ├── mapStore.js       # Map center/zoom/layers
│       │   ├── weatherStore.js   # Open-Meteo weather
│       │   ├── shelterStore.js   # Shelter data
│       │   ├── sosStore.js       # SOS alerts
│       │   └── uiStore.js        # Panel toggle state
│       ├── types/
│       │   └── disaster.js       # DISASTER_TYPE_CONFIG, SEVERITY_CONFIG
│       ├── components/
│       │   ├── auth/
│       │   │   ├── LoginForm.jsx
│       │   │   └── RegisterForm.jsx
│       │   ├── common/
│       │   │   ├── ConnectionStatus.jsx
│       │   │   ├── GlassPanel.jsx
│       │   │   ├── NavigationPanel.jsx   # Turn-by-turn route display
│       │   │   ├── ProximityAlert.jsx    # Nearby disaster warning
│       │   │   ├── StatusIndicator.jsx
│       │   │   ├── UTCClock.jsx
│       │   │   └── WeatherPanel.jsx      # Live weather from Open-Meteo
│       │   ├── layout/
│       │   │   ├── TopBar.jsx            # Header with branding + telemetry
│       │   │   ├── LeftPanel.jsx         # Layers + filters
│       │   │   ├── RightPanel.jsx        # Active disasters + distribution
│       │   │   └── BottomNav.jsx         # SOS, Chat, AI, Report, Route
│       │   ├── map/
│       │   │   └── GlobalMap.jsx         # MapLibre GL (585 lines)
│       │   ├── modals/
│       │   │   └── SOSModal.jsx          # Emergency SOS form
│       │   └── panels/
│       │       └── AIAssistantPanel.jsx  # Hardcoded first-aid chatbot
│       └── pages/
│           ├── HomePage.jsx
│           ├── LoginPage.jsx
│           └── RegisterPage.jsx
└── server/
    ├── package.json              # Express 5, Mongoose 9, Socket.IO, JWT
    ├── nodemon.json
    └── src/
        ├── index.js              # Server entry (transpiled)
        ├── app.js                # Express setup (transpiled)
        ├── config/
        │   ├── env.js            # Environment config
        │   ├── database.js       # MongoDB connection
        │   └── cron.js           # 30-min ingestion cron
        ├── controllers/
        │   ├── authController.js
        │   ├── disasterController.js
        │   ├── shelterController.js
        │   └── sosController.js
        ├── middleware/
        │   ├── auth.js           # JWT Bearer auth
        │   ├── rbac.js           # Role-based access (USER, VOLUNTEER, RESCUE_TEAM, ADMIN)
        │   ├── errorHandler.js   # Global error handler
        │   ├── rateLimiter.js    # Rate limiting
        │   ├── upload.js         # Multer file upload
        │   └── validate.js       # Zod validation
        ├── models/
        │   ├── User.js           # With 2dsphere geolocation
        │   ├── Disaster.js       # 10 types incl. LANDSLIDE, 2dsphere
        │   ├── DisasterReport.js # With credibilityScore, verifications
        │   ├── SOS.js            # Full status lifecycle
        │   ├── Shelter.js        # With amenities, capacity
        │   ├── RescueTeam.js     # + RescueMission
        │   ├── AIAnalysis.js     # IMAGE_DETECTION, RISK_ASSESSMENT, CHAT_RESPONSE
        │   ├── Notification.js   # Multi-type, severity-based
        │   └── ChatRoom.js       # + Message, GLOBAL/NEARBY/DISASTER/RESCUE types
        ├── routes/
        │   ├── index.js          # /auth, /disasters, /shelters, /sos, /health
        │   ├── authRoutes.js     # register, login, refresh, logout, me, profile
        │   ├── disasterRoutes.js # GET /, /stats, /nearby, /:id, POST, PATCH
        │   ├── shelterRoutes.js  # GET /, /nearby
        │   └── sosRoutes.js      # POST /, GET /, PATCH /:id/status
        ├── services/
        │   ├── authService.js    # Full auth with token rotation
        │   ├── disasterService.js # CRUD + geospatial queries
        │   ├── IngestionService.js # Multi-adapter ingestion pipeline
        │   └── adapters/
        │       ├── BaseAdapter.js  # Abstract base with HTTP + validation
        │       ├── USGSAdapter.js  # Earthquake data
        │       ├── EONETAdapter.js # NASA EONET events
        │       └── GDACSAdapter.js # GDACS alerts
        ├── seeds/
        │   └── seed.js           # 12 disasters + 5 shelters + admin/demo users
        ├── utils/
        │   ├── geo.js            # Haversine, GeoJSON helpers
        │   ├── jwt.js            # Token generation/verification
        │   ├── logger.js         # Pino logger
        │   └── pagination.js     # Pagination utility
        └── validators/
            ├── authValidators.js # Zod schemas
            └── disasterValidators.js
```

---

## 3. Existing Database Models

| Model | Fields | Indexes | Status |
|-------|--------|---------|--------|
| **User** | email, password, name, role (USER/VOLUNTEER/RESCUE_TEAM/ADMIN), location (2dsphere), locationSharing, refreshTokens, isOnline, lastSeen | email (unique), location (2dsphere), role | ✅ Reuse |
| **Disaster** | externalId, source, type (10 types incl. LANDSLIDE), title, description, location (2dsphere), affectedRadius, severity, status, startDate, endDate, estimatedAffected, confidence, metadata, relatedReports | location (2dsphere), type, severity, status, externalId+source (unique) | ✅ Reuse + Extend |
| **DisasterReport** | reporter, disasterId, type, title, description, location (2dsphere), severity, images[], aiAnalysis, credibilityScore, verifications[], status | location (2dsphere), status, reporter | ✅ Reuse + Extend |
| **SOS** | user, location (2dsphere), status (7 states), severity, description, numberOfPeople, batteryLevel, photo, voiceNote, assignedTeam, mission, statusHistory[] | location (2dsphere), status, user, assignedTeam | ✅ Reuse |
| **Shelter** | name, location (2dsphere), address, capacity, currentOccupancy, amenities, contact, status, createdBy | location (2dsphere), status | ✅ Reuse |
| **RescueTeam** | name, leader, members[], status, location (2dsphere), specialization[], equipment[], activeMission, completedMissions | location (2dsphere), status | ✅ Reuse |
| **RescueMission** | sos, team, assignedBy, status, eta, notes[], startedAt, completedAt | sos, team, status | ✅ Reuse |
| **AIAnalysis** | type (IMAGE_DETECTION/RISK_ASSESSMENT/CHAT_RESPONSE), input, result, aiModel, processingTime | type, createdAt | ✅ Reuse + Extend |
| **Notification** | recipient, type, title, message, severity, data, read | recipient+read, createdAt | ✅ Reuse + Extend |
| **ChatRoom** | name, type, disasterId, center (2dsphere), radius, participants[], createdBy, isActive | type, disasterId, center (2dsphere) | ✅ Reuse |
| **Message** | chatRoom, sender, content, type, location, disasterId, readBy[], deliveredTo[] | chatRoom+createdAt, sender | ✅ Reuse |

---

## 4. Current API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register user |
| POST | `/api/auth/login` | ❌ | Login |
| POST | `/api/auth/refresh` | ❌ | Refresh tokens |
| POST | `/api/auth/logout` | ✅ | Logout |
| GET | `/api/auth/me` | ✅ | Get profile |
| PATCH | `/api/auth/profile` | ✅ | Update profile |
| GET | `/api/disasters` | ❌ | List disasters (paginated, filtered) |
| GET | `/api/disasters/stats` | ❌ | Disaster statistics |
| GET | `/api/disasters/nearby` | ✅ | Nearby disasters (geospatial) |
| GET | `/api/disasters/:id` | ❌ | Single disaster |
| POST | `/api/disasters` | ✅ ADMIN | Create disaster |
| PATCH | `/api/disasters/:id` | ✅ ADMIN | Update disaster |
| GET | `/api/shelters` | ❌ | List shelters |
| GET | `/api/shelters/nearby` | ❌ | Nearby shelters (geospatial) |
| POST | `/api/sos` | ✅ | Create SOS |
| GET | `/api/sos` | ✅ | Active SOS |
| PATCH | `/api/sos/:id/status` | ✅ | Update SOS status |
| GET | `/api/health` | ❌ | Health check |

---

## 5. Current AI Architecture

The AI assistant is **entirely client-side** with hardcoded responses (no server AI service running). The backend has `AI_SERVICE_URL=http://localhost:8000` configured but there is **no Python FastAPI service** in the repository. The `AIAnalysis` model exists but is not actively used.

**What exists:**
- Client-side hardcoded emergency response chatbot ([AIAssistantPanel.jsx](file:///c:/Users/ayush/Desktop/disasterLink/client/src/components/panels/AIAssistantPanel.jsx))
- `AIAnalysis` MongoDB model with IMAGE_DETECTION / RISK_ASSESSMENT / CHAT_RESPONSE types
- `AI_SERVICE_URL` environment variable

**What's missing:**
- No Python FastAPI AI service
- No ML models
- No image analysis
- No risk prediction
- No explainable AI

---

## 6. Current Map Architecture

- **Library**: MapLibre GL v6.3.0
- **Tile Source**: Esri Dark Gray Base (raster tiles)
- **Center**: `[0, 20]` (global view, zoom 2.5)
- **Markers**: Custom HTML disaster markers with severity-based styling (Snapchat-style auras, pulse rings)
- **Shelter markers**: Green dots with popup
- **Routing**: OSRM-based safe routing with SVG overlay path + MapLibre native line layers
- **Geolocate**: Built-in MapLibre GeolocateControl with auto-trigger
- **Layers system**: disasters, shelters, sos, rescueTeams, weather, userLocation (toggleable from LeftPanel)

---

## 7. Existing Reusable Components

| Component | Location | Reusable For NER? |
|-----------|----------|-------------------|
| TopBar | layout/TopBar.jsx | ✅ Rebrand to NER, keep telemetry |
| LeftPanel | layout/LeftPanel.jsx | ✅ Add landslide layers (risk, rainfall, sensors, etc.) |
| RightPanel | layout/RightPanel.jsx | ✅ Transform to Risk Zone feed |
| BottomNav | layout/BottomNav.jsx | ✅ Add landslide report button |
| GlobalMap | map/GlobalMap.jsx | ✅ Re-center to NER, add risk heatmap layers |
| SOSModal | modals/SOSModal.jsx | ✅ Reuse as-is |
| NavigationPanel | common/NavigationPanel.jsx | ✅ Reuse as-is |
| WeatherPanel | common/WeatherPanel.jsx | ✅ Extend with rainfall intelligence |
| AIAssistantPanel | panels/AIAssistantPanel.jsx | ✅ Modify context for landslide focus |
| ProximityAlert | common/ProximityAlert.jsx | ✅ Extend for landslide warnings |
| GlassPanel | common/GlassPanel.jsx | ✅ Reuse as-is |
| StatusIndicator | common/StatusIndicator.jsx | ✅ Reuse as-is |
| UTCClock | common/UTCClock.jsx | ✅ Reuse as-is |
| ConnectionStatus | common/ConnectionStatus.jsx | ✅ Reuse as-is |
| LoginForm / RegisterForm | auth/ | ✅ Reuse as-is |
| BaseAdapter pattern | server adapters/ | ✅ Extend for weather/satellite/sensor providers |

---

## 8. Existing Real-Time Functionality

- **Socket.IO** is included in `server/package.json` but **not yet wired up** (no `io.on('connection')` handler in index.js — server creates HTTP server but never attaches Socket.IO)
- **socket.io-client** is in client `package.json` but **not imported anywhere**
- The architecture is ready but Socket.IO is not operational

---

## 9. SIH 26001 Requirements Mapping & Gap Analysis

| # | SIH 26001 Requirement | Existing Implementation | Missing | Required Changes | Priority |
|---|----------------------|------------------------|---------|-----------------|----------|
| 1 | NER geographic focus | Global map centered at [0,20] | ❌ NER focus | Re-center map to NER (~93.5, 25.5), NER boundary overlay | P1 |
| 2 | Landslide risk prediction | LANDSLIDE exists as disaster type | ❌ Risk model, prediction engine | New landslide risk engine + models | P1 |
| 3 | Rainfall monitoring | WeatherPanel uses Open-Meteo (basic) | ❌ Rainfall intelligence (cumulative, intensity, anomaly) | Dedicated rainfall analysis module | P1 |
| 4 | Soil moisture monitoring | Nothing | ❌ Complete module | New sensor models, MQTT architecture, simulator | P2 |
| 5 | Terrain/slope analysis | Nothing | ❌ Complete module | DEM, slope, aspect, terrain susceptibility | P2 |
| 6 | Historical landslide data | Seed has 1 Nepal landslide | ❌ NER historical records | New model + NER seed data | P2 |
| 7 | Satellite imagery analysis | Nothing | ❌ Complete module | Satellite provider adapters + change detection | P3 |
| 8 | AI/ML landslide prediction | No AI service exists | ❌ Complete module | New Python FastAPI service or Node.js prototype model | P1 |
| 9 | Explainable AI risk scores | Nothing | ❌ Complete module | Risk driver breakdown UI + API | P2 |
| 10 | Early warning engine | Nothing | ❌ Complete module | Threshold-based warning generation | P1 |
| 11 | Multi-level alerts | Notification model (basic types) | Partial — notification infrastructure exists | Extend notification types for WATCH/ADVISORY/WARNING/CRITICAL | P2 |
| 12 | NER GIS command center | Generic global dashboard | ❌ NER-focused UI | Transform dashboard, add risk layers | P1 |
| 13 | Risk zone detail panel | Disaster popup (basic) | ❌ Comprehensive risk panel | New risk zone detail panel component | P2 |
| 14 | What-if simulation | Nothing | ❌ Complete module | Simulation API + UI | P3 |
| 15 | Landslide computer vision | AIAnalysis model (unused) | ❌ Complete module | Image analysis for landslide indicators | P3 |
| 16 | Citizen/field reporting (landslide-specific) | DisasterReport model exists with credibility | Partial — generic reporting | Extend with landslide observation types | P2 |
| 17 | Report verification/credibility | credibilityScore + verifications in DisasterReport | Partial — structure exists, logic incomplete | Add credibility calculation engine | P2 |
| 18 | Emergency response prioritization | SOS + RescueTeam models exist | ❌ Priority engine | New priority ranking service | P3 |
| 19 | Road connectivity monitoring | Safe routing via OSRM | ❌ Road risk monitoring | New road risk model + integration | P3 |
| 20 | AI emergency assistant | Hardcoded client-side chatbot | Partial — UI exists, no real AI | Extend with landslide context | P3 |
| 21 | Multilingual support | Nothing | ❌ i18n architecture | i18n framework + NER language support | P4 |
| 22 | Offline / low-network | Online/offline detection in HomePage | Partial — detection only | IndexedDB, offline reports, sync queue | P4 |
| 23 | Data provider architecture | BaseAdapter pattern exists | Partial — only disaster feeds | Extend for weather, satellite, sensor providers | P2 |
| 24 | Socket.IO real-time events | Socket.IO in deps but NOT wired | ❌ Socket.IO not functional | Wire up Socket.IO + landslide events | P2 |
| 25 | Admin command center | Generic right panel | ❌ NER command center | Transform admin dashboard | P2 |

---

## 10. Files That Need Modification

### Server

| File | Change Type | Description |
|------|------------|-------------|
| [env.js](file:///c:/Users/ayush/Desktop/disasterLink/server/src/config/env.js) | MODIFY | Add NER, weather, sensor, satellite provider env vars |
| [cron.js](file:///c:/Users/ayush/Desktop/disasterLink/server/src/config/cron.js) | MODIFY | Add rainfall, sensor, risk evaluation cron jobs |
| [index.js](file:///c:/Users/ayush/Desktop/disasterLink/server/src/index.js) | MODIFY | Wire up Socket.IO |
| [app.js](file:///c:/Users/ayush/Desktop/disasterLink/server/src/app.js) | MODIFY | Mount new landslide route modules |
| [routes/index.js](file:///c:/Users/ayush/Desktop/disasterLink/server/src/routes/index.js) | MODIFY | Register new API route groups |
| [Notification.js](file:///c:/Users/ayush/Desktop/disasterLink/server/src/models/Notification.js) | MODIFY | Extend notification types for landslide warnings |
| [DisasterReport.js](file:///c:/Users/ayush/Desktop/disasterLink/server/src/models/DisasterReport.js) | MODIFY | Add landslide-specific observation fields |
| [seed.js](file:///c:/Users/ayush/Desktop/disasterLink/server/src/seeds/seed.js) | MODIFY | Add NER-focused seed data (risk zones, sensors, historical events) |

### Client

| File | Change Type | Description |
|------|------------|-------------|
| [mapStore.js](file:///c:/Users/ayush/Desktop/disasterLink/client/src/stores/mapStore.js) | MODIFY | Re-center to NER, add new layer toggles |
| [TopBar.jsx](file:///c:/Users/ayush/Desktop/disasterLink/client/src/components/layout/TopBar.jsx) | MODIFY | Rebrand to DISASTER-X NER, add landslide telemetry |
| [LeftPanel.jsx](file:///c:/Users/ayush/Desktop/disasterLink/client/src/components/layout/LeftPanel.jsx) | MODIFY | Add landslide-specific layers and filters |
| [RightPanel.jsx](file:///c:/Users/ayush/Desktop/disasterLink/client/src/components/layout/RightPanel.jsx) | MODIFY | Transform to NER risk zone feed |
| [BottomNav.jsx](file:///c:/Users/ayush/Desktop/disasterLink/client/src/components/layout/BottomNav.jsx) | MODIFY | Add landslide report action |
| [GlobalMap.jsx](file:///c:/Users/ayush/Desktop/disasterLink/client/src/components/map/GlobalMap.jsx) | MODIFY | Re-center to NER, add risk heatmap, terrain layers, NER boundary |
| [WeatherPanel.jsx](file:///c:/Users/ayush/Desktop/disasterLink/client/src/components/common/WeatherPanel.jsx) | MODIFY | Extend with rainfall intelligence (cumulative, intensity, forecast) |
| [AIAssistantPanel.jsx](file:///c:/Users/ayush/Desktop/disasterLink/client/src/components/panels/AIAssistantPanel.jsx) | MODIFY | Add landslide context, risk zone info, safety guidance |
| [disasterStore.js](file:///c:/Users/ayush/Desktop/disasterLink/client/src/stores/disasterStore.js) | MODIFY | Add landslide risk zone fetch |
| [weatherStore.js](file:///c:/Users/ayush/Desktop/disasterLink/client/src/stores/weatherStore.js) | MODIFY | Add rainfall intelligence data |
| [index.css](file:///c:/Users/ayush/Desktop/disasterLink/client/src/index.css) | MODIFY | Add new CSS vars for risk levels (ELEVATED), risk heatmap styles |
| [disaster.js](file:///c:/Users/ayush/Desktop/disasterLink/client/src/types/disaster.js) | MODIFY | Add LANDSLIDE_RISK_CONFIG, RISK_LEVEL_CONFIG |
| [HomePage.jsx](file:///c:/Users/ayush/Desktop/disasterLink/client/src/pages/HomePage.jsx) | MODIFY | Add new NER panels (risk detail, warnings, sensor dashboard) |
| [index.jsx](file:///c:/Users/ayush/Desktop/disasterLink/client/src/router/index.jsx) | MODIFY | Add admin command center route |

---

## 11. New Files to Create

### Server — New Models
| File | Purpose |
|------|---------|
| `server/src/models/LandslideRiskZone.js` | Risk zones with polygon geometry, risk level, probability, confidence |
| `server/src/models/RiskAssessment.js` | Individual assessments with explainable feature contributions |
| `server/src/models/RainfallObservation.js` | Rainfall readings (current, cumulative, forecast) |
| `server/src/models/SoilMoistureSensor.js` | Sensor registry with location, threshold, status |
| `server/src/models/SoilMoistureReading.js` | Time-series sensor readings |
| `server/src/models/TerrainFeature.js` | Elevation, slope, aspect, geology, land cover |
| `server/src/models/HistoricalLandslide.js` | Past events with location, severity, casualties, conditions |
| `server/src/models/SatelliteObservation.js` | Change detection results |
| `server/src/models/EarlyWarning.js` | Warnings with WATCH/ADVISORY/WARNING/CRITICAL levels |
| `server/src/models/RoadRisk.js` | Road segments with risk status |

### Server — New Services
| File | Purpose |
|------|---------|
| `server/src/services/landslide/RiskEngine.js` | Core risk calculation orchestrator |
| `server/src/services/landslide/RainfallService.js` | Rainfall data collection + feature computation |
| `server/src/services/landslide/SoilMoistureService.js` | Sensor data management + trend analysis |
| `server/src/services/landslide/TerrainService.js` | Terrain/slope/elevation features |
| `server/src/services/landslide/SatelliteService.js` | Satellite change detection orchestrator |
| `server/src/services/landslide/EarlyWarningService.js` | Warning generation + threshold monitoring |
| `server/src/services/landslide/ResponsePriorityService.js` | Emergency response ranking |
| `server/src/services/landslide/ReportCredibilityService.js` | Citizen report credibility assessment |
| `server/src/services/adapters/OpenMeteoRainfallAdapter.js` | Rainfall from Open-Meteo API |
| `server/src/services/adapters/MockRainfallAdapter.js` | Simulated rainfall for dev |
| `server/src/services/adapters/MockSensorAdapter.js` | Simulated soil moisture sensors |
| `server/src/services/adapters/MockSatelliteAdapter.js` | Simulated satellite observations |

### Server — New Routes + Controllers
| File | Purpose |
|------|---------|
| `server/src/routes/landslideRoutes.js` | /api/landslide/* endpoints |
| `server/src/routes/rainfallRoutes.js` | /api/rainfall/* endpoints |
| `server/src/routes/sensorRoutes.js` | /api/sensors/* endpoints |
| `server/src/routes/warningRoutes.js` | /api/warnings/* endpoints |
| `server/src/routes/terrainRoutes.js` | /api/terrain/* endpoints |
| `server/src/routes/roadRiskRoutes.js` | /api/roads/* endpoints |
| `server/src/controllers/landslideController.js` | Risk zone + assessment handlers |
| `server/src/controllers/rainfallController.js` | Rainfall data handlers |
| `server/src/controllers/sensorController.js` | Sensor CRUD + readings handlers |
| `server/src/controllers/warningController.js` | Warning lifecycle handlers |
| `server/src/controllers/terrainController.js` | Terrain data handlers |

### Server — WebSocket
| File | Purpose |
|------|---------|
| `server/src/config/socketio.js` | Socket.IO setup with auth + event handlers |

### Client — New Stores
| File | Purpose |
|------|---------|
| `client/src/stores/landslideStore.js` | Risk zones, assessments, risk levels |
| `client/src/stores/rainfallStore.js` | Rainfall intelligence data |
| `client/src/stores/sensorStore.js` | Soil moisture sensor state |
| `client/src/stores/warningStore.js` | Early warnings |
| `client/src/stores/socketStore.js` | Socket.IO connection + events |

### Client — New Components
| File | Purpose |
|------|---------|
| `client/src/components/panels/RiskZoneDetailPanel.jsx` | Detailed risk zone view |
| `client/src/components/panels/RainfallIntelligencePanel.jsx` | Rainfall analytics dashboard |
| `client/src/components/panels/SoilMoisturePanel.jsx` | Sensor readings + trends |
| `client/src/components/panels/EarlyWarningPanel.jsx` | Active warnings display |
| `client/src/components/panels/LandslideReportPanel.jsx` | Landslide-specific report form |
| `client/src/components/panels/WhatIfSimulationPanel.jsx` | Risk scenario simulation |
| `client/src/components/panels/ResponsePriorityPanel.jsx` | Priority queue for admin |
| `client/src/components/common/RiskLevelBadge.jsx` | Colored risk level indicator |
| `client/src/components/common/WarningBanner.jsx` | Top-screen warning banner |
| `client/src/components/common/DataSourceLabel.jsx` | LIVE/SIMULATED/DEMO label |
| `client/src/pages/AdminCommandCenter.jsx` | NER Landslide Command Center page |

---

## 12. Implementation Order

### Phase 1 — Foundation (Current step ✅)
- [x] Audit complete codebase
- [x] Gap analysis
- [x] Architecture plan
- [ ] **Await user approval**

### Phase 2 — NER Database Models
- Create all 10 new Mongoose models
- Add geospatial indexes
- Extend existing Notification types

### Phase 3 — Data Provider Architecture
- Create rainfall adapter (Open-Meteo + Mock)
- Create sensor adapter (Mock/Simulator)
- Create satellite adapter (Mock)
- Extend env.js with new provider config

### Phase 4 — Landslide Risk Engine (Backend)
- Create RiskEngine service
- Create RainfallService
- Create SoilMoistureService
- Create TerrainService
- Create prototype risk model (clearly labeled)

### Phase 5 — Early Warning Engine (Backend)
- Create EarlyWarningService
- Create threshold monitoring
- Create warning lifecycle management

### Phase 6 — New API Routes
- Mount all new route groups
- Create controllers
- Wire up Socket.IO with landslide events

### Phase 7 — NER Seed Data
- NER risk zones (8 states)
- Historical landslide events (NER)
- NER shelters
- Demo soil moisture sensors
- Demo terrain features

### Phase 8 — Client NER Transformation
- Re-center map to NER
- Add NER boundary GeoJSON overlay
- Rebrand TopBar
- Transform LeftPanel with landslide layers
- Transform RightPanel to risk zone feed
- Add risk heatmap to map

### Phase 9 — New Client Panels
- RiskZoneDetailPanel
- RainfallIntelligencePanel
- SoilMoisturePanel
- EarlyWarningPanel
- LandslideReportPanel

### Phase 10 — What-If Simulation + Response Priority
- WhatIfSimulationPanel
- ResponsePriorityPanel
- Road connectivity risk

### Phase 11 — AI Assistant + Computer Vision
- Modify AI assistant for landslide context
- Add landslide image analysis (if Python service)

### Phase 12 — Admin Command Center
- AdminCommandCenter page
- Live risk trends
- Warning history
- Response priority queue

### Phase 13 — Polish + Verification
- Offline/PWA strengthening
- Multilingual architecture stub
- Data source labels (LIVE/SIMULATED)
- Build verification
- UI polish

---

## User Review Required

> [!IMPORTANT]
> **Server code is transpiled (Babel)**. All server `.js` files contain `_interopRequireDefault`, `exports.default`, etc. — they are pre-compiled output, not source. This means:
> - I will write new server files in the **same transpiled CommonJS style** for consistency
> - OR I can add a `server/src-es/` directory with clean ES module source and update the build pipeline
> - **Recommendation**: Write new code in **clean ES module style** with a simple build step, since maintaining hand-transpiled code is error-prone

> [!IMPORTANT]
> **No Python AI service exists** in the repo. For the SIH demo:
> - Option A: Create a lightweight **Node.js prototype risk model** (faster, no Python dependency)
> - Option B: Create a **Python FastAPI service** (matches SIH expectations but adds deployment complexity)
> - **Recommendation**: Start with Node.js prototype risk engine in the backend, design it so a Python ML model can replace it later

> [!IMPORTANT]
> **Socket.IO is in dependencies but not wired up**. The client has `socket.io-client` and the server has `socket.io`, but there's zero integration code. I will wire this up as part of Phase 6.

## Open Questions

> [!IMPORTANT]
> 1. **Server code style**: Should I write new server code in the same pre-transpiled CommonJS style (for consistency), or use clean ES modules with `import/export` syntax? The existing code looks like Babel output.
>
> 2. **AI service approach**: Node.js prototype risk engine (simpler, self-contained) vs Python FastAPI (matches SIH expectations for ML)? I recommend starting with Node.js and designing for Python swap-in.
>
> 3. **Should I create the admin command center as a separate route** (`/admin`) or integrate it as a panel toggle in the existing single-page layout?
>
> 4. **NER boundary data**: Should I embed a simplified NER boundary GeoJSON in the client, or fetch it from a static file on the server?
