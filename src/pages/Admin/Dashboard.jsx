import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShoppingCart,
  faBoxes,
  faPrescriptionBottle,
  faUsers,
  faExclamationTriangle,
  faDollarSign,
  faClipboardList,
} from '@fortawesome/free-solid-svg-icons';

const API_BASE = '/api/admin';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('medster_access_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const [dashboardRes, lowStockRes] = await Promise.all([
        fetch(`${API_BASE}/dashboard`, { headers }),
        fetch(`${API_BASE}/inventory/low-stock?threshold=10`, { headers }),
      ]);

      if (!dashboardRes.ok) throw new Error('Failed to fetch dashboard');

      const dashboardData = await dashboardRes.json();
      const lowStockData = await lowStockRes.json();

      setStats(dashboardData.stats);
      setRecentOrders(dashboardData.recentOrders || []);
      setLowStock(lowStockData.products || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
        <h2>Failed to load dashboard</h2>
        <p>{error}</p>
        <button onClick={fetchDashboard} style={{ marginTop: '16px', padding: '8px 16px', cursor: 'pointer' }}>
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: faShoppingCart,
      color: '#3b82f6',
      bg: '#eff6ff',
      link: '/admin/orders',
    },
    {
      label: 'Pending Orders',
      value: stats?.pendingOrders || 0,
      icon: faClipboardList,
      color: '#f59e0b',
      bg: '#fffbeb',
      link: '/admin/orders?status=pending',
    },
    {
      label: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: faBoxes,
      color: '#10b981',
      bg: '#ecfdf5',
      link: '/admin/products',
    },
    {
      label: 'Pending Prescriptions',
      value: stats?.pendingPrescriptions || 0,
      icon: faPrescriptionBottle,
      color: '#8b5cf6',
      bg: '#f5f3ff',
      link: '/admin/prescriptions',
    },
    {
      label: 'Total Customers',
      value: stats?.totalCustomers || 0,
      icon: faUsers,
      color: '#06b6d4',
      bg: '#ecfeff',
      link: '/admin/users',
    },
    {
      label: 'Revenue',
      value: `₦${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: faDollarSign,
      color: '#059669',
      bg: '#ecfdf5',
      link: '/admin/reports',
    },
  ];

  const s = {
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '32px',
    },
    statCard: {
      background: '#fff',
      borderRadius: '12px',
      padding: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      textDecoration: 'none',
      transition: 'transform 0.2s, box-shadow 0.2s',
    },
    statIcon: {
      width: '56px',
      height: '56px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      flexShrink: 0,
    },
    statValue: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#111827',
      lineHeight: 1.2,
    },
    statLabel: {
      fontSize: '13px',
      color: '#6b7280',
      marginTop: '4px',
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#111827',
    },
    card: {
      background: '#fff',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    },
    grid2: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '20px',
      marginBottom: '32px',
    },
    orderItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid #f3f4f6',
    },
    orderNumber: { fontWeight: '600', color: '#111827', fontSize: '14px' },
    orderCustomer: { fontSize: '12px', color: '#6b7280' },
    orderTotal: { fontWeight: '600', color: '#059669', fontSize: '14px' },
    emptyState: { textAlign: 'center', color: '#9ca3af', padding: '24px' },
    row: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
    miniStat: { flex: 1, minWidth: '150px', background: '#f9fafb', borderRadius: '8px', padding: '16px' },
    miniStatLabel: { fontSize: '12px', color: '#6b7280', marginBottom: '4px' },
    miniStatValue: { fontSize: '20px', fontWeight: '700', color: '#111827' },
    lowStockItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: '1px solid #f3f4f6',
    },
    lowStockName: { fontWeight: '500', color: '#111827', fontSize: '14px' },
    viewAll: { fontSize: '13px', color: '#3b82f6', textDecoration: 'none', fontWeight: '500' },
  };

  const statusBadge = (status) => {
    const map = {
      delivered: { bg: '#ecfdf5', color: '#059669' },
      processing: { bg: '#fffbeb', color: '#d97706' },
      shipped: { bg: '#eff6ff', color: '#2563eb' },
      cancelled: { bg: '#fef2f2', color: '#dc2626' },
    };
    const m = map[status] || { bg: '#f3f4f6', color: '#6b7280' };
    return { display: 'inline-block', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', textTransform: 'capitalize', ...m, marginTop: '4px' };
  };

  const lowStockQty = (qty) => ({
    padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
    background: qty <= 5 ? '#fef2f2' : '#fffbeb',
    color: qty <= 5 ? '#dc2626' : '#d97706',
  });

  return (
    <div>
      {/* Stats Grid */}
      <div style={s.statsGrid}>
        {statCards.map((card) => (
          <Link key={card.label} to={card.link} style={s.statCard}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'; }}
          >
            <div style={{ ...s.statIcon, background: card.bg, color: card.color }}>
              <FontAwesomeIcon icon={card.icon} />
            </div>
            <div>
              <div style={s.statValue}>{card.value}</div>
              <div style={s.statLabel}>{card.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Two Column Section */}
      <div style={s.grid2}>
        {/* Recent Orders */}
        <div style={s.card}>
          <div style={s.sectionHeader}>
            <h2 style={s.sectionTitle}>Recent Orders</h2>
            <Link to="/admin/orders" style={s.viewAll}>View All →</Link>
          </div>
          {recentOrders.length === 0 ? (
            <div style={s.emptyState}>No orders yet</div>
          ) : (
            recentOrders.slice(0, 5).map((order) => (
              <div key={order.id} style={s.orderItem}>
                <div>
                  <div style={s.orderNumber}>{order.order_number}</div>
                  <div style={s.orderCustomer}>{order.users?.full_name || order.users?.email || 'Customer'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={s.orderTotal}>₦{parseFloat(order.total || 0).toLocaleString()}</div>
                  <span style={statusBadge(order.status)}>{order.status}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Low Stock Alerts */}
        <div style={s.card}>
          <div style={s.sectionHeader}>
            <h2 style={s.sectionTitle}>
              <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: '#f59e0b', marginRight: '8px' }} />
              Low Stock Alerts
            </h2>
            <Link to="/admin/products" style={s.viewAll}>Manage →</Link>
          </div>
          {lowStock.length === 0 ? (
            <div style={s.emptyState}>All products well stocked</div>
          ) : (
            lowStock.slice(0, 5).map((product) => (
              <div key={product.id} style={s.lowStockItem}>
                <span style={s.lowStockName}>{product.name}</span>
                <span style={lowStockQty(product.stock_quantity)}>{product.stock_quantity} left</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Period Summary */}
      <div style={s.card}>
        <h2 style={{ ...s.sectionTitle, marginBottom: '16px' }}>Period Summary</h2>
        <div style={s.row}>
          <div style={s.miniStat}>
            <div style={s.miniStatLabel}>Today's Orders</div>
            <div style={s.miniStatValue}>{stats?.todayOrders || 0}</div>
          </div>
          <div style={s.miniStat}>
            <div style={s.miniStatLabel}>This Week</div>
            <div style={s.miniStatValue}>{stats?.weekOrders || 0} orders</div>
          </div>
          <div style={s.miniStat}>
            <div style={s.miniStatLabel}>Weekly Revenue</div>
            <div style={s.miniStatValue}>₦{(stats?.weeklyRevenue || 0).toLocaleString()}</div>
          </div>
          <div style={s.miniStat}>
            <div style={s.miniStatLabel}>Monthly Revenue</div>
            <div style={s.miniStatValue}>₦{(stats?.monthlyRevenue || 0).toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
