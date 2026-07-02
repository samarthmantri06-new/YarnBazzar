const prisma = require('../lib/prisma');
const { z } = require('zod');

const PHONE_REGEX = /^[6-9]\d{9}$/;

const buyerUpdateSchema = z.object({
  fullName:       z.string().min(2, 'Full name required').optional(),
  email:          z.string().email('Invalid email').optional().or(z.literal('')),
  whatsappNumber: z.string().regex(PHONE_REGEX, 'Invalid WhatsApp number').optional(),
});

function sortListings(listings) {
  return [...listings].sort((a, b) => {
    const countA = a.count || '';
    const countB = b.count || '';
    return countA.localeCompare(countB, undefined, { numeric: true, sensitivity: 'base' });
  });
}

exports.getProfile = async (req, res) => {
  try {
    const buyer = await prisma.buyer.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, fullName: true, email: true, whatsappNumber: true, createdAt: true,
        isAgent: true, isTrader: true, isManufacturer: true,
        gstNumber: true, officeAddress: true, factoryAddress: true,
        linkedAgents: true
      }
    });
    if (!buyer) return res.status(404).json({ error: 'Buyer not found' });
    res.json(buyer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const data = buyerUpdateSchema.parse(req.body);

    if (data.whatsappNumber) {
      const blocked = await prisma.blockedNumber.findUnique({ where: { whatsappNumber: data.whatsappNumber } });
      if (blocked) return res.status(403).json({ error: 'This number is not allowed.' });

      const existing = await prisma.buyer.findUnique({ where: { whatsappNumber: data.whatsappNumber } });
      if (existing && existing.id !== req.user.id) {
        return res.status(409).json({ error: 'This WhatsApp number is already registered.' });
      }
    }

    const buyer = await prisma.buyer.update({
      where: { id: req.user.id },
      data,
      select: { id: true, fullName: true, email: true, whatsappNumber: true }
    });
    res.json({ message: 'Profile updated', buyer });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors[0].message });
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

