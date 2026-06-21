const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const axios = require('axios');
const prisma = require('../lib/prisma');

// ─── Validation schemas ───────────────────────────────────────────────────────
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;

// GST State Code Map (for offline firm-name hint fallback)
const GST_STATE_CODES = {
  '01': 'Jammu & Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab',
  '04': 'Chandigarh', '05': 'Uttarakhand', '06': 'Haryana',
  '07': 'Delhi', '08': 'Rajasthan', '09': 'Uttar Pradesh',
  '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh',
  '13': 'Nagaland', '14': 'Manipur', '15': 'Mizoram',
  '16': 'Tripura', '17': 'Meghalaya', '18': 'Assam',
  '19': 'West Bengal', '20': 'Jharkhand', '21': 'Odisha',
  '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
  '25': 'Daman & Diu', '26': 'Dadra & Nagar Haveli', '27': 'Maharashtra',
  '28': 'Andhra Pradesh (old)', '29': 'Karnataka', '30': 'Goa',
  '31': 'Lakshadweep', '32': 'Kerala', '33': 'Tamil Nadu',
  '34': 'Puducherry', '35': 'Andaman & Nicobar Islands', '36': 'Telangana',
  '37': 'Andhra Pradesh', '38': 'Ladakh', '97': 'Other Territory',
  '99': 'Centre Jurisdiction'
};

const sellerRegisterSchema = z.object({
  gstNumber:      z.string().regex(GST_REGEX, 'Invalid GST number format'),
  firmName:       z.string().min(2, 'Firm name required'),
  proprietorName: z.string().min(2, 'Proprietor name required'),
  email:          z.string().email('Invalid email').min(1, 'Email required'),
  password:       z.string().min(6, 'Password must be at least 6 characters'),
  whatsappNumber: z.string().regex(PHONE_REGEX, 'Invalid WhatsApp number (10 digits, Indian mobile)'),
  state:          z.string().min(1, 'State required'),
  district:       z.string().min(1, 'District required'),
  city:           z.string().min(1, 'City required'),
  exactAddress:   z.string().min(5, 'Address required'),
  firmImageUrl:   z.string().optional(),
});

const buyerRegisterSchema = z.object({
  fullName:       z.string().min(2, 'Full name required'),
  email:          z.string().email('Invalid email').optional().or(z.literal('')),
  password:       z.string().min(6, 'Password must be at least 6 characters'),
  whatsappNumber: z.string().regex(PHONE_REGEX, 'Invalid WhatsApp number (10 digits, Indian mobile)'),
});

// ─── Helper: sign token ───────────────────────────────────────────────────────
function signToken(payload, expiresIn) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

// ─── GST Lookup: Fetch Firm Name ──────────────────────────────────────────────
exports.gstLookup = async (req, res) => {
  try {
    const { gstNumber } = req.params;
    const gst = gstNumber.toUpperCase().trim();

    if (!GST_REGEX.test(gst)) {
      return res.status(400).json({ valid: false, error: 'Invalid GST number format' });
    }

    // Check if already registered on our platform
    const existing = await prisma.seller.findUnique({ where: { gstNumber: gst } });
    if (existing) {
      return res.status(409).json({
        valid: true,
        available: false,
        error: 'This GST number is already registered on YarnBazaar.'
      });
    }

    const stateCode = gst.substring(0, 2);
    const stateName = GST_STATE_CODES[stateCode] || 'Unknown State';

    // ── Try external GST API (gstincheck.co.in) if API key is configured ──────
    const apiKey = process.env.GSTIN_API_KEY;
    if (apiKey && apiKey.trim() !== '') {
      try {
        const apiRes = await axios.get(
          `https://sheet.gstincheck.co.in/check/${apiKey}/${gst}`,
          { timeout: 5000 }
        );
        const d = apiRes.data;
        if (d && d.data && d.flag === true) {
          const addr = d.data.pradr?.addr || {};
          return res.json({
            valid: true,
            available: true,
            firmName:      d.data.lgnm || d.data.tradeNam || '',
            tradeName:     d.data.tradeNam || '',
            proprietorName: d.data.pradr?.nm || '',
            state:         addr.stcd || stateName,
            district:      addr.dst || '',
            city:          addr.loc || addr.dst || '',
            exactAddress:  `${addr.bno || ''} ${addr.st || ''} ${addr.loc || ''} - ${addr.pncd || ''}`.trim(),
            gstinStatus:   d.data.sts || 'Active',
            stateCode,
          });
        }
      } catch (apiErr) {
        console.warn('GST API call failed, falling back to offline decode:', apiErr.message);
      }
    }

    // No API key configured — return valid format but no auto-fill
    return res.json({
      valid: true,
      available: true,
      firmName: '',
      proprietorName: '',
      state: stateName,
      district: '',
      city: '',
      exactAddress: '',
      stateCode,
      note: 'GST format is valid. Please fill in your firm details manually.'
    });

  } catch (err) {
    console.error('GST lookup error:', err);
    res.status(500).json({ error: 'GST lookup failed.' });
  }
};

