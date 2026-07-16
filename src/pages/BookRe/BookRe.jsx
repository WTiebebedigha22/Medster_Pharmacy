import React from "react";
import styles from "./BookRe.module.css";

function BookRe() {
  return (
    <div className={styles.propertyPage}>
      <div className={styles.propertyFormContainer}>

        
        <div className={styles.formSection}>
          <h1>Know your property’s value</h1>
          <p>
            Book a no obligation valuation with one of our local experts to
            understand what your property could be worth.
          </p>

          <h2>Your details</h2>
          <form className={styles.formDetails}>
            <input type="text" placeholder="Title (optional)" className={styles.input} />
            <input type="text" placeholder="First Name" className={styles.input} />
            <input type="text" placeholder="Last Name" className={styles.input} />
            <input type="email" placeholder="Email Address" className={styles.input} />
            <input type="tel" placeholder="Phone Number" className={styles.input} />

            <div className={styles.postcodeRow}>
              <input type="text" placeholder="Post Code" className={styles.input} />
              <button type="button" className={styles.btnFind}>Find Address</button>
            </div>

            <input type="text" placeholder="Address" className={styles.input} />
            <input type="text" placeholder="Town/City" className={styles.input} />

            <h2>Your valuation</h2>
            <p>What are you planning to do with the property?</p>
            <div className={styles.checkboxGroup}>
              <label>
                <input type="checkbox" /> Sell
              </label>
              <label>
                <input type="checkbox" /> Let
              </label>
            </div>

            <div className={styles.dateTime}>
              <p className={styles.yellowNote}>
                Please select a preferred date and time for your valuation. Once your request is received, a member of the team will be in touch to confirm your appointment.
              </p>
              <input type="date" className={styles.input} />
              <select className={styles.input}>
                <option>8:00 AM</option>
                <option>9:00 AM</option>
                <option>10:00 AM</option>
                <option>11:00 AM</option>
              </select>
            </div>

            <div className={styles.buttons}>
              <button type="submit" className={styles.btnSend}>Send</button>
              <button type="button" className={styles.btnCancel}>Cancel</button>
            </div>
          </form>
        </div>

        
        <div className={styles.infoSection}>
          <div className={styles.whySavills}>
            <h2>Why Savills?</h2>
            <p><strong>The most-visited website</strong><br />
            With over 2.9 million visits per month*, we are the most visited UK national estate agency website. We get more eyes on your place or space than anyone else.</p>
            <p><strong>170 years of experience</strong><br />
            We’ve helped sell every kind of property you can think of, building a deep, strategic understanding to get you the best value.</p>
            <p><strong>Global coverage</strong><br />
            Attract interest from across the globe. Our network spans more than 70 countries with over 42,000 employees, giving you access to the best buyers and tenants.</p>
          </div>

          <div className={styles.formalValuation}>
            <h3>Need a formal valuation?</h3>
            <p>
              Red Book valuations are sometimes needed where tax calculations or formal legal proceedings are involved. For example, complicated inheritance tax, a divorce case or in-company accounting. Whatever you need, our experts are here to help.
            </p>
            <a href="#" className={styles.link}>Request a formal valuation</a>
          </div>
        </div>

      </div>
    </div>
  );
}

export default BookRe;