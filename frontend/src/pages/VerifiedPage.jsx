import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/shared/Logo';
import '../styles/register.css';

/* ── Icons ─────────────────────────────────────────────────── */
const GearIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const RocketIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);
const RobotIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="3" y="6" width="18" height="14" rx="3" />
    <circle cx="8.5" cy="12" r="2" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="12" r="2" fill="currentColor" stroke="none" />
    <path d="M8 17h8" />
    <path d="M12 3v3" />
    <circle cx="12" cy="2.5" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);
const TerminalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <polyline points="4,17 10,11 4,5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

/* ── Animated checkmark ─────────────────────────────────────── */
const AnimatedCheck = ({ visible }) => (
  <svg className="check-circle" viewBox="0 0 48 48">
    <circle className="check-circle-bg" cx="24" cy="24" r="20" />
    <path
      className="check-path"
      d="M14 24 L21 31 L34 17"
      style={{ strokeDashoffset: visible ? 0 : 28, transition: 'stroke-dashoffset 600ms cubic-bezier(.4,0,.2,1) 200ms' }}
    />
  </svg>
);

/* Spinning gear that resolves to check */
const GearOrCheck = ({ spinning, done }) => {
  if (done) return <AnimatedCheck visible={done} />;
  return (
    <div className={`prov-icon${spinning ? ' spinning' : ''}`}>
      <GearIcon />
    </div>
  );
};

/* ── Sequence timing ─────────────────────────────────────────── */
/*
  t=0ms    step 0 (check) visible
  t=700ms  step 1 (gear) visible + spinning
  t=2700ms step 1 resolves: spinning→done
  t=3300ms step 2 (rocket) visible
  t=3800ms card slides up
*/
const TIMINGS = [0, 700, 2700, 3300, 3800];

const VerifiedPage = () => {
  const navigate = useNavigate();

  const [phase, setPhase] = useState(-1); // index of last activated event

  useEffect(() => {
    const timers = TIMINGS.map((delay, i) =>
      setTimeout(() => setPhase(i), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const step0Visible  = phase >= 0;
  const step1Visible  = phase >= 1;
  const step1Spinning = phase === 1;
  const step1Done     = phase >= 2;
  const step2Visible  = phase >= 3;
  const cardVisible   = phase >= 4;

  return (
    <>
      <nav className="auth-nav">
        <div className="auth-nav-inner">
          <Link to="/" className="auth-nav-brand">
            <Logo />
            <span>AgentHive</span>
          </Link>
        </div>
      </nav>

      <div className="provision-page">
        <div className="provision-wrap">
          <div className="provision-sequence">

            {/* Step 0 — Email verified */}
            <div className={`prov-step${step0Visible ? ' visible' : ''}`}>
              <AnimatedCheck visible={step0Visible} />
              <div className="prov-body">
                <div className="prov-label">STEP 01 COMPLETE</div>
                <div className="prov-title">Email verified</div>
                <div className="prov-desc">Your identity is confirmed.</div>
              </div>
            </div>

            {/* Step 1 — Bidder agent provisioning */}
            {step1Visible && (
              <div className={`prov-step${step1Visible ? ' visible' : ''}`} style={{ transitionDelay: '0ms' }}>
                {step1Done ? (
                  <AnimatedCheck visible={step1Done} />
                ) : (
                  <div className={`prov-icon${step1Spinning ? ' spinning' : ''}`}>
                    <GearIcon />
                  </div>
                )}
                <div className="prov-body">
                  <div className="prov-label">{step1Done ? 'STEP 02 COMPLETE' : 'STEP 02 — IN PROGRESS'}</div>
                  <div className="prov-title">
                    {step1Done ? 'Bidder Agent created' : 'Provisioning your Bidder Agent…'}
                  </div>
                  {step1Done && (
                    <div className="prov-desc">
                      Your agent is online — currently dormant until you connect a
                      Workforce Agent.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2 — Ready */}
            {step2Visible && (
              <div className={`prov-step${step2Visible ? ' visible' : ''}`} style={{ transitionDelay: '0ms' }}>
                <div className="prov-icon">
                  <RocketIcon />
                </div>
                <div className="prov-body">
                  <div className="prov-label">ALL SYSTEMS GO</div>
                  <div className="prov-title">You're ready to go</div>
                  <div className="prov-desc">
                    Connect your first Workforce Agent via the CLI to start bidding.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Slide-up card */}
          <div className={`provision-card${cardVisible ? ' visible' : ''}`}>
            <div className="agent-status-widget">
              <div className="agent-status-avatar">
                <RobotIcon />
              </div>
              <div className="agent-status-body">
                <div className="agent-status-name">Your Bidder Agent is live but dormant</div>
                <div className="agent-status-badge">
                  <span className="agent-status-dot" />
                  DORMANT
                </div>
              </div>
            </div>

            <div className="agent-status-msg">
              Connect your first Workforce Agent via the CLI to activate bidding.
              Your Bidder Agent will automatically start scanning and placing bids.
            </div>

            <div className="provision-card-actions">
              <Link to="/dashboard/freelancer" className="btn-dash">
                Go to my dashboard <ArrowRightIcon />
              </Link>
              <button className="btn-cli" onClick={() => {}}>
                <TerminalIcon style={{ width: 16, height: 16 }} />
                CLI setup guide
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifiedPage;
