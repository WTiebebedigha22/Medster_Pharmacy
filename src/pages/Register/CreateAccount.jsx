import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEye, faEyeSlash, faCheckCircle, faTimesCircle, faArrowLeft,
  faUser, faEnvelope, faLock, faShieldAlt, faPhone, faSpinner
} from '@fortawesome/free-solid-svg-icons';
import styles from './CreateAccount.module.css';

const CreateAccount = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validatePassword = (password) => ({
    hasLower: /[a-z]/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasMinLength: password.length >= 8,
  });

  const passwordRules = validatePassword(formData.password);

  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleBlur = (e) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (!passwordRules.hasMinLength) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    setLoading(true);
    try {
      const result = await signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });
      if (result.success) {
        navigate('/auth/login');
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const validCount = Object.values(passwordRules).filter(Boolean).length;
    if (validCount <= 1) return { label: 'Weak', color: '#FF6B6B' };
    if (validCount <= 3) return { label: 'Medium', color: '#FFA94D' };
    return { label: 'Strong', color: '#51CF66' };
  };

  const strength = getPasswordStrength();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Left Brand Panel */}
        <div className={styles.brandPanel}>
          <div className={styles.brandContent}>
            <img src="/images/logo.png" alt="Medster Pharmacy" className={styles.brandLogo} />
            <h1 className={styles.brandTitle}>Medster Pharmacy</h1>
            <p className={styles.brandTagline}>Join thousands of satisfied customers</p>
            <div className={styles.brandFeatures}>
              <div className={styles.feature}><FontAwesomeIcon icon={faShieldAlt} /><span>100% Secure &amp; Private</span></div>
              <div className={styles.feature}><FontAwesomeIcon icon={faCheckCircle} /><span>Free Delivery on Orders ₦10,000+</span></div>
              <div className={styles.feature}><FontAwesomeIcon icon={faUser} /><span>24/7 Pharmacist Support</span></div>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className={styles.formPanel}>
          <div className={styles.formContainer}>
            <button className={styles.backBtn} onClick={() => navigate('/')}>
              <FontAwesomeIcon icon={faArrowLeft} /> Back to Home
            </button>

            <div className={styles.mobileLogo}>
              <img src="/images/logo.png" alt="Medster Pharmacy" />
            </div>

            <h1 className={styles.title}>Create Account</h1>
            <p className={styles.subtitle}>Join Medster Pharmacy and take control of your health</p>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label><FontAwesomeIcon icon={faUser} /> First Name *</label>
                  <input name="firstName" value={formData.firstName} onChange={handleChange} onBlur={handleBlur} placeholder="John" className={errors.firstName && touched.firstName ? styles.inputError : ''} />
                  {errors.firstName && touched.firstName && <span className={styles.errorMsg}>{errors.firstName}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label><FontAwesomeIcon icon={faUser} /> Last Name *</label>
                  <input name="lastName" value={formData.lastName} onChange={handleChange} onBlur={handleBlur} placeholder="Doe" className={errors.lastName && touched.lastName ? styles.inputError : ''} />
                  {errors.lastName && touched.lastName && <span className={styles.errorMsg}>{errors.lastName}</span>}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label><FontAwesomeIcon icon={faEnvelope} /> Email Address *</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} placeholder="john@example.com" className={errors.email && touched.email ? styles.inputError : ''} />
                {errors.email && touched.email && <span className={styles.errorMsg}>{errors.email}</span>}
              </div>

              <div className={styles.formGroup}>
                <label><FontAwesomeIcon icon={faPhone} /> Phone Number *</label>
                <input name="phone" type="tel" value={formData.phone} onChange={handleChange} onBlur={handleBlur} placeholder="+234 800 000 0000" className={errors.phone && touched.phone ? styles.inputError : ''} />
                {errors.phone && touched.phone && <span className={styles.errorMsg}>{errors.phone}</span>}
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label><FontAwesomeIcon icon={faLock} /> Password *</label>
                  <div className={styles.passwordField}>
                    <input name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} onBlur={handleBlur} placeholder="Create password" className={errors.password && touched.password ? styles.inputError : ''} />
                    <button type="button" className={styles.showBtn} onClick={togglePassword}><FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} /></button>
                  </div>
                  {errors.password && touched.password && <span className={styles.errorMsg}>{errors.password}</span>}
                  {formData.password && (
                    <div className={styles.strengthBar}>
                      <div className={styles.strengthFill} style={{ width: `${(Object.values(passwordRules).filter(Boolean).length / 4) * 100}%`, background: strength.color }} />
                      <span className={styles.strengthLabel} style={{ color: strength.color }}>Strength: {strength.label}</span>
                    </div>
                  )}
                  <ul className={styles.passwordRules}>
                    <li className={passwordRules.hasMinLength ? styles.valid : styles.invalid}><FontAwesomeIcon icon={passwordRules.hasMinLength ? faCheckCircle : faTimesCircle} /> 8+ characters</li>
                    <li className={passwordRules.hasLower ? styles.valid : styles.invalid}><FontAwesomeIcon icon={passwordRules.hasLower ? faCheckCircle : faTimesCircle} /> Lowercase</li>
                    <li className={passwordRules.hasUpper ? styles.valid : styles.invalid}><FontAwesomeIcon icon={passwordRules.hasUpper ? faCheckCircle : faTimesCircle} /> Uppercase</li>
                    <li className={passwordRules.hasNumber ? styles.valid : styles.invalid}><FontAwesomeIcon icon={passwordRules.hasNumber ? faCheckCircle : faTimesCircle} /> Number</li>
                  </ul>
                </div>
                <div className={styles.formGroup}>
                  <label><FontAwesomeIcon icon={faLock} /> Confirm Password *</label>
                  <div className={styles.passwordField}>
                    <input name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleChange} onBlur={handleBlur} placeholder="Confirm password" className={errors.confirmPassword && touched.confirmPassword ? styles.inputError : ''} />
                    <button type="button" className={styles.showBtn} onClick={toggleConfirmPassword}><FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} /></button>
                  </div>
                  {errors.confirmPassword && touched.confirmPassword && <span className={styles.errorMsg}>{errors.confirmPassword}</span>}
                  {formData.confirmPassword && formData.password === formData.confirmPassword && <span className={styles.successMsg}><FontAwesomeIcon icon={faCheckCircle} /> Passwords match</span>}
                </div>
              </div>

              <div className={styles.termsGroup}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleChange} />
                  <span>I agree to the <Link to="/terms">Terms of Service</Link>, <Link to="/privacy">Privacy Policy</Link></span>
                </label>
                {errors.agreeToTerms && <span className={styles.errorMsg}>{errors.agreeToTerms}</span>}
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? <><FontAwesomeIcon icon={faSpinner} spin /> Creating Account...</> : 'Create Account'}
              </button>
            </form>

            <div className={styles.divider}><span>Already have an account?</span></div>

            <Link to="/auth/login" className={styles.signinBtn}>Sign In to Your Account</Link>

            <div className={styles.termsNotice}>
              By creating an account, you agree to receive health-related communications. You can opt out at any time.
            </div>
          </div>

          <div className={styles.footer}>
            <Link to="/help">Help</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/contact">Contact Us</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
