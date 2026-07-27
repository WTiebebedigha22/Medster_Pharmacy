import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserMd,
  faFlask,
  faSyringe,
  faPrescription,
  faTruck,
  faHeartbeat,
  faPills,
  faStethoscope,
  faBaby,
  faEye,
  faTooth,
  faArrowRight,
  faShieldAlt,
  faClock,
  faPhone,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Services.module.css";

const services = [
  {
    icon: faUserMd,
    title: "Teleconsultation",
    desc: "Video or phone consultation with licensed doctors from the comfort of your home.",
    link: "/consult",
    featured: true,
  },
  {
    icon: faPrescription,
    title: "Prescription Processing",
    desc: "Upload your prescription and our pharmacists will process and prepare your medications.",
    link: "/prescriptions/add",
    featured: true,
  },
  {
    icon: faFlask,
    title: "Lab Tests",
    desc: "Book and get lab tests done at partner diagnostic centers near you.",
    link: "#",
    featured: true,
  },
  {
    icon: faSyringe,
    title: "Vaccinations",
    desc: "Get vaccinated with our immunization services for all age groups.",
    link: "#",
    featured: true,
  },
  {
    icon: faTruck,
    title: "Medicine Delivery",
    desc: "Free delivery of medications to your doorstep within 3-5 business days.",
    link: "/shop",
  },
  {
    icon: faPills,
    title: "Medication Management",
    desc: "Set up automatic refills and medication reminders for chronic conditions.",
    link: "#",
  },
  {
    icon: faHeartbeat,
    title: "Health Checkups",
    desc: "Comprehensive health screening packages at affordable rates.",
    link: "#",
  },
  {
    icon: faBaby,
    title: "Baby & Child Care",
    desc: "Pediatric consultations, vaccinations, and child wellness programs.",
    link: "#",
  },
  {
    icon: faEye,
    title: "Eye Care",
    desc: "Vision tests, glasses, and eye health consultations with optometrists.",
    link: "#",
  },
  {
    icon: faTooth,
    title: "Dental Care",
    desc: "Dental consultations and oral health products and recommendations.",
    link: "#",
  },
  {
    icon: faStethoscope,
    title: "Chronic Care",
    desc: "Ongoing support for diabetes, hypertension, asthma, and other chronic conditions.",
    link: "#",
  },
  {
    icon: faPhone,
    title: "24/7 Pharmacist Hotline",
    desc: "Speak with a licensed pharmacist anytime for medication advice.",
    link: "#",
  },
];

const ServiceCard = ({ service }) => (
  <div className={`${styles.serviceCard} ${service.featured ? styles.featured : ""}`}>
    <div className={styles.serviceIcon}>
      <FontAwesomeIcon icon={service.icon} />
    </div>
    <h3>{service.title}</h3>
    <p>{service.desc}</p>
    <Link to={service.link} className={styles.serviceLink}>
      Learn More <FontAwesomeIcon icon={faArrowRight} />
    </Link>
  </div>
);

const Services = () => {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Our Services</span>
          <h1>Complete Healthcare Services<br />All in One Place</h1>
          <p>
            From doctor consultations to medicine delivery, Medster Pharmacy offers
            a full range of healthcare services designed for your convenience and well-being.
          </p>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.statValue}>50,000+</span>
              <span>Patients Served</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.statValue}>12+</span>
              <span>Services Offered</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.statValue}>98%</span>
              <span>Satisfaction Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className={styles.featuredServices}>
        <div className={styles.sectionContainer}>
          <h2>Most Popular Services</h2>
          <p>Our most used healthcare services</p>
          <div className={styles.featuredGrid}>
            {services.filter((s) => s.featured).map((service, index) => (
              <div key={index} className={styles.featuredCard}>
                <div className={styles.featuredIcon}>
                  <FontAwesomeIcon icon={service.icon} />
                </div>
                <div className={styles.featuredInfo}>
                  <h3>{service.title}</h3>
                  <p>{service.desc}</p>
                  <Link to={service.link} className={styles.featuredLink}>
                    Get Started <FontAwesomeIcon icon={faArrowRight} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Services */}
      <section className={styles.allServices}>
        <div className={styles.sectionContainer}>
          <h2>All Services</h2>
          <p>Explore our complete range of healthcare services</p>
          <div className={styles.servicesGrid}>
            {services.map((service, index) => (
              <ServiceCard key={index} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className={styles.whyUs}>
        <div className={styles.sectionContainer}>
          <h2>Why Choose Medster Pharmacy</h2>
          <div className={styles.whyGrid}>
            <div className={styles.whyCard}>
              <FontAwesomeIcon icon={faShieldAlt} />
              <h3>Licensed & Regulated</h3>
              <p>We operate under strict pharmacy regulations and standards.</p>
            </div>
            <div className={styles.whyCard}>
              <FontAwesomeIcon icon={faStar} />
              <h3>Qualified Professionals</h3>
              <p>Our team comprises licensed pharmacists and healthcare providers.</p>
            </div>
            <div className={styles.whyCard}>
              <FontAwesomeIcon icon={faClock} />
              <h3>Fast & Reliable</h3>
              <p>Same-day processing and quick delivery for your convenience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2>Ready to Get Started?</h2>
          <p>Book a consultation, upload a prescription, or shop for health products.</p>
          <div className={styles.ctaBtns}>
            <Link to="/consult" className={styles.ctaBtn}>Book Consultation</Link>
            <Link to="/shop" className={styles.ctaBtnOutline}>Shop Products</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;

