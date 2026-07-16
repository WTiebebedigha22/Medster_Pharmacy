/* eslint-disable no-irregular-whitespace */
import React, { useState } from "react";
import styles from './NavBar.module.css'; 
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faMagnifyingGlass, 
    faEnvelope, 
    faUser,
    faShoppingCart,
    faChevronDown,
    faBars
} from '@fortawesome/free-solid-svg-icons';
import Hamburger from 'hamburger-react';
import { useCart } from "../../context/CartContext";

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const [accountOpen, setAccountOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const { cartItems } = useCart();  // NEW — dynamic cart count

  const toggleAccount = () => {
    setHelpOpen(false);
    setAccountOpen(!accountOpen);
  };

  const toggleHelp = () => {
    setAccountOpen(false);
    setHelpOpen(!helpOpen);
  };

  return (
    <div className={styles.header}>
        
        {/* TOP BAR */}
        <div className={styles["navbar__top-bar"]}>
            <div className={styles.container}>
                <a href="#" className={styles["top-bar__link"]}>Sell on Medster</a>
                <a href="#" className={styles["top-bar__link"]}>Download App</a>
            </div>
        </div>

        {/* MAIN NAV */}
        <div className={styles.navbar}>
            <div className={styles.container}>

                {/* LOGO */}
                <div className={styles["navbar__logo"]}>
                    <NavLink to="/">
                        <img src="/src/components/NavBar/Logo.png" alt="Logo" />
                        Medster Pharmacy
                    </NavLink>
                </div>

                {/* SEARCH BAR (placeholder only) */}
                <div className={styles["navbar__search-main"]}>
                    <input
                        type="text"
                        placeholder="Search products, brands and categories..."
                        className={styles["navbar__search-input"]}
                    />
                    <button className={styles["navbar__search-button"]}>
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                        <span>SEARCH</span>
                    </button>
                </div>

                {/* ACTION BUTTONS */}
                <div className={styles["navbar__main-actions"]}>

                    {/* ACCOUNT */}
                    <div className={styles["action__item"]} onClick={toggleAccount}>
                        <FontAwesomeIcon icon={faUser} />
                        <span className={styles["action__text"]}>Account</span>
                        <FontAwesomeIcon icon={faChevronDown} className={styles["action__icon--dropdown"]} />

                        {accountOpen && (
                            <div className={styles.dropdown}>
                                <NavLink to="/auth/login">Login</NavLink>
                                <NavLink to="/auth/register">Register</NavLink>
                                <NavLink to="/orders">My Orders</NavLink>
                                <NavLink to="#">My Account</NavLink>
                            </div>
                        )}
                    </div>

                    {/* HELP */}
                    <div className={styles["action__item"]} onClick={toggleHelp}>
                        <FontAwesomeIcon icon={faEnvelope} />
                        <span className={styles["action__text"]}>Help</span>
                        <FontAwesomeIcon icon={faChevronDown} className={styles["action__icon--dropdown"]} />

                        {helpOpen && (
                            <div className={styles.dropdown}>
                                <NavLink to="/contact-us">Contact Us</NavLink>
                                <NavLink to="#">FAQs</NavLink>
                                <NavLink to="#">Report an Issue</NavLink>
                            </div>
                        )}
                    </div>

                    {/* CART */}
                    <NavLink to="/cart" className={styles["action__item"]}>
                        <FontAwesomeIcon icon={faShoppingCart} />
                        <span className={styles["action__text"]}>Cart</span>

                        {/* DYNAMIC COUNT */}
                        {cartItems.length > 0 && (
                            <span className={styles["cart__count"]}>
                                {cartItems.length}
                            </span>
                        )}
                    </NavLink>

                    {/* MOBILE MENU */}
                    <div className={styles["navbar__mobile-actions"]}>
                        <Hamburger toggled={menuOpen} toggle={setMenuOpen} size={25} />
                    </div>

                </div>
            </div>
        </div>

        {/* MOBILE MENU LINKS */}
        <ul className={`${styles["navbar__links-mobile"]} ${menuOpen ? styles.active : ""}`}>
            <li>
                <div
                    className={styles["category__toggle"]}
                    onClick={() => setCategoriesOpen(!categoriesOpen)}
                >
                    <FontAwesomeIcon icon={faBars} />
                    <span>SHOP</span>
                </div>
            </li>

            <li><NavLink to="/shop">Shop</NavLink></li>
            <li><NavLink to="/orders">My Orders</NavLink></li>
            <li><NavLink to="/contact-us">Contact Us</NavLink></li>
        </ul>

        {/* CATEGORY SIDEBAR (placeholder) */}
        {categoriesOpen && (
            <div className={styles["category__sidebar"]}>
                <ul>
                    <li><NavLink to="/shop">Pain Relief</NavLink></li>
                    <li><NavLink to="/shop">Vitamins</NavLink></li>
                </ul>
            </div>
        )}
    </div>
  );
};

export default NavBar;

