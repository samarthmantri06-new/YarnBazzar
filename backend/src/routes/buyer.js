const express = require('express');
const router = express.Router();
const { requireBuyer } = require('../middleware/auth');
const buyer = require('../controllers/buyerController');

// Profile
router.get('/profile',          requireBuyer, buyer.getProfile);
router.patch('/profile',        requireBuyer, buyer.updateProfile);
router.patch('/profile/whatsapp', requireBuyer, buyer.changeWhatsApp);
router.delete('/account',       requireBuyer, buyer.deleteAccount);

// Listings browse (public — no auth required to browse)
router.get('/listings',               buyer.getListings);

// Firm search & detail (public)
router.get('/firms/search',           buyer.searchFirms);
router.get('/firms/:id',              buyer.getFirmDetail);
router.get('/firms/:id/history',      buyer.getFirmHistory);

const traderRoutes = require('./trader');
const manufacturerRoutes = require('./manufacturer');

router.use('/trader', traderRoutes);
router.use('/manufacturer', manufacturerRoutes);

module.exports = router;
