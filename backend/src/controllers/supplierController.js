const { z } = require('zod');
const prisma = require('../lib/prisma');

const listingSchema = z.object({
  count:        z.string().min(1, 'Count required'),
  type:         z.string().min(1, 'Type required'),
  category:     z.string().min(1, 'Category required'),
  name:         z.string().optional().default(''),
  yarnType:     z.string().optional().nullable(),
  rpm:          z.string().optional().nullable(),
  rate:         z.number().nonnegative('Rate must be non-negative').optional().default(0),
  rateInclGst:  z.number().nonnegative('Rate including GST must be non-negative').optional().nullable(),
  availability: z.enum(['AVAILABLE', 'BOOKING', 'NOT_AVAILABLE', 'NONE']),
  packaging:    z.string().optional().default(''),
  csp:          z.string().optional().default(''),
  cone:         z.string().optional().default(''),
  otherDetails: z.string().optional().default(''),
  isActive:     z.boolean().optional(),
  rateUnit:     z.string().optional(),
});

function sortListings(listings) {
  return listings.sort((a, b) => {
    const countA = a.count || '';
    const countB = b.count || '';
    return countA.localeCompare(countB, undefined, { numeric: true, sensitivity: 'base' });
  });
}

// ─── GET profile ─────────────────────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, gstNumber: true, firmName: true, proprietorName: true,
        email: true, whatsappNumber: true, state: true, district: true,
        city: true, exactAddress: true, status: true, firmImageUrl: true,
        rejectionReason: true, createdAt: true
      }
    });
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
    res.json(supplier);
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
        return res.status(403).json({ error: `Field '${field}' cannot be modified by suppliers.` });
      }
    }

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (req.body.firmImageBase64 !== undefined) {
      updates.firmImageUrl = (req.body.firmImageBase64 === null || req.body.firmImageBase64 === '') ? null : req.body.firmImageBase64;
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const supplier = await prisma.supplier.update({
      where: { id: req.user.id },
      data: updates,
      select: { id: true, proprietorName: true, email: true, state: true, district: true, city: true, exactAddress: true, firmImageUrl: true }
    });
    res.json({ message: 'Profile updated successfully', supplier });
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
        supplierId: req.user.id,
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
        supplierId: req.user.id,
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
        supplierId: req.user.id,
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
        supplierId: req.user.id,
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
      where: { supplierId: req.user.id },
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
    // Only approved suppliers can add listings
    const supplier = await prisma.supplier.findUnique({ where: { id: req.user.id } });
    if (supplier?.status !== 'APPROVED') {
      return res.status(403).json({ error: 'Only approved suppliers can add listings.' });
    }

    const items = Array.isArray(req.body) ? req.body : [req.body];
    if (items.length === 0) return res.status(400).json({ error: 'No listings provided.' });

    const validItems = items.map(item => {
      let parsedRate = 0;
      if (item.rate !== undefined && item.rate !== null && item.rate !== '') {
        parsedRate = parseFloat(item.rate);
      }
      let parsedRateIncl = null;
      if (item.rateInclGst !== undefined && item.rateInclGst !== null && item.rateInclGst !== '') {
        parsedRateIncl = parseFloat(item.rateInclGst);
      } else if (parsedRate > 0) {
        parsedRateIncl = parseFloat((parsedRate * 1.05).toFixed(2));
      }
      return listingSchema.parse({ 
        ...item, 
        name: item.name || '',
        rate: parsedRate,
        rateInclGst: parsedRateIncl,
        rateUnit: item.rateUnit || 'kg'
      });
    });

    // Get today's date string (YYYY-MM-DD)
    const todayDateStr = new Date().toISOString().split('T')[0];

    // Find current active listings for this supplier
    const activeListings = await prisma.listing.findMany({
      where: {
        supplierId: req.user.id,
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
      data: validItems.map(item => ({ ...item, supplierId: req.user.id }))
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
    if (!existing || existing.supplierId !== req.user.id) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const bodyCopy = { ...req.body };
    if (bodyCopy.rate !== undefined) {
      bodyCopy.rate = (bodyCopy.rate === null || bodyCopy.rate === '') ? 0 : parseFloat(bodyCopy.rate);
    }
    if (bodyCopy.rateInclGst !== undefined) {
      bodyCopy.rateInclGst = (bodyCopy.rateInclGst === null || bodyCopy.rateInclGst === '') ? null : parseFloat(bodyCopy.rateInclGst);
    }
    if (bodyCopy.name !== undefined) {
      bodyCopy.name = bodyCopy.name || '';
    }
    const data = listingSchema.partial().parse(bodyCopy);
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
    if (!existing || existing.supplierId !== req.user.id) {
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
        supplierId: req.user.id,
        reason
      }
    });

    // Check if buyer has 3+ reports from different suppliers — notify admin via socket
    const distinctSuppliers = await prisma.buyerReport.groupBy({
      by: ['supplierId'],
      where: { buyerWhatsapp, status: { not: 'RESOLVED' } }
    });

    const io = req.app.get('io');
    if (io) {
      io.to('admin-room').emit('new-report', {
        buyerWhatsapp,
        reportCount: distinctSuppliers.length,
        isAlert: distinctSuppliers.length >= 3,
        message: distinctSuppliers.length >= 3
          ? `⚠️ ALERT: Buyer ${buyerWhatsapp} has been reported by ${distinctSuppliers.length} different suppliers!`
          : `New buyer report: ${buyerWhatsapp}`
      });
    }

    res.status(201).json({ message: 'Report submitted. Admin has been notified.', report });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit report' });
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
    const supplier = await prisma.supplier.findUnique({ where: { id: req.user.id } });
    if (!supplier) return res.status(404).json({ error: 'Supplier not found.' });

    const isMatch = await bcrypt.compare(currentPassword, supplier.password);
    if (!isMatch) return res.status(403).json({ error: 'Incorrect password. Access denied.' });

    if (newWhatsappNumber === supplier.whatsappNumber) {
      return res.status(400).json({ error: 'New number is the same as your current number.' });
    }

    const existing = await prisma.supplier.findUnique({ where: { whatsappNumber: newWhatsappNumber } });
    if (existing) return res.status(409).json({ error: 'This WhatsApp number is already registered to another account.' });

    await prisma.supplier.update({ where: { id: req.user.id }, data: { whatsappNumber: newWhatsappNumber } });
    res.json({ message: 'WhatsApp number updated successfully.' });
  } catch (err) {
    console.error('Supplier changeWhatsApp error:', err);
    res.status(500).json({ error: 'Failed to update WhatsApp number.' });
  }
};

