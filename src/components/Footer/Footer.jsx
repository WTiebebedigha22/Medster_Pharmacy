import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMessage, faBaby, faArrowRight, faCopyright, faHome, faPrescription, faPills, faHeart, faUserMd, faClock, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import styles from './Footer.module.css'
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function Footer() {
  useGSAP(() => {
    gsap.fromTo('.chat_btn', { y: 100, opacity: 0 }, { 
      y: 0, 
      opacity: 1, 
      duration: 1, 
      ease: "bounce.out", 
      delay: 0.5,
      scrollTrigger: {
        trigger: '.chat_btn',
        start: 'top 80%',
      },
    });
    
    gsap.fromTo('.link', { y: 20, opacity: 0 }, { 
      y: 0, 
      opacity: 1, 
      duration: 1, 
      ease: "power2.out", 
      stagger: 0.1, 
      delay: 1,
      scrollTrigger: {
        trigger: '.link',
        start: 'top 80%',
      },
    });
    
    gsap.fromTo('.backPage', { x: -100, opacity: 0 }, { 
      x: 0, 
      opacity: 1, 
      duration: 1, 
      ease: "power2.out",
      scrollTrigger: {
        trigger: '.backPage',
        start: 'top 80%',
      },
    });
    
    gsap.fromTo('.copywright', { y: 20, opacity: 0 }, { 
      y: 0, 
      opacity: 1, 
      duration: 1, 
      ease: "power2.out",
      scrollTrigger: {
        trigger: 'footer',
        start: 'top 80%',
      },
    });
  }, []);

  return (
    <footer className={styles.footer}>
      {/* Chat Button */}
      <span id={styles.btn_area}>
        <button id={styles.chat_btn} className='chat_btn'>
          <FontAwesomeIcon icon={faMessage} />
          <span className={styles.chatLabel}>Chat with us</span>
        </button>
      </span>

      <div id={styles.inner_footer}>
        {/* Back to Top Section */}
        <div className="backPage">
          <a href="#" id={styles.backToTop}>
            <span>Back to top</span>
            <span>
              <FontAwesomeIcon id={styles.transparent} icon={faBaby} />
              <FontAwesomeIcon icon={faArrowRight} />
            </span>
          </a>
        </div>

        {/* Main Footer Links */}
        <div id={styles.footerContent}>
          {/* Column 1 - Quick Links */}
          <div className={styles.footerColumn}>
            <h3 className={styles.columnTitle}>Quick Links</h3>
            <ul>
              <li className='link'>
                <a href="#">
                  <FontAwesomeIcon icon={faHome} /> 
                  <p>Home</p>
                </a>
              </li>
              <li className='link'>
                <a href="#">
                  <FontAwesomeIcon icon={faPrescription} />
                  <p>Prescriptions</p>
                </a>
              </li>
              <li className='link'>
                <a href="#">
                  <FontAwesomeIcon icon={faPills} />
                  <p>Medications</p>
                </a>
              </li>
              <li className='link'>
                <a href="#">
                  <FontAwesomeIcon icon={faHeart} />
                  <p>Health Resources</p>
                </a>
              </li>
              <li className='link'>
                <a href="#">
                  <FontAwesomeIcon icon={faUserMd} />
                  <p>Consult a Pharmacist</p>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2 - Services */}
          <div className={styles.footerColumn}>
            <h3 className={styles.columnTitle}>Our Services</h3>
            <ul>
              <li className='link'>
                <a href="#">Prescription Refills</a>
              </li>
              <li className='link'>
                <a href="#">Free Delivery</a>
              </li>
              <li className='link'>
                <a href="#">Medication Management</a>
              </li>
              <li className='link'>
                <a href="#">Health Checkups</a>
              </li>
              <li className='link'>
                <a href="#">Immunizations</a>
              </li>
            </ul>
          </div>

          {/* Column 3 - Support */}
          <div className={styles.footerColumn}>
            <h3 className={styles.columnTitle}>Support</h3>
            <ul>
              <li className='link'>
                <a href="#">
                  <FontAwesomeIcon icon={faPhone} />
                  <p>1-800-PHARMACY</p>
                </a>
              </li>
              <li className='link'>
                <a href="#">
                  <FontAwesomeIcon icon={faEnvelope} />
                  <p>support@pharmacy.com</p>
                </a>
              </li>
              <li className='link'>
                <a href="#">
                  <FontAwesomeIcon icon={faClock} />
                  <p>24/7 Customer Support</p>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4 - Company */}
          <div className={styles.footerColumn}>
            <h3 className={styles.columnTitle}>Company</h3>
            <ul>
              <li className='link'>
                <a href="#">About Us</a>
              </li>
              <li className='link'>
                <a href="#">Careers</a>
              </li>
              <li className='link'>
                <a href="#">Privacy Policy</a>
              </li>
              <li className='link'>
                <a href="#">Terms of Service</a>
              </li>
              <li className='link'>
                <a href="#">Blog</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className={styles.footerBottom}>
          <div className={styles.trustBadges}>
            <span>HIPAA Compliant</span>
            <span>Verified Pharmacy</span>
            <span>Trusted by 1M+ Customers</span>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className='copywright' id={styles.copyright}>
        <p>
          <FontAwesomeIcon icon={faCopyright} /> 2026 Amazon Pharmacy. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer;