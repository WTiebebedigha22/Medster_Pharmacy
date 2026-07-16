import React from 'react'
import styles from './WhyUs.module.css'

const WhyUs = () => {
  return (
    <>
    <div class={styles.wrapperr}>
      <section className={styles.hero}>
        <div>
          <h1>Building legacies, one property at a time.</h1>
          <a href="#services" className={styles.btn}>Explore Services</a>
        </div>
      </section>

      <section className={styles.about}>
        <h2>Why Choose Us</h2>
        <div className={styles.container}>
          <div className={styles['about-card']}>
            <img src="/images/WhyUs/key.svg" alt="Key icon"/>
            <p>Unmatched Local Knowledge</p>
          </div>
          <div className={styles['about-card']}>
            <img src="/images/WhyUs/handshake.svg" alt="Handshake icon"/>
            <p>Personalized Services</p>
          </div>
          <div className={styles['about-card']}>
            <img src="/images/WhyUs/shield-svgrepo-com.svg" alt="Shield icon"/>
            <p>Trusted Advisors</p>
          </div>
        </div>
      </section>


      <section className={styles.team}>
        <h2>What Our Clients Say</h2>
        <div className={styles.container}>
          <div className={styles.card}>
            <img src="/images/WhyUs/avatar1.png" alt="client"/>
            <p className={styles.name}>Lilian</p>
            <p>As a first-time homebuyer, I was completely overwhelmed. The team guided me with patience and care every step of the way.</p>
          </div>
          <div className={styles.card}>
            <img src="/images/WhyUs/avatar2.png" alt="client"/>
            <p className="name">Jessica</p>
            <p>Finding a new home was daunting, but they listened to my needs and made me feel empowered. True partners in the journey!</p>
          </div>
          <div className={styles.card}>
            <img src="/images/WhyUs/avatar3.png" alt="client"/>
            <p className={styles.name}>Bob</p>
            <p>They coordinated selling our old house and buying the new one seamlessly. Excellent communication and steady guidance.</p>
          </div>
        </div>
      </section>

      <section className={styles.property}>
        <div className={styles.container}>
          <div className={styles.card}>
            <h2>Know your property value</h2>
            <p>Book a no obligation valuation with one of our local experts to understand what your property could be worth. Prefer virtual? We can do that too.</p>
            <a href="#" className={styles.btn}>Book a Valuation</a>
          </div>
          <div className={styles.imagebox}>
            <img src="/images/WhyUs/luxury.jpg" alt="Luxury property"/>
          </div>
        </div>
      </section>

      <section id="services" className={styles.services}>
        <h2>Our Services</h2>
        <div className={styles.container}>
          <div className={styles['service-card']}>
            <h3>Buying</h3>
            <p>Find your dream home with expert guidance every step of the way.</p>
          </div>
          <div className={styles['service-card']}>
            <h3>Selling</h3>
            <p>Maximize your property’s value with our proven marketing strategies.</p>
          </div>
          <div className={styles['service-card']}>
            <h3>Consulting</h3>
            <p>Expert advice on investments, valuations, and property management.</p>
          </div>
        </div>
      </section>

      <section className={styles.contact}>
        <h2>Get in Touch</h2>
        <p>Ready to begin your property journey? Let’s make it happen.</p>
        <a href="#" className={styles.btn}>Contact Us</a>
      </section>
      </div>
    </>
  )
}

export default WhyUs