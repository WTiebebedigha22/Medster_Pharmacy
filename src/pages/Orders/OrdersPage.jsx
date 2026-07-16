import React, { useEffect, useState } from "react";
import styles from "./OrdersPage.module.css";
import { api } from "../../lib/api";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await api.getMyOrders();
        if (!cancelled) setOrders(res.orders || []);
      } catch {
        if (!cancelled) setOrders([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1>My Orders</h1>
        <div className={styles.card}>
          {loading ? (
            <p>Loading your orders…</p>
          ) : orders.length === 0 ? (
            <p>No orders found yet.</p>
          ) : (
            <div>
              {orders.map((o) => (
                <div key={o.id} className={styles.orderItem}>
                  <div className={styles.orderHeader}>
                    <strong>Order #{o.id}</strong>
                    <span>{new Date(o.createdAt).toLocaleString()}</span>
                  </div>

                  <ul>
                    {(o.items || []).map((it, idx) => (
                      <li key={`${o.id}-${idx}`}>
                        {it.name} × {it.qty}
                      </li>
                    ))}
                  </ul>

                  <div className={styles.orderStatus}>Status: {o.status}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;


