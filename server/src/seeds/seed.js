"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.seedDatabase = seedDatabase;
var _bcryptjs = _interopRequireDefault(require("bcryptjs"));
var _User = require("../models/User");
var _Disaster = require("../models/Disaster");
var _Shelter = require("../models/Shelter");
var _logger = require("../utils/logger");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const SEED_DISASTERS = [{
  externalId: 'seed-eq-1',
  source: 'SEED_DATA',
  type: 'EARTHQUAKE',
  title: 'M6.2 Earthquake — Central Turkey',
  description: 'A magnitude 6.2 earthquake struck central Turkey causing significant structural damage in nearby towns.',
  location: {
    type: 'Point',
    coordinates: [35.24, 38.96]
  },
  affectedRadius: 80,
  severity: 'HIGH',
  status: 'ACTIVE',
  startDate: new Date(Date.now() - 2 * 3600000),
  estimatedAffected: 45000,
  confidence: 95,
  metadata: {
    magnitude: 6.2,
    depth: 12.5
  }
}, {
  externalId: 'seed-fl-1',
  source: 'SEED_DATA',
  type: 'FLOOD',
  title: 'Severe Flooding — Bangladesh Dhaka Region',
  description: 'Heavy monsoon rains have caused widespread flooding across the Dhaka division, displacing thousands.',
  location: {
    type: 'Point',
    coordinates: [90.41, 23.81]
  },
  affectedRadius: 150,
  severity: 'CRITICAL',
  status: 'ACTIVE',
  startDate: new Date(Date.now() - 12 * 3600000),
  estimatedAffected: 250000,
  confidence: 90,
  metadata: {
    waterLevel: '4.2m above normal'
  }
}, {
  externalId: 'seed-wf-1',
  source: 'SEED_DATA',
  type: 'WILDFIRE',
  title: 'Wildfire — Southern California',
  description: 'A fast-moving wildfire in the San Gabriel Mountains has burned over 15,000 acres. Evacuations ordered.',
  location: {
    type: 'Point',
    coordinates: [-117.82, 34.15]
  },
  affectedRadius: 40,
  severity: 'CRITICAL',
  status: 'ACTIVE',
  startDate: new Date(Date.now() - 48 * 3600000),
  estimatedAffected: 12000,
  confidence: 98,
  metadata: {
    acresBurned: 15000,
    containment: '25%'
  }
}, {
  externalId: 'seed-cy-1',
  source: 'SEED_DATA',
  type: 'CYCLONE',
  title: 'Tropical Cyclone Amara — Bay of Bengal',
  description: 'Category 3 tropical cyclone approaching the eastern coast of India with sustained winds of 185 km/h.',
  location: {
    type: 'Point',
    coordinates: [85.5, 16.2]
  },
  affectedRadius: 300,
  severity: 'CRITICAL',
  status: 'ACTIVE',
  startDate: new Date(Date.now() - 6 * 3600000),
  estimatedAffected: 500000,
  confidence: 88,
  metadata: {
    category: 3,
    windSpeed: '185 km/h',
    pressure: '960 hPa'
  }
}, {
  externalId: 'seed-eq-2',
  source: 'SEED_DATA',
  type: 'EARTHQUAKE',
  title: 'M5.4 Earthquake — Northern Japan',
  description: 'Moderate earthquake detected off the coast of Hokkaido. No tsunami warning issued.',
  location: {
    type: 'Point',
    coordinates: [143.2, 42.8]
  },
  affectedRadius: 50,
  severity: 'MEDIUM',
  status: 'ACTIVE',
  startDate: new Date(Date.now() - 1 * 3600000),
  estimatedAffected: 8000,
  confidence: 97,
  metadata: {
    magnitude: 5.4,
    depth: 35
  }
}, {
  externalId: 'seed-vol-1',
  source: 'SEED_DATA',
  type: 'VOLCANO',
  title: 'Volcanic Activity — Mount Etna, Sicily',
  description: 'Mount Etna showing increased volcanic activity with lava fountains and ash emissions.',
  location: {
    type: 'Point',
    coordinates: [15.0, 37.75]
  },
  affectedRadius: 30,
  severity: 'MEDIUM',
  status: 'MONITORING',
  startDate: new Date(Date.now() - 72 * 3600000),
  estimatedAffected: 5000,
  confidence: 92,
  metadata: {
    alertLevel: 'Orange',
    ashHeight: '5km'
  }
}, {
  externalId: 'seed-fl-2',
  source: 'SEED_DATA',
  type: 'FLOOD',
  title: 'River Flooding — Amazon Basin, Brazil',
  description: 'Prolonged rainfall causing the Amazon River to exceed flood stage in multiple communities.',
  location: {
    type: 'Point',
    coordinates: [-60.02, -3.12]
  },
  affectedRadius: 200,
  severity: 'HIGH',
  status: 'ACTIVE',
  startDate: new Date(Date.now() - 96 * 3600000),
  estimatedAffected: 80000,
  confidence: 85,
  metadata: {
    riverLevel: '2.8m above flood stage'
  }
}, {
  externalId: 'seed-ls-1',
  source: 'SEED_DATA',
  type: 'LANDSLIDE',
  title: 'Landslide — Nepal Himalayan Region',
  description: 'Heavy rains triggered a major landslide blocking a key highway and damaging several villages.',
  location: {
    type: 'Point',
    coordinates: [85.3, 27.7]
  },
  affectedRadius: 15,
  severity: 'HIGH',
  status: 'ACTIVE',
  startDate: new Date(Date.now() - 18 * 3600000),
  estimatedAffected: 3500,
  confidence: 82,
  metadata: {
    roadBlocked: true,
    villagesAffected: 4
  }
}, {
  externalId: 'seed-sw-1',
  source: 'SEED_DATA',
  type: 'SEVERE_WEATHER',
  title: 'Severe Thunderstorm — Central Europe',
  description: 'Severe thunderstorm system producing large hail, damaging winds, and localized flooding across Germany.',
  location: {
    type: 'Point',
    coordinates: [10.45, 51.16]
  },
  affectedRadius: 120,
  severity: 'MEDIUM',
  status: 'ACTIVE',
  startDate: new Date(Date.now() - 3 * 3600000),
  estimatedAffected: 30000,
  confidence: 80,
  metadata: {
    hailSize: '4cm',
    windGusts: '120 km/h'
  }
}, {
  externalId: 'seed-wf-2',
  source: 'SEED_DATA',
  type: 'WILDFIRE',
  title: 'Bushfire — New South Wales, Australia',
  description: 'Out-of-control bushfire burning in the Blue Mountains region west of Sydney.',
  location: {
    type: 'Point',
    coordinates: [150.3, -33.7]
  },
  affectedRadius: 60,
  severity: 'HIGH',
  status: 'ACTIVE',
  startDate: new Date(Date.now() - 30 * 3600000),
  estimatedAffected: 7500,
  confidence: 91,
  metadata: {
    acresBurned: 28000,
    containment: '15%'
  }
}, {
  externalId: 'seed-ts-1',
  source: 'SEED_DATA',
  type: 'TSUNAMI',
  title: 'Tsunami Advisory — Tonga Region',
  description: 'Tsunami advisory issued following undersea volcanic activity near Tonga. Waves of 0.5-1m expected.',
  location: {
    type: 'Point',
    coordinates: [-175.2, -20.5]
  },
  affectedRadius: 500,
  severity: 'MEDIUM',
  status: 'MONITORING',
  startDate: new Date(Date.now() - 5 * 3600000),
  estimatedAffected: 15000,
  confidence: 75,
  metadata: {
    waveHeight: '0.5-1.0m',
    source: 'Volcanic'
  }
}, {
  externalId: 'seed-eq-3',
  source: 'SEED_DATA',
  type: 'EARTHQUAKE',
  title: 'M4.8 Earthquake — Central Italy',
  description: 'Light earthquake felt across the Abruzzo region. Minor structural damage reported.',
  location: {
    type: 'Point',
    coordinates: [13.4, 42.35]
  },
  affectedRadius: 30,
  severity: 'LOW',
  status: 'ACTIVE',
  startDate: new Date(Date.now() - 8 * 3600000),
  estimatedAffected: 2000,
  confidence: 96,
  metadata: {
    magnitude: 4.8,
    depth: 8
  }
}];
const SEED_SHELTERS = [{
  name: 'Lucknow Emergency Demo Shelter',
  location: {
    type: 'Point',
    coordinates: [80.95, 26.85]
  },
  address: 'Gomti Nagar, Lucknow, UP, India',
  capacity: 1000,
  currentOccupancy: 150,
  amenities: {
    water: true,
    food: true,
    medical: true,
    electricity: true,
    wifi: true
  },
  contact: {
    phone: '+91-522-555-0100'
  },
  status: 'OPEN'
}, {
  name: 'Central Emergency Shelter — Ankara',
  location: {
    type: 'Point',
    coordinates: [32.86, 39.93]
  },
  address: 'Kızılay Square, Ankara, Turkey',
  capacity: 500,
  currentOccupancy: 230,
  amenities: {
    water: true,
    food: true,
    medical: true,
    electricity: true,
    wifi: true
  },
  contact: {
    phone: '+90-312-555-0100'
  },
  status: 'OPEN'
}, {
  name: 'Dhaka Flood Relief Center',
  location: {
    type: 'Point',
    coordinates: [90.39, 23.79]
  },
  address: 'Mirpur Road, Dhaka, Bangladesh',
  capacity: 2000,
  currentOccupancy: 1850,
  amenities: {
    water: true,
    food: true,
    medical: true,
    electricity: false,
    wifi: false
  },
  contact: {
    phone: '+880-2-555-0200'
  },
  status: 'OPEN'
}, {
  name: 'Pasadena Community Emergency Shelter',
  location: {
    type: 'Point',
    coordinates: [-118.14, 34.15]
  },
  address: '100 N Garfield Ave, Pasadena, CA',
  capacity: 300,
  currentOccupancy: 280,
  amenities: {
    water: true,
    food: true,
    medical: true,
    electricity: true,
    wifi: true
  },
  contact: {
    phone: '+1-626-555-0300'
  },
  status: 'OPEN'
}, {
  name: 'Visakhapatnam Cyclone Shelter',
  location: {
    type: 'Point',
    coordinates: [83.3, 17.7]
  },
  address: 'Beach Road, Visakhapatnam, India',
  capacity: 1500,
  currentOccupancy: 450,
  amenities: {
    water: true,
    food: true,
    medical: false,
    electricity: true,
    wifi: false
  },
  contact: {
    phone: '+91-891-555-0400'
  },
  status: 'OPEN'
}];
async function seedDatabase() {
  try {
    _logger.logger.info('🌱 Starting database seeding...');

    // Create admin user if not exists
    const existingAdmin = await _User.User.findOne({
      email: 'admin@disaster-x.com'
    });
    if (!existingAdmin) {
      const hashedPassword = await _bcryptjs.default.hash('Admin123!', 12);
      await _User.User.create({
        email: 'admin@disaster-x.com',
        password: hashedPassword,
        name: 'System Administrator',
        role: 'ADMIN'
      });
      _logger.logger.info('✅ Admin user created: admin@disaster-x.com / Admin123!');
    }

    // Create demo user if not exists
    const existingUser = await _User.User.findOne({
      email: 'user@disaster-x.com'
    });
    if (!existingUser) {
      const hashedPassword = await _bcryptjs.default.hash('User1234!', 12);
      await _User.User.create({
        email: 'user@disaster-x.com',
        password: hashedPassword,
        name: 'Demo User',
        role: 'USER'
      });
      _logger.logger.info('✅ Demo user created: user@disaster-x.com / User1234!');
    }

    // Seed disasters (upsert to avoid duplicates)
    for (const disaster of SEED_DISASTERS) {
      await _Disaster.Disaster.findOneAndUpdate({
        externalId: disaster.externalId,
        source: disaster.source
      }, {
        $setOnInsert: disaster
      }, {
        upsert: true,
        new: true
      });
    }
    _logger.logger.info(`✅ Seeded ${SEED_DISASTERS.length} disasters`);

    // Seed shelters
    const adminUser = await _User.User.findOne({
      role: 'ADMIN'
    });
    if (adminUser) {
      for (const shelter of SEED_SHELTERS) {
        const existing = await _Shelter.Shelter.findOne({
          name: shelter.name
        });
        if (!existing) {
          await _Shelter.Shelter.create({
            ...shelter,
            createdBy: adminUser._id
          });
        }
      }
      _logger.logger.info(`✅ Seeded ${SEED_SHELTERS.length} shelters`);
    }
    _logger.logger.info('🌱 Database seeding complete!');
  } catch (error) {
    _logger.logger.error({
      error
    }, 'Seeding error');
  }
}