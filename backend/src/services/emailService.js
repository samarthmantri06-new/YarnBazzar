const nodemailer = require('nodemailer');

// Only create transporter if credentials are configured
const transporter = (process.env.EMAIL_USER && process.env.EMAIL_PASS)
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use a Gmail App Password, not your real password
      }
    })
  : null;

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
    console.error('[EMAIL] Failed to send approval email:', err.message);
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
    console.error('[EMAIL] Failed to send rejection email:', err.message);
  }
};
