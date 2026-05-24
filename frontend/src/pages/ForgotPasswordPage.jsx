import { useState } from 'react';
import { Link } from 'react-router-dom';
import Nav from '../components/layout/Nav';
import '../styles/register.css';

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ForgotPasswordPage = () => {
  const [email, setEmail]         = useState('');
  const [emailErr, setEmailErr]   = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validate = (v) => {
    if (!v) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate(email);
    setEmailErr(err);
    if (err) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <>
      <Nav />

      <div className="forgot-page">
        <div className="forgot-card">
          <div className="forgot-icon"><LockIcon /></div>
          <h1 className="forgot-title">Reset your password</h1>
          <p className="forgot-desc">
            Enter your email address and we'll send you a link to reset your password.
            The link expires in 1 hour.
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-field" style={{ textAlign: 'left' }}>
                <label className="form-label" htmlFor="email">Email address</label>
                <input
                  id="email" type="email"
                  className={`form-input${emailErr ? ' has-error' : ''}`}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailErr(''); }}
                  onBlur={() => setEmailErr(validate(email))}
                  autoComplete="email"
                />
                {emailErr && <div className="form-error">{emailErr}</div>}
              </div>
              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting ? <><span className="spin" />Sending…</> : 'Send reset link'}
              </button>
            </form>
          ) : (
            <div className="forgot-success">
              ✓ Reset link sent — check your inbox
            </div>
          )}

          <Link to="/login/buyer" className="forgot-back">← Back to sign in</Link>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
