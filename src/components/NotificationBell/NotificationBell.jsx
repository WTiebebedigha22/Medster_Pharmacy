import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faCheckDouble,
  faGift,
  faTruck,
  faBoxOpen,
  faBan,
  faRotateLeft,
  faEnvelope,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import styles from './NotificationBell.module.css';

const TYPE_ICONS = {
  promotion: faGift,
  order_confirmation: faBoxOpen,
  delivery_notice: faTruck,
  order_cancellation: faBan,
  return_warning: faRotateLeft,
  email: faEnvelope,
};

const TYPE_LABELS = {
  promotion: 'Promotion',
  order_confirmation: 'Order Confirmed',
  delivery_notice: 'Delivery Update',
  order_cancellation: 'Order Cancelled',
  return_warning: 'Return Reminder',
  email: 'Email',
};

function formatTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

const NotificationBell = () => {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      fetchNotifications();
      fetchUnreadCount();
    }
  };

  const handleItemClick = (n) => {
    if (!n.is_read) markAsRead(n.id);
  };

  const recent = notifications.slice(0, 6);

  return (
    <div className={styles.bell} ref={containerRef}>
      <button
        className={`${styles.bell__button} ${open ? styles['bell__button--active'] : ''}`}
        onClick={toggleOpen}
        aria-label="Notifications"
      >
        <FontAwesomeIcon icon={faBell} />
        <span className={styles['bell__text']}>Notify</span>
        {unreadCount > 0 && (
          <span className={styles.bell__badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.dropdown__header}>
            <span className={styles.dropdown__title}>Notifications</span>
            {unreadCount > 0 && (
              <button className={styles.dropdown__markall} onClick={markAllAsRead}>
                <FontAwesomeIcon icon={faCheckDouble} /> Mark all read
              </button>
            )}
          </div>

          <div className={styles.dropdown__body}>
            {recent.length === 0 ? (
              <div className={styles.empty}>
                <FontAwesomeIcon icon={faBell} className={styles.empty__icon} />
                <p>No notifications yet</p>
              </div>
            ) : (
              recent.map((n) => (
                <NavLink
                  key={n.id}
                  to="/notifications"
                  className={`${styles.item} ${!n.is_read ? styles['item--unread'] : ''}`}
                  onClick={() => handleItemClick(n)}
                >
<span className={`${styles.item__icon} ${styles['item__icon--' + (n.type || 'email')] || styles['item__icon--email']}`}>
                    <FontAwesomeIcon icon={TYPE_ICONS[n.type] || faEnvelope} />
                  </span>
                  <span className={styles.item__content}>
                    <span className={styles.item__title}>{n.title || 'Notification'}</span>
                    <span className={styles.item__message}>{n.message}</span>
                    <span className={styles.item__meta}>
                      {TYPE_LABELS[n.type] || n.type} · {formatTime(n.created_at)}
                    </span>
                  </span>
                  {!n.is_read && <span className={styles.item__dot} />}
                </NavLink>
              ))
            )}
          </div>

          <NavLink to="/notifications" className={styles.dropdown__viewall} onClick={() => setOpen(false)}>
            View all notifications <FontAwesomeIcon icon={faChevronRight} />
          </NavLink>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
