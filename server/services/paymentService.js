import axios from 'axios';
import crypto from 'crypto';
import config from '../config/index.js';

class PaystackError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'PaystackError';
    this.statusCode = statusCode;
  }
}

const paystackClient = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${config.paystack.secretKey}`,
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

/**
 * Initialize a payment transaction
 */
export async function initializePayment({ email, amount, orderId, metadata = {} }) {
  try {
    const response = await paystackClient.post('/transaction/initialize', {
      email,
      amount: Math.round(amount * 100), // Paystack uses kobo
      currency: 'NGN',
      reference: `MEDSTER-${orderId}-${Date.now()}`,
      callback_url: config.paystack.callbackUrl,
      metadata: {
        order_id: orderId,
        ...metadata,
      },
    });

    return {
      authorizationUrl: response.data.data.authorization_url,
      reference: response.data.data.reference,
      accessCode: response.data.data.access_code,
    };
  } catch (error) {
    throw new PaystackError(
      error.response?.data?.message || 'Failed to initialize payment',
      error.response?.status || 502
    );
  }
}

/**
 * Verify a payment transaction
 */
export async function verifyPayment(reference) {
  try {
    const response = await paystackClient.get(`/transaction/verify/${reference}`);

    const { status, data } = response.data;

    return {
      success: status && data.status === 'success',
      status: data.status,
      amount: data.amount / 100, // Convert back from kobo
      currency: data.currency,
      paidAt: data.paid_at,
      channel: data.channel,
      cardDetails: data.authorization
        ? {
            last4: data.authorization.last4,
            expMonth: data.authorization.exp_month,
            expYear: data.authorization.exp_year,
            brand: data.authorization.brand,
          }
        : null,
      customer: {
        email: data.customer?.email,
        name: data.customer?.name,
      },
      gatewayResponse: data.gateway_response,
      reference: data.reference,
    };
  } catch (error) {
    throw new PaystackError(
      error.response?.data?.message || 'Failed to verify payment',
      error.response?.status || 502
    );
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(signature, payload) {
  if (!config.paystack.webhookSecret) return true; // Skip if not configured
  
  const hash = crypto
    .createHmac('sha512', config.paystack.webhookSecret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}

/**
 * Process webhook event
 */
export async function handleWebhook(event) {
  const { event: eventType, data } = event;

  switch (eventType) {
    case 'charge.success':
      return {
        event: 'payment.success',
        reference: data.reference,
        amount: data.amount / 100,
        status: 'success',
        paidAt: data.paid_at,
        metadata: data.metadata,
      };

    case 'charge.failed':
      return {
        event: 'payment.failed',
        reference: data.reference,
        status: 'failed',
        metadata: data.metadata,
      };

    case 'transfer.success':
      return {
        event: 'transfer.success',
        reference: data.reference,
        status: 'success',
      };

    default:
      return { event: eventType, unhandled: true };
  }
}

export default {
  initializePayment,
  verifyPayment,
  verifyWebhookSignature,
  handleWebhook,
};
