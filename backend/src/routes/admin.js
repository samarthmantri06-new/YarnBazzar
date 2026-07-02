const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');
const admin = require('../controllers/adminController');

router.use(requireAdmin); // All admin routes require admin JWT

router.get('/dashboard',                     admin.getDashboard);

// Suppliers
router.get('/suppliers/pending',               admin.getPendingSuppliers);
router.get('/suppliers',                       admin.getAllSuppliers);
router.patch('/suppliers/:id/approve',         admin.approveSupplier);
router.patch('/suppliers/:id/reject',          admin.rejectSupplier);
router.patch('/suppliers/:id/firm-name',       admin.editFirmName);
router.patch('/suppliers/:id/suspend',         admin.suspendSupplier);
router.patch('/suppliers/:id/reset-password',  admin.resetSupplierPassword);
router.delete('/suppliers/:id',               admin.deleteSupplier);

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
