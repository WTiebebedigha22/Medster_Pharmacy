import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

const API_BASE = '/api/admin';

const ReportAnalytics = () => {
  const [report, setReport] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const token = localStorage.getItem('medster_access_token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ period });
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);

      const [reportRes, salesRes] = await Promise.all([
        fetch(`${API_BASE}/reports?${params}`, { headers }),
        fetch(`${API_BASE}/analytics/sales?${params}&limit=12`, { headers }),
      ]);

      if (reportRes.ok) setReport(await reportRes.json());
      if (salesRes.ok) setSalesData(await salesRes.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const exportData = async (type) => {
    try {
      const params = new URLSearchParams({ type, format: 'json' });
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);
      
      const res = await fetch(`${API_BASE}/export?${params}`, { headers });
      if (!res.ok) return;
      const data = await res.json();
      
      // Download as JSON file
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) { alert(err.message); }
  };

  const s = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
    title: { fontSize: '20px', fontWeight: '600' },
    controls: { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' },
    select: { padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' },
    exportBtn: { padding: '8px 16px', background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
    card: { background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '20px' },
    grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' },
    statBox: { background: '#f9fafb', borderRadius: '8px', padding: '20px', textAlign: 'center' },
    statValue: { fontSize: '28px', fontWeight: '700', color: '#111827' },
    statLabel: { fontSize: '13px', color: '#6b7280', marginTop: '4px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', borderBottom: '2px solid #e5e7eb' },
    td: { padding: '10px 12px', fontSize: '14px', borderBottom: '1px solid #f3f4f6' },
    row: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
    miniStat: { flex: 1, minWidth: '120px', background: '#f9fafb', borderRadius: '8px', padding: '12px' },
    miniStatValue: { fontSize: '18px', fontWeight: '700', color: '#111827' },
    miniStatLabel: { fontSize: '11px', color: '#6b7280' },
  };

  return (
    <div>
      <div style={s.header}>
        <h1 style={s.title}>Reports & Analytics</h1>
        <div style={s.controls}>
          <select style={s.select} value={period} onChange={e => setPeriod(e.target.value)}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button style={s.exportBtn} onClick={() => exportData('orders')}>
            <FontAwesomeIcon icon={faDownload} /> Export Orders
          </button>
          <button style={s.exportBtn} onClick={() => exportData('products')}>
            <FontAwesomeIcon icon={faDownload} /> Export Products
          </button>
        </div>
      </div>

      {loading ? <div>Loading...</div> : (
        <>
          {report?.summary && (
            <div style={s.grid2}>
              <div style={s.statBox}><div style={s.statValue}>{report.summary.totalOrders}</div><div style={s.statLabel}>Total Orders</div></div>
              <div style={s.statBox}><div style={s.statValue}>₦{(report.summary.totalRevenue || 0).toLocaleString()}</div><div style={s.statLabel}>Total Revenue</div></div>
              <div style={s.statBox}><div style={s.statValue}>₦{(report.summary.averageOrderValue || 0).toLocaleString()}</div><div style={s.statLabel}>Avg Order Value</div></div>
              <div style={s.statBox}><div style={s.statValue}>{report.summary.pending || 0}</div><div style={s.statLabel}>Pending</div></div>
              <div style={s.statBox}><div style={s.statValue}>{report.summary.processing || 0}</div><div style={s.statLabel}>Processing</div></div>
              <div style={s.statBox}><div style={s.statValue}>{report.summary.delivered || 0}</div><div style={s.statLabel}>Delivered</div></div>
            </div>
          )}

          {salesData?.topProducts && salesData.topProducts.length > 0 && (
            <div style={s.card}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Top Selling Products</h2>
              <table style={s.table}>
                <thead>
                  <tr><th style={s.th}>Product</th><th style={s.th}>Quantity Sold</th><th style={s.th}>Revenue</th></tr>
                </thead>
                <tbody>
                  {salesData.topProducts.slice(0, 10).map((p, i) => (
                    <tr key={i}>
                      <td style={s.td}>{p.name}</td>
                      <td style={s.td}>{p.quantity}</td>
                      <td style={s.td}>₦{p.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {salesData?.salesData && salesData.salesData.length > 0 && (
            <div style={s.card}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Sales Trend</h2>
              <div style={s.row}>
                {salesData.salesData.slice(-6).map((d, i) => (
                  <div key={i} style={s.miniStat}>
                    <div style={s.miniStatValue}>₦{d.revenue.toLocaleString()}</div>
                    <div style={s.miniStatLabel}>{d.period} ({d.orders} orders)</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReportAnalytics;
