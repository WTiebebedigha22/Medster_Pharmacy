import React from "react";
import styles from "./Contact.module.css";

function Sec3() {
  return (
    <div className={styles.options}>
      {/* Chat */}
      <div>
        <h3 className={styles.optionTitle}>Chat with us</h3>
        <p className={styles.optionText}>Speak to our friendly team via live chat.</p>
        <ul className={styles.optionList}>
          <li>
            <i className={`fas fa-comments ${styles.icon}`}></i>
            <a href="#">Start a live chat</a>
          </li>
          <li>
            <i className={`fas fa-envelope ${styles.icon}`}></i>
            <a href="#">Shoot us an email</a>
          </li>
          <li>
            <i className={`fab fa-x-twitter ${styles.icon}`}></i>
            <a href="#">Message us on X</a>
          </li>
        </ul>
      </div>

      {/* Call */}
      <div>
        <h3 className={styles.optionTitle}>Call us</h3>
        <p className={styles.optionText}>Call our team Mon-Fri from 8am to 5pm.</p>
        <p>
          <i className={`fas fa-phone ${styles.icon}`}></i>
          <a href="tel:+2348032360060">+2348032360060</a>
        </p>
        <p>
          <i className={`fas fa-phone ${styles.icon}`}></i>
          <a href="tel:+2348089337391">+2348089337391</a>
        </p>
        <p>
          <i className={`fas fa-phone ${styles.icon}`}></i>
          <a href="tel:+2347055556438">+2347055556438</a>
        </p>
        <p>
          <i className={`fas fa-phone ${styles.icon}`}></i>
          <a href="tel:+2349158518238">+2349158518238</a> IKEJA-LAGOS
        </p>
        <p>
          <i className={`fas fa-phone ${styles.icon}`}></i>
          <a href="tel:+2348062424012">+2348062424012</a> IKEJA-LAGOS
        </p>
      </div>

      {/* Visit */}
      <div>
        <h3 className={styles.optionTitle}>Visit us</h3>
        <p className={styles.optionText}>Chat to us in person at our Melbourne HQ.</p>
        <p>
          <i className={`fas fa-location-dot ${styles.icon}`}></i>
          <a
            href="https://maps.google.com/?q=100+Smith+Street,+Collingwood+VIC+3066"
            target="_blank"
            rel="noreferrer"
          >
            <h3>ABUJA</h3>
           <p>Suite 204,HGC Plaza,No.14 Alexandra Crescent,
             <br />Off Aminu Kano Crescent ,Wuse II,Abuja </p>
          </a>
        </p>
        <p>
          <i className={`fas fa-location-dot ${styles.icon}`}></i>
          <a
            href="https://maps.google.com/?q=101+Smith+Street,+Collingwood+VIC+3066"
            target="_blank"
            rel="noreferrer"
          >
             <h3>IKEJA</h3>
           <p>Textile Labour House <br />
             ACME Road,Ikeja-Lagos </p>
          </a>
        </p>
      </div>
    </div>
  );
}

export default Sec3;
