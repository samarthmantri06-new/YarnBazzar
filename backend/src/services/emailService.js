const axios = require('axios');
const nodemailer = require('nodemailer');
const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');

const fromEmail = () => process.env.EMAIL_FROM || process.env.EMAIL_USER;
const fromName = () => process.env.EMAIL_FROM_NAME || 'YarnBazaar';

// SMTP only works locally — Render free tier blocks outbound ports 25/465/587
const smtpTransporter =
  process.env.NODE_ENV !== 'production' &&
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASS
    ? nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        lookup: (hostname, _options, callback) => {
          dns.lookup(hostname, { family: 4 }, callback);
        },
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      })
    : null;

function getEmailProvider() {
  if (process.env.BREVO_API_KEY) return 'brevo';
  if (process.env.RESEND_API_KEY) return 'resend';
  if (smtpTransporter) return 'smtp';
  return null;
}

const provider = getEmailProvider();
if (provider === 'brevo') {
  console.log(`[EMAIL] Using Brevo HTTP API (sender: ${fromEmail()})`);
} else if (provider === 'resend') {
  console.log(`[EMAIL] Using Resend HTTP API (sender: ${fromEmail()})`);
} else if (provider === 'smtp') {
  console.log(`[EMAIL] Using Gmail SMTP for local dev (${process.env.EMAIL_USER})`);
} else {
  console.warn(
    '[EMAIL] No email provider configured. Set BREVO_API_KEY on Render (SMTP is blocked on free tier).'
  );
}

async function sendViaBrevo({ to, subject, text }) {
  const sender = fromEmail();
  if (!sender) {
    throw new Error('EMAIL_USER or EMAIL_FROM must be set to your verified Brevo sender address.');
  }

  await axios.post(
    'https://api.brevo.com/v3/smtp/email',
    {
      sender: { name: fromName(), email: sender },
      to: [{ email: to }],
      subject,
      textContent: text,
    },
    {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    }
  );
}

async function sendViaResend({ to, subject, text }) {
  const sender = fromEmail();
  if (!sender) {
    throw new Error('EMAIL_USER or EMAIL_FROM must be set to your verified sender address.');
  }

  await axios.post(
    'https://api.resend.com/emails',
    {
      from: `${fromName()} <${sender}>`,
      to: [to],
      subject,
      text,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    }
  );
}

async function sendViaSmtp({ to, subject, text }) {
  await smtpTransporter.sendMail({
    from: `"${fromName()}" <${fromEmail()}>`,
    to,
    subject,
    text,
  });
}

async function sendEmail({ to, subject, text }) {
  const activeProvider = getEmailProvider();
  if (!activeProvider) {
    throw new Error(
      'Email service is not configured. Add BREVO_API_KEY to Render environment variables.'
    );
  }

  try {
    if (activeProvider === 'brevo') await sendViaBrevo({ to, subject, text });
    else if (activeProvider === 'resend') await sendViaResend({ to, subject, text });
    else await sendViaSmtp({ to, subject, text });

    console.log(`[EMAIL] Sent "${subject}" to ${to} via ${activeProvider}`);
  } catch (err) {
    const detail =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      'Unknown email error';
    console.error(`[EMAIL] ${activeProvider} send failed:`, detail);
    throw new Error(`Failed to send email: ${detail}`);
  }
}

exports.sendApprovalEmail = async (email, firmName) => {
  if (!email) return;
  try {
    await sendEmail({
      to: email,
      subject: 'Your YarnBazaar seller account is approved!',
      text: `Dear ${firmName},\n\nGreat news! Your seller account on YarnBazaar has been approved.\n\nYou can now log in and start posting your yarn listings.\n\nWelcome to YarnBazaar!\n\nTeam YarnBazaar`,
    });
  } catch (err) {
    console.error('[EMAIL] Failed to send approval email:', err.message);
  }
};

exports.sendRejectionEmail = async (email, firmName, reason) => {
  if (!email) return;
  try {
    await sendEmail({
      to: email,
      subject: 'Update on your YarnBazaar registration',
      text: `Dear ${firmName},\n\nWe regret to inform you that your seller account could not be approved at this time.\n\nReason: ${reason}\n\nIf you believe this is a mistake or have any questions, please contact support.\n\nTeam YarnBazaar`,
    });
  } catch (err) {
    console.error('[EMAIL] Failed to send rejection email:', err.message);
  }
};

exports.sendPasswordResetEmail = async (email, resetLink) => {
  if (!email) return;

  if (!getEmailProvider()) {
    console.log(`[EMAIL] No provider configured. Reset link for ${email}: ${resetLink}`);
    throw new Error('Email service is not configured on the server. Please contact support.');
  }

  await sendEmail({
    to: email,
    subject: 'Reset your YarnBazaar password',
    text: `Hello,\n\nA password reset was requested for your YarnBazaar account.\n\nClick the link below to reset your password (valid for 1 hour):\n${resetLink}\n\nIf you did not request this, please ignore this email.\n\nTeam YarnBazaar`,
  });
};
