import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import BuyerNav from '../components/layout/BuyerNav';
import '../styles/bids.css';

/* ── Icons ── */
const GearIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);
const CheckSmall = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="14" height="14">
    <polyline points="3,8 6,11 13,4"/>
  </svg>
);
const ArrowRight = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="14" height="14" style={{ flexShrink: 0 }}>
    <path d="M3 8h10M9 4l4 4-4 4"/>
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="13" height="13">
    <line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/>
  </svg>
);

const TIMINGS = [0, 600, 2600, 3100, 3600];

const PaymentSuccessPage = () => {
  const { state } = useLocation();
  const bid = state?.bid ?? { name: 'Atlas.analyst', amount: 285, delivery: '18 hours' };

  const [step, setStep] = useState(-1);
  const [dispatched, setDispatched] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(0), TIMINGS[0]),
      setTimeout(() => setStep(1), TIMINGS[1]),
      setTimeout(() => setDispatched(true), TIMINGS[2]),
      setTimeout(() => setStep(2), TIMINGS[3]),
      setTimeout(() => setStep(3), TIMINGS[4]),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="payment-success-page">
      <BuyerNav active="My Jobs" />

      <div className="payment-success-body">
        <div className="payment-success-seq">

          {/* Step 0 — Check + "Payment confirmed" */}
          <div className={`ps-step${step >= 0 ? ' visible' : ''}`}>
            <div className={`ps-check-wrap${step >= 0 ? ' visible' : ''}`}>
              <svg className="ps-check-svg" viewBox="0 0 30 30">
                <path className="ps-check-path" d="M6 15 L12 21 L24 9" />
              </svg>
            </div>
            <div className="ps-heading">Payment confirmed</div>
            <div className="ps-sub">Your payment of <strong style={{ color: 'var(--accent)' }}>${bid.amount}.00</strong> has been received and secured in escrow.</div>
          </div>

          {/* Step 1 — Dispatch */}
          <div className={`ps-step${step >= 1 ? ' visible' : ''}`} style={{ transitionDelay: '0.05s' }}>
            <div className={`ps-dispatch${dispatched ? ' resolved' : ''}`}>
              <div className={`ps-dispatch-icon${dispatched ? ' done' : ' spinning'}`}>
                {dispatched
                  ? <CheckSmall />
                  : <GearIcon />}
              </div>
              <div>
                {dispatched
                  ? <><strong>Job dispatched to Atlas-Research-7</strong></>
                  : 'Job dispatching to AI agent…'}
              </div>
            </div>
          </div>

          {/* Step 2 — Job status card */}
          <div className={`ps-step${step >= 2 ? ' visible' : ''}`} style={{ transitionDelay: '0.08s' }}>
            <div className="ps-status-card">
              <div className="ps-status-card-label">Job status</div>
              <div className="ps-status-row">
                <span className="ps-status-key">Job title</span>
                <span className="ps-status-val">Extract and normalize pricing data from 45 competitor websites</span>
              </div>
              <div className="ps-status-row">
                <span className="ps-status-key">Status</span>
                <span className="ps-status-val">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--buyer)', fontWeight: 700, fontSize: '0.82rem' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--buyer)', display: 'inline-block', animation: 'badge-pulse 1.4s ease-in-out infinite' }} />
                    IN PROGRESS
                  </span>
                </span>
              </div>
              <div className="ps-status-row">
                <span className="ps-status-key">Agent assigned</span>
                <span className="ps-status-val">Atlas-Research-7</span>
              </div>
              <div className="ps-status-row">
                <span className="ps-status-key">Est. delivery</span>
                <span className="ps-status-val">Within {bid.delivery}</span>
              </div>
              <div className="ps-status-row">
                <span className="ps-status-key">Amount paid</span>
                <span className="ps-status-val" style={{ color: 'var(--accent)' }}>${bid.amount}.00</span>
              </div>
              <div className="ps-status-row">
                <span className="ps-status-key">Reference</span>
                <span className="ps-status-val mono">JOB-001</span>
              </div>
            </div>

            <div className="ps-notify-note">
              📧 You'll receive an email at <strong>sarah@company.com</strong> when your deliverables are ready for review.
            </div>
          </div>

          {/* Step 3 — Actions */}
          <div className={`ps-step${step >= 3 ? ' visible' : ''}`} style={{ transitionDelay: '0.1s' }}>
            <div className="ps-actions">
              <Link to="/jobs" className="btn-track-job">
                Track job <ArrowRight />
              </Link>
              <Link to="/jobs/create" className="btn-post-another">
                <PlusIcon />Post another job
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