// ─── Delete Account (Soft Delete) ────────────────────────────────────────────
exports.deleteAccount = async (req, res) => {
  try {
    const { currentPassword } = req.body;
    if (!currentPassword) return res.status(400).json({ error: 'Current password is required to delete your account.' });

    const bcrypt = require('bcryptjs');
    const supplier = await prisma.supplier.findUnique({ where: { id: req.user.id } });
    if (!supplier) return res.status(404).json({ error: 'Supplier not found.' });

    const isMatch = await bcrypt.compare(currentPassword, supplier.password);
    if (!isMatch) return res.status(403).json({ error: 'Incorrect password. Access denied.' });

    // Soft delete: archive all active listings and anonymise supplier data
    await prisma.listing.updateMany({
      where: { supplierId: req.user.id, isActive: true },
      data: { isActive: false }
    });

    await prisma.supplier.update({
      where: { id: req.user.id },
      data: {
        status: 'SUSPENDED',
        email: null,
        whatsappNumber: `DELETED_${req.user.id}`,
        proprietorName: 'Deleted Account',
        exactAddress: null,
        firmImageUrl: null,
      }
    });

    res.json({ message: 'Your account has been deleted successfully.' });
  } catch (err) {
    console.error('Supplier deleteAccount error:', err);
    res.status(500).json({ error: 'Failed to delete account.' });
  }
};

// ─── GET Buyers List (Separated by role) ──────────────────────────────────────
exports.getBuyersList = async (req, res) => {
  try {
    const buyers = await prisma.buyer.findMany({
      where: { isBlocked: false },
      select: {
        id: true,
        fullName: true,
        whatsappNumber: true,
        email: true,
        isAgent: true,
        isTrader: true,
        isManufacturer: true,
        officeAddress: true,
        factoryAddress: true,
        gstNumber: true,
        linkedAgents: {
          select: { id: true, name: true, phoneNumber: true, email: true }
        }
      },
      orderBy: { fullName: 'asc' }
    });

    const manufacturers = buyers.filter(b => b.isManufacturer);
    const traders = buyers.filter(b => b.isTrader && !b.isManufacturer); 
    // Wait, the plan says 3 tabs. Should a user appear in multiple tabs? Yes, if they are both Trader and Manufacturer. Let's just group them based on their true flags.
    
    res.json({
      manufacturers: buyers.filter(b => b.isManufacturer),
      traders: buyers.filter(b => b.isTrader),
      agents: buyers.filter(b => b.isAgent)
    });
  } catch (err) {
    console.error('Get Buyers List error:', err);
    res.status(500).json({ error: 'Failed to fetch buyers list.' });
  }
};
