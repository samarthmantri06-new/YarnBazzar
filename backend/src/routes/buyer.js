const express = require('express');
const router = express.Router();
const { requireBuyer } = require('../middleware/auth');
const buyer = require('../controllers/buyerController');

// Profile
router.get('/profile',          requireBuyer, buyer.getProfile);
router.patch('/profile',        requireBuyer, buyer.updateProfile);

// Listings browse (public — no auth required to browse)
router.get('/listings',               buyer.getListings);

// Firm search & detail (public)
router.get('/firms/search',           buyer.searchFirms);
router.get('/firms/:id',              buyer.getFirmDetail);

module.exports = router;
