import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserMd, 
  faFlask, 
  faSyringe, 
  faPrescription, 
  faShoppingCart,
  faStar,
  faTruck,
  faClock,
  faShieldAlt,
  faPhone,
  faVideo,
  faArrowRight,
  faHeart
} from '@fortawesome/free-solid-svg-icons';
import styles from "./Home.module.css";

const mockProducts = [
  {
    id: 1,
    name: "Vitamin C 1000mg",
    price: "₦4,500",
    oldPrice: "₦6,000",
    image: "/images/products/vitamin_c.jpg",
    rating: 4.8,
    reviews: 234,
    badge: "Best Seller",
    category: "Vitamins",
    delivery: "Free Delivery",
  },
  {
    id: 2,
    name: "Blood Pressure Monitor",
    price: "₦26,000",
    oldPrice: "₦32,000",
    image: "/images/products/bp_monitor.jpg",
    rating: 4.6,
    reviews: 189,
    badge: "Top Rated",
    category: "Devices",
    delivery: "Free Delivery",
  },
  {
    id: 3,
    name: "Wellwoman Multivitamin",
    price: "₦9,200",
    oldPrice: "₦12,000",
    image: "/images/products/wellwoman.jpg",
    rating: 4.9,
    reviews: 312,
    badge: "Premium",
    category: "Vitamins",
    delivery: "Free Delivery",
  },
  {
    id: 4,
    name: "Omron Digital Thermometer",
    price: "₦8,500",
    oldPrice: "₦11,000",
    image: "/images/products/thermometer.jpg",
    rating: 4.7,
    reviews: 156,
    badge: "New",
    category: "Devices",
    delivery: "Free Delivery",
  },
  {
    id: 5,
    name: "Centrum Silver Multivitamin",
    price: "₦15,500",
    oldPrice: "₦19,000",
    image: "/images/products/centrum.jpg",
    rating: 4.8,
    reviews: 278,
    badge: "Popular",
    category: "Vitamins",
    delivery: "Free Delivery",
  },
  {
    id: 6,
    name: "Nebulizer Machine",
    price: "₦32,000",
    oldPrice: "₦40,000",
    image: "/images/products/nebulizer.jpg",
    rating: 4.5,
    reviews: 143,
    badge: "Sale",
    category: "Devices",
    delivery: "Free Delivery",
  },
];

const Home = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [cartCount, setCartCount] = useState(0);

  const handleAddToCart = (productId) => {
    setCartCount(cartCount + 1);
    // Add to cart logic here
    console.log("Added to cart:", productId);
  };

  return (
    <div className={styles.home}>
      
      {/* ------------------ TOP NAVIGATION BAR ------------------ */}
      <div className={styles.topBar}>
        <div className={styles.topBarContent}>
          <div className={styles.topBarLeft}>
            <span>🔒 Trusted Pharmacy</span>
            <span>⭐ 4.8/5 Rating</span>
            <span>🚚 Free Delivery</span>
          </div>
          <div className={styles.topBarRight}>
            <Link to="/contact">Contact Us</Link>
            <Link to="/help">Help</Link>
            <Link to="/cart" className={styles.cartLink}>
              <FontAwesomeIcon icon={faShoppingCart} />
              <span className={styles.cartCount}>{cartCount}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ------------------ HERO SECTION ------------------ */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles["hero-text"]}>
            <div className={styles.heroBadge}>
<span>🌟 Medster Pharmacy</span>
            </div>
            <h1>Your Health,<br />Made Easy</h1>
            <p>Shop quality medicines, book health services, and get care online — all from the comfort of your home.</p>

            <div className={styles["hero-buttons"]}>
              <button className={styles.primaryBtn}>
                <FontAwesomeIcon icon={faVideo} /> 
                Talk to Doctor
              </button>
              <button className={styles.secondaryBtn}>
                <FontAwesomeIcon icon={faPrescription} />
                Upload Prescription
              </button>
              <button className={styles.outlineBtn}>
                <FontAwesomeIcon icon={faShoppingCart} />
                Order Medicines
              </button>
            </div>

            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>1M+</span>
                <span className={styles.statLabel}>Happy Customers</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>500+</span>
                <span className={styles.statLabel}>Trusted Brands</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>100%</span>
                <span className={styles.statLabel}>Authentic Products</span>
              </div>
            </div>
          </div>

          <div className={styles["hero-image"]}>
            <div className={styles.imageContainer}>
              <img 
                src="/images/Home/medplus_banner.jpg" 
