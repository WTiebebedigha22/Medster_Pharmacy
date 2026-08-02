import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faQuestionCircle,
  faBug,
  faPhone,
  faEnvelope,
  faCommentDots,
  faBookOpen,
  faTools,
  faShieldAlt,
  faArrowRight,
  faShoppingCart,
  faPrescription,
  faUser,
  faCreditCard,
  faTruck,
  faBox,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Help.module.css";

const helpTopics = [
  {
    icon: faShoppingCart,
    title: "Orders & Delivery",
    desc: "Track your order, delivery times, and shipping policies.",
    link: "/faqs#orders",
  },
  {
    icon: faPrescription,
    title: "Prescriptions",
    desc: "Uploading, verifying, and refilling your prescriptions.",
    link: "/faqs#prescriptions",
  },
  {
    icon: faUser,
    title: "Account & Login",
    desc: "Account creation, password reset, and profile management.",
    link: "/faqs#account",
  },
  {
    icon: faCreditCard,
    title: "Payments & Refunds",
    desc: "Payment methods, billing issues, and refund requests.",
    link: "/faqs#payment",
  },
  {
    icon: faTruck,
    title: "Delivery Issues",
    desc: "Late deliveries, damaged items, and address changes.",
    link: "/faqs#orders",
  },
  {
    icon: faBox,
    title: "Products & Availability",
    desc: "Product authenticity, stock inquiries, and alternatives.",
    link: "/faqs#general",
  },
];

const Help = () => {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Help Center</span>
          <h1>How Can We Help You?</h1>
          <p>
            Browse help topics, check our FAQs, or reach out to our support team.
            We're here to assist you with any questions or issues.
          </p>
          <div className={styles.quickActions}>
            <Link to="/faqs" className={styles.quickAction}>
              <FontAwesomeIcon icon={faQuestionCircle} />
              Browse FAQs
            </Link>
            <Link to="/contact-us" className={styles.quickAction}>
              <FontAwesomeIcon icon={faEnvelope} />
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Help Topics */}
      <section className={styles.topics}>
        <div className={styles.sectionContainer}>
          <h2>Browse Help Topics</h2>
          <div className={styles.topicsGrid}>
            {helpTopics.map((topic, index) => (
              <Link to={topic.link} key={index} className={styles.topicCard}>
                <div className={styles.topicIcon}>
                  <FontAwesomeIcon icon={topic.icon} />
                </div>
                <h3>{topic.title}</h3>
                <p>{topic.desc}</p>
                <span className={styles.topicLink}>
                  Get Help <FontAwesomeIcon icon={faArrowRight} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className={styles.contactOptions}>
        <div className={styles.sectionContainer}>
          <h2>Contact Support</h2>
          <p>Choose your preferred way to reach us</p>
          <div className={styles.contactGrid}>
            <div className={styles.contactCard}>
              <div className={styles.contactIcon}>
                <FontAwesomeIcon icon={faPhone} />
              </div>
              <h3>Phone Support</h3>
              <p>Speak directly with our support team</p>
              <a href="tel:+2348000000000" className={styles.contactLink}>
                +234 800 000 0000
              </a>
              <span className={styles.contactHours}>Available 24/7</span>
            </div>

            <div className={styles.contactCard}>
              <div className={styles.contactIcon}>
                <FontAwesomeIcon icon={faEnvelope} />
              </div>
              <h3>Email Support</h3>
              <p>Send us an email and we'll respond promptly</p>
              <a href="mailto:support@medsterpharmacy.com" className={styles.contactLink}>
                support@medsterpharmacy.com
              </a>
              <span className={styles.contactHours}>Response time: 1-2 hours</span>
            </div>

            <div className={styles.contactCard}>
              <div className={styles.contactIcon}>
                <FontAwesomeIcon icon={faCommentDots} />
              </div>
              <h3>Live Chat</h3>
              <p>Chat with our support team in real-time</p>
              <button className={styles.contactBtn}>
                Start Live Chat
              </button>
              <span className={styles.contactHours}>Available 24/7</span>
            </div>
          </div>
        </div>
      </section>

      {/* Report Issue */}
      <section className={styles.reportIssue}>
        <div className={styles.sectionContainer}>
          <div className={styles.reportCard}>
            <div className={styles.reportIcon}>
              <FontAwesomeIcon icon={faBug} />
            </div>
            <div className={styles.reportContent}>
              <h2>Report an Issue</h2>
              <p>
                Experiencing a technical problem or found a bug on our website?
                Let us know and we'll fix it as soon as possible.
              </p>
            </div>
            <Link to="/contact-us" className={styles.reportBtn}>
              Report Issue <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className={styles.resources}>
        <div className={styles.sectionContainer}>
          <h2>Additional Resources</h2>
          <div className={styles.resourcesGrid}>
            <div className={styles.resourceCard}>
              <FontAwesomeIcon icon={faBookOpen} />
              <h3>User Guide</h3>
              <p>Learn how to use all features of Medster Pharmacy.</p>
              <Link to="/faqs">Read Guide <FontAwesomeIcon icon={faArrowRight} /></Link>
            </div>
            <div className={styles.resourceCard}>
              <FontAwesomeIcon icon={faShieldAlt} />
              <h3>Privacy & Security</h3>
              <p>Learn how we protect your data and privacy.</p>
              <Link to="/privacy">Learn More <FontAwesomeIcon icon={faArrowRight} /></Link>
            </div>
            <div className={styles.resourceCard}>
              <FontAwesomeIcon icon={faTools} />
              <h3>System Status</h3>
              <p>Check the current status of our services.</p>
              <Link to="/status">Check Status <FontAwesomeIcon icon={faArrowRight} /></Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Help;

