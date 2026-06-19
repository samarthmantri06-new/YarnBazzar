const prisma = require('../lib/prisma');
const { sendApprovalEmail, sendRejectionEmail } = require('../services/emailService');

exports.getDashboard = async (req, res) => {
  try {
    const [sellerStats, totalBuyers, totalListings, reportStats] = await Promise.all([
      prisma.seller.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.buyer.count(),
      prisma.listing.count({ where: { isActive: true } }),
      prisma.buyerReport.groupBy({ by: ['status'], _count: { id: true } }),
    ]);

    const sellers = { PENDING: 0, APPROVED: 0, REJECTED: 0, SUSPENDED: 0 };
    sellerStats.forEach(s => { sellers[s.status] = s._count.id; });

    const reports = { OPEN: 0, WARNED: 0, RESOLVED: 0 };
    reportStats.forEach(r => { reports[r.status] = r._count.id; });

    // Check for buyers with 3+ reports from different sellers
    const alertBuyers = await prisma.buyerReport.groupBy({
      by: ['buyerWhatsapp'],
      where: { status: { not: 'RESOLVED' } },
      _count: { sellerId: true },
      having: { sellerId: { _count: { gte: 3 } } }
    });

    res.json({ sellers, totalBuyers, totalListings, reports, alertCount: alertBuyers.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
};

exports.getPendingSellers = async (req, res) => {
  try {
    const sellers = await prisma.seller.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' }
    });
    res.json(sellers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending sellers' });
  }
};

exports.approveSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const { firmName } = req.body;
    const updateData = { status: 'APPROVED' };
    if (firmName) updateData.firmName = firmName;

    const seller = await prisma.seller.update({ where: { id }, data: updateData });
    await sendApprovalEmail(seller.email, seller.firmName);

    const io = req.app.get('io');
    if (io) io.to('admin-room').emit('seller-approved', { sellerId: id, firmName: seller.firmName });

    res.json({ message: 'Seller approved', seller });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve seller' });
  }
};

exports.rejectSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: 'Rejection reason required' });

    const seller = await prisma.seller.update({
      where: { id },
      data: { status: 'REJECTED', rejectionReason: reason, rejectionCount: { increment: 1 } }
    });
    await sendRejectionEmail(seller.email, seller.firmName, reason);
    res.json({ message: 'Seller rejected', seller });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject seller' });
  }
};

exports.editFirmName = async (req, res) => {
  try {
    const { id } = req.params;
    const { firmName } = req.body;
    if (!firmName) return res.status(400).json({ error: 'Firm name required' });
    const seller = await prisma.seller.update({ where: { id }, data: { firmName } });
    res.json({ message: 'Firm name updated', seller });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update firm name' });
  }
};

exports.getAllSellers = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = status ? { status } : {};
    const sellers = await prisma.seller.findMany({
      where,
      include: { _count: { select: { listings: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    });
    const total = await prisma.seller.count({ where });
    res.json({ sellers, total, page: parseInt(page) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sellers' });
  }
};

exports.suspendSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const seller = await prisma.seller.update({ where: { id }, data: { status: 'SUSPENDED' } });
    res.json({ message: 'Seller suspended', seller });
  } catch (err) {
    res.status(500).json({ error: 'Failed to suspend seller' });
  }
};

exports.deleteSeller = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.seller.delete({ where: { id } });
    res.json({ message: 'Seller deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete seller' });
  }
};

exports.getAllBuyers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [buyers, total] = await Promise.all([
      prisma.buyer.findMany({ orderBy: { createdAt: 'desc' }, skip, take: parseInt(limit) }),
      prisma.buyer.count()
    ]);

    const reportCounts = await prisma.buyerReport.groupBy({
      by: ['buyerWhatsapp'], _count: { id: true }
    });
    const countMap = {};
    reportCounts.forEach(r => { countMap[r.buyerWhatsapp] = r._count.id; });
    const result = buyers.map(b => ({ ...b, reportCount: countMap[b.whatsappNumber] || 0 }));
    res.json({ buyers: result, total, page: parseInt(page) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch buyers' });
  }
};

