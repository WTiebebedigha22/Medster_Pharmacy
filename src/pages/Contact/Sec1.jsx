import React from "react";
import Sec2 from "./Sec2";
import Sec3 from "./Sec3";
import styles from "./Contact.module.css";
import Map from "./Map";

function Sec1() {

  return (
   <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Contact our team</h1>
        <p className={styles.subtitle}>
          Got any questions about our platform? We’re
          here to help. Chat to our friendly team 24/7 and get onboard in less
          than 5 minutes.
        </p>

        <div className={styles.grid}>
          <div className={styles.formWrapper}>
            <Sec2 />
            <Map />
          </div>
          <div className={styles.optionsWrapper}>
            <Sec3 />
          </div>
        </div>
      </div>
    </div>

  )
}

export default Sec1
