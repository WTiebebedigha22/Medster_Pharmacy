import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faUserShield,
  faDatabase,
  faCookie,
  faEnvelope,
  faShareAlt,
  faTrashAlt,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Privacy.module.css";

const Privacy = () => {
  const sections = [
    {
      icon: faUserShield,
      title: "1. Information We Collect",
      content:
        "We collect information you provide directly, including your name, email address, phone number, shipping address, and payment information. We also collect information automatically, such as your IP address, browser type, device information, and browsing behavior on our website. Prescription-related information, including medical history and medication details, is collected when you upload prescriptions or order prescription medications.",
    },
    {
      icon: faDatabase,
      title: "2. How We Use Your Information",
      content:
        "We use your information to process and fulfill your orders, communicate with you about your account and purchases, provide customer support, improve our services, send promotional offers (with your consent), and comply with legal obligations. Your health information is used strictly for prescription verification and dispensing purposes.",
    },
    {
      icon: faShareAlt,
      title: "3. Information Sharing",
      content:
        "We do not sell your personal information to third parties. We may share your information with trusted service providers who assist us in operating our website and conducting our business, such as payment processors (Paystack), delivery partners, and pharmacy management systems. These parties are contractually obligated to keep your information confidential and secure.",
    },
    {
      icon: faLock,
      title: "4. Data Security",
      content:
        "We implement industry-standard security measures to protect your personal information, including SSL encryption for data transmission, secure server infrastructure, regular security audits, and access controls. Payment information is processed securely through PCI-compliant payment gateways and is never stored on our servers.",
    },
    {
      icon: faCookie,
      title: "5. Cookies & Tracking",
      content:
        "We use cookies and similar tracking technologies to enhance your browsing experience, analyze website traffic, and understand where our visitors come from. You can control cookie preferences through your browser settings. Disabling cookies may affect some features of our website.",
    },
    {
      icon: faTrashAlt,
      title: "6. Data Retention & Deletion",
      content:
        "We retain your personal information for as long as necessary to provide our services and comply with legal obligations. Account information is retained until you request deletion. Prescription records are retained for the period required by Nigerian pharmaceutical regulations. You may request deletion of your data by contacting our support team.",
    },
    {
      icon: faEnvelope,
      title: "7. Your Rights",
      content:
        "You have the right to access, correct, or delete your personal information at any time. You can update your profile information through your account settings. You may opt out of marketing communications at any time. You have the right to request a copy of the data we hold about you. To exercise these rights, please contact our Data Protection Officer.",
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
            <FontAwesomeIcon icon={faUserShield} />
          </div>
          <h1>Privacy Policy</h1>
          <p className={styles.lastUpdated}>Last updated: January 2025</p>
        </div>

        {/* Introduction */}
        <div className={styles.intro}>
          <p>
            At Medster Pharmacy, we take your privacy seriously. This Privacy Policy explains how we
            collect, use, disclose, and safeguard your information when you visit our website or use
            our pharmaceutical services. Please read this policy carefully.
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
          <h3>Privacy Questions?</h3>
          <p>
            If you have any questions about this Privacy Policy or how we handle your data, please
            contact our Data Protection Officer:
          </p>
          <div className={styles.contactDetails}>
            <p><strong>Email:</strong> privacy@medsterpharmacy.com</p>
            <p><strong>Phone:</strong> +234 800 MEDSTER</p>
            <p><strong>Address:</strong> 123 Pharmacy Road, Lagos, Nigeria</p>
          </div>
          <Link to="/contact-us" className={styles.contactBtn}>
            Contact Our DPO
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
