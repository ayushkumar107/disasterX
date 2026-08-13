const express = require('express');
const router = express.Router();
const { createSOS, getActiveSOS, updateSOSStatus } = require('../controllers/sosController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/', createSOS);
router.get('/', getActiveSOS);
router.patch('/:id/status', updateSOSStatus);

module.exports = router;