alt="Medster Pharmacy Banner"
              />
              <div className={styles.floatingBadge}>
                <span>🏷️ Save 20%</span>
                <span>on first order</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------ CATEGORY NAVIGATION ------------------ */}
      <section className={styles.categoryNav}>
        <div className={styles.categoryContent}>
          <button 
            className={`${styles.categoryBtn} ${activeCategory === 'all' ? styles.active : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All Products
          </button>
          <button 
            className={`${styles.categoryBtn} ${activeCategory === 'vitamins' ? styles.active : ''}`}
            onClick={() => setActiveCategory('vitamins')}
          >
            💊 Vitamins
          </button>
          <button 
            className={`${styles.categoryBtn} ${activeCategory === 'devices' ? styles.active : ''}`}
            onClick={() => setActiveCategory('devices')}
          >
            📱 Health Devices
          </button>
          <button 
            className={`${styles.categoryBtn} ${activeCategory === 'prescription' ? styles.active : ''}`}
            onClick={() => setActiveCategory('prescription')}
          >
            📋 Prescription
          </button>
          <button 
            className={`${styles.categoryBtn} ${activeCategory === 'baby' ? styles.active : ''}`}
            onClick={() => setActiveCategory('baby')}
          >
            👶 Baby Care
          </button>
        </div>
      </section>

      {/* ------------------ HEALTH SERVICES ------------------ */}
      <section className={styles.services}>
        <div className={styles.sectionHeader}>
          <h2>Health Services</h2>
          <Link to="/services" className={styles.viewAll}>
            View All Services <FontAwesomeIcon icon={faArrowRight} />
          </Link>
        </div>

        <div className={styles["services-grid"]}>
          <div className={styles.service}>
            <div className={styles.serviceIcon}>
              <FontAwesomeIcon icon={faUserMd} />
            </div>
            <h4>Talk to Doctor</h4>
            <p>Video consultation with licensed professionals.</p>
            <button className={styles.serviceBtn}>Book Now →</button>
          </div>

          <div className={styles.service}>
            <div className={styles.serviceIcon}>
              <FontAwesomeIcon icon={faFlask} />
            </div>
            <h4>Book Lab Test</h4>
            <p>Diagnostics made simple and convenient.</p>
            <button className={styles.serviceBtn}>Book Now →</button>
          </div>

          <div className={styles.service}>
            <div className={styles.serviceIcon}>
              <FontAwesomeIcon icon={faSyringe} />
            </div>
            <h4>Vaccination</h4>
            <p>Safe immunization for all ages.</p>
            <button className={styles.serviceBtn}>Book Now →</button>
          </div>

          <div className={styles.service}>
            <div className={styles.serviceIcon}>
              <FontAwesomeIcon icon={faPrescription} />
            </div>
            <h4>Upload Prescription</h4>
            <p>Let pharmacists process your medications.</p>
            <button className={styles.serviceBtn}>Upload →</button>
          </div>
        </div>
      </section>

      {/* ------------------ FEATURED PRODUCTS ------------------ */}
      <section className={styles.products}>
        <div className={styles.sectionHeader}>
          <h2>New Arrivals</h2>
          <Link to="/products" className={styles.viewAll}>
            See All <FontAwesomeIcon icon={faArrowRight} />
          </Link>
        </div>

        <div className={styles["product-grid"]}>
          {mockProducts.slice(0, 3).map((product) => (
            <div key={product.id} className={styles.product}>
              {product.badge && (
                <span className={styles.productBadge}>{product.badge}</span>
              )}
              <div className={styles.productImage}>
                <img src={product.image} alt={product.name} />
                <button 
                  className={styles.wishlistBtn}
                  onClick={() => console.log('Wishlist:', product.id)}
                >
                  <FontAwesomeIcon icon={faHeart} />
                </button>
              </div>
              <div className={styles.productInfo}>
                <span className={styles.productCategory}>{product.category}</span>
                <h4>{product.name}</h4>
                <div className={styles.rating}>
                  <div className={styles.stars}>
                    {'★'.repeat(Math.floor(product.rating))}
                    {'☆'.repeat(5 - Math.floor(product.rating))}
                  </div>
                  <span>({product.reviews})</span>
                </div>
                <div className={styles.priceContainer}>
                  <span className={styles.price}>{product.price}</span>
                  <span className={styles.oldPrice}>{product.oldPrice}</span>
                </div>
                <div className={styles.deliveryInfo}>
                  <FontAwesomeIcon icon={faTruck} />
                  <span>{product.delivery}</span>
                </div>
                <button 
                  className={styles.addToCart}
                  onClick={() => handleAddToCart(product.id)}
                >
                  <FontAwesomeIcon icon={faShoppingCart} />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------ DISCOUNT DEALS ------------------ */}
      <section className={styles.products}>
        <div className={styles.sectionHeader}>
          <h2>🔥 Discount Deals</h2>
          <Link to="/deals" className={styles.viewAll}>
            View All Deals <FontAwesomeIcon icon={faArrowRight} />
          </Link>
        </div>

        <div className={styles["product-grid"]}>
          {mockProducts.slice(3, 6).map((product) => (
            <div key={product.id} className={styles.product}>
              {product.badge && (
                <span className={`${styles.productBadge} ${styles.dealBadge}`}>
                  🔥 {product.badge}
                </span>
              )}
              <div className={styles.productImage}>
                <img src={product.image} alt={product.name} />
                <div className={styles.discountTag}>
                  Save {Math.round(((parseInt(product.oldPrice.replace(/[₦,]/g, '')) - parseInt(product.price.replace(/[₦,]/g, ''))) / parseInt(product.oldPrice.replace(/[₦,]/g, ''))) * 100)}%
                </div>
              </div>
              <div className={styles.productInfo}>
                <span className={styles.productCategory}>{product.category}</span>
                <h4>{product.name}</h4>
                <div className={styles.rating}>
                  <div className={styles.stars}>
                    {'★'.repeat(Math.floor(product.rating))}
                    {'☆'.repeat(5 - Math.floor(product.rating))}
                  </div>
                  <span>({product.reviews})</span>
                </div>
                <div className={styles.priceContainer}>
                  <span className={styles.price}>{product.price}</span>
                  <span className={styles.oldPrice}>{product.oldPrice}</span>
                </div>
                <button className={styles.shopNow}>
                  Shop Now →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------ FEATURES BANNER ------------------ */}
      <section className={styles.features}>
        <div className={styles.feature}>
          <FontAwesomeIcon icon={faShieldAlt} />
          <h4>100% Authentic</h4>
          <p>Guaranteed genuine products</p>
        </div>
        <div className={styles.feature}>
          <FontAwesomeIcon icon={faTruck} />
          <h4>Free Delivery</h4>
          <p>On orders above ₦10,000</p>
        </div>
        <div className={styles.feature}>
          <FontAwesomeIcon icon={faClock} />
          <h4>24/7 Support</h4>
          <p>Always here to help you</p>
        </div>
        <div className={styles.feature}>
          <FontAwesomeIcon icon={faPhone} />
          <h4>Easy Returns</h4>
          <p>Hassle-free returns policy</p>
        </div>
      </section>

      {/* ------------------ STORES ------------------ */}
      <section className={styles.stores}>
        <div className={styles.storesContent}>
          <div className={styles.storesInfo}>
            <h2>Our Stores</h2>
<p>Find Medster Pharmacy branches near you.</p>
            <ul className={styles.storeFeatures}>
              <li>📍 Over 500 locations nationwide</li>
              <li>🕐 Open 8 AM - 10 PM daily</li>
              <li>🚗 Drive-thru pharmacy available</li>
            </ul>
            <button className={styles["store-btn"]}>
              View Store Locations →
            </button>
          </div>
          <div className={styles.storeMap}>
            <img src="/images/map-placeholder.jpg" alt="Store locations" />
          </div>
        </div>
      </section>

      {/* ------------------ NEWSLETTER ------------------ */}
      <section className={styles.newsletter}>
        <div className={styles.newsletterContent}>
          <h3>Stay Healthy with Us</h3>
          <p>Subscribe to get health tips, exclusive offers, and updates</p>
          <div className={styles.newsletterForm}>
            <input type="email" placeholder="Enter your email" />
            <button>Subscribe</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;