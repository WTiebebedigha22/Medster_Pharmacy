import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faCheckDouble,
  faTrash,
  faGift,
  faTruck,
  faBoxOpen,
  faBan,
  faRotateLeft,
  faEnvelope,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import styles from './Notifications.module.css';

const TYPE_ICONS = {
  promotion: faGift,
  order_confirmation: faBoxOpen,
  delivery_notice: faTruck,
  order_cancellation: faBan,
  return_warning: faRotateLeft,
  email: faEnvelope,
};

const TYPE_LABELS = {
  promotion: 'Promotions',
  order_confirmation: 'Order Confirmed',
  delivery_notice: 'Delivery Updates',
  order_cancellation: 'Order Cancelled',
  return_warning: 'Return Reminders',
  email: 'Emails',
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'order_confirmation', label: 'Order Confirmed' },
  { key: 'delivery_notice', label: 'Delivery' },
  { key: 'order_cancellation', label: 'Cancellations' },
  { key: 'return_warning', label: 'Returns' },
  { key: 'promotion', label: 'Promotions' },
  { key: 'email', label: 'Emails' },
];

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const NotificationsPage = () => {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user, fetchNotifications]);

  const filtered = activeFilter === 'all'
    ? notifications
    : notifications.filter(n => n.type === activeFilter);

  const handleFilter = (key) => {
    setActiveFilter(key);
    fetchNotifications(key === 'all' ? '' : key);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Notifications</h1>
            <p className={styles.subtitle}>
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                : 'You are all caught up'}
            </p>
          </div>
          <div className={styles.actions}>
            <button
              className={styles.markallBtn}
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <FontAwesomeIcon icon={faCheckDouble} /> Mark all read
            </button>
          </div>
        </div>

        <div className={styles.filters}>
          {FILTERS.map(filter => (
            <button
              key={filter.key}
              className={`${styles.filter} ${activeFilter === filter.key ? styles['filter--active'] : ''}`}
              onClick={() => handleFilter(filter.key)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className={styles.list}>
          {loading && notifications.length === 0 && (
            <div className={styles.empty}>
              <div className={styles.spinner} />
              <p>Loading notifications...</p>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className={styles.empty}>
              <FontAwesomeIcon icon={faBell} className={styles.empty__icon} />
              <h3>No notifications</h3>
              <p>You don&apos;t have any notifications in this category yet.</p>
            </div>
          )}

          {filtered.map(n => (
            <div
              key={n.id}
              className={`${styles.item} ${!n.is_read ? styles['item--unread'] : ''}`}
            >
              <span className={`${styles.item__icon} ${styles['item__icon--' + (n.type || 'email')] || ''}`}>
                <FontAwesomeIcon icon={TYPE_ICONS[n.type] || faEnvelope} />
              </span>

              <div className={styles.item__content}>
                <div className={styles.item__top}>
                  <span className={styles.item__title}>{n.title || 'Notification'}</span>
                  <span className={styles.item__time}>{formatDate(n.created_at)}</span>
                </div>
                <span className={styles.item__type}>
                  {TYPE_LABELS[n.type] || n.type}
                </span>
                <p className={styles.item__message}>{n.message}</p>
                {n.data?.order_number && (
                  <span className={styles.item__ref}>Order: {n.data.order_number}</span>
                )}
              </div>

              <div className={styles.item__actions}>
                {!n.is_read && (
                  <button
                    className={styles.actionBtn}
                    title="Mark as read"
                    onClick={() => markAsRead(n.id)}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} />
                  </button>
                )}
                <button
                  className={`${styles.actionBtn} ${styles['actionBtn--danger']}`}
                  title="Delete"
                  onClick={() => deleteNotification(n.id)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
