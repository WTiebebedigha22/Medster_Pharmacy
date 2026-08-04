/* global process */
import { supabase } from '../db/supabase.js';
import mailService from './mailService.js';

const NIGERIAN_NAIRA = '₦';

/**
 * Insert a notification into the DB and optionally send an email.
 * @param {Object} params
 * @param {string} params.userId - the recipient user id
 * @param {string} params.type - one of the notification types in the CHECK constraint
 * @param {string} params.title
 * @param {string} params.message
 * @param {Object} [params.data] - extra metadata (orderId, orderNumber, etc.)
 * @param {string} [params.channel] - 'in_app' | 'email' | 'both' (default 'in_app')
 * @param {Object} [params.email] - { to, subject, body, ctaText, ctaUrl } if email should be sent
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  data = {},
  channel = 'in_app',
  email = null,
}) {
  const newNotification = {
    user_id: userId,
    type: type || 'general',
    title,
    message,
    data,
    channel,
    is_read: false,
    email_sent: false,
  };

  // Insert into DB
  const { data: notification, error } = await supabase
    .from('notifications')
    .insert(newNotification)
    .select()
    .single();

  if (error) {
    console.error('[NOTIFICATION] Failed to create notification:', error.message);
    return null;
  }

  // Send email if requested
  if (channel === 'both' && email) {
    const { sent } = await mailService.sendTemplatedEmail({
      to: email.to,
      subject: email.subject || title,
      title: email.title || title,
      body: email.body || message,
      ctaText: email.ctaText,
      ctaUrl: email.ctaUrl,
      text: email.text || message,
    });

    if (sent) {
      await supabase
        .from('notifications')
        .update({ email_sent: true })
        .eq('id', notification.id);
    }
  }

  return notification;
}

/**
 * Helper to fetch a user's email/name for email notifications.
 */
async function getUserEmail(userId) {
  const { data } = await supabase
    .from('users')
    .select('email, full_name')
    .eq('id', userId)
    .single();
  return data || null;
}

function formatMoney(amount) {
  const num = parseFloat(amount || 0);
  return `${NIGERIAN_NAIRA}${num.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

/**
 * Send an order confirmation notification (in-app + email).
 */
export async function notifyOrderConfirmation({ userId, orderId, orderNumber, total, items }) {
  const user = await getUserEmail(userId);
  const title = 'Order Confirmed 🎉';
  const message = `Your order ${orderNumber} has been placed successfully. Total: ${formatMoney(total)}. We're processing it now.`;

  const itemsHtml = (items || []).slice(0, 10).map((it) =>
    `<li>${it.product_name || it.name || 'Item'} × ${it.quantity || 1} — ${formatMoney(it.price || 0)}</li>`
  ).join('');

  return createNotification({
    userId,
    type: 'order_confirmation',
    title,
    message,
    data: { orderId, orderNumber, total },
    channel: 'both',
    email: user
      ? {
          to: user.email,
          subject: `Order Confirmed: ${orderNumber}`,
          title: 'Your order has been confirmed!',
          body: `Hi ${user.full_name || 'there'},<br/><br/>Your order <strong>${orderNumber}</strong> has been placed successfully.<br/><br/>Total: <strong>${formatMoney(total)}</strong><br/><br/>Items ordered:<ul>${itemsHtml}</ul><p>We will notify you once your order is on its way.</p>`,
          ctaText: 'View My Order',
          ctaUrl: `${process.env.APP_URL || 'http://localhost:5173'}/orders`,
        }
      : null,
  });
}

/**
 * Send a delivery notice notification (in-app + email).
 */
