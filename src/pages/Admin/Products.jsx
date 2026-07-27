import React, { useState, useEffect } from 'react';

const API_BASE = '/api/admin';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({
    name: '', description: '', category: '', brand: '', price: '',
    compare_at_price: '', stock_quantity: '0', is_rx: false, manufacturer: '',
  });

  const token = localStorage.getItem('medster_access_token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => { fetchProducts(); }, [page, search]);

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams({ page, limit: '20' });
      if (search) params.append('search', search);
      const res = await fetch(`${API_BASE}/products?${params}`, { headers });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingProduct
        ? `${API_BASE}/products/${editingProduct.id}`
        : `${API_BASE}/products`;
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
      if (!res.ok) throw new Error('Failed to save');
      setShowForm(false);
      setEditingProduct(null);
      setForm({ name: '', description: '', category: '', brand: '', price: '', compare_at_price: '', stock_quantity: '0', is_rx: false, manufacturer: '' });
      fetchProducts();
    } catch (err) { alert(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this product?')) return;
    try {
      await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE', headers });
      fetchProducts();
    } catch (err) { alert(err.message); }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || '',
      description: product.description || '',
      category: product.category || '',
      brand: product.brand || '',
      price: product.price?.toString() || '',
      compare_at_price: product.compare_at_price?.toString() || '',
      stock_quantity: product.stock_quantity?.toString() || '0',
      is_rx: product.is_rx || false,
      manufacturer: product.manufacturer || '',
    });
    setShowForm(true);
  };

  const styles = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    title: { fontSize: '20px', fontWeight: '600' },
    addBtn: { background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' },
    searchInput: { width: '100%', padding: '10px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
    table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
    th: { padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' },
    td: { padding: '12px 16px', fontSize: '14px', borderBottom: '1px solid #f3f4f6' },
    badge: (active) => ({ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', background: active ? '#ecfdf5' : '#fef2f2', color: active ? '#059669' : '#dc2626' }),
    editBtn: { background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: '8px', fontSize: '13px' },
    deleteBtn: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px' },
    formOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    formCard: { background: '#fff', borderRadius: '12px', padding: '32px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    field: { display: 'flex', flexDirection: 'column', gap: '4px' },
    label: { fontSize: '13px', fontWeight: '500', color: '#374151' },
    input: { padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' },
    formActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' },
    pagination: { display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' },
    pageBtn: (active) => ({ padding: '8px 14px', borderRadius: '6px', border: '1px solid #e5e7eb', background: active ? '#3b82f6' : '#fff', color: active ? '#fff' : '#374151', cursor: 'pointer' }),
  };

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Products Management</h1>
        <button style={styles.addBtn} onClick={() => { setEditingProduct(null); setForm({ name: '', description: '', category: '', brand: '', price: '', compare_at_price: '', stock_quantity: '0', is_rx: false, manufacturer: '' }); setShowForm(true); }}>
          + Add Product
        </button>
      </div>

      <input style={styles.searchInput} placeholder="Search products..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />

      {loading ? <div>Loading...</div> : error ? <div style={{ color: '#ef4444' }}>{error}</div> : (
        <>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Stock</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td style={styles.td}><div style={{ fontWeight: '500' }}>{p.name}</div></td>
                  <td style={styles.td}>{p.category}</td>
                  <td style={styles.td}>₦{parseFloat(p.price || 0).toLocaleString()}</td>
                  <td style={styles.td}>{p.stock_quantity}</td>
                  <td style={styles.td}><span style={styles.badge(p.is_active)}>{p.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td style={styles.td}>
                    <button style={styles.editBtn} onClick={() => handleEdit(p)}>Edit</button>
                    <button style={styles.deleteBtn} onClick={() => handleDelete(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={styles.pagination}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} style={styles.pageBtn(page === p)} onClick={() => setPage(p)}>{p}</button>
            ))}
          </div>
        </>
      )}

      {showForm && (
        <div style={styles.formOverlay} onClick={() => setShowForm(false)}>
          <div style={styles.formCard} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '20px' }}>{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGrid}>
                <div style={styles.field}><label style={styles.label}>Name *</label><input style={styles.input} value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                <div style={styles.field}><label style={styles.label}>Brand</label><input style={styles.input} value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} /></div>
                <div style={styles.field}><label style={styles.label}>Category</label><input style={styles.input} value={form.category} onChange={e => setForm({...form, category: e.target.value})} /></div>
                <div style={styles.field}><label style={styles.label}>Price *</label><input style={styles.input} type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required /></div>
                <div style={styles.field}><label style={styles.label}>Compare At Price</label><input style={styles.input} type="number" step="0.01" value={form.compare_at_price} onChange={e => setForm({...form, compare_at_price: e.target.value})} /></div>
                <div style={styles.field}><label style={styles.label}>Stock Quantity</label><input style={styles.input} type="number" value={form.stock_quantity} onChange={e => setForm({...form, stock_quantity: e.target.value})} /></div>
                <div style={styles.field}><label style={styles.label}>Manufacturer</label><input style={styles.input} value={form.manufacturer} onChange={e => setForm({...form, manufacturer: e.target.value})} /></div>
                <div style={styles.field}><label style={styles.label}><input type="checkbox" checked={form.is_rx} onChange={e => setForm({...form, is_rx: e.target.checked})} /> Prescription Required</label></div>
              </div>
              <div style={{ ...styles.field, marginTop: '12px' }}><label style={styles.label}>Description</label><textarea style={{ ...styles.input, minHeight: '80px' }} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <div style={styles.formActions}>
                <button type="button" style={{ ...styles.addBtn, background: '#6b7280' }} onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" style={styles.addBtn}>{editingProduct ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
