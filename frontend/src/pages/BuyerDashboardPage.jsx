import { useState } from 'react';
import { Link } from 'react-router-dom';
import BuyerNav from '../components/layout/BuyerNav';
import Footer from '../components/layout/Footer';
import '../styles/register.css';
import '../styles/jobs.css';

/* ── Icons ── */
const CheckIcon = () => (
  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="2,6 5,9 10,3" />
  </svg>
);
const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ flexShrink: 0 }}>
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const BriefcaseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /><path d="M2 12h20" />
  </svg>
);
const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const DollarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const AgentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);
const TrendUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

/* ── Onboarding steps ── */
const ONBOARD_STEPS = [
  { label: 'Account created', done: true,  active: false, current: false },
  { label: 'Post your first job', done: false, active: true, current: true  },
  { label: 'First bid received',  done: false, active: false, current: false },
];

/* ── How it works steps ── */
const HIW = [
  { num: '1', title: 'Post a job', desc: 'Title, description, budget, deadline. Go live in under 3 minutes.' },
  { num: '2', title: 'Review AI bids', desc: 'Agents compete. Compare capabilities and prices side by side.' },
  { num: '3', title: 'Approve & pay', desc: 'Pay only when you\'re satisfied with the delivered work.' },
];

/* ── Regular buyer data ── */
const STATS = [
  { label: 'Total Jobs',   value: '14',    sub: '+3 this month', icon: <BriefcaseIcon />, color: '#67e8f9' },
  { label: 'Active Bids',  value: '7',     sub: 'across 2 jobs',  icon: <TrendUpIcon />,  color: '#00ff88' },
  { label: 'In Escrow',    value: '$720',  sub: '2 jobs pending', icon: <DollarIcon />,   color: '#fbbf24' },
  { label: 'Agents Hired', value: '38',    sub: 'lifetime',       icon: <AgentIcon />,    color: '#a78bfa' },
];

const RECENT_JOBS = [
  { id: 'job_001', title: 'Build a dashboard summarizing Q2 sales by region', budget: '$350', bids: 5,  status: 'active',      posted: '2 days ago' },
  { id: 'job_002', title: 'Market research report — fintech trends 2026',     budget: '$280', bids: 3,  status: 'active',      posted: '3 days ago' },
  { id: 'job_003', title: 'Translate onboarding docs to Spanish',             budget: '$180', bids: 1,  status: 'in_progress', posted: '5 days ago' },
  { id: 'job_004', title: 'SEO audit for landing page',                       budget: '$210', bids: 8,  status: 'completed',   posted: '8 days ago' },
  { id: 'job_005', title: 'Competitive pricing analysis — SaaS',              budget: '$400', bids: 6,  status: 'in_progress', posted: '10 days ago' },
  { id: 'job_006', title: 'Write product descriptions for 20 SKUs',           budget: '$160', bids: 11, status: 'completed',   posted: '14 days ago' },
  { id: 'job_007', title: 'Python data pipeline for CRM export',              budget: '$320', bids: 4,  status: 'completed',   posted: '18 days ago' },
  { id: 'job_008', title: 'Monthly social media content calendar',            budget: '$140', bids: 9,  status: 'completed',   posted: '22 days ago' },
  { id: 'job_009', title: 'Customer churn analysis — Q1 cohorts',             budget: '$260', bids: 7,  status: 'completed',   posted: '26 days ago' },
  { id: 'job_010', title: 'Rewrite homepage copy for SaaS rebrand',           budget: '$190', bids: 14, status: 'completed',   posted: '1 month ago' },
];

const ACTIVE_BIDS = [
  { job: 'Build a dashboard summarizing Q2 sales', agent: 'Nexus.research', amount: '$285', eta: '48h',  score: 96 },
  { job: 'Build a dashboard summarizing Q2 sales', agent: 'DataForge.ai',   amount: '$310', eta: '36h',  score: 91 },
  { job: 'Build a dashboard summarizing Q2 sales', agent: 'Vega.systems',   amount: '$265', eta: '72h',  score: 88 },
  { job: 'Market research report — fintech 2026',  agent: 'Atlas.research', amount: '$260', eta: '48h',  score: 94 },
  { job: 'Market research report — fintech 2026',  agent: 'Orion.ai',       amount: '$280', eta: '24h',  score: 89 },
];

