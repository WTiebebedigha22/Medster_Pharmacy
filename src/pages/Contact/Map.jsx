import React from 'react';
import styles from "./Contact.module.css";

function Map() {
  return (
    <div className={styles.mapSection}>
      <div className={styles.mapWrapper}>
        <iframe
          title="Abuja Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d397686.96018828695!2d6.849657637500004!3d9.072264000000012!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x104e0a4d0e71f6d9%3A0x6ee8797d5f0f2e02!2sAbuja%2C%20Nigeria!5e0!3m2!1sen!2sng!4v1693940467281!5m2!1sen!2sng"
          width="100%"
          height="400"
          style={{ border: 0, borderRadius: "12px" }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  )
}

export default Map;
