const express = require('express');
const router = express.Router();
const traderController = require('../controllers/traderController');
const { requireBuyer } = require('../middleware/auth');

router.use(requireBuyer);

router.post('/upgrade', traderController.upgradeToTrader);
router.post('/delete', traderController.deleteTraderProfile);
router.post('/agents', traderController.addLinkedAgent);
router.get('/agents', traderController.getLinkedAgents);
router.delete('/agents/:agentId', traderController.removeLinkedAgent);

module.exports = router;
