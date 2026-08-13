const express = require('express');
const router = express.Router();
const { getShelters, getNearbyShelters } = require('../controllers/shelterController');
router.get('/', getShelters);
router.get('/nearby', getNearbyShelters);

module.exports = router;