exports.getListings = async (req, res) => {
  try {
    const { count, type, category, city, date, yarnType, rpm, page = 1, limit = 30 } = req.query;
    const supplierFilter = { status: 'APPROVED' };
    // City is a case-insensitive substring search
    if (city) supplierFilter.city = { contains: city, mode: 'insensitive' };

    // Compute IST-aware start/end of the requested date
    // IST = UTC+5:30, so offset is 330 minutes
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    const todayIST = new Date(Date.now() + IST_OFFSET_MS);
    const todayDateStr = todayIST.toISOString().split('T')[0]; // YYYY-MM-DD in IST

    let queryDateStr = date || todayDateStr;

    // Build UTC range for that IST date (IST midnight = UTC 18:30 prev day)
    const startOfDayUTC = new Date(`${queryDateStr}T00:00:00+05:30`);
    const endOfDayUTC   = new Date(`${queryDateStr}T23:59:59.999+05:30`);

    const isToday = (queryDateStr === todayDateStr);

    const where = { 
      supplier: supplierFilter, 
      createdAt: { gte: startOfDayUTC, lte: endOfDayUTC } 
    };
    // For today show only active listings; for past dates include all (active + archived)
    if (isToday) where.isActive = true;

    if (count)    where.count    = count;
    if (type)     where.type     = type;
    if (category) where.category = category;
    if (yarnType) where.yarnType = yarnType;
    if (rpm && rpm.trim()) where.rpm = { contains: rpm.trim(), mode: 'insensitive' };

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 30;
    const skip = (pageNum - 1) * limitNum;

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          supplier: {
            select: { id: true, firmName: true, proprietorName: true, whatsappNumber: true, email: true, state: true, district: true, city: true, firmImageUrl: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.listing.count({ where })
    ]);

    res.json({
      listings: sortListings(listings),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
};

exports.searchFirms = async (req, res) => {
  try {
    const { q, city } = req.query;
    const where = { status: 'APPROVED' };

    if (q && q.trim().length > 0) {
      const keyword = q.trim();
      where.OR = [
        { firmName:       { contains: keyword, mode: 'insensitive' } },
        { gstNumber:      { contains: keyword, mode: 'insensitive' } },
        { proprietorName: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    if (city && city.trim().length > 0) {
      where.city = { contains: city.trim(), mode: 'insensitive' };
    }

    const firms = await prisma.supplier.findMany({
      where,
      select: { id: true, firmName: true, proprietorName: true, gstNumber: true, state: true, city: true, firmImageUrl: true },
      orderBy: { firmName: 'asc' }
    });
    res.json(firms);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
};

exports.getFirmDetail = async (req, res) => {
  try {
    const { id, date } = req.params.id ? req.params : req.query;
    const firmId = req.params.id;
    const requestedDate = req.query.date;

    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    const todayIST = new Date(Date.now() + IST_OFFSET_MS);
    const todayDateStr = todayIST.toISOString().split('T')[0];

    // Build listing filter: if date requested, fetch that date's listings (active + inactive)
    // Otherwise, fetch all active listings from last 30 days (today's view)
    let listingWhere;
    if (requestedDate) {
      const isToday = (requestedDate === todayDateStr);
      const startOfDay = new Date(`${requestedDate}T00:00:00+05:30`);
      const endOfDay   = new Date(`${requestedDate}T23:59:59.999+05:30`);
      listingWhere = { createdAt: { gte: startOfDay, lte: endOfDay } };
      if (isToday) listingWhere.isActive = true;
    } else {
      // Default: today's active listings
      const startOfToday = new Date(`${todayDateStr}T00:00:00+05:30`);
      const endOfToday   = new Date(`${todayDateStr}T23:59:59.999+05:30`);
      listingWhere = { isActive: true, createdAt: { gte: startOfToday, lte: endOfToday } };
    }

    const supplier = await prisma.supplier.findUnique({
      where: { id: firmId },
      select: {
        id: true, firmName: true, proprietorName: true, whatsappNumber: true, email: true,
        gstNumber: true,
        state: true, district: true, city: true, exactAddress: true,
        status: true, firmImageUrl: true,
        listings: {
          where: listingWhere,
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    if (!supplier || supplier.status === 'SUSPENDED') return res.status(404).json({ error: 'Firm not found' });
    supplier.listings = sortListings(supplier.listings);
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch firm' });
  }
};

exports.getFirmHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const listings = await prisma.listing.findMany({
      where: {
        supplierId: id,
        createdAt: { gte: thirtyDaysAgo }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch firm history' });
  }
};

// ─── Change WhatsApp Number ───────────────────────────────────────────────────
exports.changeWhatsApp = async (req, res) => {
  try {
    const { currentPassword, newWhatsappNumber, confirmWhatsappNumber } = req.body;
    const PHONE_REGEX = /^[6-9]\d{9}$/;

    if (!currentPassword) return res.status(400).json({ error: 'Current password is required.' });
    if (!newWhatsappNumber || !confirmWhatsappNumber) return res.status(400).json({ error: 'New number and confirmation are required.' });
    if (newWhatsappNumber !== confirmWhatsappNumber) return res.status(400).json({ error: 'Numbers do not match. Please re-enter carefully.' });
    if (!PHONE_REGEX.test(newWhatsappNumber)) return res.status(400).json({ error: 'Invalid WhatsApp number format.' });

    const bcrypt = require('bcryptjs');
    const buyer = await prisma.buyer.findUnique({ where: { id: req.user.id } });
    if (!buyer) return res.status(404).json({ error: 'Buyer not found.' });

    const isMatch = await bcrypt.compare(currentPassword, buyer.password);
    if (!isMatch) return res.status(403).json({ error: 'Incorrect password. Access denied.' });

    if (newWhatsappNumber === buyer.whatsappNumber) {
      return res.status(400).json({ error: 'New number is the same as your current number.' });
    }

    const blocked = await prisma.blockedNumber.findUnique({ where: { whatsappNumber: newWhatsappNumber } });
    if (blocked) return res.status(403).json({ error: 'This number is not allowed on the platform.' });

    const existing = await prisma.buyer.findUnique({ where: { whatsappNumber: newWhatsappNumber } });
    if (existing) return res.status(409).json({ error: 'This WhatsApp number is already registered to another account.' });

    await prisma.buyer.update({ where: { id: req.user.id }, data: { whatsappNumber: newWhatsappNumber } });
    res.json({ message: 'WhatsApp number updated successfully.' });
  } catch (err) {
    console.error('Buyer changeWhatsApp error:', err);
    res.status(500).json({ error: 'Failed to update WhatsApp number.' });
  }
};

// ─── Delete Account (Soft Delete) ────────────────────────────────────────────
exports.deleteAccount = async (req, res) => {
  try {
    const { currentPassword } = req.body;
    if (!currentPassword) return res.status(400).json({ error: 'Current password is required to delete your account.' });

    const bcrypt = require('bcryptjs');
    const buyer = await prisma.buyer.findUnique({ where: { id: req.user.id } });
    if (!buyer) return res.status(404).json({ error: 'Buyer not found.' });

    const isMatch = await bcrypt.compare(currentPassword, buyer.password);
    if (!isMatch) return res.status(403).json({ error: 'Incorrect password. Access denied.' });

    await prisma.buyer.update({
      where: { id: req.user.id },
      data: {
        fullName: 'Deleted Account',
        email: null,
        whatsappNumber: `DELETED_${req.user.id}`,
        isBlocked: true,
      }
    });

    res.json({ message: 'Your account has been deleted successfully.' });
  } catch (err) {
    console.error('Buyer deleteAccount error:', err);
    res.status(500).json({ error: 'Failed to delete account.' });
  }
};

// ─── Delete Agent Profile (removes isAgent flag only) ────────────────────────
exports.deleteAgentProfile = async (req, res) => {
  try {
    const buyer = await prisma.buyer.findUnique({ where: { id: req.user.id } });
    if (!buyer) return res.status(404).json({ error: 'Buyer not found.' });
    if (!buyer.isAgent) return res.status(400).json({ error: 'You do not have an Agent profile.' });

    // Must hold at least one other role — can't remove Agent if it's the only one
    if (!buyer.isTrader && !buyer.isManufacturer) {
      return res.status(400).json({ error: 'Cannot remove Agent role — it is your only profile. Delete account instead.' });
    }

    await prisma.buyer.update({
      where: { id: req.user.id },
      data: { isAgent: false }
    });

    res.json({ message: 'Agent profile removed successfully.' });
  } catch (err) {
    console.error('deleteAgentProfile error:', err);
    res.status(500).json({ error: 'Failed to remove Agent profile.' });
  }
};

