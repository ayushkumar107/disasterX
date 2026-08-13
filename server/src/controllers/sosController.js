const { SOS } = require('../models/SOS');

/**
 * Create a new SOS alert
 */
const createSOS = async (req, res) => {
  try {
    const { lng, lat, severity, description, numberOfPeople } = req.body;

    if (!lng || !lat) {
      return res.status(400).json({ success: false, message: 'Location (lng, lat) is required' });
    }

    const sos = await SOS.create({
      user: req.user.id,
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      severity: severity || 'HIGH',
      description,
      numberOfPeople: numberOfPeople || 1,
      statusHistory: [{ status: 'CREATED', updatedBy: req.user.id }]
    });

    res.status(201).json({ success: true, data: sos });
  } catch (error) {
    req.log.error({ error }, 'Error creating SOS alert');
    res.status(500).json({ success: false, message: 'Server error creating SOS' });
  }
};

/**
 * Get all active SOS alerts (For Rescue/Admin Dashboard and Map)
 */
const getActiveSOS = async (req, res) => {
  try {
    const sosList = await SOS.find({ status: { $ne: 'RESCUED' } })
      .populate('user', 'firstName lastName phone')
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({ success: true, count: sosList.length, data: sosList });
  } catch (error) {
    req.log.error({ error }, 'Error fetching SOS alerts');
    res.status(500).json({ success: false, message: 'Server error fetching SOS alerts' });
  }
};

/**
 * Update SOS status (For Rescuers/Admins)
 */
const updateSOSStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const sos = await SOS.findById(id);
    if (!sos) {
      return res.status(404).json({ success: false, message: 'SOS not found' });
    }

    sos.status = status;
    sos.statusHistory.push({ status, updatedBy: req.user.id });
    
    if (status === 'ACKNOWLEDGED') sos.acknowledgedBy = req.user.id;
    if (status === 'RESCUED') sos.rescuedAt = new Date();

    await sos.save();
    res.json({ success: true, data: sos });
  } catch (error) {
    req.log.error({ error }, 'Error updating SOS status');
    res.status(500).json({ success: false, message: 'Server error updating SOS' });
  }
};

module.exports = {
  createSOS,
  getActiveSOS,
  updateSOSStatus
};
