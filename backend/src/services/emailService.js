const nodemailer = require('nodemailer');

// Only create transporter if credentials are configured
const transporter = (process.env.EMAIL_USER && process.env.EMAIL_PASS)
  ? nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,      // STARTTLS - more compatible with cloud hosts
      requireTLS: true,
      family: 4,          // Force IPv4 (Fixes Render IPv6 ENETUNREACH error)
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Must be a Gmail App Password (16 chars, no spaces)
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    })
  : null;

if (!transporter) {
  console.warn('[EMAIL] EMAIL_USER or EMAIL_PASS not set. Email features disabled.');
} else {
  console.log(`[EMAIL] Email service configured for: ${process.env.EMAIL_USER}`);
}

exports.sendApprovalEmail = async (email, firmName) => {
  if (!email) return;
  if (!transporter) {
    console.log(`[EMAIL] No credentials configured. Skipping approval email to ${email}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"YarnBazaar" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your YarnBazaar seller account is approved! 🎉',
      text: `Dear ${firmName},\n\nGreat news! Your seller account on YarnBazaar has been approved.\n\nYou can now log in and start posting your yarn listings.\n\nWelcome to YarnBazaar!\n\nTeam YarnBazaar`
    });
    console.log(`[EMAIL] Approval email sent to ${email}`);
  } catch (err) {
    console.error('[EMAIL] Failed to send approval email:', err);
  }
};

exports.sendRejectionEmail = async (email, firmName, reason) => {
  if (!email) return;
  if (!transporter) {
    console.log(`[EMAIL] No credentials configured. Skipping rejection email to ${email}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"YarnBazaar" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Update on your YarnBazaar registration',
      text: `Dear ${firmName},\n\nWe regret to inform you that your seller account could not be approved at this time.\n\nReason: ${reason}\n\nIf you believe this is a mistake or have any questions, please contact support.\n\nTeam YarnBazaar`
    });
    console.log(`[EMAIL] Rejection email sent to ${email}`);
  } catch (err) {
    console.error('[EMAIL] Failed to send rejection email:', err);
  }
};

exports.sendPasswordResetEmail = async (email, resetLink) => {
  if (!email) return;
  if (!transporter) {
    const msg = `[EMAIL] No credentials. Reset link for ${email}: ${resetLink}`;
    console.log(msg);
    throw new Error('Email service is not configured on the server. Please contact support.');
  }
  try {
    await transporter.sendMail({
      from: `"YarnBazaar" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset your YarnBazaar password',
      text: `Hello,\n\nA password reset was requested for your YarnBazaar account.\n\nClick the link below to reset your password (valid for 1 hour):\n${resetLink}\n\nIf you did not request this, please ignore this email.\n\nTeam YarnBazaar`
    });
    console.log(`[EMAIL] Password reset email sent to ${email}`);
  } catch (err) {
    console.error('[EMAIL] Failed to send password reset email:', err);
    throw new Error('Failed to send email due to SMTP error. Check Render server logs.');
  }
};

