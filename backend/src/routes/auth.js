const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');

// ─── GST Lookup (firm name auto-fill) ────────────────────────────────────────
router.get('/gst-lookup/:gstNumber',   auth.gstLookup);

// ─── Seller Auth ──────────────────────────────────────────────────────────────
router.post('/seller/register',        auth.sellerRegister);
router.post('/seller/login',           auth.sellerLogin);

// ─── Buyer Auth ───────────────────────────────────────────────────────────────
router.post('/buyer/register',         auth.buyerRegister);
router.post('/buyer/login',            auth.buyerLogin);

// ─── Admin Auth ───────────────────────────────────────────────────────────────
router.post('/admin/login',            auth.adminLogin);

module.exports = router;
