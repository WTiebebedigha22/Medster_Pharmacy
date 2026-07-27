import { supabase } from './supabase';
import { products as localProducts } from '../data/products';

// IREC API Configuration
const IREC_API_URL = import.meta.env.VITE_IREC_API_URL || 'https://api.irec.com/v1';
const IREC_API_KEY = import.meta.env.VITE_IREC_API_KEY || '';

// Track whether we've fallen back to local data
let useLocalFallback = false;

// Helper function for API calls with local fallback
const fetchFromIREC = async (endpoint, options = {}) => {
  // If we already know the external API is unavailable, use local data
  if (useLocalFallback) {
    throw new Error('Using local fallback');
  }

  // Try external API first
  try {
    const url = `${IREC_API_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${IREC_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `IREC API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    // If external API fails, fall back to local server
    if (!useLocalFallback) {
      console.warn('⚠️ IREC API unavailable, falling back to local data');
      useLocalFallback = true;
    }
    throw error;
  }
};

// Helper to transform IREC product to app format
const transformProduct = (product) => ({
  id: product.id,
  name: product.name,
  price: product.price,
  oldPrice: product.old_price || product.compare_at_price || null,
  image: product.images?.[0] || product.image || '/images/placeholder.jpg',
  images: product.images || [product.image || '/images/placeholder.jpg'],
  category: product.category || 'General',
  brand: product.brand || 'Generic',
  description: product.description || 'No description available.',
  isRx: product.is_rx || product.prescription_required || product.isRx || false,
  discount: product.discount_percentage || 0,
  bestseller: product.bestseller || false,
  rating: product.rating || 4.0,
  reviews: product.reviews_count || product.reviews || 0,
  // FIX: Check ALL possible stock fields from different data sources
  inStock: product.inventory_quantity > 0 || product.quantity > 0 || product.stock_quantity > 0 || product.inStock === true,
  quantity: product.inventory_quantity || product.quantity || product.stock_quantity || 0,
  ingredients: product.ingredients || null,
  usage: product.usage_instructions || null,
  sideEffects: product.side_effects || null,
  manufacturer: product.manufacturer || null,
  createdAt: product.created_at || new Date().toISOString(),
  updatedAt: product.updated_at || new Date().toISOString(),
});

