const { z } = require('zod');
const prisma = require('../lib/prisma');

const listingSchema = z.object({
  count:        z.string().min(1, 'Count required'),
  type:         z.string().min(1, 'Type required'),
  category:     z.string().min(1, 'Category required'),
  name:         z.string().min(1, 'Name required'),
  rate:         z.number().positive('Rate must be positive'),
  availability: z.enum(['AVAILABLE', 'BOOKING', 'NOT_AVAILABLE']),
  packaging:    z.string().optional(),
  csp:          z.string().optional(),
  otherDetails: z.string().optional(),
  isActive:     z.boolean().optional(),
  rateUnit:     z.string().optional(),
});

const AVAILABILITY_ORDER = { AVAILABLE: 0, BOOKING: 1, NOT_AVAILABLE: 2 };
function sortListings(listings) {
  return listings.sort((a, b) => (AVAILABILITY_ORDER[a.availability] ?? 3) - (AVAILABILITY_ORDER[b.availability] ?? 3));
}

// ─── GET profile ─────────────────────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const seller = await prisma.seller.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, gstNumber: true, firmName: true, proprietorName: true,
        email: true, whatsappNumber: true, state: true, district: true,
        city: true, exactAddress: true, status: true,
        rejectionReason: true, createdAt: true
      }
    });
    if (!seller) return res.status(404).json({ error: 'Seller not found' });
    res.json(seller);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// ─── PATCH profile (allowed fields only) ────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const allowed = ['proprietorName', 'email', 'state', 'district', 'city', 'exactAddress'];
    // FIX: Block locked fields server-side
    const locked = ['gstNumber', 'whatsappNumber', 'firmName', 'status', 'documentUrl'];
    for (const field of locked) {
      if (req.body[field] !== undefined) {
        return res.status(403).json({ error: `Field '${field}' cannot be modified by sellers.` });
      }
    }

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const seller = await prisma.seller.update({
      where: { id: req.user.id },
      data: updates,
      select: { id: true, proprietorName: true, email: true, state: true, district: true, city: true, exactAddress: true }
    });
    res.json({ message: 'Profile updated successfully', seller });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// ─── GET listings ─────────────────────────────────────────────────────────────
