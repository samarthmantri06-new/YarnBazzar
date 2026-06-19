const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');
const admin = require('../controllers/adminController');

router.use(requireAdmin); // All admin routes require admin JWT

router.get('/dashboard',                     admin.getDashboard);

// Sellers
router.get('/sellers/pending',               admin.getPendingSellers);
router.get('/sellers',                       admin.getAllSellers);
router.patch('/sellers/:id/approve',         admin.approveSeller);
router.patch('/sellers/:id/reject',          admin.rejectSeller);
router.patch('/sellers/:id/firm-name',       admin.editFirmName);
router.patch('/sellers/:id/suspend',         admin.suspendSeller);
router.patch('/sellers/:id/reset-password',  admin.resetSellerPassword);
router.delete('/sellers/:id',               admin.deleteSeller);

// Buyers
router.get('/buyers',                        admin.getAllBuyers);
router.patch('/buyers/:id/block',            admin.blockBuyer);
router.patch('/buyers/:id/unblock',          admin.unblockBuyer);
router.patch('/buyers/:id/reset-password',  admin.resetBuyerPassword);

// Reports
router.get('/reports',                       admin.getReports);
router.patch('/reports/:id/warn',            admin.warnReport);
router.patch('/reports/:id/resolve',         admin.resolveReport);

// Dropdowns
router.get('/dropdowns',                     admin.getDropdowns);
router.post('/dropdowns',                    admin.addDropdown);
router.delete('/dropdowns/:id',             admin.deleteDropdown);

// Profile
router.put('/profile',                       admin.updateAdminProfile);

module.exports = router;
