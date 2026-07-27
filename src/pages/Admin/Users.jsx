import React, { useState, useEffect } from 'react';

const API_BASE = '/api/admin';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState(null);

  const token = localStorage.getItem('medster_access_token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => { fetchUsers(); }, [page, search]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({ page, limit: '20' });
      if (search) params.append('search', search);
      const res = await fetch(`${API_BASE}/users?${params}`, { headers });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) { alert(err.message); }
    finally { setLoading(false); }
  };

  const suspendUser = async (id) => {
    if (!confirm('Suspend this user?')) return;
    try {
      await fetch(`${API_BASE}/users/${id}/suspend`, { method: 'PUT', headers });
      fetchUsers();
    } catch (err) { alert(err.message); }
  };

  const activateUser = async (id) => {
    try {
      await fetch(`${API_BASE}/users/${id}/activate`, { method: 'PUT', headers });
      fetchUsers();
    } catch (err) { alert(err.message); }
  };

  const viewDetails = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, { headers });
      if (!res.ok) return;
      setSelected((await res.json()).user);
    } catch (err) { alert(err.message); }
  };

  const s = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    title: { fontSize: '20px', fontWeight: '600' },
    searchInput: { width: '100%', padding: '10px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
    table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
    th: { padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' },
    td: { padding: '12px 16px', fontSize: '14px', borderBottom: '1px solid #f3f4f6' },
    badge: (active) => ({ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', background: active ? '#ecfdf5' : '#fef2f2', color: active ? '#059669' : '#dc2626' }),
    actionBtn: (color) => ({ background: 'none', border: 'none', color, cursor: 'pointer', fontSize: '13px', padding: '4px 8px' }),
    pagination: { display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' },
    pageBtn: (active) => ({ padding: '8px 14px', borderRadius: '6px', border: '1px solid #e5e7eb', background: active ? '#3b82f6' : '#fff', color: active ? '#fff' : '#374151', cursor: 'pointer' }),
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalCard: { background: '#fff', borderRadius: '12px', padding: '32px', width: '90%', maxWidth: '500px' },
    detailRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6', fontSize: '14px' },
    detailLabel: { color: '#6b7280', fontWeight: '500' },
    detailValue: { color: '#111827', fontWeight: '600' },
  };

  return (
    <div>
      <div style={s.header}>
        <h1 style={s.title}>Customer Management</h1>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>{users.length} users</div>
      </div>

      <input style={s.searchInput} placeholder="Search customers by name, email or phone..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />

      {loading ? <div>Loading...</div> : (
        <>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Name</th>
                <th style={s.th}>Email</th>
                <th style={s.th}>Phone</th>
                <th style={s.th}>Orders</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={s.td}><div style={{ fontWeight: '500' }}>{u.full_name || 'N/A'}</div></td>
                  <td style={s.td}>{u.email}</td>
                  <td style={s.td}>{u.phone || 'N/A'}</td>
                  <td style={s.td}>{u.orderCount || 0}</td>
                  <td style={s.td}><span style={s.badge(u.is_active)}>{u.is_active ? 'Active' : 'Suspended'}</span></td>
                  <td style={s.td}>
                    <button style={s.actionBtn('#3b82f6')} onClick={() => viewDetails(u.id)}>View</button>
                    {u.is_active ? (
                      <button style={s.actionBtn('#f59e0b')} onClick={() => suspendUser(u.id)}>Suspend</button>
                    ) : (
                      <button style={s.actionBtn('#059669')} onClick={() => activateUser(u.id)}>Activate</button>
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

      {selected && (
        <div style={s.modalOverlay} onClick={() => setSelected(null)}>
          <div style={s.modalCard} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '16px' }}>Customer Details</h2>
            <div style={s.detailRow}><span style={s.detailLabel}>Name</span><span style={s.detailValue}>{selected.full_name || 'N/A'}</span></div>
            <div style={s.detailRow}><span style={s.detailLabel}>Email</span><span style={s.detailValue}>{selected.email}</span></div>
            <div style={s.detailRow}><span style={s.detailLabel}>Phone</span><span style={s.detailValue}>{selected.phone || 'N/A'}</span></div>
            <div style={s.detailRow}><span style={s.detailLabel}>Role</span><span style={s.detailValue}>{selected.role}</span></div>
            <div style={s.detailRow}><span style={s.detailLabel}>Status</span><span style={s.badge(selected.is_active)}>{selected.is_active ? 'Active' : 'Suspended'}</span></div>
            <div style={s.detailRow}><span style={s.detailLabel}>Joined</span><span style={s.detailValue}>{new Date(selected.created_at).toLocaleDateString()}</span></div>
            <button onClick={() => setSelected(null)} style={{ marginTop: '16px', width: '100%', padding: '10px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