exports.getListings = async (req, res) => {
  try {
    // Background cleanup: Delete listings older than 1 year
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    prisma.listing.deleteMany({
      where: { createdAt: { lt: oneYearAgo } }
    }).catch(console.error);

    // Only show active listings from the last 30 days in the active view
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const listings = await prisma.listing.findMany({
      where: { 
        sellerId: req.user.id,
        isActive: true,
        createdAt: { gte: thirtyDaysAgo }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(sortListings(listings));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
};

// ─── GET listing dates (last 30 days) ─────────────────────────────────────────
exports.getListingDates = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const listings = await prisma.listing.findMany({
      where: { 
        sellerId: req.user.id,
        createdAt: { gte: thirtyDaysAgo }
      },
      select: { createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    
    // Extract unique dates in YYYY-MM-DD format
    const dates = [...new Set(listings.map(l => l.createdAt.toISOString().split('T')[0]))];
    res.json(dates);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch listing dates' });
  }
};

// ─── GET listing history ──────────────────────────────────────────────────────
exports.getListingHistory = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const listings = await prisma.listing.findMany({
      where: {
        sellerId: req.user.id,
        createdAt: { gte: since }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

// ─── GET listings by date ─────────────────────────────────────────────────────
exports.getListingsByDate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Date is required' });

    const startDate = new Date(`${date}T00:00:00.000Z`);
    const endDate = new Date(`${date}T23:59:59.999Z`);

    const listings = await prisma.listing.findMany({
      where: {
        sellerId: req.user.id,
        createdAt: { gte: startDate, lte: endDate }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(sortListings(listings));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch listings by date' });
  }
};

// ─── GET last listing (for "copy yesterday's data") ──────────────────────────
exports.getLastListing = async (req, res) => {
  try {
    const listing = await prisma.listing.findFirst({
      where: { sellerId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(listing || null);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch last listing' });
  }
};

// ─── POST listing(s) ────────────────────────────────────────────────────────
exports.createListing = async (req, res) => {
  try {
    // Only approved sellers can add listings
    const seller = await prisma.seller.findUnique({ where: { id: req.user.id } });
    if (seller?.status !== 'APPROVED') {
      return res.status(403).json({ error: 'Only approved sellers can add listings.' });
    }

    const items = Array.isArray(req.body) ? req.body : [req.body];
    if (items.length === 0) return res.status(400).json({ error: 'No listings provided.' });

    const validItems = items.map(item => listingSchema.parse({ 
      ...item, 
      rate: parseFloat(item.rate),
      rateUnit: item.rateUnit || 'kg'
    }));

    // Get today's date string (YYYY-MM-DD)
    const todayDateStr = new Date().toISOString().split('T')[0];

    // Find current active listings for this seller
    const activeListings = await prisma.listing.findMany({
      where: {
        sellerId: req.user.id,
        isActive: true
      }
    });

    // Only archive listings created on previous days
    const previousDayListings = activeListings.filter(l => {
      const lDateStr = l.createdAt.toISOString().split('T')[0];
      return lDateStr !== todayDateStr;
    });

    if (previousDayListings.length > 0) {
      const idsToArchive = previousDayListings.map(l => l.id);
      await prisma.listing.updateMany({
        where: { id: { in: idsToArchive } },
        data: { isActive: false }
      });
    }

    // Auto-add custom dropdown values to global list
    for (const data of validItems) {
      const fields = [
        { fieldType: 'COUNT', value: data.count },
        { fieldType: 'TYPE', value: data.type },
        { fieldType: 'CATEGORY', value: data.category },
      ];
      for (const f of fields) {
        await prisma.dropdownOption.upsert({
          where: { fieldType_value: { fieldType: f.fieldType, value: f.value } },
          update: {},
          create: { fieldType: f.fieldType, value: f.value, addedBy: req.user.id }
        });
      }
    }

    // Create all new listings
    const createdListings = await prisma.listing.createMany({
      data: validItems.map(item => ({ ...item, sellerId: req.user.id }))
    });

    res.status(201).json({ message: 'Listings published successfully', count: createdListings.count });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors[0].message });
    res.status(500).json({ error: 'Failed to create listings' });
  }
};

// ─── PATCH listing ────────────────────────────────────────────────────────────
exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.listing.findUnique({ where: { id } });
    if (!existing || existing.sellerId !== req.user.id) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const data = listingSchema.partial().parse({ ...req.body, rate: req.body.rate ? parseFloat(req.body.rate) : undefined });
    const listing = await prisma.listing.update({ where: { id }, data });
    res.json(listing);
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors[0].message });
    res.status(500).json({ error: 'Failed to update listing' });
  }
};

// ─── DELETE listing ───────────────────────────────────────────────────────────
exports.deleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.listing.findUnique({ where: { id } });
    if (!existing || existing.sellerId !== req.user.id) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    await prisma.listing.delete({ where: { id } });
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete listing' });
  }
};

// ─── POST report buyer ────────────────────────────────────────────────────────
exports.reportBuyer = async (req, res) => {
  try {
    const { buyerWhatsapp, buyerEmail, reason } = req.body;
    if (!buyerWhatsapp) return res.status(400).json({ error: 'Buyer WhatsApp number required' });

    const report = await prisma.buyerReport.create({
      data: {
        buyerWhatsapp,
        buyerEmail: buyerEmail || null,
        sellerId: req.user.id,
        reason
      }
    });

    // Check if buyer has 3+ reports from different sellers — notify admin via socket
    const distinctSellers = await prisma.buyerReport.groupBy({
      by: ['sellerId'],
      where: { buyerWhatsapp, status: { not: 'RESOLVED' } }
    });

    const io = req.app.get('io');
    if (io) {
      io.to('admin-room').emit('new-report', {
        buyerWhatsapp,
        reportCount: distinctSellers.length,
        isAlert: distinctSellers.length >= 3,
        message: distinctSellers.length >= 3
          ? `⚠️ ALERT: Buyer ${buyerWhatsapp} has been reported by ${distinctSellers.length} different sellers!`
          : `New buyer report: ${buyerWhatsapp}`
      });
    }

    res.status(201).json({ message: 'Report submitted. Admin has been notified.', report });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit report' });
  }
};
