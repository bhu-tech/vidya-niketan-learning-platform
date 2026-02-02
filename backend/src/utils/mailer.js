const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transport using SMTP settings from env
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendMail = async (opts) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'no-reply@example.com',
    to: opts.to,
    subject: opts.subject,
    html: opts.html
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendMail };
