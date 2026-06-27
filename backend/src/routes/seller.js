const express = require('express');
const router = express.Router();
const { requireSeller } = require('../middleware/auth');
const seller = require('../controllers/sellerController');

// Profile
router.get('/profile',                requireSeller, seller.getProfile);
router.patch('/profile',              requireSeller, seller.updateProfile);
router.patch('/profile/whatsapp',     requireSeller, seller.changeWhatsApp);
router.delete('/account',             requireSeller, seller.deleteAccount);

// Listings
router.get('/listings',               requireSeller, seller.getListings);
router.get('/listings/history',       requireSeller, seller.getListingHistory);
router.get('/listings/dates',         requireSeller, seller.getListingDates);
router.get('/listings/by-date',       requireSeller, seller.getListingsByDate);
router.get('/listings/last',          requireSeller, seller.getLastListing);
router.post('/listings',              requireSeller, seller.createListing);
router.patch('/listings/:id',         requireSeller, seller.updateListing);
router.delete('/listings/:id',        requireSeller, seller.deleteListing);



// Report buyer
router.post('/report-buyer',          requireSeller, seller.reportBuyer);

module.exports = router;
