import React, { useState } from "react";
import styles from "./Contact.module.css";

function Sec2() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
    services: [],
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => {
        if (checked) {
          return { ...prev, services: [...prev.services, value] };
        } else {
          return {
            ...prev,
            services: prev.services.filter((s) => s !== value),
          };
        }
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <form className={styles.form}>
      {/* Name */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>First name</label>
          <input
            type="text"
            name="firstName"
            placeholder="First name"
            className={styles.input}
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Last name</label>
          <input
            type="text"
            name="lastName"
            placeholder="Last name"
            className={styles.input}
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Email */}
      <div className={styles.field}>
        <label className={styles.label}>Email</label>
        <input
          type="email"
          name="email"
          placeholder="you@company.com"
          className={styles.input}
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      {/* Phone */}
      <div className={styles.field}>
        <label className={styles.label}>Phone number</label>
        <input
          type="tel"
          name="phone"
          placeholder="+1 (555) 000-0000"
          className={styles.input}
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      {/* Message */}
      <div className={styles.field}>
        <label className={styles.label}>Message</label>
        <textarea
          name="message"
          placeholder="Leave us a message..."
          rows="4"
          className={styles.textarea}
          value={formData.message}
          onChange={handleChange}
        />
      </div>

      {/* Services */}
      <div className={styles.field}>
        <label className={styles.label}>Services</label>
        <div className={styles.checkboxGrid}>
          {["A customer", "An agent", "Estate manager", "Other"].map(
            (service) => (
              <label key={service} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  value={service}
                  onChange={handleChange}
                  checked={formData.services.includes(service)}
                  className={styles.checkbox}
                />
                <span>{service}</span>
              </label>
            )
          )}
        </div>
      </div>

      {/* Submit */}
      <button type="submit" className={styles.button}>
        Send message
      </button>
    </form>
  );
}

export default Sec2;
