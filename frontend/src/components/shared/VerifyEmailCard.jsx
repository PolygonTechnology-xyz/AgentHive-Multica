import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const COOLDOWN = 60;

const WarnIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

const EnvelopeIcon = () => (
  <svg className="envelope-icon-svg" viewBox="0 0 80 80" fill="none">
    <rect x="8" y="20" width="64" height="44" rx="6" fill="currentColor" fillOpacity="0.10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.5" />
    <path d="M8 26 L40 48 L72 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M8 26 L40 48 L72 26 L72 20 L8 20 Z" fill="currentColor" fillOpacity="0.07" />
    <line x1="18" y1="56" x2="36" y2="56" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.4" />
    <line x1="18" y1="62" x2="28" y2="62" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.25" />
    <circle cx="62" cy="26" r="4" fill="currentColor" fillOpacity="0.6" />
    <circle cx="62" cy="26" r="7" fill="currentColor" fillOpacity="0.12" />
  </svg>
);

/**
 * Reusable email verification card.
 * @param {string}   email         - The email address that was sent to
 * @param {string}   subtext       - Role-specific follow-up text after the email mention
 * @param {string}   simulateLink  - Route to navigate to when dev "simulate" is clicked
 * @param {function} onGoBack      - Called when user clicks "Wrong email? Go back"
 */
const VerifyEmailCard = ({ email, subtext, simulateLink, onGoBack }) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(0);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  const handleResend = useCallback(() => {
    setSent(true);
    setCountdown(COOLDOWN);
    setTimeout(() => setSent(false), 3000);
  }, []);

  const resendLabel = () => {
    if (sent) return <><CheckIcon /> Email sent!</>;
    if (countdown > 0) return `Resend again in ${countdown}s…`;
    return 'Resend verification email';
  };

  return (
    <div className="verify-card">
      <div className="envelope-wrap">
        <div className="envelope-glow" />
        <EnvelopeIcon />
      </div>

      <h1 className="verify-title">Check your inbox</h1>
      <p className="verify-desc">
        We've sent a verification link to{' '}
        <span className="verify-email">{email}</span>.{' '}
        {subtext}
      </p>

      <div className="verify-note">
        <span className="verify-note-icon"><WarnIcon /></span>
        <span>
          The link expires in <strong style={{ color: 'var(--text)' }}>24 hours</strong> and
          can only be used once.
        </span>
      </div>

      <button
        className={`btn-resend${sent ? ' sent' : ''}`}
        onClick={handleResend}
        disabled={countdown > 0}
      >
        {resendLabel()}
      </button>

      <div className="verify-links">
        <button
          className="auth-back"
          style={{ fontSize: 13, justifyContent: 'center' }}
          onClick={onGoBack}
        >
          Wrong email? Go back and correct it
        </button>
        <a href="#">Already verified? Sign in</a>
      </div>

      <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
        <button
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12, color: 'var(--text-faint)',
            fontFamily: 'var(--font-mono)', letterSpacing: '0.04em',
          }}
          onClick={() => navigate(simulateLink)}
        >
          [dev] Simulate email click →
        </button>
      </div>
    </div>
  );
};

export default VerifyEmailCard;
