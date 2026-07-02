const express = require('express');
const router = express.Router();
const { requireSupplier } = require('../middleware/auth');
const supplier = require('../controllers/supplierController');

// Profile
router.get('/profile',                requireSupplier, supplier.getProfile);
router.patch('/profile',              requireSupplier, supplier.updateProfile);
router.patch('/profile/whatsapp',     requireSupplier, supplier.changeWhatsApp);
router.delete('/account',             requireSupplier, supplier.deleteAccount);

// Listings
router.get('/listings',               requireSupplier, supplier.getListings);
router.get('/listings/history',       requireSupplier, supplier.getListingHistory);
router.get('/listings/dates',         requireSupplier, supplier.getListingDates);
router.get('/listings/by-date',       requireSupplier, supplier.getListingsByDate);
router.get('/listings/last',          requireSupplier, supplier.getLastListing);
router.post('/listings',              requireSupplier, supplier.createListing);
router.patch('/listings/:id',         requireSupplier, supplier.updateListing);
router.delete('/listings/:id',        requireSupplier, supplier.deleteListing);



// Report buyer
router.post('/report-buyer',          requireSupplier, supplier.reportBuyer);

// Buyers List
router.get('/buyers',                 requireSupplier, supplier.getBuyersList);

module.exports = router;
