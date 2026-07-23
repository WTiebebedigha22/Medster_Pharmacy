import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import styles from "./ProductPage.module.css";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faShoppingCart, 
  faPlus, 
  faMinus, 
  faHeart,
  faShare,
  faStar,
  faStarHalfAlt,
  faTruck,
  faClock,
  faShieldAlt,
  faPrescription,
  faCheckCircle,
  faInfoCircle,
  faPhone,
  faEnvelope,
  faStore,
  faTag,
  faGift,
  faPercent,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [isWishlist, setIsWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('details');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [customerReviews, setCustomerReviews] = useState([]);
  const [inStock, setInStock] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  // Fetch product from IREC API
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    
    (async () => {
      try {
        // Fetch product from IREC API
        const productData = await api.getProduct(id);
        
        if (!cancelled) {
          if (productData) {
            setProduct(productData);
            setInStock(productData.inStock !== false);
            
            // Fetch related products
            const relatedRes = await api.getProducts({ 
              category: productData.category,
              limit: 4,
              exclude: id 
            });
            setRelatedProducts(relatedRes.products || []);
            
            // Check wishlist status if user is logged in
            if (user) {
              try {
                const { wishlist } = await api.getWishlist();
                const isInWishlist = wishlist.some(item => item.product_id === id);
                setIsWishlist(isInWishlist);
              } catch (err) {
                console.error('Error checking wishlist:', err);
              }
            }
            
            // Fetch or generate customer reviews
            // In a real app, you'd have a reviews endpoint
            setCustomerReviews([
              {
                id: 1,
                user: "Dr. Sarah Johnson",
                rating: productData.rating || 5,
                date: "2026-07-10",
                comment: "Excellent product! Highly recommend for daily use.",
                verified: true
              },
              {
                id: 2,
                user: "John Doe",
                rating: 4,
                date: "2026-07-05",
                comment: "Good quality, fast delivery. Will buy again.",
                verified: true
              },
              {
                id: 3,
                user: "Mary Smith",
                rating: 5,
                date: "2026-06-28",
comment: "Life-saving medication. Thank you Medster Pharmacy!",
                verified: true
              }
            ]);
          } else {
            setError('Product not found');
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error fetching product:', err);
          setError('Failed to load product. Please try again.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, user]);

  // Calculate average rating
  const avgRating = useMemo(() => {
    if (customerReviews.length === 0) return product?.rating || 0;
    const sum = customerReviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / customerReviews.length);
  }, [customerReviews, product]);

  const handleAdd = async () => {
    if (!product) return;
    
    setAddingToCart(true);
    try {
      for (let i = 0; i < qty; i++) {
        addToCart({ 
          ...product, 
          qty: 1,
          image: product.images?.[0] || product.image || '/images/placeholder.jpg'
        });
      }
      navigate("/cart");
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    
    try {
      for (let i = 0; i < qty; i++) {
        addToCart({ 
          ...product, 
          qty: 1,
          image: product.images?.[0] || product.image || '/images/placeholder.jpg'
        });
      }
      navigate("/checkout");
    } catch (err) {
      console.error('Error processing buy now:', err);
      alert('Failed to process your request. Please try again.');
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    if (!product) return;
    
    setWishlistLoading(true);
    try {
      const result = await api.toggleWishlist(product.id);
      setIsWishlist(result.action === 'added');
      
      // Show feedback
      if (result.action === 'added') {
        // Product added to wishlist
        console.log('Added to wishlist');
      } else {
        // Product removed from wishlist
        console.log('Removed from wishlist');
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
      alert('Failed to update wishlist. Please try again.');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: product?.name || 'Medster Pharmacy Product',
      text: `Check out ${product?.name || 'this product'} on Medster Pharmacy`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Product link copied to clipboard!');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <FontAwesomeIcon key={`full-${i}`} icon={faStar} />
        ))}
        {halfStar && <FontAwesomeIcon icon={faStarHalfAlt} />}
        {[...Array(emptyStars)].map((_, i) => (
          <FontAwesomeIcon key={`empty-${i}`} icon={faStar} className={styles.emptyStar} />
        ))}
      </>
    );
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.page}>
        <div className={styles.notFoundContainer}>
          <div className={styles.notFoundIcon}>🔍</div>
          <h1>{error || 'Product Not Found'}</h1>
          <p>{error || "The product you're looking for doesn't exist or has been removed."}</p>
          <button className={styles.btnPrimary} onClick={() => navigate("/shop")}>
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Shop
          </button>
          <div className={styles.suggestions}>
            <p>You might be interested in:</p>
            <div className={styles.suggestionLinks}>
              <Link to="/shop?category=vitamins">💊 Vitamins</Link>
              <Link to="/shop?category=devices">📱 Health Devices</Link>
              <Link to="/shop?category=baby">👶 Baby Care</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const productImage = product.images?.[0] || product.image || '/images/placeholder.jpg';
  const productImages = product.images || [productImage];

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <div className={styles.breadcrumbContent}>
          <Link to="/">Home</Link>
          <span className={styles.separator}>›</span>
          <Link to="/shop">Shop</Link>
          <span className={styles.separator}>›</span>
          <Link to={`/shop?category=${product.category || 'all'}`}>
            {product.category || 'Products'}
          </Link>
          <span className={styles.separator}>›</span>
          <span className={styles.current}>{product.name}</span>
        </div>
      </div>

      <div className={styles.container}>
        {/* Left - Image Gallery */}
        <div className={styles.gallerySection}>
          <div className={styles.gallery}>
            <div className={styles.mainImageContainer}>
              <img 
                className={styles.mainImage} 
                src={productImages[selectedImage] || productImage}
                alt={product.name}
                onError={(e) => {
                  e.target.src = '/images/placeholder.jpg';
                }}
              />
              {product.isRx && (
                <span className={styles.rxBadge}>Prescription Required</span>
              )}
              {!inStock && (
                <div className={styles.outOfStockOverlay}>
                  <span>Out of Stock</span>
                </div>
              )}
              {product.discount && (
                <span className={styles.discountBadge}>
                  <FontAwesomeIcon icon={faPercent} />
                  Save {product.discount}%
                </span>
              )}
            </div>
            {productImages.length > 1 && (
              <div className={styles.thumbnailGrid}>
                {productImages.slice(0, 4).map((img, index) => (
                  <div 
                    key={index}
                    className={`${styles.thumbnail} ${selectedImage === index ? styles.active : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img 
                      src={img || '/images/placeholder.jpg'} 
                      alt={`Product view ${index + 1}`}
                      onError={(e) => {
                        e.target.src = '/images/placeholder.jpg';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Trust Badges */}
          <div className={styles.trustBadges}>
            <div className={styles.trustBadge}>
              <FontAwesomeIcon icon={faShieldAlt} />
              <span>100% Authentic</span>
            </div>
            <div className={styles.trustBadge}>
              <FontAwesomeIcon icon={faTruck} />
              <span>Free Delivery</span>
            </div>
            <div className={styles.trustBadge}>
              <FontAwesomeIcon icon={faClock} />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>

        {/* Right - Product Details */}
        <div className={styles.detailsSection}>
          <div className={styles.details}>
            {/* Category and Badges */}
            <div className={styles.badges}>
              <span className={styles.category}>{product.category || 'General'}</span>
              {product.isRx && (
                <span className={styles.rxBadgeSmall}>
                  <FontAwesomeIcon icon={faPrescription} />
                  Rx Required
                </span>
              )}
              {product.bestseller && (
                <span className={styles.bestsellerBadge}>⭐ Best Seller</span>
              )}
            </div>

            {/* Product Name */}
            <h1 className={styles.name}>{product.name}</h1>

            {/* Brand */}
            {product.brand && (
              <p className={styles.brand}>Brand: <strong>{product.brand}</strong></p>
            )}

            {/* Rating */}
            <div className={styles.ratingSection}>
              <div className={styles.stars}>
                {renderStars(avgRating || 4.5)}
              </div>
              <span className={styles.ratingValue}>{avgRating ? avgRating.toFixed(1) : '4.5'}</span>
              <span className={styles.reviewCount}>({customerReviews.length} reviews)</span>
              <Link to="#reviews" className={styles.reviewLink}>Write a review</Link>
            </div>

            {/* Price */}
            <div className={styles.priceContainer}>
              <span className={styles.price}>
                ₦{Number(product.price).toLocaleString()}
              </span>
              {product.oldPrice && (
                <span className={styles.oldPrice}>
                  ₦{Number(product.oldPrice).toLocaleString()}
                </span>
              )}
              {product.discount && (
                <span className={styles.discountTag}>
                  Save {product.discount}%
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className={styles.stockStatus}>
              {inStock ? (
                <span className={styles.inStock}>
                  <FontAwesomeIcon icon={faCheckCircle} />
                  In Stock - Available
                </span>
              ) : (
                <span className={styles.outOfStock}>Out of Stock</span>
              )}
              <span className={styles.shippingInfo}>
                <FontAwesomeIcon icon={faTruck} />
                Free delivery on orders above ₦50,000
              </span>
            </div>

            {/* Description */}
            <div className={styles.descriptionContainer}>
              <p className={styles.desc}>
                {showFullDescription 
                  ? product.description || 'No description available.' 
                  : (product.description || '').slice(0, 150)}
                {product.description && product.description.length > 150 && (
                  <button 
                    className={styles.readMoreBtn}
                    onClick={() => setShowFullDescription(!showFullDescription)}
                  >
                    {showFullDescription ? ' Show less' : ' ...Read more'}
                  </button>
                )}
              </p>
            </div>

            {/* Prescription Note */}
            {product.isRx && (
              <div className={styles.rxNotice}>
                <FontAwesomeIcon icon={faInfoCircle} />
                <div>
                  <strong>Prescription Required</strong>
                  <p>This product requires a valid prescription. Upload your prescription during checkout.</p>
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className={styles.qtyRow}>
              <span className={styles.qtyLabel}>Quantity:</span>
              <div className={styles.qtyControls}>
                <button
                  className={styles.qtyBtn}
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                >
                  <FontAwesomeIcon icon={faMinus} />
                </button>
                <span className={styles.qty}>{qty}</span>
                <button
                  className={styles.qtyBtn}
                  onClick={() => setQty((q) => q + 1)}
                  disabled={!inStock}
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.actionButtons}>
              <button 
                className={styles.addBtn} 
                onClick={handleAdd}
                disabled={!inStock || addingToCart}
              >
                {addingToCart ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : (
                  <FontAwesomeIcon icon={faShoppingCart} />
                )}
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
              <button 
                className={styles.buyBtn}
                onClick={handleBuyNow}
                disabled={!inStock}
              >
                Buy Now
              </button>
            </div>

            {/* Secondary Buttons */}
            <div className={styles.secondaryActions}>
              <button 
                className={`${styles.wishlistBtn} ${isWishlist ? styles.active : ''}`}
                onClick={handleWishlist}
                disabled={wishlistLoading}
              >
                {wishlistLoading ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : (
                  <FontAwesomeIcon icon={isWishlist ? faHeart : faHeart} />
                )}
                {isWishlist ? ' Added to Wishlist' : ' Add to Wishlist'}
              </button>
              <button className={styles.shareBtn} onClick={handleShare}>
                <FontAwesomeIcon icon={faShare} />
                Share
              </button>
            </div>

            {/* Delivery Info */}
            <div className={styles.deliveryInfo}>
              <div className={styles.deliveryOption}>
                <FontAwesomeIcon icon={faTruck} />
                <div>
                  <strong>Free Delivery</strong>
                  <p>Get it by {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                </div>
              </div>
              <div className={styles.deliveryOption}>
                <FontAwesomeIcon icon={faClock} />
                <div>
                  <strong>Express Delivery</strong>
                  <p>Get it by {new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toLocaleDateString()} (+₦2,500)</p>
                </div>
              </div>
            </div>

            {/* Quick Contact */}
            <div className={styles.quickContact}>
              <span>Questions? Contact us:</span>
              <Link to="/contact" className={styles.contactLink}>
                <FontAwesomeIcon icon={faPhone} />
                +234 800 000 0000
              </Link>
              <Link to="/contact" className={styles.contactLink}>
                <FontAwesomeIcon icon={faEnvelope} />
support@medsterpharmacy.com
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <div className={styles.tabsSection}>
        <div className={styles.tabsContent}>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === 'details' ? styles.active : ''}`}
              onClick={() => setActiveTab('details')}
            >
              Product Details
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'reviews' ? styles.active : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({customerReviews.length})
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'shipping' ? styles.active : ''}`}
              onClick={() => setActiveTab('shipping')}
            >
              Shipping & Returns
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'details' && (
              <div className={styles.detailsTab}>
                <h3>Product Information</h3>
                <div className={styles.productSpecs}>
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Category</span>
                    <span className={styles.specValue}>{product.category || 'N/A'}</span>
                  </div>
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Brand</span>
                    <span className={styles.specValue}>{product.brand || 'N/A'}</span>
                  </div>
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Prescription</span>
                    <span className={styles.specValue}>{product.isRx ? 'Required' : 'Not Required'}</span>
                  </div>
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Availability</span>
                    <span className={styles.specValue}>{inStock ? 'In Stock' : 'Out of Stock'}</span>
                  </div>
                </div>
                <div className={styles.fullDescription}>
                  <h4>Description</h4>
                  <p>{product.description || 'No description available.'}</p>
                </div>
                {product.ingredients && (
                  <div className={styles.ingredients}>
                    <h4>Ingredients / Composition</h4>
                    <p>{product.ingredients}</p>
                  </div>
                )}
                {product.usage && (
                  <div className={styles.usage}>
                    <h4>Usage Instructions</h4>
                    <p>{product.usage}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className={styles.reviewsTab}>
                <div className={styles.reviewsSummary}>
                  <div className={styles.reviewStats}>
                    <span className={styles.bigRating}>{avgRating ? avgRating.toFixed(1) : '4.5'}</span>
                    <div className={styles.reviewStars}>
                      {renderStars(avgRating || 4.5)}
                    </div>
                    <span className={styles.reviewCount}>{customerReviews.length} customer reviews</span>
                  </div>
                  <button className={styles.writeReviewBtn}>Write a Review</button>
                </div>
                <div className={styles.reviewsList}>
                  {customerReviews.map((review) => (
                    <div key={review.id} className={styles.reviewItem}>
                      <div className={styles.reviewHeader}>
                        <strong>{review.user}</strong>
                        {review.verified && (
                          <span className={styles.verifiedBadge}>
                            <FontAwesomeIcon icon={faCheckCircle} />
                            Verified Purchase
                          </span>
                        )}
                        <span className={styles.reviewDate}>
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className={styles.reviewStars}>
                        {renderStars(review.rating)}
                      </div>
                      <p className={styles.reviewComment}>{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className={styles.shippingTab}>
                <h3>Shipping Information</h3>
                <div className={styles.shippingInfo}>
                  <div className={styles.shippingItem}>
                    <FontAwesomeIcon icon={faTruck} />
                    <div>
                      <strong>Free Delivery</strong>
                      <p>Free delivery on all orders above ₦50,000. Standard delivery takes 3-5 business days.</p>
                    </div>
                  </div>
                  <div className={styles.shippingItem}>
                    <FontAwesomeIcon icon={faClock} />
                    <div>
                      <strong>Express Delivery</strong>
                      <p>Get your order in 1-2 business days for an additional ₦2,500.</p>
                    </div>
                  </div>
                  <div className={styles.shippingItem}>
                    <FontAwesomeIcon icon={faStore} />
                    <div>
                      <strong>Store Pickup</strong>
<p>Collect your order from any Medster Pharmacy location. Usually ready within 2 hours.</p>
                    </div>
                  </div>
                </div>
                <div className={styles.returnsInfo}>
                  <h4>Returns Policy</h4>
                  <p>We accept returns within 30 days of delivery for a full refund. Items must be in original condition.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className={styles.relatedProducts}>
          <div className={styles.relatedContent}>
            <h2>Related Products</h2>
            <p>Customers who bought this also bought</p>
            <div className={styles.relatedGrid}>
              {relatedProducts.map((related) => (
                <Link to={`/product/${related.id}`} key={related.id} className={styles.relatedCard}>
                  <img 
                    src={related.image || related.images?.[0] || '/images/placeholder.jpg'} 
                    alt={related.name} 
                  />
                  <h5>{related.name}</h5>
                  <p className={styles.relatedPrice}>₦{Number(related.price).toLocaleString()}</p>
                  <span className={styles.relatedRating}>
                    {'★'.repeat(Math.floor(related.rating || 4))}
                    {'☆'.repeat(5 - Math.floor(related.rating || 4))}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Product Benefits */}
      <div className={styles.productBenefits}>
        <div className={styles.benefitsContent}>
          <div className={styles.benefitItem}>
            <FontAwesomeIcon icon={faShieldAlt} />
            <h4>100% Authentic</h4>
            <p>Guaranteed genuine products directly from manufacturers</p>
          </div>
          <div className={styles.benefitItem}>
            <FontAwesomeIcon icon={faTag} />
            <h4>Best Price</h4>
            <p>Competitive pricing with price match guarantee</p>
          </div>
          <div className={styles.benefitItem}>
            <FontAwesomeIcon icon={faGift} />
            <h4>Free Gifts</h4>
            <p>Receive free health products with qualifying orders</p>
          </div>
          <div className={styles.benefitItem}>
            <FontAwesomeIcon icon={faPrescription} />
            <h4>Easy Refills</h4>
            <p>Set up automatic refills for your medications</p>
          </div>
        </div>
      </div>

      {/* Sticky Add to Cart on Mobile */}
      <div className={styles.stickyAdd}>
        <div className={styles.stickyContent}>
          <div className={styles.stickyPrice}>
            <span className={styles.stickyPriceValue}>
              ₦{Number(product.price).toLocaleString()}
            </span>
            {inStock && <span className={styles.stickyStock}>✓ In Stock</span>}
          </div>
          <button 
            className={styles.stickyAddBtn}
            onClick={handleAdd}
            disabled={!inStock || addingToCart}
          >
            {addingToCart ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <FontAwesomeIcon icon={faShoppingCart} />
            )}
            {addingToCart ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;