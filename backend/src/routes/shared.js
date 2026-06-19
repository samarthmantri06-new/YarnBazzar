const express = require('express');
const router = express.Router();
const { requireSellerOrAdmin } = require('../middleware/auth');
const shared = require('../controllers/sharedController');

// Dropdown options (public read, seller/admin write)
router.get('/dropdowns/:fieldType',     shared.getDropdownOptions);
router.post('/dropdowns',               requireSellerOrAdmin, shared.addDropdownOption);

// India location cascading
router.get('/location/states',          shared.getStates);
router.get('/location/districts/:state', shared.getDistricts);
router.get('/location/cities/:state/:district', shared.getCities);

module.exports = router;