export async function notifyDeliveryNotice({ userId, orderId, orderNumber, status, trackingNumber }) {
  const user = await getUserEmail(userId);
  const title = status === 'delivered' ? 'Order Delivered ✅' : 'Order Shipped 🚚';
  const message = status === 'delivered'
    ? `Your order ${orderNumber} has been delivered. Enjoy your purchase!`
    : `Your order ${orderNumber} is on the way${trackingNumber ? ` (Tracking: ${trackingNumber})` : ''}.`;

  return createNotification({
    userId,
    type: 'delivery_notice',
    title,
    message,
    data: { orderId, orderNumber, status, trackingNumber },
    channel: 'both',
    email: user
      ? {
          to: user.email,
          subject: status === 'delivered' ? `Order Delivered: ${orderNumber}` : `Order Shipped: ${orderNumber}`,
          title,
          body: `Hi ${user.full_name || 'there'},<br/><br/>${message}<br/><br/>Order Number: <strong>${orderNumber}</strong>${trackingNumber ? `<br/>Tracking Number: <strong>${trackingNumber}</strong>` : ''}`,
          ctaText: 'Track My Order',
          ctaUrl: `${process.env.APP_URL || 'http://localhost:5173'}/orders`,
        }
      : null,
  });
}

/**
 * Send an order cancellation notification (in-app + email).
 */
export async function notifyOrderCancellation({ userId, orderId, orderNumber, reason }) {
  const user = await getUserEmail(userId);
  const title = 'Order Cancelled ❌';
  const message = `Your order ${orderNumber} has been cancelled${reason ? ` (Reason: ${reason})` : ''}. If you have any questions, contact our support team.`;

  return createNotification({
    userId,
    type: 'order_cancellation',
    title,
    message,
    data: { orderId, orderNumber, reason },
    channel: 'both',
    email: user
      ? {
          to: user.email,
          subject: `Order Cancelled: ${orderNumber}`,
          title: 'Your order has been cancelled',
          body: `Hi ${user.full_name || 'there'},<br/><br/>Your order <strong>${orderNumber}</strong> has been cancelled${reason ? `<br/>Reason: <strong>${reason}</strong>` : ''}.<br/><br/>If you didn't cancel this order or have any questions, please contact our support team.`,
          ctaText: 'Contact Support',
          ctaUrl: `${process.env.APP_URL || 'http://localhost:5173'}/contact-us`,
        }
      : null,
  });
}

/**
 * Send a return warning notification (in-app + email).
 */
export async function notifyReturnWarning({ userId, orderId, orderNumber, returnDeadline }) {
  const user = await getUserEmail(userId);
  const title = 'Return Window Reminder ⏳';
  const message = `Your order ${orderNumber} was delivered. Remember you can return eligible items within ${returnDeadline || '7 days'}.`;

  return createNotification({
    userId,
    type: 'return_warning',
    title,
    message,
    data: { orderId, orderNumber, returnDeadline },
    channel: 'both',
    email: user
      ? {
          to: user.email,
          subject: `Return Reminder: ${orderNumber}`,
          title: 'Don\'t forget your return window',
          body: `Hi ${user.full_name || 'there'},<br/><br/>Your order <strong>${orderNumber}</strong> was delivered. Eligible items can be returned within <strong>${returnDeadline || '7 days'}</strong> of delivery.<br/><br/>If you have any issues with your order, please reach out.`,
          ctaText: 'View Returns Policy',
          ctaUrl: `${process.env.APP_URL || 'http://localhost:5173'}/terms`,
        }
      : null,
  });
}

/**
 * Send a promotional notification (in-app + email).
 */
export async function notifyPromotion({ userId, title, message, data = {}, sendEmail = true }) {
  const user = await getUserEmail(userId);
  return createNotification({
    userId,
    type: 'promotion',
    title,
    message,
    data,
    channel: sendEmail ? 'both' : 'in_app',
    email: user && sendEmail
      ? {
          to: user.email,
          subject: title,
          title,
          body: message,
          ctaText: 'Shop Now',
          ctaUrl: `${process.env.APP_URL || 'http://localhost:5173'}/shop`,
        }
      : null,
  });
}

export default {
  createNotification,
  notifyOrderConfirmation,
  notifyDeliveryNotice,
  notifyOrderCancellation,
  notifyReturnWarning,
  notifyPromotion,
};
