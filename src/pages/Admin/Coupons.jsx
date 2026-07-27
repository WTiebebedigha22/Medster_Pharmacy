import React, { useState, useEffect } from 'react';

const API_BASE = '/api/admin';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    code: '', description: '', discount_type: 'percentage', discount_value: '',
    min_order_amount: '0', max_discount: '', usage_limit: '0', expires_at: '',
  });

  const token = localStorage.getItem('medster_access_token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => { fetchCoupons(); }, [page]);

  const fetchCoupons = async () => {
    try {
      const res = await fetch(`${API_BASE}/coupons?page=${page}&limit=20`, { headers });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setCoupons(data.coupons || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) { alert(err.message); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editing ? `${API_BASE}/coupons/${editing.id}` : `${API_BASE}/coupons`;
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
      if (!res.ok) throw new Error('Failed to save');
      setShowForm(false);
      setEditing(null);
      setForm({ code: '', description: '', discount_type: 'percentage', discount_value: '', min_order_amount: '0', max_discount: '', usage_limit: '0', expires_at: '' });
      fetchCoupons();
    } catch (err) { alert(err.message); }
  };

  const toggleCoupon = async (id) => {
    try {
      await fetch(`${API_BASE}/coupons/${id}/toggle`, { method: 'PUT', headers });
      fetchCoupons();
    } catch (err) { alert(err.message); }
  };

  const deleteCoupon = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await fetch(`${API_BASE}/coupons/${id}`, { method: 'DELETE', headers });
      fetchCoupons();
    } catch (err) { alert(err.message); }
  };

  const s = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    title: { fontSize: '20px', fontWeight: '600' },
    addBtn: { background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' },
    table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
    th: { padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' },
    td: { padding: '12px 16px', fontSize: '14px', borderBottom: '1px solid #f3f4f6' },
    badge: (active) => ({ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', background: active ? '#ecfdf5' : '#fef2f2', color: active ? '#059669' : '#dc2626' }),
    editBtn: { background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: '8px', fontSize: '13px' },
    deleteBtn: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px' },
    formOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    formCard: { background: '#fff', borderRadius: '12px', padding: '32px', width: '90%', maxWidth: '500px' },
    field: { display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' },
    label: { fontSize: '13px', fontWeight: '500', color: '#374151' },
    input: { padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' },
    pagination: { display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' },
    pageBtn: (active) => ({ padding: '8px 14px', borderRadius: '6px', border: '1px solid #e5e7eb', background: active ? '#3b82f6' : '#fff', color: active ? '#fff' : '#374151', cursor: 'pointer' }),
  };

  return (
    <div>
      <div style={s.header}>
        <h1 style={s.title}>Coupon Management</h1>
        <button style={s.addBtn} onClick={() => { setEditing(null); setForm({ code: '', description: '', discount_type: 'percentage', discount_value: '', min_order_amount: '0', max_discount: '', usage_limit: '0', expires_at: '' }); setShowForm(true); }}>
          + Create Coupon
        </button>
      </div>

      {loading ? <div>Loading...</div> : (
        <>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Code</th>
                <th style={s.th}>Type</th>
                <th style={s.th}>Value</th>
                <th style={s.th}>Used</th>
                <th style={s.th}>Expires</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id}>
                  <td style={s.td}><div style={{ fontWeight: '600', fontFamily: 'monospace' }}>{c.code}</div></td>
                  <td style={s.td}>{c.discount_type === 'percentage' ? '%' : '₦'}</td>
                  <td style={s.td}>{c.discount_type === 'percentage' ? `${c.discount_value}%` : `₦${parseFloat(c.discount_value).toLocaleString()}`}</td>
                  <td style={s.td}>{c.used_count}/{c.usage_limit > 0 ? c.usage_limit : '∞'}</td>
                  <td style={s.td}>{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'Never'}</td>
                  <td style={s.td}><span style={s.badge(c.is_active)}>{c.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td style={s.td}>
                    <button style={s.editBtn} onClick={() => toggleCoupon(c.id)}>
                      {c.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button style={s.deleteBtn} onClick={() => deleteCoupon(c.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {showForm && (
        <div style={s.formOverlay} onClick={() => setShowForm(false)}>
          <div style={s.formCard} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '20px' }}>{editing ? 'Edit Coupon' : 'Create Coupon'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={s.field}><label style={s.label}>Coupon Code *</label><input style={s.input} value={form.code} onChange={e => setForm({...form, code: e.target.value})} required placeholder="e.g. SAVE20" /></div>
              <div style={s.field}><label style={s.label}>Description</label><input style={s.input} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={s.field}>
                  <label style={s.label}>Discount Type *</label>
                  <select style={s.input} value={form.discount_type} onChange={e => setForm({...form, discount_type: e.target.value})}>
                    <option value="percentage">Percentage</option>
                    <option value="fixed_amount">Fixed Amount</option>
                  </select>
                </div>
                <div style={s.field}><label style={s.label}>Discount Value *</label><input style={s.input} type="number" step="0.01" value={form.discount_value} onChange={e => setForm({...form, discount_value: e.target.value})} required /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={s.field}><label style={s.label}>Min Order Amount</label><input style={s.input} type="number" value={form.min_order_amount} onChange={e => setForm({...form, min_order_amount: e.target.value})} /></div>
                <div style={s.field}><label style={s.label}>Max Discount</label><input style={s.input} type="number" value={form.max_discount} onChange={e => setForm({...form, max_discount: e.target.value})} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={s.field}><label style={s.label}>Usage Limit (0=unlimited)</label><input style={s.input} type="number" value={form.usage_limit} onChange={e => setForm({...form, usage_limit: e.target.value})} /></div>
                <div style={s.field}><label style={s.label}>Expires At</label><input style={s.input} type="date" value={form.expires_at} onChange={e => setForm({...form, expires_at: e.target.value})} /></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" style={{ ...s.addBtn, background: '#6b7280' }} onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" style={s.addBtn}>{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;
