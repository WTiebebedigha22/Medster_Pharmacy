import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faUserEdit,
  faAddressCard,
  faPrescription,
  faHeart,
  faShoppingBag,
  faCog,
  faSignOutAlt,
  faChevronRight,
  faCamera,
  faCheckCircle,
  faExclamationTriangle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Account.module.css";

const Account = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+234 800 000 0000",
    dateOfBirth: "1990-01-15",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const recentOrders = [
    { id: "MED-001", date: "2026-07-10", status: "Delivered", total: "₦12,500", items: 3 },
    { id: "MED-002", date: "2026-07-05", status: "Processing", total: "₦8,200", items: 2 },
    { id: "MED-003", date: "2026-06-28", status: "Shipped", total: "₦23,000", items: 4 },
  ];

  const savedAddresses = [
    { id: 1, label: "Home", address: "123 Main Street, Ikoyi, Lagos", default: true },
    { id: 2, label: "Office", address: "456 Victoria Island, Lagos", default: false },
  ];

  const tabs = [
    { id: "profile", icon: faUser, label: "My Profile" },
    { id: "orders", icon: faShoppingBag, label: "My Orders" },
    { id: "prescriptions", icon: faPrescription, label: "Prescriptions" },
    { id: "wishlist", icon: faHeart, label: "Wishlist" },
    { id: "addresses", icon: faAddressCard, label: "Addresses" },
    { id: "settings", icon: faCog, label: "Settings" },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.profileSummary}>
            <div className={styles.avatar}>
              <div className={styles.avatarPlaceholder}>
                <FontAwesomeIcon icon={faUser} />
              </div>
              <button className={styles.avatarEdit}>
                <FontAwesomeIcon icon={faCamera} />
              </button>
            </div>
            <h3>{profile.firstName} {profile.lastName}</h3>
            <p>{profile.email}</p>
          </div>

          <nav className={styles.sidebarNav}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.navBtn} ${activeTab === tab.id ? styles.active : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <FontAwesomeIcon icon={tab.icon} />
                <span>{tab.label}</span>
                <FontAwesomeIcon icon={faChevronRight} className={styles.navArrow} />
              </button>
            ))}
          </nav>

          <button className={styles.logoutBtn} onClick={() => navigate("/auth/login")}>
            <FontAwesomeIcon icon={faSignOutAlt} />
            Sign Out
          </button>
        </aside>

        {/* Main Content */}
        <main className={styles.mainContent}>
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className={styles.tabContent}>
              <h1>My Profile</h1>
              <p className={styles.tabSubtitle}>Manage your personal information</p>

              <form onSubmit={handleProfileUpdate} className={styles.profileForm}>
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label>First Name</label>
                    <input
                      type="text"
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Last Name</label>
                    <input
                      type="text"
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Email</label>
                    <input type="email" value={profile.email} disabled />
                  </div>
                  <div className={styles.field}>
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      value={profile.dateOfBirth}
                      onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.formActions}>
                  {saved && (
                    <span className={styles.saveSuccess}>
                      <FontAwesomeIcon icon={faCheckCircle} /> Profile updated successfully
                    </span>
                  )}
                  <button type="submit" className={styles.saveBtn} disabled={saving}>
                    {saving ? <><FontAwesomeIcon icon={faSpinner} spin /> Saving...</> : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className={styles.tabContent}>
              <div className={styles.tabHeader}>
                <h1>My Orders</h1>
                <Link to="/orders" className={styles.viewAllLink}>View All</Link>
              </div>
              <p className={styles.tabSubtitle}>Track and manage your orders</p>

              <div className={styles.ordersList}>
                {recentOrders.map((order) => (
                  <div key={order.id} className={styles.orderCard}>
                    <div className={styles.orderInfo}>
                      <span className={styles.orderId}>{order.id}</span>
                      <span className={styles.orderDate}>{order.date}</span>
                      <span className={styles.orderItems}>{order.items} items</span>
                      <span className={styles.orderTotal}>{order.total}</span>
                    </div>
                    <span className={`${styles.orderStatus} ${styles[order.status.toLowerCase()]}`}>
                      {order.status}
                    </span>
                    <button className={styles.orderActionBtn}>View Details</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prescriptions Tab */}
          {activeTab === "prescriptions" && (
            <div className={styles.tabContent}>
              <div className={styles.tabHeader}>
                <h1>My Prescriptions</h1>
                <Link to="/prescriptions/add" className={styles.addBtn}>
                  + Upload New
                </Link>
              </div>
              <p className={styles.tabSubtitle}>Manage your uploaded prescriptions</p>
              <div className={styles.emptyState}>
                <FontAwesomeIcon icon={faPrescription} />
                <h3>No Prescriptions Yet</h3>
                <p>Upload your first prescription to get your medications processed.</p>
                <Link to="/prescriptions/add" className={styles.emptyStateBtn}>
                  Upload Prescription
                </Link>
              </div>
            </div>
          )}

          {/* Wishlist Tab */}
          {activeTab === "wishlist" && (
            <div className={styles.tabContent}>
              <h1>My Wishlist</h1>
              <p className={styles.tabSubtitle}>Products you've saved for later</p>
              <div className={styles.emptyState}>
                <FontAwesomeIcon icon={faHeart} />
                <h3>Your Wishlist is Empty</h3>
                <p>Save your favorite products for quick access later.</p>
                <Link to="/shop" className={styles.emptyStateBtn}>
                  Browse Products
                </Link>
              </div>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === "addresses" && (
            <div className={styles.tabContent}>
              <div className={styles.tabHeader}>
                <h1>My Addresses</h1>
                <button className={styles.addBtn}>+ Add New</button>
              </div>
              <p className={styles.tabSubtitle}>Manage your shipping addresses</p>
              <div className={styles.addressesGrid}>
                {savedAddresses.map((addr) => (
                  <div key={addr.id} className={`${styles.addressCard} ${addr.default ? styles.default : ""}`}>
                    <div className={styles.addressHeader}>
                      <span className={styles.addressLabel}>{addr.label}</span>
                      {addr.default && <span className={styles.defaultBadge}>Default</span>}
                    </div>
                    <p className={styles.addressText}>{addr.address}</p>
                    <div className={styles.addressActions}>
                      <button className={styles.addressBtn}>Edit</button>
                      <button className={styles.addressBtn}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className={styles.tabContent}>
              <h1>Settings</h1>
              <p className={styles.tabSubtitle}>Manage your account preferences</p>

              <div className={styles.settingsSection}>
                <h3>Notifications</h3>
                <div className={styles.settingRow}>
                  <span>Email notifications</span>
                  <label className={styles.toggle}>
                    <input type="checkbox" defaultChecked />
                    <span className={styles.toggleSlider}></span>
                  </label>
                </div>
                <div className={styles.settingRow}>
                  <span>SMS notifications</span>
                  <label className={styles.toggle}>
                    <input type="checkbox" defaultChecked />
                    <span className={styles.toggleSlider}></span>
                  </label>
                </div>
                <div className={styles.settingRow}>
                  <span>Promotional emails</span>
                  <label className={styles.toggle}>
                    <input type="checkbox" />
                    <span className={styles.toggleSlider}></span>
                  </label>
                </div>
              </div>

              <div className={styles.settingsSection}>
                <h3>Security</h3>
                <div className={styles.settingRow}>
                  <span>Change Password</span>
                  <button className={styles.settingBtn}>Update</button>
                </div>
                <div className={styles.settingRow}>
                  <span>Two-Factor Authentication</span>
                  <button className={styles.settingBtn}>Enable</button>
                </div>
              </div>

              <div className={styles.dangerZone}>
                <h3>Danger Zone</h3>
                <p>Once you delete your account, there is no going back.</p>
                <button className={styles.deleteBtn}>
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Account;

