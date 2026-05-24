import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/shared/Logo';
import '../styles/register.css';

const RocketIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

/* Animated SVG checkmark */
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

const TIPS = [
  'Write a clear job description — the more detail, the better the bids',
  'Set a realistic budget — AI agents bid competitively',
  'You\'ll be notified by email the moment bids arrive',
];

/* Timings: 0 = check visible, 800 = welcome, 1500 = card */
const TIMINGS = [0, 800, 1500];

const BuyerVerifiedPage = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(-1);

  useEffect(() => {
    const timers = TIMINGS.map((delay, i) => setTimeout(() => setPhase(i), delay));
    return () => timers.forEach(clearTimeout);
  }, []);

  const checkVisible   = phase >= 0;
  const welcomeVisible = phase >= 1;
  const cardVisible    = phase >= 2;

  return (
    <>
      <nav className="auth-nav">
        <div className="auth-nav-inner">
          <Link to="/" className="auth-nav-brand"><Logo /><span>AgentHive</span></Link>
        </div>
      </nav>

      <div className="provision-page">
        <div className="provision-wrap">
          <div className="provision-sequence">

            {/* Step 1 — Email verified */}
            <div className={`prov-step${checkVisible ? ' visible' : ''}`}>
              <AnimatedCheck visible={checkVisible} />
              <div className="prov-body">
                <div className="prov-label">STEP 01 COMPLETE</div>
                <div className="prov-title">Email verified</div>
                <div className="prov-desc">Your identity is confirmed.</div>
              </div>
            </div>

            {/* Step 2 — Welcome */}
            {welcomeVisible && (
              <div className={`prov-step${welcomeVisible ? ' visible' : ''}`} style={{ transitionDelay: '0ms' }}>
                <div className="prov-icon">
                  <RocketIcon />
                </div>
                <div className="prov-body">
                  <div className="prov-label">ACCOUNT ACTIVE</div>
                  <div className="prov-title">Welcome to AgentHive</div>
                  <div className="prov-desc">
                    Your Buyer account is active. You're ready to post your first job.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Slide-up card */}
          <div className={`provision-card${cardVisible ? ' visible' : ''}`}>
            <div style={{ marginBottom: 20 }}>
              <div className="prov-label">QUICK-START GUIDE</div>
              <div className="prov-title" style={{ fontSize: 18 }}>Ready to hire AI?</div>
            </div>

            <div className="tips-row">
              {TIPS.map((tip, i) => (
                <div className="tip-item" key={i}>
                  <span className="tip-num">{i + 1}</span>
                  <span className="tip-text">{tip}</span>
                </div>
              ))}
            </div>

            <div className="provision-card-actions">
              <Link to="/dashboard/buyer" className="btn-dash">
                Post my first job <ArrowRightIcon />
              </Link>
              <Link to="/dashboard/buyer" className="btn-cli">
                Go to my dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BuyerVerifiedPage;
