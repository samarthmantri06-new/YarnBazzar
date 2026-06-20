const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function saveBase64Image(base64Str) {
  if (!base64Str || !base64Str.startsWith('data:image/')) return null;

  const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) return null;

  const ext = matches[1].split('/')[1] || 'png';
  const buffer = Buffer.from(matches[2], 'base64');
  
  const filename = `${crypto.randomBytes(16).toString('hex')}.${ext}`;
  // Path to backend/uploads
  const uploadDir = path.join(__dirname, '../../uploads');

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, buffer);

  return `/uploads/${filename}`;
}

module.exports = { saveBase64Image };
