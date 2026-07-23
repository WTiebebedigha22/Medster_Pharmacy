import { z } from 'zod';

// Generic validation middleware factory
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      // Replace with validated/sanitized data
      req.body = parsed.body || req.body;
      req.query = parsed.query || req.query;
      req.params = parsed.params || req.params;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return res.status(400).json({ message: 'Validation error', errors });
      }
      next(error);
    }
  };
};

// Common schemas
export const schemas = {
  // Auth schemas
  register: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain an uppercase letter')
        .regex(/[0-9]/, 'Password must contain a number'),
      fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
      phone: z.string().optional(),
    }),
  }),

  login: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(1, 'Password is required'),
    }),
  }),

  // Product schemas
  productQuery: z.object({
    query: z.object({
      category: z.string().optional(),
      search: z.string().optional(),
      brand: z.string().optional(),
      minPrice: z.string().optional(),
      maxPrice: z.string().optional(),
      page: z.string().optional(),
      limit: z.string().optional(),
      sort: z.string().optional(),
      isRx: z.string().optional(),
      inStock: z.string().optional(),
    }).optional(),
  }),

  // Cart schemas
  addToCart: z.object({
    body: z.object({
      productId: z.string().uuid('Invalid product ID'),
      quantity: z.number().int().positive('Quantity must be positive').max(100),
    }),
  }),

  updateCartItem: z.object({
    body: z.object({
      quantity: z.number().int().min(0, 'Quantity must be 0 or more').max(100),
    }),
  }),

  // Order schemas
  createOrder: z.object({
    body: z.object({
      shippingAddressId: z.string().uuid('Invalid address ID'),
      paymentMethod: z.enum(['card', 'transfer', 'ussd', 'qr'], {
        errorMap: () => ({ message: 'Invalid payment method' }),
      }),
      notes: z.string().max(500).optional(),
      couponCode: z.string().optional(),
    }),
  }),

  // Address schemas
  address: z.object({
    body: z.object({
      label: z.string().max(50).optional().default('Home'),
      addressLine1: z.string().min(3, 'Address is required').max(200),
      addressLine2: z.string().max(200).optional(),
      city: z.string().min(2, 'City is required').max(100),
      state: z.string().min(2, 'State is required').max(100),
      postalCode: z.string().optional(),
      country: z.string().optional().default('Nigeria'),
      isDefault: z.boolean().optional().default(false),
    }),
  }),

  // Prescription schemas
  uploadPrescription: z.object({
    body: z.object({
      doctorName: z.string().max(200).optional(),
      prescriptionDate: z.string().optional(),
      notes: z.string().max(1000).optional(),
    }),
  }),

  // Payment schemas
  verifyPayment: z.object({
    body: z.object({
      reference: z.string().min(1, 'Payment reference is required'),
      orderId: z.string().uuid('Invalid order ID'),
    }),
  }),
};
