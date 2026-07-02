const jwt = require('jsonwebtoken');

// ─── Helper: get midnight IST for a given date ────────────────────────────────
function getMidnightIST(date) {
  // IST = UTC + 5:30
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(date.getTime() + istOffset);
  // Set to midnight
  istDate.setUTCHours(0, 0, 0, 0);
  // Convert back to UTC
  return new Date(istDate.getTime() - istOffset + 24 * 60 * 60 * 1000);
}

// ─── Generic JWT verifier ─────────────────────────────────────────────────────
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // ─── FIX: Midnight IST expiry for suppliers ─────────────────────────────
    if (decoded.role === 'supplier') {
      const issuedAt = new Date(decoded.iat * 1000);
      const midnightIST = getMidnightIST(issuedAt);
      if (new Date() > midnightIST) {
        return res.status(401).json({
          error: 'Session expired. Please log in again to continue.',
          code: 'MIDNIGHT_EXPIRY'
        });
      }
    }

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid token. Please log in again.' });
  }
}

// ─── Role Guards ──────────────────────────────────────────────────────────────
function requireSupplier(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.role !== 'supplier') {
      return res.status(403).json({ error: 'Access denied. Supplier role required.' });
    }
    next();
  });
}

function requireBuyer(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.role !== 'buyer') {
      return res.status(403).json({ error: 'Access denied. Buyer role required.' });
    }
    next();
  });
}

function requireAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    next();
  });
}

function requireSupplierOrAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (!['supplier', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    next();
  });
}

module.exports = { verifyToken, requireSupplier, requireBuyer, requireAdmin, requireSupplierOrAdmin };
