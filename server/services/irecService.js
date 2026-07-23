import axios from 'axios';
import https from 'https';
import config from '../config/index.js';
import { supabase } from '../db/supabase.js';

// Custom error class for iREC errors
export class IRECError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'IRECError';
    this.statusCode = statusCode;
  }
}

// Axios instance with SSL handling for self-signed certs
const irecClient = axios.create({
  baseURL: config.irec.apiUrl,
  timeout: config.irec.timeout,
  headers: {
    'Authorization': `Bearer ${config.irec.apiKey}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
    keepAlive: true,
  }),
});

// Retry logic wrapper
async function fetchWithRetry(fn, retries = config.irec.maxRetries, delay = config.irec.retryDelay) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === retries) throw error;

      const isRetryable =
        error.response?.status >= 500 ||
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT' ||
        error.code === 'ECONNREFUSED' ||
        error.code === 'ENOTFOUND' ||
        (error.message && error.message.includes('timeout'));

      if (!isRetryable) throw error;

      console.warn(`⚠️ iREC API retry ${attempt}/${retries} after ${delay}ms (${error.code || error.message})`);
      await new Promise((r) => setTimeout(r, delay * attempt));
    }
  }
}

// =============================================
// PRODUCT SYNC
// =============================================

export async function syncProducts() {
  const syncLog = {
    sync_type: 'products',
    status: 'started',
    records_processed: 0,
    records_failed: 0,
    started_at: new Date().toISOString(),
  };

  try {
    console.log('🔄 Starting product sync from iRECPlus...');
    let page = 1;
    let totalProcessed = 0;
    let totalFailed = 0;
    let hasMore = true;

    while (hasMore) {
      const response = await fetchWithRetry(() =>
        irecClient.get('/products', {
          params: { page, limit: 100, include_inactive: false },
        })
      );

      const { products, total_pages } = response.data;

      if (!products || products.length === 0) {
        hasMore = false;
        break;
      }

      for (const product of products) {
        try {
          await upsertProduct(product);
          totalProcessed++;
        } catch (err) {
          console.error(`❌ Failed to sync product ${product.id}:`, err.message);
          totalFailed++;
        }
      }

      console.log(`  → Synced page ${page}/${total_pages} (${totalProcessed} products)`);
      page++;
      hasMore = page <= (total_pages || 1);
    }

    syncLog.status = totalFailed > 0 ? 'partial' : 'completed';
    syncLog.records_processed = totalProcessed;
    syncLog.records_failed = totalFailed;
    syncLog.completed_at = new Date().toISOString();
    syncLog.duration_ms = new Date() - new Date(syncLog.started_at);

    console.log(`✅ Product sync completed: ${totalProcessed} synced, ${totalFailed} failed`);

    await supabase.from('sync_logs').insert([syncLog]);
    return syncLog;
  } catch (error) {
    console.error('❌ Product sync failed:', error.message);
    syncLog.status = 'failed';
    syncLog.error_message = error.message;
    syncLog.completed_at = new Date().toISOString();
    syncLog.duration_ms = new Date() - new Date(syncLog.started_at);

    await supabase.from('sync_logs').insert([syncLog]);
    throw error;
  }
}

export async function syncProductById(irecId) {
  try {
    const response = await fetchWithRetry(() => irecClient.get(`/products/${irecId}`));
    const product = response.data;
    await upsertProduct(product);
    return product;
  } catch (error) {
    throw new IRECError(
      error.response?.data?.message || `Failed to sync product ${irecId}`,
      error.response?.status || 502
    );
  }
}

// =============================================
// STOCK VERIFICATION
// =============================================

export async function checkStock(productId, quantity) {
  try {
    const response = await fetchWithRetry(() => irecClient.get(`/products/${productId}/stock`));
    const { available_quantity, is_in_stock } = response.data;

    return {
      inStock: is_in_stock && available_quantity >= quantity,
      availableQuantity: available_quantity,
      requestedQuantity: quantity,
      sufficient: available_quantity >= quantity,
    };
  } catch (error) {
    console.warn('⚠️ Could not verify stock with iREC, using cached data');
    const { data: cached } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('irec_id', productId)
      .single();

    return {
      inStock: cached ? cached.stock_quantity >= quantity : false,
      availableQuantity: cached?.stock_quantity || 0,
      requestedQuantity: quantity,
      sufficient: cached ? cached.stock_quantity >= quantity : false,
      cached: true,
    };
  }
}

export async function verifyBulkStock(items) {
  const results = [];
  for (const item of items) {
    try {
      const stockInfo = await checkStock(item.irecId, item.quantity);
      results.push({ productId: item.irecId, name: item.name, ...stockInfo });
    } catch (error) {
      results.push({
        productId: item.irecId,
        name: item.name,
        inStock: false,
        availableQuantity: 0,
        requestedQuantity: item.quantity,
        sufficient: false,
        error: error.message,
      });
    }
  }
  return results;
}

// =============================================
// ORDER MANAGEMENT IN IREC
// =============================================

export async function createIRECOrder(orderData) {
  try {
    const response = await fetchWithRetry(() =>
      irecClient.post('/orders', {
        customer: {
          name: orderData.customerName,
          email: orderData.customerEmail,
          phone: orderData.customerPhone,
        },
        items: orderData.items.map((item) => ({
          product_id: item.irecId,
          quantity: item.quantity,
          unit_price: item.price,
        })),
        shipping_address: orderData.shippingAddress,
        payment_method: orderData.paymentMethod,
        notes: orderData.notes,
        external_reference: orderData.orderId,
      })
    );

    return {
      irecOrderId: response.data.id,
      irecOrderNumber: response.data.order_number,
      status: response.data.status,
    };
  } catch (error) {
    throw new IRECError(
      error.response?.data?.message || 'Failed to create order in iRECPlus',
      error.response?.status || 502
    );
  }
}

export async function getIRECOrderStatus(irecOrderId) {
  try {
    const response = await fetchWithRetry(() => irecClient.get(`/orders/${irecOrderId}`));
    return response.data;
  } catch (error) {
    throw new IRECError(
      error.response?.data?.message || 'Failed to get order status',
      error.response?.status || 502
    );
  }
}

// =============================================
// CATEGORY SYNC
// =============================================

export async function syncCategories() {
  try {
    const response = await fetchWithRetry(() => irecClient.get('/categories'));
    return response.data.categories || [];
  } catch (error) {
    console.error('❌ Failed to sync categories:', error.message);
    return [];
  }
}

// =============================================
// HELPERS
// =============================================

async function upsertProduct(product) {
  const transformed = {
    irec_id: product.id,
    name: product.name,
    description: product.description || '',
    category: product.category || 'General',
    brand: product.brand || 'Generic',
    price: parseFloat(product.price) || 0,
    compare_at_price: product.compare_at_price ? parseFloat(product.compare_at_price) : null,
    currency: product.currency || 'NGN',
    stock_quantity: product.inventory_quantity || 0,
    is_rx: product.prescription_required || false,
    images: product.images || [],
    thumbnail_url: product.images?.[0] || null,
    attributes: {
      strength: product.strength,
      dosage_form: product.dosage_form,
      pack_size: product.pack_size,
      manufacturer: product.manufacturer,
      ...product.attributes,
    },
    manufacturer: product.manufacturer || null,
    is_active: product.is_active !== false,
    last_synced_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('products').upsert(transformed, {
    onConflict: 'irec_id',
    ignoreDuplicates: false,
  });

  if (error) throw error;
}

export default {
  syncProducts,
  syncProductById,
  checkStock,
  verifyBulkStock,
  createIRECOrder,
  getIRECOrderStatus,
  syncCategories,
};
