import nodemailer from 'nodemailer';
import config from '../config/index.js';

/**
 * Mail Service
 * Sends emails via SMTP (supports free providers like Gmail app passwords,
 * SendGrid, Mailgun, Amazon SES, etc.). When SMTP credentials are not
 * configured, emails are logged to the console instead of being sent.
 */
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const { mail } = config;
  if (!mail.enabled || !mail.host || !mail.user || !mail.pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: mail.host,
    port: mail.port,
    secure: mail.secure, // true for 465, false for 587/25
    auth: {
      user: mail.user,
      pass: mail.pass,
    },
  });

  return transporter;
}

/**
 * Build a simple HTML email wrapper with Medster branding.
 */
function buildHtmlEmail({ title, body, ctaText, ctaUrl }) {
  const cta = ctaText && ctaUrl
    ? `<div style="text-align:center;margin:24px 0;">
         <a href="${ctaUrl}" style="display:inline-block;background:#005abc;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">${ctaText}</a>
       </div>`
    : '';

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
      <div style="text-align:center;padding:16px 0;border-bottom:2px solid #005abc;">
        <img src="https://medsterpharmacy.com/logo.png" alt="Medster Pharmacy" style="height:48px;" />
        <h1 style="color:#005abc;margin:8px 0 0;font-size:20px;">Medster Pharmacy</h1>
      </div>
      <div style="padding:24px;background:#ffffff;border-radius:8px;margin-top:16px;">
        <h2 style="color:#0f172a;margin:0 0 16px;">${title}</h2>
        <div style="color:#334155;font-size:15px;line-height:1.6;">${body}</div>
        ${cta}
      </div>
      <div style="text-align:center;padding:16px;color:#64748b;font-size:12px;">
        <p>Medster Pharmacy — Your trusted online pharmacy</p>
        <p>123 Pharmacy Street, Lagos, Nigeria &bull; +234 800 MEDSTER</p>
        <p>You are receiving this email because you have an account with Medster Pharmacy.</p>
      </div>
    </div>
  `;
}

/**
 * Send an email. Returns { sent: boolean, info?: any }.
 * If SMTP is not configured, logs the email and returns sent: false.
 */
export async function sendEmail({ to, subject, html, text }) {
  const t = getTransporter();

  if (!t) {
    console.log(`[MAIL] Email would be sent (SMTP not configured)
  To: ${to}
  Subject: ${subject}
  ${text || ''}`);
    return { sent: false, reason: 'smtp_not_configured' };
  }

  try {
    const info = await t.sendMail({
      from: `${config.mail.fromName || 'Medster Pharmacy'} <${config.mail.from || 'no-reply@medsterpharmacy.com'}>`,
      to,
      subject,
      html,
      text: text || '',
    });
    console.log(`[MAIL] Email sent to ${to}: ${info.messageId}`);
    return { sent: true, info };
  } catch (error) {
    console.error(`[MAIL] Failed to send email to ${to}:`, error.message);
    return { sent: false, reason: error.message };
  }
}

/**
 * Send a branded email using a title + body builder.
 */
export async function sendTemplatedEmail({ to, subject, title, body, ctaText, ctaUrl, text }) {
  const html = buildHtmlEmail({ title, body, ctaText, ctaUrl });
  return sendEmail({ to, subject, html, text: text || `\n${title}\n\n${body.replace(/<[^>]+>/g, '')}` });
}

export default {
  sendEmail,
  sendTemplatedEmail,
};
