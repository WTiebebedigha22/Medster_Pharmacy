import React from 'react';
import styles from './FAS.module.css'

const HeroSection = () => {
  return (
    <section className={styles['hero-section']}>
      <div className={styles['hero-content']}>
        <div className={styles['hero-heading-group']}>
          <h1 className={styles['hero-heading']}>
            <span className={styles['hero-white']}>Show me results from </span>
            <span className={styles['hero-blue']}><span className={styles['hero-underline']}>all sectors</span></span>
          </h1>
        </div>
        <div className={styles['hero-heading-group']}>
          <h2 className={styles['hero-heading']}>
            <span className={styles['hero-white']}>relevant to </span>
            <span className={styles['hero-blue']}><span className={styles['hero-underline']}>all services</span></span>
          </h2>
        </div>
        <button className={styles['hero-update-btn']}>
          <span>Update</span>
        </button>
      </div>
    </section>
  );
};

export default HeroSection;