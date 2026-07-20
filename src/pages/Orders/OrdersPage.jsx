/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./OrdersPage.module.css";
import { api } from "../../lib/api";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBox,
  faPackage,
  faTruck,
  faCheckCircle,
  faClock,
  faTimesCircle,
  faSearch,
  faFilter,
  faSort,
  faEye,
  faArrowLeft,
  faCalendarAlt,
  faTag,
  faReceipt,
  faPrint,
  faDownload,
  faStar,
  faStarHalfAlt,
  faShoppingBag,
  faRefresh,
  faChevronDown,
  faChevronUp,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await api.getMyOrders();
        if (!cancelled) {
          // Sort orders by date
          const sortedOrders = (res.orders || []).sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          );
          setOrders(sortedOrders);
        }
      } catch {
        if (!cancelled) setOrders([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Get status badge configuration
  const getStatusConfig = (status) => {
    const statusMap = {
      'pending': { label: 'Pending', icon: faClock, color: '#FFA94D', bg: '#FFF8E1' },
      'processing': { label: 'Processing', icon: faRefresh, color: '#4DABF7', bg: '#E3F2FD' },
      'shipped': { label: 'Shipped', icon: faTruck, color: '#748FFC', bg: '#EDF2FF' },
      'delivered': { label: 'Delivered', icon: faCheckCircle, color: '#51CF66', bg: '#E8F5E9' },
      'cancelled': { label: 'Cancelled', icon: faTimesCircle, color: '#FF6B6B', bg: '#FFF0F0' },
      'returned': { label: 'Returned', icon: faPackage, color: '#FFA94D', bg: '#FFF8E1' },
    };
    return statusMap[status?.toLowerCase()] || { label: status, icon: faBox, color: '#565959', bg: '#F7F8FA' };
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status?.toLowerCase() === filterStatus;
    const matchesSearch = searchTerm === '' || 
      order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items?.some(item => item.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortOrder === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else if (sortOrder === 'total-high') {
      return (b.total || 0) - (a.total || 0);
    } else if (sortOrder === 'total-low') {
      return (a.total || 0) - (b.total || 0);
    }
    return 0;
  });

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    // Navigate to order details or open modal
    navigate(`/order/${order.id}`);
  };

  const getOrderTotal = (order) => {
    if (order.total) return order.total;
    if (order.items) {
      return order.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    }
    return 0;
  };

  const getItemCount = (order) => {
    if (order.items) {
      return order.items.reduce((sum, item) => sum + item.qty, 0);
    }
    return 0;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.backButton} onClick={() => navigate(-1)}>
              <FontAwesomeIcon icon={faArrowLeft} />
              Back
            </button>
            <div>
              <h1 className={styles.title}>
                <FontAwesomeIcon icon={faReceipt} />
                My Orders
              </h1>
              <p className={styles.subtitle}>
                Track and manage your orders
              </p>
            </div>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.orderCount}>
              {orders.length} {orders.length === 1 ? 'order' : 'orders'}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.totalOrders}`}>
            <div className={styles.statIcon}>
              <FontAwesomeIcon icon={faShoppingBag} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statNumber}>{orders.length}</span>
              <span className={styles.statLabel}>Total Orders</span>
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.deliveredOrders}`}>
            <div className={styles.statIcon}>
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statNumber}>
                {orders.filter(o => o.status?.toLowerCase() === 'delivered').length}
              </span>
              <span className={styles.statLabel}>Delivered</span>
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.pendingOrders}`}>
            <div className={styles.statIcon}>
              <FontAwesomeIcon icon={faClock} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statNumber}>
                {orders.filter(o => o.status?.toLowerCase() === 'pending' || o.status?.toLowerCase() === 'processing').length}
              </span>
              <span className={styles.statLabel}>In Progress</span>
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.shippedOrders}`}>
            <div className={styles.statIcon}>
              <FontAwesomeIcon icon={faTruck} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statNumber}>
                {orders.filter(o => o.status?.toLowerCase() === 'shipped').length}
              </span>
              <span className={styles.statLabel}>On the Way</span>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className={styles.filtersSection}>
          <div className={styles.searchBox}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search orders by ID or product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterActions}>
            <button 
              className={styles.filterToggle}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FontAwesomeIcon icon={faFilter} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className={styles.filtersPanel}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Status</label>
              <div className={styles.statusFilters}>
                <button
                  className={`${styles.statusFilterBtn} ${filterStatus === 'all' ? styles.active : ''}`}
                  onClick={() => setFilterStatus('all')}
                >
                  All
                </button>
                <button
                  className={`${styles.statusFilterBtn} ${filterStatus === 'pending' ? styles.active : ''}`}
                  onClick={() => setFilterStatus('pending')}
                >
                  <FontAwesomeIcon icon={faClock} />
                  Pending
                </button>
                <button
                  className={`${styles.statusFilterBtn} ${filterStatus === 'processing' ? styles.active : ''}`}
                  onClick={() => setFilterStatus('processing')}
                >
                  <FontAwesomeIcon icon={faRefresh} />
                  Processing
                </button>
                <button
                  className={`${styles.statusFilterBtn} ${filterStatus === 'shipped' ? styles.active : ''}`}
                  onClick={() => setFilterStatus('shipped')}
                >
                  <FontAwesomeIcon icon={faTruck} />
                  Shipped
                </button>
                <button
                  className={`${styles.statusFilterBtn} ${filterStatus === 'delivered' ? styles.active : ''}`}
                  onClick={() => setFilterStatus('delivered')}
                >
                  <FontAwesomeIcon icon={faCheckCircle} />
                  Delivered
                </button>
                <button
                  className={`${styles.statusFilterBtn} ${filterStatus === 'cancelled' ? styles.active : ''}`}
                  onClick={() => setFilterStatus('cancelled')}
                >
                  <FontAwesomeIcon icon={faTimesCircle} />
                  Cancelled
                </button>
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Sort By</label>
              <div className={styles.sortOptions}>
                <select 
                  value={sortOrder} 
                  onChange={(e) => setSortOrder(e.target.value)}
                  className={styles.sortSelect}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="total-high">Total - High to Low</option>
                  <option value="total-low">Total - Low to High</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Orders List */}
        <div className={styles.card}>
          {orders.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <FontAwesomeIcon icon={faBox} />
              </div>
              <h2>No orders yet</h2>
              <p>You haven't placed any orders yet. Start shopping to see your orders here.</p>
              <Link to="/shop" className={styles.shopNowBtn}>
                Start Shopping
              </Link>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <FontAwesomeIcon icon={faSearch} />
              </div>
              <h2>No matching orders</h2>
              <p>Try adjusting your filters or search terms.</p>
              <button 
                className={styles.clearFiltersBtn}
                onClick={() => {
                  setFilterStatus('all');
                  setSearchTerm('');
                  setSortOrder('newest');
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={styles.ordersList}>
              {sortedOrders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                const isExpanded = expandedOrder === order.id;
                
                return (
                  <div key={order.id} className={styles.orderCard}>
                    <div className={styles.orderHeader}>
                      <div className={styles.orderInfo}>
                        <div className={styles.orderId}>
                          <FontAwesomeIcon icon={faReceipt} />
                          <span>Order #{order.id}</span>
                          <span className={styles.orderDate}>
                            <FontAwesomeIcon icon={faCalendarAlt} />
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                        <div className={styles.orderSummary}>
                          <span className={styles.itemCount}>
                            {getItemCount(order)} items
                          </span>
                          <span className={styles.orderTotal}>
                            ₦{getOrderTotal(order).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className={styles.orderActions}>
                        <div 
                          className={styles.statusBadge}
                          style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
                        >
                          <FontAwesomeIcon icon={statusConfig.icon} />
                          {statusConfig.label}
                        </div>
                        <button 
                          className={styles.expandBtn}
                          onClick={() => toggleOrderExpansion(order.id)}
                        >
                          <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className={styles.orderDetails}>
                        <div className={styles.itemsSection}>
                          <h4>Order Items</h4>
                          <div className={styles.itemsList}>
                            {(order.items || []).map((item, idx) => (
                              <div key={`${order.id}-${idx}`} className={styles.orderItem}>
                                <div className={styles.itemImage}>
                                  <img 
                                    src={item.image || '/images/placeholder.jpg'} 
                                    alt={item.name}
                                    onError={(e) => {
                                      e.target.src = '/images/placeholder.jpg';
                                    }}
                                  />
                                </div>
                                <div className={styles.itemDetails}>
                                  <span className={styles.itemName}>{item.name}</span>
                                  <span className={styles.itemMeta}>
                                    Quantity: {item.qty} × ₦{Number(item.price).toLocaleString()}
                                  </span>
                                </div>
                                <div className={styles.itemTotal}>
                                  ₦{(Number(item.price) * Number(item.qty)).toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className={styles.orderSummary}>
                          <div className={styles.summaryRow}>
                            <span>Subtotal</span>
                            <span>₦{getOrderTotal(order).toLocaleString()}</span>
                          </div>
                          <div className={styles.summaryRow}>
                            <span>Delivery Fee</span>
                            <span>{order.deliveryFee > 0 ? `₦${order.deliveryFee.toLocaleString()}` : 'FREE'}</span>
                          </div>
                          {order.discount > 0 && (
                            <div className={styles.summaryRow}>
                              <span>Discount</span>
                              <span className={styles.discountAmount}>-₦{order.discount.toLocaleString()}</span>
                            </div>
                          )}
                          <div className={styles.summaryTotal}>
                            <span>Total</span>
                            <span>₦{(getOrderTotal(order) + (order.deliveryFee || 0) - (order.discount || 0)).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className={styles.orderActions}>
                          {order.status?.toLowerCase() === 'shipped' && (
                            <button className={styles.trackBtn}>
                              <FontAwesomeIcon icon={faTruck} />
                              Track Order
                            </button>
                          )}
                          {order.status?.toLowerCase() === 'delivered' && (
                            <button className={styles.reviewBtn}>
                              <FontAwesomeIcon icon={faStar} />
                              Write a Review
                            </button>
                          )}
                          <button 
                            className={styles.viewDetailsBtn}
                            onClick={() => viewOrderDetails(order)}
                          >
                            <FontAwesomeIcon icon={faEye} />
                            View Details
                          </button>
                          <button className={styles.printBtn}>
                            <FontAwesomeIcon icon={faPrint} />
                            Print
                          </button>
                        </div>

                        {/* Delivery Information */}
                        {order.tracking && (
                          <div className={styles.trackingInfo}>
                            <h4>Tracking Information</h4>
                            <p>Tracking Number: {order.tracking}</p>
                            <p>Estimated Delivery: {formatDate(order.estimatedDelivery)}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <Link to="/shop" className={styles.quickAction}>
            <FontAwesomeIcon icon={faShoppingBag} />
            Continue Shopping
          </Link>
          <Link to="/prescription" className={styles.quickAction}>
            <FontAwesomeIcon icon={faPackage} />
            Upload Prescription
          </Link>
          <Link to="/support" className={styles.quickAction}>
            <FontAwesomeIcon icon={faInfoCircle} />
            Need Help?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;