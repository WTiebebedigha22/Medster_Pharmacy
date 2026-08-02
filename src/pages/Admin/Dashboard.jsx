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
  faSpinner,
  faArrowRight,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';
import styles from './AdminStyles.module.css';

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

  const getBadgeClass = (status) => {
    const map = {
      delivered: styles.badgeSuccess,
      paid: styles.badgePurple,
      processing: styles.badgeWarning,
      shipped: styles.badgeInfo,
      cancelled: styles.badgeDanger,
      refunded: styles.badgeDanger,
      pending: styles.badgeDefault,
    };
    return map[status] || styles.badgeDefault;
  };

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

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner}></div>
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.emptyState}>
        <h3>Failed to load dashboard</h3>
        <p>{error}</p>
        <button className={styles.primaryBtn} onClick={fetchDashboard} style={{ marginTop: '16px' }}>
          <FontAwesomeIcon icon={faSpinner} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1>
            <FontAwesomeIcon icon={faClipboardList} />
            Dashboard
          </h1>
          <p className={styles.pageSubtitle}>
            Welcome back! Here's your pharmacy overview.
          </p>
        </div>
        <Link to="/admin/products" className={styles.primaryBtn}>
          <FontAwesomeIcon icon={faBoxes} /> Manage Products
        </Link>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {statCards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className={styles.statCard}
            style={{ '--accent': card.color }}
          >
            <div className={styles.statIcon} style={{ background: card.bg, color: card.color }}>
              <FontAwesomeIcon icon={card.icon} />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{card.value}</div>
              <div className={styles.statLabel}>{card.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Two Column Section */}
      <div className={styles.grid2}>
        {/* Recent Orders */}
        <div className={styles.card}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <FontAwesomeIcon icon={faShoppingCart} />
              Recent Orders
            </h2>
            <Link to="/admin/orders" className={styles.viewAll}>
              View All <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No orders yet</p>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              {recentOrders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderBottom: '1px solid #f3f4f6',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>
                      {order.order_number}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {order.users?.full_name || order.users?.email || 'Customer'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: '#059669', fontSize: '14px' }}>
                      ₦{parseFloat(order.total || 0).toLocaleString()}
                    </div>
                    <span className={`${styles.badge} ${getBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className={styles.card}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: '#f59e0b' }} />
              Low Stock Alerts
            </h2>
            <Link to="/admin/products" className={styles.viewAll}>
              Manage <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <div className={styles.emptyState}>
              <p><FontAwesomeIcon icon={faCheckCircle} style={{ color: '#10b981' }} /> All products well stocked</p>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              {lowStock.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderBottom: '1px solid #f3f4f6',
                  }}
                >
                  <span style={{ fontWeight: 500, color: '#111827', fontSize: '14px' }}>
                    {product.name}
                  </span>
                  <span
                    className={styles.badge}
                    style={{
                      background: product.stock_quantity <= 5 ? '#fef2f2' : '#fffbeb',
                      color: product.stock_quantity <= 5 ? '#dc2626' : '#d97706',
                    }}
                  >
                    {product.stock_quantity} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Period Summary */}
      <div className={styles.card}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faDollarSign} />
            Period Summary
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div className={styles.statCard} style={{ padding: '16px', cursor: 'default' }}>
            <div className={styles.statInfo}>
              <div className={styles.statLabel}>Today's Orders</div>
              <div className={styles.statValue} style={{ fontSize: '22px' }}>
                {stats?.todayOrders || 0}
              </div>
            </div>
          </div>
          <div className={styles.statCard} style={{ padding: '16px', cursor: 'default' }}>
            <div className={styles.statInfo}>
              <div className={styles.statLabel}>Pending Orders</div>
              <div className={styles.statValue} style={{ fontSize: '22px' }}>
                {stats?.pendingOrders || 0}
              </div>
            </div>
          </div>
          <div className={styles.statCard} style={{ padding: '16px', cursor: 'default' }}>
            <div className={styles.statInfo}>
              <div className={styles.statLabel}>Pending Prescriptions</div>
              <div className={styles.statValue} style={{ fontSize: '22px' }}>
                {stats?.pendingPrescriptions || 0}
              </div>
            </div>
          </div>
          <div className={styles.statCard} style={{ padding: '16px', cursor: 'default' }}>
            <div className={styles.statInfo}>
              <div className={styles.statLabel}>Total Revenue</div>
              <div className={styles.statValue} style={{ fontSize: '22px', color: '#059669' }}>
                ₦{(stats?.totalRevenue || 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
