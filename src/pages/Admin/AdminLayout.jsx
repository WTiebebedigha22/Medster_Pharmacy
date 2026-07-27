import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartPie,
  faBoxes,
  faShoppingCart,
  faPrescriptionBottle,
  faUsers,
  faUserShield,
  faTags,
  faChartBar,
  faCog,
  faClipboardList,
  faSignOutAlt,
  faBars,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import styles from './AdminLayout.module.css';

const navSections = [
  {
    title: 'Main',
    items: [
      { path: '/admin', icon: faChartPie, label: 'Dashboard', end: true },
      { path: '/admin/products', icon: faBoxes, label: 'Products' },
      { path: '/admin/orders', icon: faShoppingCart, label: 'Orders' },
      { path: '/admin/prescriptions', icon: faPrescriptionBottle, label: 'Prescriptions' },
    ],
  },
  {
    title: 'Management',
    items: [
      { path: '/admin/users', icon: faUsers, label: 'Customers' },
      { path: '/admin/admins', icon: faUserShield, label: 'Administrators' },
      { path: '/admin/coupons', icon: faTags, label: 'Coupons' },
    ],
  },
  {
    title: 'Insights',
    items: [
      { path: '/admin/reports', icon: faChartBar, label: 'Reports' },
      { path: '/admin/audit-logs', icon: faClipboardList, label: 'Audit Logs' },
    ],
  },
  {
    title: 'System',
    items: [
      { path: '/admin/settings', icon: faCog, label: 'Settings' },
    ],
  },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className={styles.layout}>
      {/* Mobile overlay */}
      {sidebarOpen && <div className={styles.overlay} onClick={closeSidebar} />}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <NavLink to="/admin" className={styles.sidebarLogo} onClick={closeSidebar}>
            <img src="/images/logo.png" alt="Medster" />
            Medster Admin
          </NavLink>
        </div>

        <nav className={styles.sidebarNav}>
          {navSections.map((section) => (
            <div key={section.title} className={styles.navSection}>
              <div className={styles.navSectionTitle}>{section.title}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `${styles.navItem} ${isActive ? styles.active : ''}`
                  }
                  onClick={closeSidebar}
                >
                  <FontAwesomeIcon icon={item.icon} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Top Bar */}
        <div className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <button
              className={styles.menuToggle}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} />
            </button>
            <h1 className={styles.pageTitle}>
              <Outlet context={{ pageTitle: true }} />
            </h1>
          </div>

          <div className={styles.topBarRight}>
            <div className={styles.adminInfo}>
              <div className={styles.adminAvatar}>
                {user?.full_name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div>
                <div className={styles.adminName}>{user?.full_name || 'Admin'}</div>
                <div className={styles.adminRole}>{user?.role || 'admin'}</div>
              </div>
            </div>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOutAlt} /> Sign Out
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

