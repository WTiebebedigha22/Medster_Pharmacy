const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

async function request(path, { method = "GET", headers, body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message =
      (payload && payload.message) || `Request failed: ${res.status}`;
    throw new Error(message);
  }

  return payload;
}

export const api = {
  getProducts: () => request("/api/products"),
  createOrder: (order) => request("/api/orders", { method: "POST", body: order }),
  getMyOrders: () => request("/api/orders/me"),
  login: (credentials) => request("/api/auth/login", { method: "POST", body: credentials }),
  register: (data) => request("/api/auth/register", { method: "POST", body: data }),
};

