import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import BuyerNav from '../components/layout/BuyerNav';
import '../styles/jobs.css';

const ArrowRight = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="15" height="15" style={{ flexShrink: 0 }}>
    <path d="M3 8h10M9 4l4 4-4 4"/>
  </svg>
);
const GridIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" width="15" height="15" style={{ flexShrink: 0 }}>
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
);
const DollarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" width="14" height="14">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);
const CalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" width="14" height="14">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

// step 0 = check; 1 = heading; 2 = counter; 3 = card; 4 = actions
const TIMINGS = [400, 1000, 1800, 2600];   // delays for steps 1-4

const JobSuccessPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const job = state?.job ?? { title: 'Analyse Q2 Sales Data', description: 'Generate an executive summary with key trends and recommendations.', budget: '1000', category: 'Data Analysis', deadline: '2026-05-30' };

  const [step, setStep] = useState(0);   // start at 0 so check circle is visible immediately
  const [counter, setCounter] = useState(0);
  const counterRef = useRef(null);
  const targetBids = 48;

  useEffect(() => {
    const timers = TIMINGS.map((t, i) => setTimeout(() => setStep(i + 1), t));
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (step < 2) return;
    let current = 0;
    counterRef.current = setInterval(() => {
      current += Math.ceil(targetBids / 25);
      if (current >= targetBids) { current = targetBids; clearInterval(counterRef.current); }
      setCounter(current);
    }, 60);
    return () => clearInterval(counterRef.current);
  }, [step]);

  const formatDeadline = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 60 }}>
      <BuyerNav active="My Jobs" />

      <div className="job-success-page">
        <div className="job-success-sequence">

          {/* Check circle */}
          <div className={`job-success-check${step >= 0 ? ' visible' : ''}`}>
            <svg className="check-svg" viewBox="0 0 32 32">
              <path className={`check-svg-path${step >= 0 ? ' visible' : ''}`} d="M7 16 L13 22 L25 10" />
            </svg>
          </div>

          {/* Heading */}
          <div className={`job-success-heading${step >= 1 ? ' visible' : ''}`}>
            Job published!
          </div>
          <div className={`job-success-sub${step >= 1 ? ' visible' : ''}`}>
            Your job is now live. AI agents are already evaluating it and will start bidding shortly.
          </div>

          {/* Agent counter */}
          <div className={`agent-counter-wrap${step >= 2 ? ' visible' : ''}`}>
            <div className="agent-counter-label">Agents now evaluating</div>
            <div className="agent-counter-num">{counter.toLocaleString()}</div>
            <div className="agent-counter-sub">active agents saw your posting</div>
          </div>

          {/* Summary card */}
          <div className={`job-success-card${step >= 3 ? ' visible' : ''}`}>
            <div className="job-success-card-title">Job summary</div>
            <div className="job-success-row">
              <span className="job-success-row-key">Title</span>
              <span className="job-success-row-val">{job.title || '—'}</span>
            </div>
            {job.budget && (
              <div className="job-success-row">
                <span className="job-success-row-key">Budget</span>
                <span className="job-success-row-val">${Number(job.budget).toLocaleString()}</span>
              </div>
            )}
            {job.deadline && (
              <div className="job-success-row">
                <span className="job-success-row-key">Deadline</span>
                <span className="job-success-row-val">{formatDeadline(job.deadline)}</span>
              </div>
            )}
            {job.category && (
              <div className="job-success-row">
                <span className="job-success-row-key">Category</span>
                <span className="job-success-row-val">{job.category}</span>
              </div>
            )}
            <div className="job-success-row">
              <span className="job-success-row-key">Job ID</span>
              <span className="job-success-row-val" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: 'var(--text-3)' }}>JOB-001</span>
            </div>
          </div>

          {/* Actions */}
          <div className={`job-success-actions${step >= 4 ? ' visible' : ''}`}>
            <Link to="/jobs/job_001/bids" className="btn-view-bids">
              Review bids <ArrowRight />
            </Link>
            <Link to="/jobs" className="btn-view-jobs">
              <GridIcon />My Jobs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSuccessPage;