exports.blockBuyer = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const buyer = await prisma.buyer.findUnique({ where: { id } });
    if (!buyer) return res.status(404).json({ error: 'Buyer not found' });

    if (buyer.whatsappNumber) {
      await prisma.blockedNumber.upsert({
        where: { whatsappNumber: buyer.whatsappNumber },
        update: { reason },
        create: { whatsappNumber: buyer.whatsappNumber, reason }
      });
    }

    await prisma.buyer.update({
      where: { id },
      data: { isBlocked: true, blockedAt: new Date(), blockReason: reason || '' }
    });

    res.json({ message: 'Buyer blocked successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to block buyer' });
  }
};

exports.unblockBuyer = async (req, res) => {
  try {
    const { id } = req.params;
    const buyer = await prisma.buyer.findUnique({ where: { id } });
    if (!buyer) return res.status(404).json({ error: 'Buyer not found' });

    if (buyer.whatsappNumber) {
      await prisma.blockedNumber.deleteMany({ where: { whatsappNumber: buyer.whatsappNumber } });
    }

    await prisma.buyer.update({
      where: { id },
      data: { isBlocked: false, blockedAt: null, blockReason: null }
    });

    res.json({ message: 'Buyer unblocked successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unblock buyer' });
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await prisma.buyerReport.findMany({
      include: { reportedBySeller: { select: { firmName: true, whatsappNumber: true } } },
      orderBy: { createdAt: 'desc' }
    });

    const grouped = await prisma.buyerReport.groupBy({
      by: ['buyerWhatsapp'],
      where: { status: { not: 'RESOLVED' } },
      _count: { sellerId: true },
      having: { sellerId: { _count: { gte: 3 } } }
    });
    const alertNumbers = new Set(grouped.map(g => g.buyerWhatsapp));

    res.json({ reports, alertNumbers: [...alertNumbers] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

exports.warnReport = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await prisma.buyerReport.update({ where: { id }, data: { status: 'WARNED' } });
    res.json({ message: 'Report marked as warned', report });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update report' });
  }
};

exports.resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await prisma.buyerReport.update({ where: { id }, data: { status: 'RESOLVED' } });
    res.json({ message: 'Report resolved', report });
  } catch (err) {
    res.status(500).json({ error: 'Failed to resolve report' });
  }
};

exports.getDropdowns = async (req, res) => {
  try {
    const options = await prisma.dropdownOption.findMany({ orderBy: [{ fieldType: 'asc' }, { value: 'asc' }] });
    res.json(options);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dropdowns' });
  }
};

exports.deleteDropdown = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.dropdownOption.delete({ where: { id } });
    res.json({ message: 'Dropdown option removed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete option' });
  }
};

exports.addDropdown = async (req, res) => {
  try {
    const { fieldType, value } = req.body;
    if (!['COUNT', 'TYPE', 'CATEGORY'].includes(fieldType)) {
      return res.status(400).json({ error: 'Invalid field type.' });
    }
    if (!value || value.trim() === '') {
      return res.status(400).json({ error: 'Value is required.' });
    }
    const option = await prisma.dropdownOption.create({
      data: { fieldType, value: value.trim() }
    });
    res.status(201).json(option);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'This option already exists.' });
    }
    res.status(500).json({ error: 'Failed to add option.' });
  }
};

exports.resetSellerPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }
    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.seller.update({ where: { id }, data: { password: hashed } });
    res.json({ message: 'Password reset successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset password.' });
  }
};

exports.resetBuyerPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }
    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.buyer.update({ where: { id }, data: { password: hashed } });
    res.json({ message: 'Password reset successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset password.' });
  }
};

// ─── Admin: Update Own Profile ────────────────────────────────────────────────
exports.updateAdminProfile = async (req, res) => {
  try {
    const { specialKey, name, newPassword } = req.body;

    // Validate special key
    if (!specialKey || specialKey !== process.env.ADMIN_SPECIAL_KEY) {
      return res.status(403).json({ error: 'Invalid special key. Access denied.' });
    }

    const adminId = req.user.id;
    const updateData = {};
    if (name && name.trim()) updateData.name = name.trim();
    if (newPassword) {
      if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
      const bcrypt = require('bcryptjs');
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Provide a name or new password to update.' });
    }

    const admin = await prisma.admin.update({ where: { id: adminId }, data: updateData });
    res.json({ message: 'Profile updated successfully.', name: admin.name });
  } catch (err) {
    console.error('Admin profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
};

