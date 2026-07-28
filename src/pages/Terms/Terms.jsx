import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldAlt,
  faFileContract,
  faGavel,
  faUserCheck,
  faCreditCard,
  faTruck,
  faExclamationTriangle,
  faCopyright,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Terms.module.css";

const Terms = () => {
  const sections = [
    {
      icon: faFileContract,
      title: "1. Acceptance of Terms",
      content:
        "By accessing and using Medster Pharmacy's website and services, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use our services. These terms constitute a legally binding agreement between you and Medster Pharmacy Ltd.",
    },
    {
      icon: faUserCheck,
      title: "2. Eligibility & Account Registration",
      content:
        "You must be at least 18 years old to use our services. When creating an account, you agree to provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. Medster Pharmacy reserves the right to suspend or terminate accounts that violate these terms.",
    },
    {
      icon: faShieldAlt,
      title: "3. Product Information & Availability",
      content:
        "We strive to ensure all product descriptions, prices, and availability are accurate. However, we do not warrant that product descriptions or other content are error-free. We reserve the right to modify or discontinue products without prior notice. All prescription medications require a valid prescription from a licensed healthcare professional.",
    },
    {
      icon: faCreditCard,
      title: "4. Pricing & Payment",
      content:
        "All prices are listed in Nigerian Naira (NGN) and include applicable taxes unless stated otherwise. We accept various payment methods including card payments (via Paystack), bank transfers, USSD, and pay on delivery. Payment must be received in full before order processing begins. We reserve the right to correct pricing errors.",
    },
    {
      icon: faTruck,
      title: "5. Shipping & Delivery",
      content:
        "We deliver to addresses within Nigeria. Delivery times are estimates and not guaranteed. Standard delivery takes 3-5 business days, while express delivery takes 1-2 business days. We are not responsible for delays caused by third-party carriers or circumstances beyond our control. Risk of loss passes to you upon delivery.",
    },
    {
      icon: faExclamationTriangle,
      title: "6. Returns & Refunds",
      content:
        "Due to the nature of pharmaceutical products, we cannot accept returns on medications for safety reasons. Damaged or incorrect items must be reported within 48 hours of delivery. Refunds for eligible returns will be processed within 5-10 business days to the original payment method. We reserve the right to refuse returns that do not meet our policy.",
    },
    {
      icon: faGavel,
      title: "7. Prescription Medications",
      content:
        "Prescription-only medications (Rx) require a valid prescription from a licensed healthcare professional. By uploading a prescription, you certify that it is genuine and valid. Our pharmacists will verify all prescriptions. We reserve the right to refuse dispensing if the prescription appears invalid or inappropriate.",
    },
    {
      icon: faCopyright,
      title: "8. Intellectual Property",
      content:
        "All content on this website, including text, graphics, logos, images, and software, is the property of Medster Pharmacy Ltd and is protected by Nigerian and international copyright laws. You may not reproduce, distribute, or create derivative works without our express written consent.",
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Back Button */}
        <Link to="/" className={styles.backLink}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Home
        </Link>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <FontAwesomeIcon icon={faFileContract} />
          </div>
          <h1>Terms & Conditions</h1>
          <p className={styles.lastUpdated}>Last updated: January 2025</p>
        </div>

        {/* Introduction */}
        <div className={styles.intro}>
          <p>
            Welcome to Medster Pharmacy. These Terms and Conditions govern your use of our website,
            mobile application, and pharmaceutical services. Please read these terms carefully before
            using our services.
          </p>
        </div>

        {/* Sections */}
        <div className={styles.sections}>
          {sections.map((section, index) => (
            <div key={index} className={styles.section}>
              <div className={styles.sectionIcon}>
                <FontAwesomeIcon icon={section.icon} />
              </div>
              <div className={styles.sectionContent}>
                <h2>{section.title}</h2>
                <p>{section.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className={styles.contactSection}>
          <h3>Questions About These Terms?</h3>
          <p>
            If you have any questions about our Terms and Conditions, please contact us:
          </p>
          <div className={styles.contactDetails}>
            <p><strong>Email:</strong> legal@medsterpharmacy.com</p>
            <p><strong>Phone:</strong> +234 800 MEDSTER</p>
            <p><strong>Address:</strong> 123 Pharmacy Road, Lagos, Nigeria</p>
          </div>
          <Link to="/contact-us" className={styles.contactBtn}>
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Terms;
