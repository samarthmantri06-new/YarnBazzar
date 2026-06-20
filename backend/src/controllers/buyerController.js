const prisma = require('../lib/prisma');
const { z } = require('zod');

const PHONE_REGEX = /^[6-9]\d{9}$/;

const buyerUpdateSchema = z.object({
  fullName:       z.string().min(2, 'Full name required').optional(),
  email:          z.string().email('Invalid email').optional().or(z.literal('')),
  whatsappNumber: z.string().regex(PHONE_REGEX, 'Invalid WhatsApp number').optional(),
});

const AVAILABILITY_ORDER = { AVAILABLE: 0, BOOKING: 1, NOT_AVAILABLE: 2 };
function sortListings(listings) {
  return [...listings].sort((a, b) => (AVAILABILITY_ORDER[a.availability] ?? 3) - (AVAILABILITY_ORDER[b.availability] ?? 3));
}

exports.getProfile = async (req, res) => {
  try {
    const buyer = await prisma.buyer.findUnique({
      where: { id: req.user.id },
      select: { id: true, fullName: true, email: true, whatsappNumber: true, createdAt: true }
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
    const { count, type, category, city, page = 1, limit = 30 } = req.query;
    const sellerFilter = { status: 'APPROVED' };
    // City is a case-insensitive substring search
    if (city) sellerFilter.city = { contains: city, mode: 'insensitive' };

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const where = { isActive: true, seller: sellerFilter, createdAt: { gte: thirtyDaysAgo } };
    if (count)    where.count    = count;
    if (type)     where.type     = type;
    if (category) where.category = category;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 30;
    const skip = (pageNum - 1) * limitNum;

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          seller: {
            select: { id: true, firmName: true, proprietorName: true, whatsappNumber: true, state: true, district: true, city: true }
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

    const firms = await prisma.seller.findMany({
      where,
      select: { id: true, firmName: true, proprietorName: true, gstNumber: true, state: true, city: true },
      orderBy: { firmName: 'asc' }
    });
    res.json(firms);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
};

exports.getFirmDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const seller = await prisma.seller.findUnique({
      where: { id },
      select: {
        id: true, firmName: true, proprietorName: true, whatsappNumber: true,
        state: true, district: true, city: true, exactAddress: true,
        status: true,
        listings: { 
          where: { isActive: true, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }, 
          orderBy: { createdAt: 'desc' } 
        }
      }
    });
    if (!seller || seller.status === 'SUSPENDED') return res.status(404).json({ error: 'Firm not found' });
    seller.listings = sortListings(seller.listings);
    res.json(seller);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch firm' });
  }
};
