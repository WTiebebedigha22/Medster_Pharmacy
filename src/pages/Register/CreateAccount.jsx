import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEye, 
  faEyeSlash, 
  faCheckCircle,
  faTimesCircle,
  faArrowLeft,
  faUser,
  faEnvelope,
  faLock,
  faShieldAlt,
  faPhone,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import styles from './CreateAccount.module.css';

const CreateAccount = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    dob: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Password validation
  const validatePassword = (password) => {
    const rules = {
      hasLower: /[a-z]/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasMinLength: password.length >= 8,
    };
    return rules;
  };

  const passwordRules = validatePassword(formData.password);

  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordRules.hasMinLength) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Handle account creation logic here
      console.log('Account created:', formData);
      // Redirect to login or dashboard
      navigate('/auth/login');
    }
  };

  const getPasswordStrength = () => {
    const validCount = Object.values(passwordRules).filter(Boolean).length;
    if (validCount <= 1) return { label: 'Weak', color: '#FF6B6B' };
    if (validCount <= 3) return { label: 'Medium', color: '#FFA94D' };
    if (validCount === 4) return { label: 'Strong', color: '#51CF66' };
    return { label: 'Very Weak', color: '#FF6B6B' };
  };

  const strength = getPasswordStrength();

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        {/* Back Button */}
        <button 
          className={styles.backButton}
          onClick={() => navigate('/')}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Home
        </button>

        {/* Header */}
        <div className={styles.header}>
          <img 
            src="/images/logo.png" 
            alt="Medster Pharmacy" 
            className={styles.logo}
          />
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>
            Join Medster Pharmacy and take control of your health
          </p>
        </div>

        {/* Benefits */}
        <div className={styles.benefits}>
          <div className={styles.benefit}>
            <FontAwesomeIcon icon={faShieldAlt} />
            <span>100% Secure & Private</span>
          </div>
          <div className={styles.benefit}>
            <FontAwesomeIcon icon={faCheckCircle} />
            <span>Free Delivery on Orders ₦10,000+</span>
          </div>
          <div className={styles.benefit}>
            <FontAwesomeIcon icon={faUser} />
            <span>24/7 Pharmacist Support</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Email Field */}
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              <FontAwesomeIcon icon={faEnvelope} />
              Email Address
              <span className={styles.required}>*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your email address"
              className={`${styles.input} ${errors.email && touched.email ? styles.error : ''}`}
            />
            {errors.email && touched.email && (
              <span className={styles.errorMessage}>{errors.email}</span>
            )}
            <p className={styles.helperText}>
              We'll never share your email with anyone else.
            </p>
          </div>

          {/* Password Field */}
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              <FontAwesomeIcon icon={faLock} />
              Password
              <span className={styles.required}>*</span>
            </label>
            <div className={styles.passwordField}>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Create a strong password"
                className={`${styles.input} ${errors.password && touched.password ? styles.error : ''}`}
              />
              <button
                type="button"
                className={styles.showButton}
                onClick={togglePassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
            {errors.password && touched.password && (
              <span className={styles.errorMessage}>{errors.password}</span>
            )}

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className={styles.passwordStrength}>
                <div className={styles.strengthBar}>
                  <div 
                    className={styles.strengthFill}
                    style={{ 
                      width: `${(Object.values(passwordRules).filter(Boolean).length / 4) * 100}%`,
                      background: strength.color 
                    }}
                  />
                </div>
                <span className={styles.strengthLabel} style={{ color: strength.color }}>
                  Password Strength: {strength.label}
                </span>
              </div>
            )}

            {/* Password Requirements */}
            <ul className={styles.passwordRules}>
              <li className={passwordRules.hasMinLength ? styles.valid : styles.invalid}>
                <FontAwesomeIcon icon={passwordRules.hasMinLength ? faCheckCircle : faTimesCircle} />
                8 characters minimum
              </li>
              <li className={passwordRules.hasLower ? styles.valid : styles.invalid}>
                <FontAwesomeIcon icon={passwordRules.hasLower ? faCheckCircle : faTimesCircle} />
                One lowercase character
              </li>
              <li className={passwordRules.hasUpper ? styles.valid : styles.invalid}>
                <FontAwesomeIcon icon={passwordRules.hasUpper ? faCheckCircle : faTimesCircle} />
                One uppercase character
              </li>
              <li className={passwordRules.hasNumber ? styles.valid : styles.invalid}>
                <FontAwesomeIcon icon={passwordRules.hasNumber ? faCheckCircle : faTimesCircle} />
                One numerical character
              </li>
            </ul>
          </div>

          {/* Confirm Password Field */}
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              <FontAwesomeIcon icon={faLock} />
              Confirm Password
              <span className={styles.required}>*</span>
            </label>
            <div className={styles.passwordField}>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Confirm your password"
                className={`${styles.input} ${errors.confirmPassword && touched.confirmPassword ? styles.error : ''}`}
              />
              <button
                type="button"
                className={styles.showButton}
                onClick={toggleConfirmPassword}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
              </button>
            </div>
            {errors.confirmPassword && touched.confirmPassword && (
              <span className={styles.errorMessage}>{errors.confirmPassword}</span>
            )}
            {formData.confirmPassword && formData.password === formData.confirmPassword && (
              <span className={styles.successMessage}>
                <FontAwesomeIcon icon={faCheckCircle} />
                Passwords match
              </span>
            )}
          </div>

          {/* First Name */}
          <div className={styles.formGroup}>
            <label htmlFor="firstName" className={styles.label}>
              <FontAwesomeIcon icon={faUser} />
              First Name
              <span className={styles.required}>*</span>
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your first name"
              className={`${styles.input} ${errors.firstName && touched.firstName ? styles.error : ''}`}
            />
            {errors.firstName && touched.firstName && (
              <span className={styles.errorMessage}>{errors.firstName}</span>
            )}
          </div>

          {/* Last Name */}
          <div className={styles.formGroup}>
            <label htmlFor="lastName" className={styles.label}>
              <FontAwesomeIcon icon={faUser} />
              Last Name
              <span className={styles.required}>*</span>
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your last name"
              className={`${styles.input} ${errors.lastName && touched.lastName ? styles.error : ''}`}
            />
            {errors.lastName && touched.lastName && (
              <span className={styles.errorMessage}>{errors.lastName}</span>
            )}
          </div>

          {/* Phone Number */}
          <div className={styles.formGroup}>
            <label htmlFor="phone" className={styles.label}>
              <FontAwesomeIcon icon={faPhone} />
              Phone Number
              <span className={styles.required}>*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your phone number"
              className={`${styles.input} ${errors.phone && touched.phone ? styles.error : ''}`}
            />
            {errors.phone && touched.phone && (
              <span className={styles.errorMessage}>{errors.phone}</span>
            )}
            <p className={styles.helperText}>
              We'll send order updates and delivery notifications to this number.
            </p>
          </div>

          {/* Date of Birth */}
          <div className={styles.formGroup}>
            <label htmlFor="dob" className={styles.label}>
              <FontAwesomeIcon icon={faCalendarAlt} />
              Date of Birth
            </label>
            <input
              id="dob"
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              className={styles.input}
            />
            <p className={styles.helperText}>
              Optional - Helps us provide age-appropriate health recommendations.
            </p>
          </div>

          {/* Terms and Conditions */}
          <div className={styles.termsGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>
                I agree to Medster Pharmacy's
                <Link to="/terms" className={styles.termsLink}> Terms of Service</Link>
                , 
                <Link to="/privacy" className={styles.termsLink}> Privacy Policy</Link>
                , and 
                <Link to="/hipaa" className={styles.termsLink}> HIPAA Notice</Link>
              </span>
            </label>
            {errors.agreeToTerms && (
              <span className={styles.errorMessage}>{errors.agreeToTerms}</span>
            )}
          </div>

          {/* Submit Buttons */}
          <button type="submit" className={styles.btnPrimary}>
            <FontAwesomeIcon icon={faUser} />
            Create Account
          </button>

          <div className={styles.divider}>
            <span className={styles.dividerText}>Already have an account?</span>
          </div>

          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => navigate("/auth/login")}
          >
            Sign In to Your Account
          </button>

          <div className={styles.termsNotice}>
            By creating an account, you agree to receive health-related communications.
            You can opt out at any time.
          </div>
        </form>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.footerLinks}>
            <Link to="/help">Help</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/contact">Contact Us</Link>
          </div>
          <div className={styles.copyright}>
            © 2026 Medster Pharmacy. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;