import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserMd, 
  faFlask, 
  faSyringe, 
  faPrescription, 
  faShoppingCart,
  faTruck,
  faClock,
  faShieldAlt,
  faPhone,
  faVideo,
  faArrowRight,
  faHeart,
  faPills,
  faPrescriptionBottle,
  faJar,
  faEye,
  faTooth,
  faPersonDotsFromLine,
  faDumbbell,
  faTablets,
  faBacteria,
  faBriefcaseMedical,
  faMicroscope,
  faUtensils,
  faPersonRays,
  faLungs,
  faSpoon,
  faHeartPulse,
  faDroplet,
  faBaby,
  faStar,
  faBandAid,
  faLock,
  faTag,
  faBullseye,
  faFire,
  faMapMarkerAlt,
  faCar,
  faBox,
  faPersonDress
} from '@fortawesome/free-solid-svg-icons';
import { api } from '../../lib/api';
import styles from "./Home.module.css";

const Home = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [cartCount, setCartCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real products from API (falls back to local data if no backend)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await api.getProducts({ limit: 50 });
        if (!cancelled) {
          setProducts(res.products || []);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Filter products by active category for featured section
  const getFeaturedProducts = () => {
    if (activeCategory === 'all') return products.slice(0, 3);
    const filtered = products.filter(p => 
      p.category?.toLowerCase() === activeCategory.toLowerCase()
    );
    return filtered.slice(0, 3);
  };

  // Products for discount deals section (sorted by price descending = "higher value")
  const getDealProducts = () => {
    return [...products]
      .sort((a, b) => (b.price || 0) - (a.price || 0))
      .slice(0, 3);
  };

  // Format price in Naira
  const formatNaira = (price) => {
    if (!price && price !== 0) return '₦0';
    const num = typeof price === 'string' ? parseFloat(price.replace(/[₦,]/g, '')) : price;
    return `₦${num.toLocaleString()}`;
  };

  // Calculate discount percentage
  const calcDiscount = (price, oldPrice) => {
    if (!oldPrice || !price || oldPrice <= price) return null;
    return Math.round((1 - price / oldPrice) * 100);
  };

const handleAddToCart = (productId) => {
    setCartCount(cartCount + 1);
    console.log("Added to cart:", productId);
  };

  // Get icon for category
  const getCategoryIcon = (category) => {
    const icons = {
      'Injections & Infusions': faSyringe,
      'Tablets & Capsules': faPills,
      'Syrups & Suspensions': faPrescriptionBottle,
      'Creams & Ointments': faJar,
      'Eye, Ear & Nasal Drops': faEye,
      'Oral Care': faTooth,
      'Contraceptives': faPersonDotsFromLine,
      'Vitamins & Supplements': faDumbbell,
      'Pain Relief': faTablets,
      'Antibiotics & Anti-infectives': faBacteria,
      'Medical Supplies': faBriefcaseMedical,
      'Diagnostic Tests': faMicroscope,
      'Food & Beverages': faUtensils,
      'Personal Care': faPersonRays,
      'Cough & Cold Syrups': faLungs,
      'Antacids & Digestive Health': faSpoon,
      'Cardiovascular Health': faHeartPulse,
      'Diabetes Care': faDroplet,
      'Fertility & Sexual Health': faBaby,
      'General Health': faStar,
      'Antimalarials': faBacteria,
      'Feminine Care': faPersonDress,
      'Respiratory': faLungs,
      'First Aid': faBandAid,
    };
    return icons[category] || faBox;
  };

  const featuredProducts = getFeaturedProducts();
  const dealProducts = getDealProducts();

  return (
    <div className={styles.home}>
      
      {/* ------------------ TOP NAVIGATION BAR ------------------ */}
      <div className={styles.topBar}>
        <div className={styles.topBarContent}>
          <div className={styles.topBarLeft}>
            <span><FontAwesomeIcon icon={faLock} /> Trusted Pharmacy</span>
            <span><FontAwesomeIcon icon={faStar} /> 4.8/5 Rating</span>
            <span><FontAwesomeIcon icon={faTruck} /> Free Delivery</span>
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
              <span><FontAwesomeIcon icon={faStar} /> Medster Pharmacy</span>
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
                src="/images/Home/Home.jpg" 
alt="Medster Pharmacy Banner"
              />
              <div className={styles.floatingBadge}>
                <span><FontAwesomeIcon icon={faTag} /> Save 20%</span>
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
            <FontAwesomeIcon icon={faBullseye} /> All Products
          </button>
          {products.length > 0 && [...new Set(products.map(p => p.category).filter(Boolean))].slice(0, 6).map(cat => (
            <button 
              key={cat}
              className={`${styles.categoryBtn} ${activeCategory === cat.toLowerCase() ? styles.active : ''}`}
              onClick={() => setActiveCategory(cat.toLowerCase())}
            >
              <FontAwesomeIcon icon={getCategoryIcon(cat)} /> {cat}
            </button>
          ))}
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
            <button className={styles.serviceBtn}>Book Now <FontAwesomeIcon icon={faArrowRight} /></button>
          </div>

          <div className={styles.service}>
            <div className={styles.serviceIcon}>
              <FontAwesomeIcon icon={faFlask} />
            </div>
            <h4>Book Lab Test</h4>
            <p>Diagnostics made simple and convenient.</p>
            <button className={styles.serviceBtn}>Book Now <FontAwesomeIcon icon={faArrowRight} /></button>
          </div>

          <div className={styles.service}>
            <div className={styles.serviceIcon}>
              <FontAwesomeIcon icon={faSyringe} />
            </div>
            <h4>Vaccination</h4>
            <p>Safe immunization for all ages.</p>
            <button className={styles.serviceBtn}>Book Now <FontAwesomeIcon icon={faArrowRight} /></button>
          </div>

          <div className={styles.service}>
            <div className={styles.serviceIcon}>
              <FontAwesomeIcon icon={faPrescription} />
            </div>
            <h4>Upload Prescription</h4>
            <p>Let pharmacists process your medications.</p>
            <button className={styles.serviceBtn}>Upload <FontAwesomeIcon icon={faArrowRight} /></button>
          </div>
        </div>
      </section>

      {/* ------------------ FEATURED PRODUCTS ------------------ */}
      <section className={styles.products}>
        <div className={styles.sectionHeader}>
          <h2>New Arrivals</h2>
          <Link to="/shop" className={styles.viewAll}>
            See All <FontAwesomeIcon icon={faArrowRight} />
          </Link>
        </div>

        {loading ? (
          <div className={styles["product-grid"]}>
            {[1, 2, 3].map(i => (
              <div key={i} className={styles.product} style={{ opacity: 0.5 }}>
                <div className={styles.productImage}>
                  <img src="/images/placeholder.jpg" alt="Loading..." />
                </div>
                <div className={styles.productInfo}>
                  <h4>Loading...</h4>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles["product-grid"]}>
            {featuredProducts.map((product) => (
              <div key={product.id} className={styles.product}>
                <div className={styles.productImage}>
                  <Link to={`/product/${product.id}`}>
                    <img src={product.image || '/images/placeholder.jpg'} alt={product.name} />
                  </Link>
                  <button 
                    className={styles.wishlistBtn}
                    onClick={() => console.log('Wishlist:', product.id)}
                  >
                    <FontAwesomeIcon icon={faHeart} />
                  </button>
                </div>
                <div className={styles.productInfo}>
                  <span className={styles.productCategory}>{product.category}</span>
                  <h4>{product.name.length > 50 ? product.name.slice(0, 50) + '...' : product.name}</h4>
                  <div className={styles.priceContainer}>
                    <span className={styles.price}>{formatNaira(product.price)}</span>
                    {product.compare_at_price > product.price && (
                      <span className={styles.oldPrice}>{formatNaira(product.compare_at_price)}</span>
                    )}
                  </div>
                  <div className={styles.deliveryInfo}>
                    <FontAwesomeIcon icon={faTruck} />
                    <span>Available at Medster Pharmacy</span>
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
        )}
      </section>

      {/* ------------------ DISCOUNT DEALS ------------------ */}
      <section className={styles.products}>
        <div className={styles.sectionHeader}>
          <h2><FontAwesomeIcon icon={faFire} /> Popular Products</h2>
          <Link to="/shop" className={styles.viewAll}>
            View All Products <FontAwesomeIcon icon={faArrowRight} />
          </Link>
        </div>

        {loading ? (
          <div className={styles["product-grid"]}>
            {[1, 2, 3].map(i => (
              <div key={i} className={styles.product} style={{ opacity: 0.5 }}>
                <div className={styles.productImage}>
                  <img src="/images/placeholder.jpg" alt="Loading..." />
                </div>
                <div className={styles.productInfo}>
                  <h4>Loading...</h4>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles["product-grid"]}>
            {dealProducts.map((product) => {
              const discount = calcDiscount(product.price, product.compare_at_price);
              return (
                <div key={product.id} className={styles.product}>
                  <div className={styles.productImage}>
                    <Link to={`/product/${product.id}`}>
                      <img src={product.image || '/images/placeholder.jpg'} alt={product.name} />
                    </Link>
                    {discount && (
                      <div className={styles.discountTag}>
                        Save {discount}%
                      </div>
                    )}
                  </div>
                  <div className={styles.productInfo}>
                    <span className={styles.productCategory}>{product.brand || product.category}</span>
                    <h4>{product.name.length > 50 ? product.name.slice(0, 50) + '...' : product.name}</h4>
                    <div className={styles.priceContainer}>
                      <span className={styles.price}>{formatNaira(product.price)}</span>
                      {product.compare_at_price > product.price && (
                        <span className={styles.oldPrice}>{formatNaira(product.compare_at_price)}</span>
                      )}
                    </div>
                    <Link to={`/product/${product.id}`}>
                      <button className={styles.shopNow}>
                        View Details <FontAwesomeIcon icon={faArrowRight} />
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ------------------ TESTIMONIALS ------------------ */}
      <section className={styles.testimonials}>
        <div className={styles.sectionHeader}>
          <h2>What Our Customers Say</h2>
          <Link to="/shop" className={styles.viewAll}>
            Read All Reviews <FontAwesomeIcon icon={faArrowRight} />
          </Link>
        </div>
        <div className={styles.testimonialGrid}>
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialStars}>
              <FontAwesomeIcon icon={faStar} /><FontAwesomeIcon icon={faStar} /><FontAwesomeIcon icon={faStar} /><FontAwesomeIcon icon={faStar} /><FontAwesomeIcon icon={faStar} />
            </div>
            <p className={styles.testimonialText}>
              "Medster Pharmacy has been a lifesaver! Fast delivery and genuine products. I order all my medications here now."
            </p>
            <div className={styles.testimonialAuthor}>
              <div className={styles.testimonialAvatar}>A</div>
              <div>
                <div className={styles.testimonialName}>Amanda Chukwu</div>
                <div className={styles.testimonialRole}>Lagos, Nigeria</div>
              </div>
            </div>
          </div>
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialStars}>
              <FontAwesomeIcon icon={faStar} /><FontAwesomeIcon icon={faStar} /><FontAwesomeIcon icon={faStar} /><FontAwesomeIcon icon={faStar} /><FontAwesomeIcon icon={faStar} />
            </div>
            <p className={styles.testimonialText}>
              "The video consultation service is amazing. I spoke to a doctor within minutes and got my prescription filled immediately."
            </p>
            <div className={styles.testimonialAuthor}>
              <div className={styles.testimonialAvatar}>K</div>
              <div>
                <div className={styles.testimonialName}>Kehinde Okafor</div>
                <div className={styles.testimonialRole}>Abuja, Nigeria</div>
              </div>
            </div>
          </div>
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialStars}>
              <FontAwesomeIcon icon={faStar} /><FontAwesomeIcon icon={faStar} /><FontAwesomeIcon icon={faStar} /><FontAwesomeIcon icon={faStar} /><FontAwesomeIcon icon={faStar} />
            </div>
            <p className={styles.testimonialText}>
              "Finally a pharmacy I can trust! Competitive prices, authentic products, and excellent customer service. Highly recommended!"
            </p>
            <div className={styles.testimonialAuthor}>
              <div className={styles.testimonialAvatar}>T</div>
              <div>
                <div className={styles.testimonialName}>Tunde Bello</div>
                <div className={styles.testimonialRole}>Port Harcourt, Nigeria</div>
              </div>
            </div>
          </div>
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
          <p>On orders above ₦50,000</p>
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
              <li><FontAwesomeIcon icon={faMapMarkerAlt} /> Over 500 locations nationwide</li>
              <li><FontAwesomeIcon icon={faClock} /> Open 8 AM - 10 PM daily</li>
              <li><FontAwesomeIcon icon={faCar} /> Drive-thru pharmacy available</li>
            </ul>
            <button className={styles["store-btn"]}>
              View Store Locations <FontAwesomeIcon icon={faArrowRight} />
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
