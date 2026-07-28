import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserShield,
  faEdit,
  faTrash,
  faSearch,
  faCheckCircle,
  faTimesCircle,
  faShieldAlt,
  faKey,
  faSpinner,
  faUserPlus,
  faCalendarAlt,
  faChevronDown,
  faChevronUp,
  faCrown,
  faUserCog,
} from '@fortawesome/free-solid-svg-icons';
import styles from './AdminStyles.module.css';

const API_BASE = '/api/admin';

const ROLES = [
  { value: 'admin', label: 'Administrator', description: 'Full system access' },
  { value: 'pharmacist', label: 'Pharmacist', description: 'Prescription & order management' },
  { value: 'manager', label: 'Manager', description: 'Products & inventory management' },
];

const DEFAULT_PERMISSIONS = {
  admin: ['all'],
  pharmacist: ['view_orders', 'update_orders', 'view_prescriptions', 'verify_prescriptions', 'view_products'],
  manager: ['view_products', 'manage_products', 'view_inventory', 'manage_inventory', 'view_orders'],
};

const Administrators = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    role: 'admin',
    permissions: [],
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem('medster_access_token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => { fetchAdmins(); }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/admins`, { headers });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setAdmins(data.admins || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      full_name: admin.full_name || '',
      email: admin.email || '',
      password: '',
      phone: admin.phone || '',
      role: admin.role || 'admin',
      permissions: admin.adminRole?.permissions || DEFAULT_PERMISSIONS[admin.role] || [],
    });
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingAdmin(null);
    setFormData({
      full_name: '',
      email: '',
      password: '',
      phone: '',
      role: 'admin',
      permissions: [],
    });
    setFormErrors({});
    setShowForm(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.full_name.trim()) errors.full_name = 'Full name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email';
    if (!editingAdmin && !formData.password) errors.password = 'Password is required';
    else if (!editingAdmin && formData.password.length < 8) errors.password = 'Min 8 characters';
    if (!editingAdmin && !formData.phone.trim()) errors.phone = 'Phone is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (editingAdmin) {
        const res = await fetch(`${API_BASE}/admins/${editingAdmin.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            full_name: formData.full_name,
            phone: formData.phone,
            role: formData.role,
          }),
        });
        if (!res.ok) throw new Error('Failed to update');

        // Update permissions
        await fetch(`${API_BASE}/admins/${editingAdmin.id}/permissions`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            permissions: formData.permissions,
            role_label: formData.role,
          }),
        });
      } else {
        const res = await fetch(`${API_BASE}/admins`, {
          method: 'POST',
          headers,
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Failed to create');
      }

      setShowForm(false);
      fetchAdmins();
    } catch (err) { alert(err.message); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (admin) => {
    if (!confirm(`Remove admin privileges from ${admin.full_name || admin.email}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/admins/${admin.id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Failed to remove');
      fetchAdmins();
    } catch (err) { alert(err.message); }
  };

  const togglePermission = (perm) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  const handleRoleChange = (role) => {
    setFormData(prev => ({
      ...prev,
      role,
      permissions: DEFAULT_PERMISSIONS[role] || [],
    }));
  };

  const getRoleBadge = (role) => {
    const map = {
      admin: { bg: '#fef2f2', color: '#dc2626', icon: faCrown },
      pharmacist: { bg: '#f0fdf4', color: '#059669', icon: faShieldAlt },
      manager: { bg: '#eff6ff', color: '#2563eb', icon: faUserCog },
    };
    const m = map[role] || { bg: '#f3f4f6', color: '#6b7280', icon: faUserShield };
    return (
      <span className={styles.badge} style={{ background: m.bg, color: m.color }}>
        <FontAwesomeIcon icon={m.icon} style={{ marginRight: '4px' }} />
        {role}
      </span>
    );
  };

  const filteredAdmins = admins.filter(a =>
    !search || a.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase())
  );

  const allPermissions = [
    { id: 'all', label: 'Full Access (All)', description: 'All permissions' },
    { id: 'view_products', label: 'View Products', description: 'View product catalog' },
    { id: 'manage_products', label: 'Manage Products', description: 'Create, edit, delete products' },
    { id: 'view_orders', label: 'View Orders', description: 'View all orders' },
    { id: 'update_orders', label: 'Update Orders', description: 'Update order status' },
    { id: 'view_prescriptions', label: 'View Prescriptions', description: 'View all prescriptions' },
    { id: 'verify_prescriptions', label: 'Verify Prescriptions', description: 'Approve/reject prescriptions' },
    { id: 'view_users', label: 'View Customers', description: 'View customer list' },
    { id: 'manage_users', label: 'Manage Customers', description: 'Edit/suspend customers' },
    { id: 'view_admins', label: 'View Admins', description: 'View admin list' },
    { id: 'manage_admins', label: 'Manage Admins', description: 'Create/edit/remove admins' },
    { id: 'view_coupons', label: 'View Coupons', description: 'View coupon list' },
    { id: 'manage_coupons', label: 'Manage Coupons', description: 'Create/edit/delete coupons' },
    { id: 'view_reports', label: 'View Reports', description: 'View analytics & reports' },
    { id: 'manage_settings', label: 'Manage Settings', description: 'Update system settings' },
    { id: 'view_audit_logs', label: 'View Audit Logs', description: 'View audit trail' },
  ];

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1><FontAwesomeIcon icon={faUserShield} /> Administrators</h1>
          <p className={styles.pageSubtitle}>Manage admin accounts and permissions</p>
        </div>
        <button className={styles.primaryBtn} onClick={handleCreate}>
          <FontAwesomeIcon icon={faUserPlus} /> Add Admin
        </button>
      </div>

      <div className={styles.searchBox}>
        <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
        <input
          className={styles.searchInput}
          placeholder="Search administrators by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div> Loading administrators...
        </div>
      ) : error ? (
        <div className={styles.emptyState}>
          <h3>Error loading administrators</h3>
          <p>{error}</p>
          <button className={styles.primaryBtn} onClick={fetchAdmins} style={{ marginTop: '16px' }}>
            <FontAwesomeIcon icon={faSpinner} /> Retry
          </button>
        </div>
      ) : filteredAdmins.length === 0 ? (
        <div className={styles.emptyState}>
          <FontAwesomeIcon icon={faUserShield} style={{ fontSize: '48px', opacity: 0.5 }} />
          <h3>{search ? 'No administrators match your search' : 'No administrators yet'}</h3>
          <p>{search ? 'Try a different search term' : 'Add your first administrator to get started'}</p>
          {!search && (
            <button className={styles.primaryBtn} onClick={handleCreate} style={{ marginTop: '16px' }}>
              <FontAwesomeIcon icon={faUserPlus} /> Add Admin
            </button>
          )}
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Admin</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.map(admin => (
                <React.Fragment key={admin.id}>
                  <tr>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          background: admin.role === 'admin' ? '#dc2626' : '#059669',
                          color: '#fff', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontWeight: 700, fontSize: '14px',
                        }}>
                          {admin.full_name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#111827' }}>
                            {admin.full_name || 'Unnamed'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>{admin.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', color: '#374151' }}>
                        {admin.phone || 'N/A'}
                      </div>
                    </td>
                    <td>{getRoleBadge(admin.role)}</td>
                    <td>
                      <span className={`${styles.badge} ${admin.is_active ? styles.badgeSuccess : styles.badgeDanger}`}>
                        <FontAwesomeIcon icon={admin.is_active ? faCheckCircle : faTimesCircle} style={{ marginRight: '4px' }} />
                        {admin.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', color: '#6b7280' }}>
                      <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '6px' }} />
                      {new Date(admin.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <button className={styles.primaryBtn} style={{ padding: '6px 12px', fontSize: '12px', marginRight: '6px' }}
                        onClick={() => handleEdit(admin)}>
                        <FontAwesomeIcon icon={faEdit} /> Edit
                      </button>
                      <button className={styles.dangerBtn} style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => handleDelete(admin)}>
                        <FontAwesomeIcon icon={faTrash} /> Remove
                      </button>
                      <button
                        onClick={() => setExpandedId(expandedId === admin.id ? null : admin.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', marginLeft: '6px' }}>
                        <FontAwesomeIcon icon={expandedId === admin.id ? faChevronUp : faChevronDown} />
                      </button>
                    </td>
                  </tr>
                  {expandedId === admin.id && (
                    <tr>
                      <td colSpan={6} style={{ padding: '16px 24px', background: '#f9fafb' }}>
                        <div style={{ fontSize: '13px', color: '#374151' }}>
                          <strong>Permissions:</strong>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                            {(admin.adminRole?.permissions || ['all']).map(p => (
                              <span key={p} className={styles.badge} style={{ background: '#e0f2fe', color: '#0369a1' }}>
                                {p.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                          {admin.adminRole?.updated_at && (
                            <div style={{ marginTop: '8px', color: '#9ca3af' }}>
                              Last updated: {new Date(admin.adminRole.updated_at).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.modalCard} onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className={styles.modalHeader}>
              <h2>
                <FontAwesomeIcon icon={editingAdmin ? faUserCog : faUserPlus} />
                {' '}{editingAdmin ? 'Edit Administrator' : 'Add Administrator'}
              </h2>
              <button className={styles.modalClose} onClick={() => setShowForm(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <div className={`${styles.field} ${formErrors.full_name ? styles.fieldError : ''}`}>
                  <label>Full Name *</label>
                  <input value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
                  {formErrors.full_name && <span className={styles.errorText}>{formErrors.full_name}</span>}
                </div>
                <div className={`${styles.field} ${formErrors.email ? styles.fieldError : ''}`}>
                  <label>Email *</label>
                  <input type="email" value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    disabled={!!editingAdmin} />
                  {formErrors.email && <span className={styles.errorText}>{formErrors.email}</span>}
                </div>
                {!editingAdmin && (
                  <>
                    <div className={`${styles.field} ${formErrors.password ? styles.fieldError : ''}`}>
                      <label>Password *</label>
                      <input type="password" value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })} />
                      {formErrors.password && <span className={styles.errorText}>{formErrors.password}</span>}
                    </div>
                    <div className={`${styles.field} ${formErrors.phone ? styles.fieldError : ''}`}>
                      <label>Phone *</label>
                      <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                      {formErrors.phone && <span className={styles.errorText}>{formErrors.phone}</span>}
                    </div>
                  </>
                )}
                <div className={styles.field}>
                  <label>Role</label>
                  <select value={formData.role} onChange={e => handleRoleChange(e.target.value)}>
                    {ROLES.map(r => (
                      <option key={r.value} value={r.value}>{r.label} - {r.description}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Permissions */}
              <div className={styles.field} style={{ marginTop: '20px' }}>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
                  <FontAwesomeIcon icon={faKey} style={{ marginRight: '6px' }} />
                  Permissions
                </label>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '8px', padding: '12px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb',
                }}>
                  {allPermissions.map(perm => (
                    <label key={perm.id} className={styles.checkbox} style={{ fontSize: '13px' }}>
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes('all') || formData.permissions.includes(perm.id)}
                        onChange={() => {
                          if (perm.id === 'all') {
                            setFormData(prev => ({
                              ...prev,
                              permissions: prev.permissions.includes('all') ? [] : ['all'],
                            }));
                          } else {
                            togglePermission(perm.id);
                          }
                        }}
                        disabled={formData.permissions.includes('all') && perm.id !== 'all'}
                      />
                      <span>{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryBtn} disabled={submitting}>
                  {submitting ? (
                    <><FontAwesomeIcon icon={faSpinner} spin /> Saving...</>
                  ) : (
                    <><FontAwesomeIcon icon={editingAdmin ? faEdit : faUserPlus} /> {editingAdmin ? 'Update' : 'Create'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Administrators;
