const nodemailer = require('nodemailer');
require('dotenv').config();

// Check if SMTP is configured
const isSMTPConfigured = () => {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
};

let transporter = null;

// Create transport only if SMTP is configured
if (isSMTPConfigured()) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  console.log('✅ Email service configured');
} else {
  console.log('⚠️  Email service not configured - emails will not be sent');
}

const sendMail = async (opts) => {
  // If SMTP not configured, log and skip
  if (!isSMTPConfigured() || !transporter) {
    console.log('📧 Email skipped (SMTP not configured):', opts.subject);
    return { skipped: true, reason: 'SMTP not configured' };
  }

  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'no-reply@example.com',
      to: opts.to,
      subject: opts.subject,
      html: opts.html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', opts.subject);
    return result;
  } catch (error) {
    console.error('❌ Email failed:', error.message);
    return { error: error.message };
  }
};

module.exports = { sendMail, isSMTPConfigured };
