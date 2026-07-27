import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCheckCircle, faSpinner, faLock, faEnvelope, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import styles from './ForgotPassword.module.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('request');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStep('sent');
        setMessage('If an account exists with this email, you will receive password reset instructions.');
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to send reset email');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/update-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, password: newPassword }),
      });
      if (res.ok) {
        setMessage('Password reset successful! Redirecting to login...');
        setTimeout(() => navigate('/auth/login'), 2000);
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to reset password');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Left Brand Panel */}
        <div className={styles.brandPanel}>
          <div className={styles.brandContent}>
            <img src="/images/logo.png" alt="Medster Pharmacy" className={styles.brandLogo} />
            <h1 className={styles.brandTitle}>Medster Pharmacy</h1>
            <p className={styles.brandTagline}>Your Trusted Online Pharmacy</p>
            <div className={styles.brandFeatures}>
              <div className={styles.feature}><FontAwesomeIcon icon={faShieldAlt} /><span>Secure & Encrypted</span></div>
              <div className={styles.feature}><FontAwesomeIcon icon={faCheckCircle} /><span>24/7 Support</span></div>
              <div className={styles.feature}><FontAwesomeIcon icon={faLock} /><span>Privacy Protected</span></div>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className={styles.formPanel}>
          <div className={styles.formContainer}>
            <button className={styles.backBtn} onClick={() => navigate('/auth/login')}>
              <FontAwesomeIcon icon={faArrowLeft} /> Back to Login
            </button>

            <div className={styles.mobileLogo}>
              <img src="/images/logo.png" alt="Medster Pharmacy" />
            </div>

            {step === 'request' && (
              <>
                <div className={styles.iconCircle}><FontAwesomeIcon icon={faLock} /></div>
                <h1 className={styles.title}>Reset Password</h1>
                <p className={styles.subtitle}>Enter your email address and we'll send you instructions to reset your password.</p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleRequestReset}>
                  <div className={styles.field}>
                    <label><FontAwesomeIcon icon={faEnvelope} /> Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" required />
                  </div>
                  <button type="submit" className={styles.btn} disabled={loading}>
                    {loading ? <><FontAwesomeIcon icon={faSpinner} spin /> Sending...</> : 'Send Reset Instructions'}
                  </button>
                </form>
              </>
            )}

            {step === 'sent' && (
              <div className={styles.sentState}>
                <div className={styles.successIcon}><FontAwesomeIcon icon={faCheckCircle} /></div>
                <h1 className={styles.title}>Check Your Email</h1>
                <p className={styles.subtitle}>{message}</p>
                <button className={styles.btn} onClick={() => setStep('reset')}>Enter Reset Code</button>
                <button className={styles.resendBtn} onClick={handleRequestReset} disabled={loading}>
                  {loading ? 'Sending...' : 'Resend Email'}
                </button>
              </div>
            )}

            {step === 'reset' && (
              <>
                <div className={styles.iconCircle}><FontAwesomeIcon icon={faLock} /></div>
                <h1 className={styles.title}>Set New Password</h1>
                <p className={styles.subtitle}>Enter the reset code sent to your email and your new password.</p>

                {error && <div className={styles.error}>{error}</div>}
                {message && <div className={styles.success}>{message}</div>}

                <form onSubmit={handleResetPassword}>
                  <div className={styles.field}>
                    <label>Reset Code</label>
                    <input value={code} onChange={e => setCode(e.target.value)} placeholder="Enter reset code from email" required />
                  </div>
                  <div className={styles.field}>
                    <label>New Password</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 8 characters" required minLength={8} />
                  </div>
                  <div className={styles.field}>
                    <label>Confirm Password</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" required />
                  </div>
                  <button type="submit" className={styles.btn} disabled={loading}>
                    {loading ? <><FontAwesomeIcon icon={faSpinner} spin /> Resetting...</> : 'Reset Password'}
                  </button>
                </form>
              </>
            )}

            <div className={styles.footer}>
              <Link to="/auth/login">Back to Sign In</Link>
              <Link to="/auth/register">Create Account</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