export const api = {
  // =============================================
  // PRODUCTS - IREC API
  // =============================================
  
  // Get all products with filters
  getProducts: async (filters = {}) => {
    // If using local fallback, serve from local data
    if (useLocalFallback) {
      let filtered = [...localProducts];
      if (filters.category) {
        filtered = filtered.filter(p => p.category.toLowerCase() === filters.category.toLowerCase());
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
      }
      if (filters.isRx !== undefined) {
        filtered = filtered.filter(p => p.isRx === (filters.isRx === 'true' || filters.isRx === true));
      }
      if (filters.minPrice) filtered = filtered.filter(p => p.price >= Number(filters.minPrice));
      if (filters.maxPrice) filtered = filtered.filter(p => p.price <= Number(filters.maxPrice));
      if (filters.brand) {
        filtered = filtered.filter(p => p.brand.toLowerCase() === filters.brand.toLowerCase());
      }
      return {
        products: filtered.map(transformProduct),
        total: filtered.length,
        page: 1,
        totalPages: 1,
      };
    }

    try {
      const queryParams = new URLSearchParams();
      
      // Apply filters
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.limit) queryParams.append('limit', filters.limit || 20);
      if (filters.page) queryParams.append('page', filters.page || 1);
      if (filters.sort) queryParams.append('sort', filters.sort);
      if (filters.minPrice) queryParams.append('min_price', filters.minPrice);
      if (filters.maxPrice) queryParams.append('max_price', filters.maxPrice);
      if (filters.brand) queryParams.append('brand', filters.brand);
      if (filters.inStock) queryParams.append('in_stock', filters.inStock);
      if (filters.isRx) queryParams.append('prescription_required', filters.isRx);
      if (filters.exclude) queryParams.append('exclude', filters.exclude);
      
      const queryString = queryParams.toString();
      const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
      
      const data = await fetchFromIREC(endpoint);
      
      return {
        products: (data.products || []).map(transformProduct),
        total: data.total || 0,
        page: data.page || 1,
        totalPages: data.total_pages || 1,
        filters: data.filters || {},
      };
    } catch (error) {
      console.error('Error fetching products from IREC, using local data:', error);
      // Fall back to local data
      let filtered = [...localProducts];
      if (filters.category) {
        filtered = filtered.filter(p => p.category.toLowerCase() === filters.category.toLowerCase());
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
      }
      if (filters.isRx !== undefined) {
        filtered = filtered.filter(p => p.isRx === (filters.isRx === 'true' || filters.isRx === true));
      }
      return {
        products: filtered.map(transformProduct),
        total: filtered.length,
        page: 1,
        totalPages: 1,
      };
    }
  },

  // Get single product
  getProduct: async (id) => {
    // If using local fallback, find product from local data
    if (useLocalFallback) {
      const product = localProducts.find(p => p.id === id);
      return product ? transformProduct(product) : null;
    }

    try {
      if (!id) throw new Error('Product ID is required');
      
      const data = await fetchFromIREC(`/products/${id}`);
      return transformProduct(data);
    } catch (error) {
      console.error('Error fetching product from IREC:', error);
      // Try local fallback
      const product = localProducts.find(p => p.id === id);
      return product ? transformProduct(product) : null;
    }
  },

  // Search products
  searchProducts: async (query, options = {}) => {
    try {
      const params = new URLSearchParams({
        q: query,
        limit: options.limit || 20,
        page: options.page || 1,
      });
      
      if (options.category) params.append('category', options.category);
      if (options.minPrice) params.append('min_price', options.minPrice);
      if (options.maxPrice) params.append('max_price', options.maxPrice);
      
      const data = await fetchFromIREC(`/products/search?${params}`);
      
      return {
        products: (data.products || []).map(transformProduct),
        total: data.total || 0,
        page: data.page || 1,
        totalPages: data.total_pages || 1,
      };
    } catch (error) {
      console.error('Error searching products:', error);
      return { products: [], total: 0, page: 1, totalPages: 1 };
    }
  },

  // Get products by category
  getProductsByCategory: async (category, options = {}) => {
    return api.getProducts({ category, ...options });
  },

  // Get featured products
  getFeaturedProducts: async (limit = 6) => {
    try {
      const data = await fetchFromIREC(`/products/featured?limit=${limit}`);
      return (data.products || []).map(transformProduct);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }
  },

  // Get bestsellers
  getBestsellers: async (limit = 6) => {
    try {
      const data = await fetchFromIREC(`/products/bestsellers?limit=${limit}`);
      return (data.products || []).map(transformProduct);
    } catch (error) {
      console.error('Error fetching bestsellers:', error);
      return [];
    }
  },

  // Get products on sale
  getProductsOnSale: async (limit = 6) => {
    try {
      const data = await fetchFromIREC(`/products/sale?limit=${limit}`);
      return (data.products || []).map(transformProduct);
    } catch (error) {
      console.error('Error fetching sale products:', error);
      return [];
    }
  },

  // =============================================
  // CATEGORIES - IREC API
  // =============================================
  
  getCategories: async () => {
    try {
      const data = await fetchFromIREC('/categories');
      return data.categories || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  getCategoryDetails: async (categoryId) => {
    try {
      const data = await fetchFromIREC(`/categories/${categoryId}`);
      return data;
    } catch (error) {
      console.error('Error fetching category details:', error);
      return null;
    }
  },

  // =============================================
  // AUTHENTICATION - Supabase
  // =============================================
  
  signUp: async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData?.firstName || '',
          last_name: userData?.lastName || '',
          phone: userData?.phone || '',
          ...userData,
        }
      }
    });
    
    if (error) throw error;
    
    // Create user profile in Supabase
    if (data.user) {
      await supabase
        .from('profiles')
        .insert([{
          user_id: data.user.id,
          first_name: userData?.firstName || '',
          last_name: userData?.lastName || '',
          email: email,
          phone: userData?.phone || '',
          created_at: new Date().toISOString()
        }]);
    }
    
    return data;
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return { success: true };
  },

  updatePassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
    return { success: true };
  },

  // =============================================
  // ORDERS - Supabase
  // =============================================
  
  getMyOrders: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { orders: data || [] };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return { orders: [] };
    }
  },

  getOrderById: async (orderId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  },

  createOrder: async (orderData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const order = {
        user_id: user.id,
        items: orderData.items,
        total: orderData.total,
        status: 'pending',
        delivery_fee: orderData.deliveryFee || 0,
        discount: orderData.discount || 0,
        shipping_address: orderData.shippingAddress || null,
        payment_method: orderData.paymentMethod || 'card',
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([order])
        .select();
      
      if (error) throw error;
      
      // Clear cart after successful order
      await api.clearCart();
      
      return data[0];
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  },

  // =============================================
  // CART - Supabase
  // =============================================
  
  getCart: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { cart: [] };
      
      const { data, error } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      // Fetch product details from IREC for each cart item
      if (data?.items && data.items.length > 0) {
        const enrichedItems = await Promise.all(
          data.items.map(async (item) => {
            try {
              const product = await api.getProduct(item.id);
              return { 
                ...item, 
                name: product?.name || item.name,
                price: product?.price || item.price,
                image: product?.image || item.image,
                inStock: product?.inventory_quantity > 0 || product?.quantity > 0 || product?.stock_quantity > 0 || product?.inStock === true
              };
            } catch {
              return item;
            }
          })
        );
        return { cart: enrichedItems };
      }
      
      return { cart: data?.items || [] };
    } catch (error) {
      console.error('Error fetching cart:', error);
      return { cart: [] };
    }
  },

  updateCart: async (cartItems) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('carts')
        .upsert({
          user_id: user.id,
          items: cartItems,
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    }
  },

  clearCart: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { error } = await supabase
        .from('carts')
        .delete()
        .eq('user_id', user.id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  },

  // =============================================
  // WISHLIST - Supabase
  // =============================================
  
  getWishlist: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { wishlist: [] };
      
      const { data, error } = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch product details from IREC
      const wishlistWithProducts = await Promise.all(
        (data || []).map(async (item) => {
          try {
            const product = await api.getProduct(item.product_id);
            return { 
              ...item, 
              product: product,
              product_name: product?.name || 'Unknown Product',
              product_price: product?.price || 0,
              product_image: product?.image || '/images/placeholder.jpg'
            };
          } catch {
            return { 
              ...item, 
              product: null,
              product_name: 'Unknown Product',
              product_price: 0,
              product_image: '/images/placeholder.jpg'
            };
          }
        })
      );
      
      return { wishlist: wishlistWithProducts };
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      return { wishlist: [] };
    }
  },

  toggleWishlist: async (productId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Check if product is already in wishlist
      const { data: existing, error: checkError } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existing) {
        // Remove from wishlist
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('id', existing.id);
        
        if (error) throw error;
        return { action: 'removed', success: true };
      } else {
        // Add to wishlist
        const { error } = await supabase
          .from('wishlist')
          .insert([{
            user_id: user.id,
            product_id: productId,
            created_at: new Date().toISOString()
          }]);
        
        if (error) throw error;
        return { action: 'added', success: true };
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      throw error;
    }
  },

  // =============================================
  // USER PROFILE - Supabase
  // =============================================
  
  getProfile: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // =============================================
  // PRESCRIPTIONS - Supabase
  // =============================================
  
  uploadPrescription: async (prescriptionData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('prescriptions')
        .insert([{
          user_id: user.id,
          image_url: prescriptionData.imageUrl,
          doctor_name: prescriptionData.doctorName || '',
          prescription_date: prescriptionData.date || new Date().toISOString(),
          notes: prescriptionData.notes || '',
          status: 'pending',
          created_at: new Date().toISOString()
        }])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error uploading prescription:', error);
      throw error;
    }
  },

  getPrescriptions: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { prescriptions: [] };
      
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { prescriptions: data || [] };
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      return { prescriptions: [] };
    }
  },

  updatePrescriptionStatus: async (prescriptionId, status) => {
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', prescriptionId)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating prescription:', error);
      throw error;
    }
  },
};

// Export helper functions
export const transformIRECProduct = transformProduct;
export const IREC_API = { fetchFromIREC };