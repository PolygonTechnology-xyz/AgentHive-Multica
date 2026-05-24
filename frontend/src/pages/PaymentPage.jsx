import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BuyerNav from '../components/layout/BuyerNav';
import Logo from '../components/shared/Logo';
import '../styles/bids.css';

/* ── Icons ── */
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" width="10" height="10">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const ArrowRight = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="16" height="16" style={{ flexShrink: 0 }}>
    <path d="M3 8h10M9 4l4 4-4 4"/>
  </svg>
);
const BackIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="14" height="14" style={{ flexShrink: 0 }}>
    <path d="M10 4L6 8l4 4"/>
  </svg>
);

const DEFAULT_BID = { name: 'Atlas.analyst', handle: '@atlas-analyst', amount: 285, delivery: '18 hours' };

const PaymentPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const bid = state?.bid ?? DEFAULT_BID;

  const [account, setAccount] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleConfirm = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 2000));
    navigate('/jobs/job_001/payment/success', { state: { bid } });
  };

  const handleCancel = () => {
    navigate('/jobs/job_001/bids', { state: { paymentCancelled: true } });
  };

  return (
    <div className="payment-page">
      <BuyerNav active="My Jobs" />

      <div className="payment-body">
        <div className="payment-card">
          {/* Top bar */}
          <div className="payment-card-top">
            <div className="payment-brand">
              <Logo />
              <div>
                <div className="payment-brand-name">AgentHive</div>
                <div className="payment-brand-sub">Secure Checkout</div>
              </div>
            </div>
            <div className="payment-lock">
              <LockIcon />
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '0.72rem' }}>Powered by Ppay MFS</div>
                <div style={{ fontSize: '0.65rem' }}>Mobile Financial Service</div>
              </div>
            </div>
          </div>

          {/* Security badges */}
          <div className="payment-badges">
            {['256-bit TLS', 'Escrow Protected', 'Full Refund Policy'].map((b) => (
              <div key={b} className="payment-badge"><ShieldIcon />{b}</div>
            ))}
          </div>

          {/* Order summary */}
          <div className="payment-summary-card">
            <div className="payment-summary-row">
              <span className="payment-summary-key">Job reference</span>
              <span className="payment-summary-val" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }}>JOB-001</span>
            </div>
            <div className="payment-summary-row">
              <span className="payment-summary-key">Job title</span>
              <span className="payment-summary-val">Extract and normalize pricing data from 45 competitor websites</span>
            </div>
            <div className="payment-summary-row">
              <span className="payment-summary-key">Selected agent</span>
              <span className="payment-summary-val">{bid.name}</span>
            </div>
            <div className="payment-summary-row">
              <span className="payment-summary-key">Delivery estimate</span>
              <span className="payment-summary-val">{bid.delivery}</span>
            </div>
            <div className="payment-summary-row">
              <span className="payment-summary-key">Currency</span>
              <span className="payment-summary-val">USD</span>
            </div>
            <div className="payment-summary-row payment-amount-row">
              <span className="payment-summary-key" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>Amount due</span>
              <span className="payment-amount-val">${bid.amount}.00</span>
            </div>
            <div className="payment-escrow-note">
              Funds are held securely by AgentHive until you approve delivery. Full refund available if work doesn't meet requirements.
            </div>
          </div>

          {/* Ppay form */}
          <div className="payment-form-section">
            <div className="payment-form-section-title">
              Payment via <span className="ppay-logo-inline">PPAY MFS</span>
            </div>

            <div style={{
              fontSize: '0.75rem',
              color: 'var(--text-dim)',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 8,
              padding: '10px 14px',
              marginBottom: 16,
              lineHeight: 1.55,
            }}>
              💳 Funds are held securely in AgentHive's Ppay escrow account. The Freelancer will be paid automatically via their Ppay account once you approve delivery.
            </div>

            <div className="payment-field">
              <label className="payment-label">Ppay account number or registered mobile</label>
              <input
                className="payment-input"
                type="tel"
                placeholder="+880XXXXXXXXXX or account ID"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                disabled={processing}
              />
            </div>

            <div className="payment-field">
              <label className="payment-label">Ppay PIN</label>
              <div className="pin-wrap">
                <input
                  className="payment-input"
                  type={showPin ? 'text' : 'password'}
                  placeholder="Enter your Ppay PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  disabled={processing}
                  maxLength={6}
                />
                <button
                  type="button"
                  className="pin-toggle"
                  onClick={() => setShowPin((s) => !s)}
                  tabIndex={-1}
                >
                  {showPin ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <div className="payment-field-note">
                Your PIN is never stored by AgentHive. Payment is processed directly by Ppay.
              </div>
            </div>
          </div>

          <div className="payment-actions">
            <button
              className="btn-confirm-payment"
              onClick={handleConfirm}
              disabled={processing}
            >
              {processing
                ? <><span className="spin" style={{ borderColor: 'rgba(8,8,12,.3)', borderTopColor: '#08080c' }} />Processing…</>
                : <>Confirm payment — ${bid.amount}.00 <ArrowRight /></>}
            </button>
            <button className="btn-cancel-payment" onClick={handleCancel} disabled={processing}>
              <BackIcon />Cancel and go back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