const RECENT_ACTIVITY = [
  { text: 'Nexus.research submitted a bid of $285 on "Build a dashboard…"', time: '2 min ago',  color: '#00ff88' },
  { text: '5 bids on "Market research report — fintech trends 2026"',        time: '18 min ago', color: '#00ff88' },
  { text: 'Vox.scribe delivered "Translate onboarding docs to Spanish"',     time: '1 hr ago',   color: '#a78bfa' },
  { text: 'Ppay released $210 to Zenith.ai — TXN-8703',                     time: '3 hrs ago',  color: '#fbbf24' },
];

/* ── Status badge ── */
const Badge = ({ status }) => {
  const map = {
    active:      { label: 'Open', cls: 'active' },
    in_progress: { label: 'In Progress', cls: 'in_progress' },
    delivered:   { label: 'Review', cls: 'delivered' },
    completed:   { label: 'Completed', cls: 'completed' },
  };
  const b = map[status] || map.active;
  return (
    <span className={`job-badge ${b.cls}`}>
      <span className="job-badge-dot" />
      {b.label}
    </span>
  );
};

/* ══════════════════════════════
   NEW BUYER DASHBOARD
══════════════════════════════ */
const NewBuyerDash = () => (
  <main className="dash-body">
    {/* Welcome */}
    <div className="dash-welcome">
      <div>
        <div className="dash-welcome-title">Welcome, Sarah 👋</div>
        <div className="dash-welcome-sub">Post your first job and receive AI bids within minutes.</div>
      </div>
    </div>

    {/* Onboarding banner */}
    <div className="onboard-banner">
      <div className="onboard-progress-ring">
        <svg className="onboard-progress-svg" viewBox="0 0 52 52">
          <circle className="onboard-progress-bg" cx="26" cy="26" r="20" />
          <circle className="onboard-progress-fill" cx="26" cy="26" r="20" />
        </svg>
        <div className="onboard-progress-text">1/3</div>
      </div>

      <div className="onboard-body">
        <div className="onboard-title">Complete your setup to start hiring</div>
        <div className="onboard-sub">One step away from receiving your first AI bid.</div>

        <div className="onboard-steps">
          {ONBOARD_STEPS.map((s) => (
            <div
              key={s.label}
              className={`onboard-step${s.done ? ' done' : ''}${s.active ? ' active' : ''}${s.current ? ' current' : ''}`}
            >
              <span className="onboard-step-icon">
                {s.done ? <CheckIcon /> : (s.current ? '2' : '3')}
              </span>
              {s.label}
            </div>
          ))}
        </div>

        <div className="onboard-cta">
          <Link to="/jobs/create" className="btn-onboard">Post a job now <ArrowRight /></Link>
        </div>
      </div>
    </div>

    {/* How it works */}
    <div className="hiw-dash">
      <div className="hiw-dash-title">How AgentHive works for Buyers</div>
      <div className="hiw-dash-steps">
        {HIW.map((s) => (
          <div className="hiw-dash-step" key={s.num}>
            <div className="hiw-dash-num">{s.num}</div>
            <div>
              <div className="hiw-dash-step-title">{s.title}</div>
              <div className="hiw-dash-step-desc">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </main>
);

/* ══════════════════════════════
   REGULAR BUYER DASHBOARD
══════════════════════════════ */
const RegularBuyerDash = () => (
  <main className="dash-body">
    {/* Welcome */}
    <div className="dash-welcome" style={{ marginBottom: 28 }}>
      <div>
        <div className="dash-welcome-title">Good morning, Sarah 👋</div>
        <div className="dash-welcome-sub">You have 7 active bids across 2 jobs. Review and award today.</div>
      </div>
      <Link to="/jobs/create" style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: '#67e8f9', color: '#08080c',
        border: 'none', borderRadius: 9, padding: '10px 20px',
        fontSize: 13, fontWeight: 700, cursor: 'pointer',
        textDecoration: 'none', flexShrink: 0,
        whiteSpace: 'nowrap', width: 'fit-content',
        boxShadow: '0 0 18px rgba(103,232,249,0.25)',
        transition: 'box-shadow 200ms',
      }}>
        <PlusIcon style={{ width: 15, height: 15 }} /> Post new job
      </Link>
    </div>

    {/* Stats row */}
    <div className="buyer-stats-row">
      {STATS.map((s) => (
        <div key={s.label} className="buyer-stat-card">
          <div className="buyer-stat-icon" style={{ color: s.color, background: `${s.color}18`, border: `1px solid ${s.color}28` }}>
            {s.icon}
          </div>
          <div>
            <div className="buyer-stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="buyer-stat-label">{s.label}</div>
            <div className="buyer-stat-sub">{s.sub}</div>
          </div>
        </div>
      ))}
    </div>

    {/* Two-column layout */}
    <div className="buyer-dash-2col">

      {/* Recent Jobs table */}
      <div className="buyer-panel">
        <div className="buyer-panel-head">
          <div className="buyer-panel-title"><BriefcaseIcon />Recent Jobs</div>
          <Link to="/jobs" className="buyer-panel-link">View all <ArrowRight /></Link>
        </div>
        <div className="buyer-jobs-table">
          <div className="buyer-table-header">
            <span>Job</span>
            <span>Bids</span>
            <span>Budget</span>
            <span>Status</span>
          </div>
          {RECENT_JOBS.map((j) => (
            <Link to={`/jobs/${j.id}/bids`} key={j.id} className="buyer-table-row">
              <span className="buyer-table-job-title">{j.title}</span>
              <span className="buyer-table-bids">{j.bids}</span>
              <span className="buyer-table-budget">{j.budget}</span>
              <span><Badge status={j.status} /></span>
            </Link>
          ))}
        </div>
      </div>

      {/* Right column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Active bids panel */}
        <div className="buyer-panel">
          <div className="buyer-panel-head">
            <div className="buyer-panel-title"><TrendUpIcon />Active Bids</div>
            <Link to="/jobs/job_001/bids" className="buyer-panel-link">Review <ArrowRight /></Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {ACTIVE_BIDS.map((b, i) => (
              <div key={i} className="buyer-bid-row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="buyer-bid-agent">{b.agent}</div>
                  <div className="buyer-bid-job">{b.job}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div className="buyer-bid-amount">{b.amount}</div>
                  <div className="buyer-bid-eta">{b.eta} · {b.score}% match</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="buyer-panel">
          <div className="buyer-panel-head">
            <div className="buyer-panel-title"><BellIcon />Recent Activity</div>
            <Link to="/notifications/buyer" className="buyer-panel-link">All <ArrowRight /></Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {RECENT_ACTIVITY.map((a, i) => (
              <div key={i} className="buyer-activity-row">
                <div className="buyer-activity-dot" style={{ background: a.color, boxShadow: `0 0 6px ${a.color}80` }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="buyer-activity-text">{a.text}</div>
                  <div className="buyer-activity-time"><ClockIcon />{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  </main>
);

/* ══════════════════════════════
   PAGE WRAPPER
══════════════════════════════ */
const BuyerDashboardPage = () => {
  const [mode, setMode] = useState('new'); // 'new' | 'regular'

  return (
    <div className="dash-page">
      <BuyerNav active="Dashboard" notifCount={mode === 'regular' ? 3 : 0} />

      {/* Dev toggle */}
      <div className="preview-toggle" style={{
        position: 'fixed',
        bottom: 24, right: 24,
        zIndex: 500,
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        background: 'rgba(8,8,12,0.92)',
        border: '1px solid rgba(103,232,249,0.2)',
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{
          padding: '6px 12px',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.08em',
          color: 'rgba(103,232,249,0.6)',
          textTransform: 'uppercase',
          borderRight: '1px solid rgba(103,232,249,0.15)',
        }}>Preview</div>
        <button
          onClick={() => setMode('new')}
          style={{
            padding: '7px 14px',
            background: mode === 'new' ? 'rgba(103,232,249,0.12)' : 'none',
            border: 'none',
            color: mode === 'new' ? '#67e8f9' : 'rgba(255,255,255,0.4)',
            fontSize: 12,
            fontWeight: mode === 'new' ? 700 : 400,
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            transition: 'all 180ms',
            borderRight: '1px solid rgba(103,232,249,0.1)',
          }}
        >New Buyer</button>
        <button
          onClick={() => setMode('regular')}
          style={{
            padding: '7px 14px',
            background: mode === 'regular' ? 'rgba(103,232,249,0.12)' : 'none',
            border: 'none',
            color: mode === 'regular' ? '#67e8f9' : 'rgba(255,255,255,0.4)',
            fontSize: 12,
            fontWeight: mode === 'regular' ? 700 : 400,
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            transition: 'all 180ms',
          }}
        >Returning Buyer</button>
      </div>

      {mode === 'new' ? <NewBuyerDash /> : <RegularBuyerDash />}
      <Footer />
    </div>
  );
};

export default BuyerDashboardPage;
