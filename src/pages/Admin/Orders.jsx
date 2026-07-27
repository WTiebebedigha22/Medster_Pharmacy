import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faEye, faSearch } from '@fortawesome/free-solid-svg-icons';

const API_BASE = '/api/admin';
const STATUS_STEPS = ['pending', 'paid', 'processing', 'shipped', 'delivered'];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const token = localStorage.getItem('medster_access_token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => { fetchOrders(); }, [page, statusFilter, search]);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams({ page, limit: '20' });
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);
      const res = await fetch(`${API_BASE}/orders?${params}`, { headers });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${id}/status`, { method: 'PUT', headers, body: JSON.stringify({ status }) });
      if (!res.ok) throw new Error('Failed to update');
      fetchOrders();
    } catch (err) { alert(err.message); }
  };

  const viewOrder = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${id}`, { headers });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setSelectedOrder(data.order);
    } catch (err) { alert(err.message); }
  };

  const getNextStatus = (current) => {
    const idx = STATUS_STEPS.indexOf(current);
    if (idx >= 0 && idx < STATUS_STEPS.length - 1) return STATUS_STEPS[idx + 1];
    return null;
  };

  const s = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
    title: { fontSize: '20px', fontWeight: '600' },
    filters: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
    filterBtn: (active) => ({ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', background: active ? '#3b82f6' : '#fff', color: active ? '#fff' : '#374151', cursor: 'pointer', fontSize: '13px' }),
    searchBox: { display: 'flex', gap: '8px', alignItems: 'center' },
    searchInput: { padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', width: '250px' },
    table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
    th: { padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' },
    td: { padding: '12px 16px', fontSize: '14px', borderBottom: '1px solid #f3f4f6' },
    badge: (status) => {
      const map = { delivered: '#059669', processing: '#d97706', shipped: '#2563eb', cancelled: '#dc2626', paid: '#7c3aed', pending: '#6b7280' };
      const bgMap = { delivered: '#ecfdf5', processing: '#fffbeb', shipped: '#eff6ff', cancelled: '#fef2f2', paid: '#f5f3ff', pending: '#f3f4f6' };
      return { padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', textTransform: 'capitalize', background: bgMap[status] || '#f3f4f6', color: map[status] || '#6b7280' };
    },
    actionBtn: (color) => ({ background: 'none', border: 'none', color, cursor: 'pointer', fontSize: '13px', padding: '4px 8px' }),
    pagination: { display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' },
    pageBtn: (active) => ({ padding: '8px 14px', borderRadius: '6px', border: '1px solid #e5e7eb', background: active ? '#3b82f6' : '#fff', color: active ? '#fff' : '#374151', cursor: 'pointer' }),
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalCard: { background: '#fff', borderRadius: '12px', padding: '32px', width: '90%', maxWidth: '700px', maxHeight: '90vh', overflow: 'auto' },
    detailRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6', fontSize: '14px' },
    detailLabel: { color: '#6b7280', fontWeight: '500' },
    detailValue: { color: '#111827', fontWeight: '600' },
  };

  const statuses = ['', 'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div>
      <div style={s.header}>
        <h1 style={s.title}>Order Management</h1>
        <div style={s.filters}>
          {statuses.map(st => (
            <button key={st} style={s.filterBtn(statusFilter === st)} onClick={() => { setStatusFilter(st); setPage(1); }}>
              {st || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ ...s.searchBox, marginBottom: '16px' }}>
        <FontAwesomeIcon icon={faSearch} style={{ color: '#9ca3af' }} />
        <input style={s.searchInput} placeholder="Search by order number or customer..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
      </div>

      {loading ? <div>Loading...</div> : error ? <div style={{ color: '#ef4444' }}>{error}</div> : (
        <>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Order #</th>
                <th style={s.th}>Customer</th>
                <th style={s.th}>Total</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Date</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td style={s.td}><div style={{ fontWeight: '600', fontSize: '13px' }}>{o.order_number}</div></td>
                  <td style={s.td}>{o.users?.full_name || o.users?.email || 'N/A'}</td>
                  <td style={s.td}>₦{parseFloat(o.total || 0).toLocaleString()}</td>
                  <td style={s.td}><span style={s.badge(o.status)}>{o.status}</span></td>
                  <td style={s.td}>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td style={s.td}>
                    <button style={s.actionBtn('#3b82f6')} onClick={() => viewOrder(o.id)} title="View Details"><FontAwesomeIcon icon={faEye} /></button>
                    {getNextStatus(o.status) && (
                      <button style={s.actionBtn('#059669')} onClick={() => updateStatus(o.id, getNextStatus(o.status))} title={`Mark as ${getNextStatus(o.status)}`}>
                        <FontAwesomeIcon icon={faCheck} />
                      </button>
                    )}
                    {!['delivered', 'cancelled', 'refunded'].includes(o.status) && (
                      <button style={s.actionBtn('#ef4444')} onClick={() => updateStatus(o.id, 'cancelled')} title="Cancel"><FontAwesomeIcon icon={faTimes} /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={s.pagination}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} style={s.pageBtn(page === p)} onClick={() => setPage(p)}>{p}</button>
            ))}
          </div>
        </>
      )}

      {selectedOrder && (
        <div style={s.modalOverlay} onClick={() => setSelectedOrder(null)}>
          <div style={s.modalCard} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Order {selectedOrder.order_number}</h2>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Customer Details</h3>
            <div style={s.detailRow}><span style={s.detailLabel}>Name</span><span style={s.detailValue}>{selectedOrder.users?.full_name || 'N/A'}</span></div>
            <div style={s.detailRow}><span style={s.detailLabel}>Email</span><span style={s.detailValue}>{selectedOrder.users?.email || 'N/A'}</span></div>
            <div style={s.detailRow}><span style={s.detailLabel}>Phone</span><span style={s.detailValue}>{selectedOrder.users?.phone || 'N/A'}</span></div>

            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '16px 0 12px' }}>Order Details</h3>
            <div style={s.detailRow}><span style={s.detailLabel}>Status</span><span style={s.badge(selectedOrder.status)}>{selectedOrder.status}</span></div>
            <div style={s.detailRow}><span style={s.detailLabel}>Subtotal</span><span style={s.detailValue}>₦{parseFloat(selectedOrder.subtotal || 0).toLocaleString()}</span></div>
            <div style={s.detailRow}><span style={s.detailLabel}>Delivery Fee</span><span style={s.detailValue}>₦{parseFloat(selectedOrder.delivery_fee || 0).toLocaleString()}</span></div>
            <div style={s.detailRow}><span style={s.detailLabel}>Total</span><span style={{ ...s.detailValue, fontSize: '18px', color: '#059669' }}>₦{parseFloat(selectedOrder.total || 0).toLocaleString()}</span></div>
            <div style={s.detailRow}><span style={s.detailLabel}>Payment Method</span><span style={s.detailValue}>{selectedOrder.payment_method || 'N/A'}</span></div>
            <div style={s.detailRow}><span style={s.detailLabel}>Tracking</span><span style={s.detailValue}>{selectedOrder.tracking_number || 'Not set'}</span></div>
            <div style={s.detailRow}><span style={s.detailLabel}>Date</span><span style={s.detailValue}>{new Date(selectedOrder.created_at).toLocaleString()}</span></div>

            {selectedOrder.order_items?.length > 0 && (
              <>
                <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '16px 0 12px' }}>Items</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ ...s.th }}>Product</th>
                      <th style={{ ...s.th }}>Qty</th>
                      <th style={{ ...s.th }}>Price</th>
                      <th style={{ ...s.th }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.order_items.map(item => (
                      <tr key={item.id}>
                        <td style={s.td}>{item.product_name}</td>
                        <td style={s.td}>{item.quantity}</td>
                        <td style={s.td}>₦{parseFloat(item.price || 0).toLocaleString()}</td>
                        <td style={s.td}>₦{parseFloat(item.subtotal || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
