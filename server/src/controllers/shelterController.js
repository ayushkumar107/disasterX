const { Shelter } = require('../models/Shelter');

/**
 * Get all shelters with optional filtering
 */
const getShelters = async (req, res) => {
  try {
    const { status, hasCapacity } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (hasCapacity === 'true') {
      filter.$expr = { $gt: ['$capacity', '$currentOccupancy'] };
    }

    const shelters = await Shelter.find(filter).lean();
    res.json({ success: true, count: shelters.length, data: shelters });
  } catch (error) {
    req.log.error({ error }, 'Error fetching shelters');
    res.status(500).json({ success: false, message: 'Server error fetching shelters' });
  }
};

/**
 * Find shelters near a specific point
 */
const getNearbyShelters = async (req, res) => {
  try {
    const { lng, lat, maxDistance = 50000 } = req.query; // maxDistance in meters (default 50km)

    if (!lng || !lat) {
      return res.status(400).json({ success: false, message: 'Longitude (lng) and Latitude (lat) are required' });
    }

    const shelters = await Shelter.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      },
      status: 'OPEN'
    }).lean();

    res.json({ success: true, count: shelters.length, data: shelters });
  } catch (error) {
    req.log.error({ error }, 'Error fetching nearby shelters');
    res.status(500).json({ success: false, message: 'Server error finding nearby shelters' });
  }
};

module.exports = {
  getShelters,
  getNearbyShelters
};
