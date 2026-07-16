import express from "express";

const app = express();
app.use(express.json());

// In-memory demo DB (replace with SQLite later if desired)
let products = [];
let orders = [];
let users = [];
let nextOrderId = 1;

// Seed products from frontend data file
import { products as seedProducts } from "../src/data/products.js";
products = seedProducts;

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.get("/api/products", (req, res) => {
  res.json({ products });
});

app.post("/api/orders", (req, res) => {
  const { items, shipping, paymentMethod, notes } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "No items supplied" });
  }

  const order = {
    id: String(nextOrderId++),
    status: "PLACED",
    createdAt: new Date().toISOString(),
    items,
    shipping: shipping || null,
    paymentMethod: paymentMethod || "CARD",
    notes: notes || null,
    userId: "demo-user",
  };

  orders.unshift(order);
  res.status(201).json({ order });
});

app.get("/api/orders/me", (req, res) => {
  const myOrders = orders.filter((o) => o.userId === "demo-user");
  res.json({ orders: myOrders });
});

// Auth scaffolding (no real JWT yet)
app.post("/api/auth/login", (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ message: "Email is required" });
  return res.json({ token: "demo-token", user: { id: "demo-user", email } });
});

app.post("/api/auth/register", (req, res) => {
  const { email, password, fullName } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  const existing = users.find((u) => u.email === email);
  if (existing) return res.status(409).json({ message: "Account already exists" });
  const user = { id: `u_${users.length + 1}`, email, fullName: fullName || "", password };
  users.push(user);
  return res.status(201).json({ token: "demo-token", user: { id: user.id, email: user.email } });
});

const port = 4000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[server] listening on :${port}`);
});

