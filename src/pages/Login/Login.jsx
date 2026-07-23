import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from './Login.module.css';

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login attempted with:", { email, password });
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <img 
            src="/images/logo.png" 
            alt="Medster Pharmacy" 
            className={styles.logo}
          />
          <h1 className={styles.title}>Medster Pharmacy</h1>
        </div>

        <h2 className={styles.subtitle}>Sign in</h2>
        <p className={styles.description}>
          Access your prescriptions and manage your medications
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email or mobile phone number
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email or phone number"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <div className={styles.passwordField}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={styles.input}
                required
              />
              <button
                type="button"
                className={styles.showButton}
                onClick={togglePassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className={styles.continueButton}
          >
            Continue
          </button>

          <div className={styles.helpSection}>
            <a href="#" className={styles.helpLink}>
              <span className={styles.helpIcon}>🔒</span> 
              Forgot your password?
            </a>
          </div>

          <div className={styles.divider}>
            <span className={styles.dividerText}>New to Medster Pharmacy?</span>
          </div>

          <Link 
            to="/auth/register" 
            className={styles.createAccountButton}
          >
            Create your Medster Pharmacy account
          </Link>

          <div className={styles.terms}>
            By continuing, you agree to Medster Pharmacy's
            <a href="#" className={styles.termsLink}> Terms of Use</a> and 
            <a href="#" className={styles.termsLink}> Privacy Notice</a>.
          </div>
        </form>

        <div className={styles.footer}>
          <div className={styles.footerLinks}>
            <a href="#" className={styles.footerLink}>Conditions of Use</a>
            <a href="#" className={styles.footerLink}>Privacy Notice</a>
            <a href="#" className={styles.footerLink}>Help</a>
          </div>
          <div className={styles.copyright}>
            © 2026, Medster Pharmacy. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;