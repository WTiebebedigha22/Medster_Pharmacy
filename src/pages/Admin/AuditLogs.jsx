import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList,
  faSearch,
  faFilter,
  faSpinner,
  faUser,
  faCalendarAlt,
  faChevronDown,
  faChevronUp,
  faTimes,
  faDownload,
} from '@fortawesome/free-solid-svg-icons';
import styles from './AdminStyles.module.css';

const API_BASE = '/api/admin';

const ACTION_COLORS = {
  create_product: { bg: '#dbeafe', color: '#1e40af', label: 'Product Created' },
  update_product: { bg: '#fef3c7', color: '#92400e', label: 'Product Updated' },
  delete_product: { bg: '#fee2e2', color: '#991b1b', label: 'Product Deleted' },
  create_category: { bg: '#dbeafe', color: '#1e40af', label: 'Category Created' },
  update_category: { bg: '#fef3c7', color: '#92400e', label: 'Category Updated' },
  delete_category: { bg: '#fee2e2', color: '#991b1b', label: 'Category Deleted' },
  update_order_status: { bg: '#e0e7ff', color: '#3730a3', label: 'Order Status Changed' },
  process_order: { bg: '#fef3c7', color: '#92400e', label: 'Order Processed' },
  ship_order: { bg: '#dbeafe', color: '#1e40af', label: 'Order Shipped' },
  deliver_order: { bg: '#d1fae5', color: '#065f46', label: 'Order Delivered' },
  cancel_order: { bg: '#fee2e2', color: '#991b1b', label: 'Order Cancelled' },
  add_tracking: { bg: '#e0e7ff', color: '#3730a3', label: 'Tracking Added' },
  create_coupon: { bg: '#dbeafe', color: '#1e40af', label: 'Coupon Created' },
  update_coupon: { bg: '#fef3c7', color: '#92400e', label: 'Coupon Updated' },
  delete_coupon: { bg: '#fee2e2', color: '#991b1b', label: 'Coupon Deleted' },
  toggle_coupon: { bg: '#f3e8ff', color: '#6b21a8', label: 'Coupon Toggled' },
  verify_prescription: { bg: '#d1fae5', color: '#065f46', label: 'Prescription Verified' },
  add_prescription_notes: { bg: '#fef3c7', color: '#92400e', label: 'Prescription Notes' },
  update_user: { bg: '#fef3c7', color: '#92400e', label: 'User Updated' },
  delete_user: { bg: '#fee2e2', color: '#991b1b', label: 'User Deleted' },
  suspend_user: { bg: '#fee2e2', color: '#991b1b', label: 'User Suspended' },
  activate_user: { bg: '#d1fae5', color: '#065f46', label: 'User Activated' },
  notify_user: { bg: '#e0e7ff', color: '#3730a3', label: 'User Notified' },
  create_admin: { bg: '#fee2e2', color: '#991b1b', label: 'Admin Created' },
  update_admin: { bg: '#fef3c7', color: '#92400e', label: 'Admin Updated' },
  remove_admin: { bg: '#fee2e2', color: '#991b1b', label: 'Admin Removed' },
  update_admin_permissions: { bg: '#f3e8ff', color: '#6b21a8', label: 'Permissions Updated' },
  update_inventory: { bg: '#fef3c7', color: '#92400e', label: 'Inventory Updated' },
  bulk_import_products: { bg: '#dbeafe', color: '#1e40af', label: 'Bulk Import' },
  update_settings: { bg: '#f3e8ff', color: '#6b21a8', label: 'Settings Updated' },
  toggle_maintenance: { bg: '#fee2e2', color: '#991b1b', label: 'Maintenance Toggled' },
  backup_data: { bg: '#d1fae5', color: '#065f46', label: 'Data Backup' },
  export_data: { bg: '#e0e7ff', color: '#3730a3', label: 'Data Exported' },
};

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [availableActions, setAvailableActions] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const token = localStorage.getItem('medster_access_token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => { fetchLogs(); }, [page, actionFilter, entityFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: '30' });
      if (actionFilter) params.append('action', actionFilter);
      if (entityFilter) params.append('entityType', entityFilter);

      const res = await fetch(`${API_BASE}/audit-logs?${params}`, { headers });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setLogs(data.logs || []);
      setTotalPages(data.totalPages || 1);
      setTotalLogs(data.total || 0);
      if (data.filters?.actions) setAvailableActions(data.filters.actions);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const getActionStyle = (action) => {
    return ACTION_COLORS[action] || { bg: '#f3f4f6', color: '#374151', label: action.replace(/_/g, ' ') };
  };

  const getEntityIcon = (type) => {
    const icons = {
      products: '📦', orders: '🛒', users: '👤', prescriptions: '💊',
      coupons: '🏷️', categories: '📁', system_settings: '⚙️', admin_roles: '🔐',
      system: '🖥️',
    };
    return icons[type] || '📋';
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const filteredLogs = logs.filter(log =>
    !search ||
    log.action?.toLowerCase().includes(search.toLowerCase()) ||
    log.entity_type?.toLowerCase().includes(search.toLowerCase()) ||
    log.details?.toString().toLowerCase().includes(search.toLowerCase()) ||
    log.users?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const entityTypes = ['products', 'orders', 'users', 'prescriptions', 'coupons', 'categories', 'system_settings', 'admin_roles', 'system'];

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1><FontAwesomeIcon icon={faClipboardList} /> Audit Logs</h1>
          <p className={styles.pageSubtitle}>
            Track all system activities and changes ({totalLogs} total entries)
          </p>
        </div>
        <button className={styles.secondaryBtn} onClick={() => window.print()}>
          <FontAwesomeIcon icon={faDownload} /> Export
        </button>
      </div>

      {/* Search and Filters */}
      <div className={styles.searchBox}>
        <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
        <input
          className={styles.searchInput}
          placeholder="Search audit logs by action, entity, or details..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.filters}>
        <button
          className={`${styles.filterBtn} ${showFilters ? styles.filterBtnActive : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <FontAwesomeIcon icon={faFilter} /> Filters
        </button>
        {actionFilter && (
          <span className={styles.badge} style={{ background: '#dbeafe', color: '#1e40af', cursor: 'pointer' }}
            onClick={() => { setActionFilter(''); setPage(1); }}>
            Action: {actionFilter} <FontAwesomeIcon icon={faTimes} style={{ marginLeft: '4px' }} />
          </span>
        )}
        {entityFilter && (
          <span className={styles.badge} style={{ background: '#fef3c7', color: '#92400e', cursor: 'pointer' }}
            onClick={() => { setEntityFilter(''); setPage(1); }}>
            Entity: {entityFilter} <FontAwesomeIcon icon={faTimes} style={{ marginLeft: '4px' }} />
          </span>
        )}
      </div>

      {showFilters && (
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div className={styles.field} style={{ minWidth: '200px' }}>
            <label>Action Type</label>
            <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }}>
              <option value="">All Actions</option>
              {availableActions.map(a => (
                <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div className={styles.field} style={{ minWidth: '200px' }}>
            <label>Entity Type</label>
            <select value={entityFilter} onChange={e => { setEntityFilter(e.target.value); setPage(1); }}>
              <option value="">All Entities</option>
              {entityTypes.map(t => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Logs */}
      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div> Loading audit logs...
        </div>
      ) : error ? (
        <div className={styles.emptyState}>
          <h3>Error loading logs</h3>
          <p>{error}</p>
          <button className={styles.primaryBtn} onClick={fetchLogs} style={{ marginTop: '16px' }}>
            <FontAwesomeIcon icon={faSpinner} /> Retry
          </button>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className={styles.emptyState}>
          <FontAwesomeIcon icon={faClipboardList} style={{ fontSize: '48px', opacity: 0.5 }} />
          <h3>{search || actionFilter || entityFilter ? 'No matching logs' : 'No audit logs yet'}</h3>
          <p>
            {search || actionFilter || entityFilter
              ? 'Try adjusting your filters or search terms'
              : 'Audit logs will appear here as admin actions are performed'}
          </p>
        </div>
      ) : (
        <>
          {/* Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredLogs.map(log => {
              const actionStyle = getActionStyle(log.action);
              const isExpanded = expandedId === log.id;

              return (
                <div
                  key={log.id}
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    border: '1px solid #f3f4f6',
                    overflow: 'hidden',
                    transition: 'box-shadow 0.2s',
                    cursor: 'pointer',
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px 18px',
                  }}>
                    {/* Timeline dot */}
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: actionStyle.color,
                      flexShrink: 0,
                    }} />

                    {/* Action badge */}
                    <span className={styles.badge} style={{
                      background: actionStyle.bg,
                      color: actionStyle.color,
                      fontSize: '12px',
                      whiteSpace: 'nowrap',
                      minWidth: '120px',
                    }}>
                      {actionStyle.label}
                    </span>

                    {/* Entity */}
                    <span style={{ fontSize: '20px', flexShrink: 0 }}>
                      {getEntityIcon(log.entity_type)}
                    </span>
                    <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500, minWidth: '80px' }}>
                      {log.entity_type?.replace(/_/g, ' ')}
                    </span>

                    {/* User */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                      <FontAwesomeIcon icon={faUser} style={{ color: '#9ca3af', fontSize: '12px' }} />
                      <span style={{ fontSize: '13px', color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {log.users?.full_name || log.users?.email || 'System'}
                      </span>
                    </div>

                    {/* Time */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, color: '#9ca3af', fontSize: '12px' }}>
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      <span>{formatDate(log.created_at)}</span>
                    </div>

                    {/* Expand */}
                    <FontAwesomeIcon
                      icon={isExpanded ? faChevronUp : faChevronDown}
                      style={{ color: '#9ca3af', fontSize: '12px', flexShrink: 0 }}
                    />
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div style={{
                      padding: '16px 18px',
                      borderTop: '1px solid #f3f4f6',
                      background: '#f9fafb',
                      fontSize: '13px',
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        <div>
                          <strong style={{ color: '#6b7280' }}>Action:</strong>
                          <span style={{ color: '#111827', marginLeft: '8px' }}>{log.action}</span>
                        </div>
                        <div>
                          <strong style={{ color: '#6b7280' }}>Entity:</strong>
                          <span style={{ color: '#111827', marginLeft: '8px' }}>{log.entity_type}</span>
                        </div>
                        <div>
                          <strong style={{ color: '#6b7280' }}>Entity ID:</strong>
                          <span style={{ color: '#111827', marginLeft: '8px', fontFamily: 'monospace' }}>
                            {log.entity_id || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <strong style={{ color: '#6b7280' }}>Date:</strong>
                          <span style={{ color: '#111827', marginLeft: '8px' }}>
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <strong style={{ color: '#6b7280' }}>User:</strong>
                          <span style={{ color: '#111827', marginLeft: '8px' }}>
                            {log.users?.full_name || log.users?.email || 'System'} ({log.user_id?.slice(0, 8) || 'N/A'})
                          </span>
                        </div>
                        <div>
                          <strong style={{ color: '#6b7280' }}>IP:</strong>
                          <span style={{ color: '#111827', marginLeft: '8px' }}>{log.ip_address || 'N/A'}</span>
                        </div>
                      </div>

                      {log.details && Object.keys(log.details).length > 0 && (
                        <div style={{ marginTop: '8px' }}>
                          <strong style={{ color: '#6b7280', display: 'block', marginBottom: '6px' }}>Details:</strong>
                          <pre style={{
                            background: '#fff',
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb',
                            fontSize: '12px',
                            color: '#374151',
                            overflow: 'auto',
                            maxHeight: '200px',
                            margin: 0,
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'monospace',
                          }}>
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      )}

                      {log.user_agent && (
                        <div style={{ marginTop: '8px', color: '#9ca3af', fontSize: '11px' }}>
                          <strong>User Agent:</strong> {log.user_agent}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Previous
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    className={`${styles.pageBtn} ${page === pageNum ? styles.pageBtnActive : ''}`}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                className={styles.pageBtn}
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AuditLogs;
