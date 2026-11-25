const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  }
  return transporter;
}

async function sendLoginOtpEmail({ to, name, otp }) {
  return getTransporter().sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: 'Your Bank Manager sign-in verification code',
    text: `Hello ${name},\n\nYour Bank Manager sign-in verification code is ${otp}. It expires in 5 minutes. If you did not try to sign in, you can ignore this email.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#172033"><h2>Sign-in verification</h2><p>Hello ${escapeHtml(name)},</p><p>Enter this code to finish signing in to Bank Manager:</p><p style="font-size:30px;font-weight:700;letter-spacing:8px;background:#f1f5f9;padding:16px;text-align:center">${otp}</p><p>This code expires in <strong>5 minutes</strong>. If you did not try to sign in, you can ignore this email.</p></div>`
  });
}

async function sendPasswordResetOtpEmail({ to, name, otp }) {
  return getTransporter().sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: 'Your Bank Manager password reset code',
    text: `Hello ${name},\n\nYour Bank Manager password reset code is ${otp}. It expires in 5 minutes. If you did not request a password reset, you can ignore this email.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#172033"><h2>Password reset</h2><p>Hello ${escapeHtml(name)},</p><p>Use this code to reset your Bank Manager password:</p><p style="font-size:30px;font-weight:700;letter-spacing:8px;background:#f1f5f9;padding:16px;text-align:center">${otp}</p><p>This code expires in <strong>5 minutes</strong>. If you did not request a password reset, you can ignore this email.</p></div>`
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

module.exports = { sendLoginOtpEmail, sendPasswordResetOtpEmail };
