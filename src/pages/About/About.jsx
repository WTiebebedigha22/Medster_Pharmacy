import React from 'react'
import styles from './About.module.css'

const About = () => {
  return (
    <div className={styles.wrapper}>
    <section className={styles.hero}>
        <div className={styles.heroConte}>
          <video
            autoplay
            loop
            muted
            disablepictureinpicture
            src="/images/About/20250904_104722-CINEMATIC~2.mp4"
          ></video>
          <div className={styles.heroText}>
            <h1>About us</h1>
            <h2>Your trusted partner in real estate</h2>
          </div>
        </div>
      </section>

      <section className={styles.about}>
        <div className={styles.container}>
          <div className={styles.story}>
            <h1>Our Story</h1>
            <p>
              Established in 2010, <strong> TUNDE ESUOLA & CO.</strong> is a
              leading firm specializing in real estate surveying, valuation, and
              advisory services. The company is built on a foundation of
              competence, integrity, and results, and has a proven track record
              of delivering exceptional services to a diverse range of clients,
              including banks, government agencies, and high-net-worth
              individuals.
            </p>
          </div>

          <div className={styles['miss_valu']}>
            <h1>Our Mission & Values</h1>
            <ul>
              <li>Validation Advisory</li>
              <li>Property Management</li>
              <li>Competence</li>
              <li>Global best practices</li>
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.team}>
        <h1>Meet Our Team</h1>
        <div className={styles.container}>
          <div>
            <img src="/images/About/p1.png" alt="Tunde Esuola" />
            <h3>Alex Bello</h3>
          </div>
          <div>
            <img src="/images/About/p2.png" alt="Tunde Esuola" />
            <h3>Dave Adewale</h3>
          </div>
          <div>
            <img src="/images/About/p3.png" alt="Tunde Esuola" />
            <h3>Chioma Bennett</h3>
          </div>
        </div>
      </section>

      <section className={styles.metrics}>
        <h1>Key Metrics</h1>
        <div className={styles.container}>
          <div>
            <img src="/images/About/clock-two.svg" alt="" />
            <p>15+ Years</p>
          </div>
          <div id="property">
            <img src="/images/About/home-1-svgrepo-com.svg" alt="" />
            <p>2500+ Properties</p>
            <p></p>
          </div>

          <div>
            <img src="/images/About/level-point-satisfaction.svg" alt="" />
            <p>2500+ Satisfaction</p>
          </div>
          <div>
            <img src="/images/About/handshake.svg" alt="" />
            <p>98% Clients</p>
          </div>
        </div>
      </section>

      <section className={styles.process}>
        <h1>Our Process</h1>
        <div className={styles.container}>
          <div>
            <h1>01 <span>Discover</span></h1>
            <p>
              We start by helping you discover the right property that matches your lifestyle, budget, and goals. Whether it’s a family home, investment property, or commercial space, we guide you through market insights, locations, and options that fit your vision.
            </p>
          </div>
          <div>
            <h1>02 <span>Finalize</span></h1>
            <p>
              Once you’ve found the right property, we handle the details. From negotiations and paperwork to inspections and legal checks, we make sure everything is transparent, secure, and stress-free. Our goal is to give you confidence before you sign the deal.
            </p>
          </div>
          <div>
            <h1>03 <span>Move In</span></h1>
            <p>
              With everything finalized, it’s time to move in! We ensure a smooth handover of your new property, assist with final arrangements, and make your transition seamless. All you have to do is enjoy your new home or investment.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.contact}>
        <h2>Get in Touch</h2>
        <p>Ready to begin your property journey? Let’s make it happen.</p>
        <a href="#" className="btn">Contact Us</a>
      </section>
    </div>
  )
}

export default About