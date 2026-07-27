import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faSearch,
  faShoppingCart,
  faPrescription,
  faTruck,
  faCreditCard,
  faUser,
  faQuestionCircle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./FAQs.module.css";

const faqCategories = [
  {
    id: "orders",
    icon: faShoppingCart,
    name: "Orders & Delivery",
    questions: [
      {
        q: "How do I place an order?",
        a: "Simply browse our catalog, add items to your cart, and proceed to checkout. You'll need to create an account or log in to complete your purchase. Follow the prompts to enter your shipping details and payment information.",
      },
      {
        q: "How long does delivery take?",
        a: "Standard delivery takes 3-5 business days. Express delivery is available for 1-2 business days at an additional cost. Free delivery is available on orders above ₦50,000.",
      },
      {
        q: "Can I track my order?",
        a: "Yes! Once your order is shipped, you'll receive a tracking number via email and SMS. You can also track your order in the 'My Orders' section of your account.",
      },
      {
        q: "What areas do you deliver to?",
        a: "We currently deliver to all 36 states in Nigeria, including the FCT. Delivery to remote areas may take slightly longer.",
      },
      {
        q: "Can I change my delivery address after placing an order?",
        a: "You can change your delivery address within 1 hour of placing the order. Contact our support team immediately to make changes.",
      },
    ],
  },
  {
    id: "prescriptions",
    icon: faPrescription,
    name: "Prescriptions",
    questions: [
      {
        q: "How do I upload a prescription?",
        a: "Go to the 'Upload Prescription' page, take a clear photo or scan of your prescription, and upload it. Our pharmacy team will review and process it within 1-2 hours.",
      },
      {
        q: "What types of prescriptions do you accept?",
        a: "We accept valid prescriptions from licensed healthcare professionals. The prescription must be clearly legible, include patient name, date, and doctor's signature.",
      },
      {
        q: "How long does prescription verification take?",
        a: "Prescription verification typically takes 1-2 hours during business hours. Orders placed before 2 PM are usually ready for same-day pickup or dispatch.",
      },
      {
        q: "Can I get a refill on my prescription?",
        a: "Yes, you can request refills for eligible prescriptions. Simply log in to your account, go to 'My Prescriptions', and click 'Request Refill'.",
      },
    ],
  },
  {
    id: "payment",
    icon: faCreditCard,
    name: "Payment & Pricing",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept major credit/debit cards, bank transfers, USSD payments, and cash on delivery (selected locations). All payments are processed securely.",
      },
      {
        q: "Is my payment information secure?",
        a: "Absolutely. We use industry-standard encryption and security measures to protect your payment information. We are PCI-DSS compliant.",
      },
      {
        q: "Do you offer discounts or promotions?",
        a: "Yes! We regularly offer discounts, seasonal promotions, and loyalty rewards. Sign up for our newsletter to stay updated on the best deals.",
      },
      {
        q: "Can I get a refund?",
        a: "We accept returns within 30 days of delivery for unopened items. Prescription medications cannot be returned once dispensed due to safety regulations.",
      },
    ],
  },
  {
    id: "account",
    icon: faUser,
    name: "Account & Support",
    questions: [
      {
        q: "How do I create an account?",
        a: "Click on 'Account' in the top navigation bar, then select 'Register'. Fill in your details and verify your email address to get started.",
      },
      {
        q: "I forgot my password. How do I reset it?",
        a: "On the login page, click 'Forgot Password'. Enter your registered email address, and we'll send you a password reset link.",
      },
      {
        q: "How do I contact customer support?",
        a: "You can reach us via phone at +234 800 000 0000, email at support@medsterpharmacy.com, or through the live chat feature on our website. We're available 24/7.",
      },
      {
        q: "Can I cancel my order?",
        a: "Orders can be cancelled within 1 hour of placement. After that, the order may already be in processing. Contact support immediately for cancellation requests.",
      },
    ],
  },
  {
    id: "general",
    icon: faQuestionCircle,
    name: "General",
    questions: [
      {
        q: "Are your products authentic?",
        a: "Yes! We source all our products directly from manufacturers and authorized distributors. We guarantee 100% authentic products.",
      },
      {
        q: "Do I need a prescription for all medications?",
        a: "No. Over-the-counter (OTC) medications, supplements, and health products can be purchased without a prescription. Prescription-only medications require a valid prescription from a licensed healthcare provider.",
      },
      {
        q: "Can I pick up my order from a store?",
        a: "Yes, we offer in-store pickup at select Medster Pharmacy locations. Choose 'Store Pickup' at checkout and select your preferred branch.",
      },
      {
        q: "Do you offer health consultations?",
        a: "Yes! We offer online consultations with licensed doctors through our Telehealth service. You can book a video, phone, or chat consultation.",
      },
    ],
  },
];

const FAQs = () => {
  const [activeCategory, setActiveCategory] = useState("orders");
  const [openQuestions, setOpenQuestions] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const toggleQuestion = (categoryId, index) => {
    const key = `${categoryId}-${index}`;
    setOpenQuestions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const activeCategoryData = faqCategories.find((c) => c.id === activeCategory);
  const filteredQuestions = activeCategoryData?.questions.filter(
    (q) =>
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions about ordering, prescriptions, delivery, and more.</p>
          <div className={styles.searchBox}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className={styles.clearBtn} onClick={() => setSearchQuery("")}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>
        </div>
      </section>

      <div className={styles.content}>
        {/* Category Tabs */}
        <div className={styles.categories}>
          {faqCategories.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.categoryBtn} ${activeCategory === cat.id ? styles.active : ""}`}
              onClick={() => { setActiveCategory(cat.id); setSearchQuery(""); }}
            >
              <FontAwesomeIcon icon={cat.icon} />
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Questions */}
        <div className={styles.questionsSection}>
          {filteredQuestions && filteredQuestions.length > 0 ? (
            filteredQuestions.map((item, index) => {
              const key = `${activeCategory}-${index}`;
              const isOpen = openQuestions[key];
              return (
                <div
                  key={index}
                  className={`${styles.faqItem} ${isOpen ? styles.open : ""}`}
                  onClick={() => toggleQuestion(activeCategory, index)}
                >
                  <div className={styles.question}>
                    <span>{item.q}</span>
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`${styles.chevron} ${isOpen ? styles.rotated : ""}`}
                    />
                  </div>
                  <div className={`${styles.answer} ${isOpen ? styles.show : ""}`}>
                    <p>{item.a}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.noResults}>
              <FontAwesomeIcon icon={faSearch} />
              <p>No results found for "{searchQuery}"</p>
              <button onClick={() => setSearchQuery("")}>Clear search</button>
            </div>
          )}
        </div>
      </div>

      {/* Still Need Help */}
      <section className={styles.helpCta}>
        <div className={styles.helpCtaContent}>
          <h2>Still Have Questions?</h2>
          <p>Our support team is ready to help you.</p>
          <div className={styles.helpCtaBtns}>
            <Link to="/contact-us" className={styles.helpBtn}>
              Contact Us
            </Link>
            <Link to="/help" className={styles.helpBtnOutline}>
              Visit Help Center
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQs;

