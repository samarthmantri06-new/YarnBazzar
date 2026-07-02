const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');

// ─── GST Lookup (firm name auto-fill) ────────────────────────────────────────
router.get('/gst-lookup/:gstNumber',   auth.gstLookup);

// ─── Supplier Auth ──────────────────────────────────────────────────────────────
router.post('/supplier/register',        auth.supplierRegister);
router.post('/supplier/login',           auth.supplierLogin);

// ─── Buyer Auth ───────────────────────────────────────────────────────────────
router.post('/buyer/register',         auth.buyerRegister);
router.post('/buyer/login',            auth.buyerLogin);

// ─── Admin Auth ───────────────────────────────────────────────────────────────
router.post('/admin/login',            auth.adminLogin);

// ─── Password Management ──────────────────────────────────────────────────────
const { verifyToken } = require('../middleware/auth');
router.post('/forgot-password',        auth.forgotPassword);
router.post('/reset-password',         auth.resetPassword);
router.put('/change-password', verifyToken, auth.changePassword);

module.exports = router;