// ─── SELLER: Register ─────────────────────────────────────────────────────────
exports.sellerRegister = async (req, res) => {
  try {
    const data = sellerRegisterSchema.parse(req.body);

    // Check blocked number
    const blocked = await prisma.blockedNumber.findUnique({
      where: { whatsappNumber: data.whatsappNumber }
    });
    if (blocked) {
      return res.status(403).json({ error: 'This number is not allowed to register on YarnBazaar.' });
    }

    // Check duplicates
    const existingGST = await prisma.seller.findUnique({ where: { gstNumber: data.gstNumber } });
    if (existingGST) return res.status(409).json({ error: 'This GST number is already registered on YarnBazaar.' });

    if (data.email && data.email.trim() !== '') {
      const existingEmail = await prisma.seller.findUnique({ where: { email: data.email.toLowerCase().trim() } });
      if (existingEmail) return res.status(409).json({ error: 'This email is already registered.' });
    }

    const existingPhone = await prisma.seller.findUnique({ where: { whatsappNumber: data.whatsappNumber } });
    if (existingPhone) return res.status(409).json({ error: 'This WhatsApp number is already registered.' });

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const seller = await prisma.seller.create({
      data: {
        gstNumber:      data.gstNumber,
        firmName:       data.firmName,
        proprietorName: data.proprietorName,
        email:          data.email.toLowerCase().trim(),
        password:       hashedPassword,
        whatsappNumber: data.whatsappNumber,
        state:          data.state,
        district:       data.district,
        city:           data.city,
        exactAddress:   data.exactAddress,
        firmImageUrl:   req.body.firmImageBase64 || null,
      }
    });

    res.status(201).json({
      message: 'Registration submitted successfully! Your account is under review. You will be notified once approved.',
      sellerId: seller.id
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error('Seller register error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

// ─── SELLER: Login ────────────────────────────────────────────────────────────
exports.sellerLogin = async (req, res) => {
  try {
    const { whatsappNumber, password } = req.body;
    if (!whatsappNumber || !password) {
      return res.status(400).json({ error: 'WhatsApp number and password are required.' });
    }

    const seller = await prisma.seller.findUnique({ where: { whatsappNumber } });
    if (!seller) return res.status(404).json({ error: 'No account found with this WhatsApp number.' });

    // Password check
    if (!seller.password) {
      return res.status(401).json({ error: 'This account was registered without a password. Please contact support.' });
    }
    const valid = await bcrypt.compare(password, seller.password);
    if (!valid) return res.status(401).json({ error: 'Incorrect password.' });

    if (seller.status === 'PENDING') {
      return res.status(403).json({ error: 'Your account is still under review. Please wait for admin approval.' });
    }
    if (seller.status === 'REJECTED') {
      return res.status(403).json({ error: `Your account was rejected. Reason: ${seller.rejectionReason || 'Contact support.'}` });
    }
    if (seller.status === 'SUSPENDED') {
      return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
    }

    const token = signToken(
      { id: seller.id, role: 'seller', email: seller.email },
      process.env.JWT_SELLER_EXPIRES || '1d'
    );

    res.json({ token, seller: { id: seller.id, firmName: seller.firmName, email: seller.email, status: seller.status } });
  } catch (err) {
    console.error('Seller login error:', err);
    res.status(500).json({ error: 'Login failed.' });
  }
};

// ─── BUYER: Register ──────────────────────────────────────────────────────────
exports.buyerRegister = async (req, res) => {
  try {
    const data = buyerRegisterSchema.parse(req.body);

    // Check blocked number
    if (data.whatsappNumber) {
      const blocked = await prisma.blockedNumber.findUnique({ where: { whatsappNumber: data.whatsappNumber } });
      if (blocked) return res.status(403).json({ error: 'This number is not allowed to register on YarnBazaar.' });
    }

    if (data.email && data.email.trim() !== '') {
      const existing = await prisma.buyer.findUnique({ where: { email: data.email.toLowerCase().trim() } });
      if (existing) return res.status(409).json({ error: 'This email is already registered.' });
    }

    const existingPhone = await prisma.buyer.findUnique({ where: { whatsappNumber: data.whatsappNumber } });
    if (existingPhone) return res.status(409).json({ error: 'This WhatsApp number is already registered.' });

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const buyer = await prisma.buyer.create({
      data: {
        fullName:       data.fullName,
        email:          (data.email && data.email.trim() !== '') ? data.email.toLowerCase().trim() : null,
        password:       hashedPassword,
        whatsappNumber: data.whatsappNumber,
      }
    });

    const token = signToken(
      { id: buyer.id, role: 'buyer', email: buyer.email },
      process.env.JWT_BUYER_EXPIRES || '30d'
    );

    res.status(201).json({ token, buyer: { id: buyer.id, fullName: buyer.fullName, email: buyer.email } });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors[0].message });
    console.error('Buyer register error:', err);
    res.status(500).json({ error: 'Registration failed.' });
  }
};

// ─── BUYER: Login ─────────────────────────────────────────────────────────────
exports.buyerLogin = async (req, res) => {
  try {
    const { whatsappNumber, password } = req.body;
    if (!whatsappNumber || !password) return res.status(400).json({ error: 'WhatsApp number and password are required.' });

    const buyer = await prisma.buyer.findUnique({ where: { whatsappNumber } });
    if (!buyer) return res.status(404).json({ error: 'No account found with this WhatsApp number.' });

    if (!buyer.password) {
      return res.status(401).json({ error: 'This account was registered without a password. Please contact support.' });
    }
    const valid = await bcrypt.compare(password, buyer.password);
    if (!valid) return res.status(401).json({ error: 'Incorrect password.' });

    if (buyer.isBlocked) {
      return res.status(403).json({ error: 'This account has been blocked. Contact support.' });
    }

    const token = signToken(
      { id: buyer.id, role: 'buyer', email: buyer.email },
      process.env.JWT_BUYER_EXPIRES || '30d'
    );

    res.json({ token, buyer: { id: buyer.id, fullName: buyer.fullName, email: buyer.email } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.' });
  }
};

// ─── ADMIN: Login ─────────────────────────────────────────────────────────────
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials.' });

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials.' });

    const token = signToken(
      { id: admin.id, role: 'admin', email: admin.email },
      process.env.JWT_ADMIN_EXPIRES || '7d'
    );

    res.json({ token, admin: { id: admin.id, name: admin.name, email: admin.email } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.' });
  }
};

// ─── Forgot Password ──────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { whatsappNumber, role } = req.body;
    if (!whatsappNumber || !role) return res.status(400).json({ error: 'WhatsApp Number and role are required.' });

    let user;
    if (role === 'seller') user = await prisma.seller.findUnique({ where: { whatsappNumber: whatsappNumber.trim() } });
    else if (role === 'buyer') user = await prisma.buyer.findUnique({ where: { whatsappNumber: whatsappNumber.trim() } });
    
    if (!user) {
      return res.status(404).json({ error: 'No account found with this WhatsApp number.' });
    }

    if (!user.email) {
      return res.status(400).json({ error: 'NO_EMAIL' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    if (role === 'seller') {
      await prisma.seller.update({ where: { id: user.id }, data: { resetToken, resetTokenExpiry } });
    } else {
      await prisma.buyer.update({ where: { id: user.id }, data: { resetToken, resetTokenExpiry } });
    }

    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const host = req.headers.host;
    const resetLink = `${protocol}://${host}/reset-password.html?token=${resetToken}&role=${role}`;
    
    const { sendPasswordResetEmail } = require('../services/emailService');
    await sendPasswordResetEmail(user.email, resetLink);

    res.json({ message: 'A password reset link has been sent to the email registered with this number.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: err.message || 'Failed to process request.' });
  }
};

// ─── Reset Password ───────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { token, role, newPassword } = req.body;
    if (!token || !role || !newPassword) return res.status(400).json({ error: 'Token, role, and new password required.' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    let user;
    if (role === 'seller') user = await prisma.seller.findFirst({ where: { resetToken: token, resetTokenExpiry: { gt: new Date() } } });
    else if (role === 'buyer') user = await prisma.buyer.findFirst({ where: { resetToken: token, resetTokenExpiry: { gt: new Date() } } });

    if (!user) return res.status(400).json({ error: 'Invalid or expired reset token.' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (role === 'seller') {
      await prisma.seller.update({ where: { id: user.id }, data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null } });
    } else {
      await prisma.buyer.update({ where: { id: user.id }, data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null } });
    }

    res.json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password.' });
  }
};

// ─── Change Password (Logged In) ──────────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Old and new passwords are required.' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters.' });

    let user;
    if (role === 'seller') user = await prisma.seller.findUnique({ where: { id: userId } });
    else if (role === 'buyer') user = await prisma.buyer.findUnique({ where: { id: userId } });
    
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) return res.status(401).json({ error: 'Incorrect old password.' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (role === 'seller') {
      await prisma.seller.update({ where: { id: userId }, data: { password: hashedPassword } });
    } else {
      await prisma.buyer.update({ where: { id: userId }, data: { password: hashedPassword } });
    }

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Failed to change password.' });
  }
};
