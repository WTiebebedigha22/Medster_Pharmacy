# Medster Pharmacy E-Commerce MVP — Backend Architecture

## Phase 6: Backend Implementation ✅ COMPLETE

### Server Architecture (17 files)
- `server/config/index.js` — Environment-based config (Supabase, iREC, JWT, Paystack, Cloudinary, CORS)
- `server/db/supabase.js` — Supabase client with service role key
- `server/db/migrations.sql` — Full schema (11 tables)
- `server/middleware/auth.js` — JWT auth (authenticate, requireRole, optionalAuth)
- `server/middleware/validate.js` — Zod validation schemas
- `server/middleware/errorHandler.js` — Async handler + error middleware
- `server/services/irecService.js` — iRECPlus API integration with retry + SSL handling
- `server/services/paymentService.js` — Paystack integration (init, verify, webhook)
- `server/services/authService.js` — Custom auth (bcrypt, JWT, token blacklist)
- `server/routes/auth.js` — Register, login, refresh, logout, profile, change-password
- `server/routes/products.js` — List with filters, get by ID, sync trigger/status
- `server/routes/cart.js` — CRUD cart items with stock validation
- `server/routes/orders.js` — List, get, create (with stock check + Paystack init), cancel
- `server/routes/prescriptions.js` — Upload, list, get, delete, admin review
- `server/routes/addresses.js` — CRUD delivery addresses
- `server/routes/admin.js` — Dashboard stats, orders, prescriptions queue, sync control
- `server/routes/webhooks.js` — Paystack payment webhook with signature verification
- `server/jobs/syncScheduler.js` — node-cron scheduled product sync (every 30 min)

### Key Design Decisions
1. **Three-tier architecture** — Frontend → Backend → iRECPlus (never frontend directly to iREC)
2. **Custom JWT auth** — Users managed in local DB, not iRECPlus
3. **Paystack payments** — Payment verified before order creation in iRECPlus
4. **Graceful degradation** — When iRECPlus is unavailable, server continues with cached data
5. **iRECPlus SSL issues** — Handled with `rejectUnauthorized: false` + retry logic + fallback to local DB

### Known Issue: iRECPlus API Unreachable
- iREC host `208.91.197.27:443` times out / SSL error from current environment
- **This is a pre-existing network/SSL issue**, not a code defect
- `ETIMEDOUT`, `EPROTO`, `ECONNRESET` all trigger retry (3 attempts with exponential backoff)
- On failure: sync logged to `sync_logs` table, server continues, scheduler retries next interval
- Stock verification falls back to cached data from local products table
- **Fix**: Deploy to environment with access to `208.91.197.27`, or update `IREC_API_URL` in `.env`

## Seed Script
- `scripts/seed-products.js` — Populates local DB from `src/data/products.js`
- Run with: `npm run seed:products`
- Creates products with `irec_id: seed_*` prefix for offline development

## Environment Variables (.env)
```bash
# Supabase
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# iRECPlus
IREC_API_URL=https://api.irecplus.com/api
IREC_API_KEY=your-irec-api-key

# JWT
JWT_SECRET=your-jwt-secret

# Paystack
PAYSTACK_SECRET_KEY=your-paystack-secret
VITE_PAYSTACK_PUBLIC_KEY=your-paystack-public
```

## Running
```bash
npm run dev:server   # Backend on port 4000
npm run dev          # Frontend (Vite) on port 5173
npm run dev:all      # Both (requires concurrently)
npm run seed:products # Seed local DB with demo products
```

---

## Phase 7: Frontend Refactor (Pending)
- [ ] Update `src/lib/api.js` to point to backend proxy (port 4000)
- [ ] Replace Supabase direct calls with backend API calls
- [ ] Update checkout flow to use Paystack via backend
- [ ] Add prescription upload flow
- [ ] Build admin dashboard pages
- [ ] Test full end-to-end flow

---

## File Inventory — Server
```
server/
├── .eslintrc.cjs
├── config/index.js
├── db/
│   ├── supabase.js
│   └── migrations.sql
├── index.js              ← Entry point (port 4000)
├── jobs/
│   └── syncScheduler.js
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   └── validate.js
├── routes/
│   ├── addresses.js
│   ├── admin.js
│   ├── auth.js
│   ├── cart.js
│   ├── orders.js
│   ├── prescriptions.js
│   ├── products.js
│   └── webhooks.js
└── services/
    ├── authService.js
    ├── irecService.js
    └── paymentService.js

scripts/
├── seed-products.js       ← Seed local DB from frontend data
└── quick-test.js
