import React from 'react';
import { Link } from 'react-router-dom';
import styles from './FAS.module.css'

const HelpSection = () => {
  return (
    <section id="help" className={styles['help-section']}>
      <div className={styles['help-container']}>
        <div className={styles['help-side']}>
          <h2 className={styles['help-heading']}>HOW CAN WE HELP YOU?</h2>
          <p className={styles['help-paragraph']}>
            Whatever your property aspirations, we're here to provide you with more information, answer any questions, or connect you with the right people.
          </p>
          <Link to="#" className={styles['help-link']}>
            <span>GET IN TOUCH TODAY</span>
          </Link>
        </div>
        <div className={styles['help-divider']}></div>
        <div className={styles['help-side']}>
          <h2 className={styles['help-heading']}>WONDERING WHAT YOUR PROPERTY IS WORTH?</h2>
          <p className={styles['help-paragraph']}>
            Get specialist advice for residential, commercial or rural property, grounded in our local, regional and international market knowledge.
          </p>
          <Link to="/book-valuation" className={styles['help-link']}>
            <span>BOOK A VALUATION</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HelpSection;