import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faEye, faSearch } from '@fortawesome/free-solid-svg-icons';

const API_BASE = '/api/admin';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const token = localStorage.getItem('medster_access_token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => { fetchPrescriptions(); }, [page, filter]);

  const fetchPrescriptions = async () => {
    try {
      const params = new URLSearchParams({ page, limit: '20', status: filter });
      const res = await fetch(`${API_BASE}/prescriptions?${params}`, { headers });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setPrescriptions(data.prescriptions || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) { alert(err.message); }
    finally { setLoading(false); }
  };

  const verify = async (id, status) => {
    if (status === 'rejected' && !rejectionReason) {
      alert('Please provide a rejection reason');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/prescriptions/${id}/verify`, {
        method: 'PUT', headers,
        body: JSON.stringify({ status, rejection_reason: status === 'rejected' ? rejectionReason : null }),
      });
      if (!res.ok) throw new Error('Failed');
      setSelected(null);
      setRejectionReason('');
      fetchPrescriptions();
    } catch (err) { alert(err.message); }
  };

  const viewDetails = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/prescriptions/${id}`, { headers });
      if (!res.ok) return;
      setSelected((await res.json()).prescription);
    } catch (err) { alert(err.message); }
  };

  const s = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    title: { fontSize: '20px', fontWeight: '600' },
    filters: { display: 'flex', gap: '12px' },
    filterBtn: (active) => ({ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', background: active ? '#3b82f6' : '#fff', color: active ? '#fff' : '#374151', cursor: 'pointer', fontSize: '13px' }),
    table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
    th: { padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' },
    td: { padding: '12px 16px', fontSize: '14px', borderBottom: '1px solid #f3f4f6' },
    badge: (st) => {
      const m = { approved: { bg: '#ecfdf5', c: '#059669' }, rejected: { bg: '#fef2f2', c: '#dc2626' }, pending: { bg: '#fffbeb', c: '#d97706' }, expired: { bg: '#f3f4f6', c: '#6b7280' } };
      const b = m[st] || m.pending;
      return { padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', textTransform: 'capitalize', background: b.bg, color: b.c };
    },
    actionBtn: (color) => ({ background: 'none', border: 'none', color, cursor: 'pointer', fontSize: '13px', padding: '4px 8px' }),
    pagination: { display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' },
    pageBtn: (active) => ({ padding: '8px 14px', borderRadius: '6px', border: '1px solid #e5e7eb', background: active ? '#3b82f6' : '#fff', color: active ? '#fff' : '#374151', cursor: 'pointer' }),
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalCard: { background: '#fff', borderRadius: '12px', padding: '32px', width: '90%', maxWidth: '500px' },
  };

  const filters = ['pending', 'approved', 'rejected', ''];

  return (
    <div>
      <div style={s.header}>
        <h1 style={s.title}>Prescription Management</h1>
        <div style={s.filters}>
          {filters.map(f => (
            <button key={f} style={s.filterBtn(filter === f)} onClick={() => { setFilter(f); setPage(1); }}>
              {f || 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div>Loading...</div> : (
        <>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Patient</th>
                <th style={s.th}>Doctor</th>
                <th style={s.th}>Date</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map(p => (
                <tr key={p.id}>
                  <td style={s.td}>{p.users?.full_name || p.users?.email || 'N/A'}</td>
                  <td style={s.td}>{p.doctor_name || 'N/A'}</td>
                  <td style={s.td}>{new Date(p.created_at).toLocaleDateString()}</td>
                  <td style={s.td}><span style={s.badge(p.status)}>{p.status}</span></td>
                  <td style={s.td}>
                    <button style={s.actionBtn('#3b82f6')} onClick={() => viewDetails(p.id)}><FontAwesomeIcon icon={faEye} /></button>
                    {p.status === 'pending' && (
                      <button style={s.actionBtn('#059669')} onClick={() => setSelected(p)}><FontAwesomeIcon icon={faCheck} /></button>
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
            <h2 style={{ marginBottom: '16px' }}>Review Prescription</h2>
            {selected.image_url && (
              <div style={{ marginBottom: '16px' }}>
                <img src={selected.image_url} alt="Prescription" style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px', background: '#f3f4f6' }} />
              </div>
            )}
            <div style={{ marginBottom: '12px' }}><strong>Patient:</strong> {selected.users?.full_name || selected.users?.email}</div>
            <div style={{ marginBottom: '12px' }}><strong>Doctor:</strong> {selected.doctor_name || 'N/A'}</div>
            <div style={{ marginBottom: '12px' }}><strong>Date:</strong> {new Date(selected.created_at).toLocaleString()}</div>
            {selected.notes && <div style={{ marginBottom: '12px' }}><strong>Notes:</strong> {selected.notes}</div>}

            {selected.status === 'pending' && (
              <div style={{ marginTop: '20px' }}>
                <textarea
                  placeholder="Rejection reason (required if rejecting)..."
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', minHeight: '80px', marginBottom: '12px' }}
                />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => verify(selected.id, 'approved')} style={{ flex: 1, padding: '10px', background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
                    <FontAwesomeIcon icon={faCheck} /> Approve
                  </button>
                  <button onClick={() => verify(selected.id, 'rejected')} style={{ flex: 1, padding: '10px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
                    <FontAwesomeIcon icon={faTimes} /> Reject
                  </button>
                </div>
              </div>
            )}

            {selected.status !== 'pending' && (
              <div style={{ marginTop: '12px', padding: '12px', background: '#f3f4f6', borderRadius: '8px' }}>
                <strong>Reviewed by:</strong> {selected.reviewer?.full_name || 'N/A'}<br />
                <strong>Status:</strong> <span style={s.badge(selected.status)}>{selected.status}</span>
                {selected.rejection_reason && <><br /><strong>Reason:</strong> {selected.rejection_reason}</>}
              </div>
            )}

            <button onClick={() => setSelected(null)} style={{ marginTop: '16px', width: '100%', padding: '10px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prescriptions;
