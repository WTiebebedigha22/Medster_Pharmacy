import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeartbeat,
  faShieldAlt,
  faUsers,
  faAward,
  faHandshake,
  faLightbulb,
  faArrowRight,
  faCheckCircle,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./AboutPharmacy.module.css";

const AboutPharmacy = () => {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <span className={styles.heroBadge}>About Medster Pharmacy</span>
            <h1>Your Trusted Partner in Health & Wellness</h1>
            <p>
              Medster Pharmacy is a modern, patient-centered pharmacy committed to providing
              accessible, affordable, and authentic healthcare products and services to
              communities across Nigeria.
            </p>
            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span className={styles.statNumber}>15+</span>
                <span>Years of Service</span>
              </div>
              <div className={styles.heroStat}>
                <span className={styles.statNumber}>1M+</span>
                <span>Happy Customers</span>
              </div>
              <div className={styles.heroStat}>
                <span className={styles.statNumber}>500+</span>
                <span>Trusted Brands</span>
              </div>
              <div className={styles.heroStat}>
                <span className={styles.statNumber}>50+</span>
                <span>Locations</span>
              </div>
            </div>
          </div>
          <div className={styles.heroImage}>
            <div className={styles.heroPlaceholder}>
              <FontAwesomeIcon icon={faHeartbeat} />
              <p>Medster Pharmacy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className={styles.mission}>
        <div className={styles.sectionContainer}>
          <div className={styles.missionGrid}>
            <div className={styles.missionCard}>
              <h2>Our Mission</h2>
              <p>
                To improve the health and well-being of our communities by providing
                accessible, affordable, and high-quality pharmacy services, empowered
                by technology and delivered with compassion.
              </p>
            </div>
            <div className={styles.missionCard}>
              <h2>Our Vision</h2>
              <p>
                To be the most trusted and innovative pharmacy platform in Africa,
                setting the standard for patient-centered care and digital health
                transformation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className={styles.story}>
        <div className={styles.sectionContainer}>
          <div className={styles.storyContent}>
            <h2>Our Story</h2>
            <p>
              Founded in 2010, Medster Pharmacy began as a small community pharmacy
              with a simple mission: to provide authentic medications and personalized
              care to our neighbors. Over the years, we've grown into one of Nigeria's
              most trusted pharmacy chains, serving over a million customers across
              more than 50 locations nationwide.
            </p>
            <p>
              In 2024, we launched our digital platform to bring the same level of
              trust and quality service online. Today, customers can shop for
              medications, consult with doctors, upload prescriptions, and get
              deliveries right to their doorstep — all through our integrated platform.
            </p>
            <p>
              Our growth has been driven by our unwavering commitment to authenticity,
              patient safety, and exceptional customer service. We partner directly
              with manufacturers and authorized distributors to ensure every product
              we sell is 100% genuine.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className={styles.values}>
        <div className={styles.sectionContainer}>
          <h2>Our Core Values</h2>
          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <FontAwesomeIcon icon={faShieldAlt} />
              <h3>Trust & Integrity</h3>
              <p>We uphold the highest ethical standards in every interaction.</p>
            </div>
            <div className={styles.valueCard}>
              <FontAwesomeIcon icon={faUsers} />
              <h3>Patient-Centered</h3>
              <p>Every decision we make puts our patients' well-being first.</p>
            </div>
            <div className={styles.valueCard}>
              <FontAwesomeIcon icon={faAward} />
              <h3>Quality Excellence</h3>
              <p>We never compromise on the quality of our products and services.</p>
            </div>
            <div className={styles.valueCard}>
              <FontAwesomeIcon icon={faLightbulb} />
              <h3>Innovation</h3>
              <p>We continuously evolve to bring you the best healthcare experience.</p>
            </div>
            <div className={styles.valueCard}>
              <FontAwesomeIcon icon={faHandshake} />
              <h3>Partnership</h3>
              <p>We work closely with healthcare providers to ensure coordinated care.</p>
            </div>
            <div className={styles.valueCard}>
              <FontAwesomeIcon icon={faHeartbeat} />
              <h3>Community</h3>
              <p>We're committed to improving health outcomes in our communities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className={styles.team}>
        <div className={styles.sectionContainer}>
          <h2>Our Leadership Team</h2>
          <div className={styles.teamGrid}>
            <div className={styles.teamCard}>
              <div className={styles.teamAvatar}>
                <FontAwesomeIcon icon={faUserMd} />
              </div>
              <h3>Dr. Adewale Ogunlesi</h3>
              <p className={styles.teamRole}>Founder & CEO</p>
              <p className={styles.teamBio}>Pharmacist with 20+ years of experience in pharmaceutical care.</p>
            </div>
            <div className={styles.teamCard}>
              <div className={styles.teamAvatar}>
                <FontAwesomeIcon icon={faUserMd} />
              </div>
              <h3>Dr. Chioma Eze</h3>
              <p className={styles.teamRole}>Chief Pharmacist</p>
              <p className={styles.teamBio}>Leading our clinical team with expertise in patient care.</p>
            </div>
            <div className={styles.teamCard}>
              <div className={styles.teamAvatar}>
                <FontAwesomeIcon icon={faUserMd} />
              </div>
              <h3>Emeka Okonkwo</h3>
              <p className={styles.teamRole}>Chief Technology Officer</p>
              <p className={styles.teamBio}>Driving digital innovation in healthcare delivery.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className={styles.certifications}>
        <div className={styles.sectionContainer}>
          <h2>Licenses & Certifications</h2>
          <div className={styles.certGrid}>
            <div className={styles.certCard}>
              <FontAwesomeIcon icon={faCheckCircle} />
              <p>Licensed by the Pharmacists Council of Nigeria (PCN)</p>
            </div>
            <div className={styles.certCard}>
              <FontAwesomeIcon icon={faCheckCircle} />
              <p>NAFDAC Certified for pharmaceutical product handling</p>
            </div>
            <div className={styles.certCard}>
              <FontAwesomeIcon icon={faCheckCircle} />
              <p>HIPAA Compliant for data protection and privacy</p>
            </div>
            <div className={styles.certCard}>
              <FontAwesomeIcon icon={faCheckCircle} />
              <p>ISO 9001:2015 Certified for quality management</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2>Experience the Medster Difference</h2>
          <p>Join over 1 million satisfied customers who trust us with their health.</p>
          <div className={styles.ctaBtns}>
            <Link to="/shop" className={styles.ctaBtn}>Shop Now</Link>
            <Link to="/contact-us" className={styles.ctaBtnOutline}>Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPharmacy;

