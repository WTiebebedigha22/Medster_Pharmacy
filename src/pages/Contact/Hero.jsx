import React from 'react'
import styles from "./Contact.module.css";

function Hero() {
  return (
    <div className={styles.hero}>   
      <div className={styles['hero-title']}>
        <h1>Talk to us</h1>
        <p>Whatever your needs, we have someone who can help</p>
      </div>
    </div>
  )
}

export default Hero
