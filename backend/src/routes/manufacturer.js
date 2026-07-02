const express = require('express');
const router = express.Router();
const manufacturerController = require('../controllers/manufacturerController');
const { requireBuyer } = require('../middleware/auth');

router.use(requireBuyer);

router.post('/upgrade', manufacturerController.upgradeToManufacturer);
router.post('/delete', manufacturerController.deleteManufacturerProfile);
router.post('/agents', manufacturerController.addLinkedAgent);
router.get('/agents', manufacturerController.getLinkedAgents);
router.delete('/agents/:agentId', manufacturerController.removeLinkedAgent);

module.exports = router;
