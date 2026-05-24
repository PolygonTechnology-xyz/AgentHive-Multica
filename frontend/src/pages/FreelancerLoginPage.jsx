import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Nav from '../components/layout/Nav';
import RoleBadge from '../components/shared/RoleBadge';
import '../styles/register.css';

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const SPECIAL = {
  'unverified@test.com':  'unverified',
  'deactivated@test.com': 'deactivated',
};

const FreelancerLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [emailErr, setEmailErr] = useState('');
  const [pwErr, setPwErr]       = useState('');
  const [loginState, setLoginState] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validateEmail = (v) => {
    if (!v) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eErr = validateEmail(email);
    const pErr = password ? '' : 'Password is required';
    setEmailErr(eErr);
    setPwErr(pErr);
    setLoginState('');
    if (eErr || pErr) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitting(false);
    const special = SPECIAL[email.toLowerCase()];
    if (special) { setLoginState(special); return; }
    navigate('/dashboard/freelancer');
  };

  const renderAlert = () => {
    if (!loginState) return null;
    if (loginState === 'invalid') return (
      <div className="login-alert login-alert-error">
        <span className="login-alert-icon"><AlertIcon /></span>
        Invalid email or password.
      </div>
    );
    if (loginState === 'unverified') return (
      <div className="login-alert login-alert-warn">
        <span className="login-alert-icon"><AlertIcon /></span>
        <span>
          Your email isn't verified yet.{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/register/freelancer/verify', { state: { email } }); }}>
            Resend verification email
          </a>
        </span>
      </div>
    );
    if (loginState === 'deactivated') return (
      <div className="login-alert login-alert-error">
        <span className="login-alert-icon"><AlertIcon /></span>
        This account has been deactivated. Please <a href="#">contact support</a>.
      </div>
    );
    return null;
  };

  return (
    <>
      <Nav />

      <div className="login-page">
        <div className="login-card">
          <div className="login-head">
            <RoleBadge role="freelancer" />
            <h1 className="login-title">Welcome back</h1>
            <p className="login-sub">Sign in to your Freelancer account</p>
          </div>

          {renderAlert()}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <label className="form-label" htmlFor="email">Email address</label>
              <input
                id="email" type="email"
                className={`form-input${emailErr ? ' has-error' : ''}`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailErr(''); setLoginState(''); }}
                onBlur={() => setEmailErr(validateEmail(email))}
                autoComplete="email"
              />
              {emailErr && <div className="form-error">{emailErr}</div>}
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="form-input-wrap">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  className={`form-input with-toggle${pwErr ? ' has-error' : ''}`}
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPwErr(''); setLoginState(''); }}
                  onBlur={() => setPwErr(password ? '' : 'Password is required')}
                  autoComplete="current-password"
                />
                <button type="button" className="pw-toggle" onClick={() => setShowPw((v) => !v)}>
                  {showPw ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {pwErr && <div className="form-error">{pwErr}</div>}
              <div className="login-forgot">
                <Link to="/forgot-password">Forgot password?</Link>
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? <><span className="spin" />Signing in…</> : 'Sign in'}
            </button>
          </form>

          <div className="login-footer">
            <div className="login-footer-row">
              Don't have an account?{' '}
              <Link to="/register/freelancer">Register as a Freelancer →</Link>
            </div>
            <div className="login-footer-divider">──</div>
            <div className="login-footer-row" style={{ fontSize: 12.5 }}>
              Are you a Buyer?{' '}
              <Link to="/login/buyer">Sign in here →</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FreelancerLoginPage;
