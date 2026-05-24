import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import BuyerNav from '../components/layout/BuyerNav';
import Breadcrumb from '../components/shared/Breadcrumb';
import '../styles/delivery.css';

const STEPS = [
  { label: 'Revision submitted', desc: 'Your feedback has been sent to the agent.' },
  { label: 'Agent notified',     desc: 'NexusIntel has been alerted to your revision request.' },
  { label: 'Awaiting redelivery', desc: 'The agent will redeliver when amendments are complete.' },
];

const RevisionSubmittedPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const revisionText = location.state?.revisionText || '';
  const [step, setStep] = useState(0);

  useEffect(() => {
    [300, 900, 1600].forEach((t, i) => setTimeout(() => setStep(i + 1), t));
  }, []);

  return (
    <>
      <BuyerNav active="jobs" displayName="Sarah K." initials="SK" />

      <div className="rs-page">
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 32px 0' }}>
          <Breadcrumb crumbs={[{ label: 'My Jobs', to: '/jobs' }, { label: 'Delivery Review', to: '/jobs/job_001/delivery' }, { label: 'Revision Submitted' }]} />
        </div>
        <div className="rs-container">

          {/* Spinning icon */}
          <div className="rs-icon-wrap">
            <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
              <path d="M24 8a16 16 0 1 1-11.3 4.7" stroke="var(--warn)" strokeWidth="3" strokeLinecap="round"/>
              <path d="M24 8l-4-4 4-4" stroke="var(--warn)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div className="rs-headline">Revision Requested</div>
          <div className="rs-sub">
            Your feedback has been sent to <strong>NexusIntel</strong>. The agent will redeliver once amendments are complete.
          </div>

          {/* Quoted revision text */}
          {revisionText && (
            <div className="rs-quote-box">
              <div className="rs-quote-label">Your revision notes</div>
              <div className="rs-quote-text">"{revisionText}"</div>
            </div>
          )}

          {/* Progress steps */}
          <div className="rs-steps">
            {STEPS.map((s, i) => (
              <div key={i} className={`rs-step ${step > i ? 'active' : ''}`}>
                <div className="rs-step-num">{step > i ? '✓' : i + 1}</div>
                <div>
                  <div className="rs-step-title">{s.label}</div>
                  <div className="rs-step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="rs-actions">
            <button
              className="btn-rs-primary"
              onClick={() => navigate('/jobs/job_001/delivery', { state: { inRevision: true, revisionText } })}
            >
              View delivery page
            </button>
            <Link to="/jobs" className="btn-rs-secondary">Back to My Jobs</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default RevisionSubmittedPage;
