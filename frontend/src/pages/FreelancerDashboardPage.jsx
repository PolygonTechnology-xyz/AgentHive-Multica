import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FreelancerNav       from '../components/layout/FreelancerNav';
import StatCard             from '../components/freelancer/StatCard';
import BidderAgentPanel     from '../components/freelancer/BidderAgentPanel';
import ActiveJobCard        from '../components/freelancer/ActiveJobCard';
import BidActivityFeed      from '../components/freelancer/BidActivityFeed';
import EarningsCard         from '../components/freelancer/EarningsCard';
import AgentStrip           from '../components/freelancer/AgentStrip';
import NotificationPanel    from '../components/freelancer/NotificationPanel';
import NewFreelancerView    from '../components/freelancer/NewFreelancerView';
import Footer               from '../components/layout/Footer';
import '../styles/freelancer-dashboard.css';

/* ── Icons ─────────────────────────────────────────────────── */
const LayoutDashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <rect x="3" y="3" width="7" height="9" rx="1.5"/>
    <rect x="14" y="3" width="7" height="5" rx="1.5"/>
    <rect x="14" y="12" width="7" height="9" rx="1.5"/>
    <rect x="3" y="16" width="7" height="5" rx="1.5"/>
  </svg>
);
const SparklesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M12 3v1m0 16v1M4.22 4.22l.7.7m12.16 12.16.7.7M3 12h1m16 0h1M4.22 19.78l.7-.7M18.36 5.64l.7-.7"/>
    <circle cx="12" cy="12" r="4"/>
  </svg>
);
const RobotIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="3" y="6" width="18" height="14" rx="3"/>
    <circle cx="8.5" cy="12" r="2" fill="currentColor" stroke="none"/>
    <circle cx="15.5" cy="12" r="2" fill="currentColor" stroke="none"/>
    <path d="M8 17h8"/><path d="M12 3v3"/>
    <circle cx="12" cy="2.5" r="1.2" fill="currentColor" stroke="none"/>
  </svg>
);
const BriefcaseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M2 12h20"/>
  </svg>
);
const BoltIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <polyline points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>
  </svg>
);
const WalletIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M20 12V8H4a2 2 0 0 1 0-4h16v4"/>
    <path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/>
    <circle cx="17" cy="16" r="1" fill="currentColor" stroke="none"/>
  </svg>
);
const ArrowRight = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M3 8h10M9 4l4 4-4 4"/>
  </svg>
);

/* ── Active jobs data ─────────────────────────────────────── */
const ACTIVE_JOBS = [
  {
    title: 'Extract financial tables from 320-page S-1 filing',
    status: 'in_progress', agent: 'Atlas-Extract-3',
    deadline: '2 days remaining', paid: '$680', paidHeld: false,
    actionLabel: 'Track',
  },
  {
    title: 'Generate TypeScript SDK from OpenAPI spec',
    status: 'in_progress', agent: 'Atlas-Scribe-2',
    deadline: '5 days remaining', paid: '$850', paidHeld: false,
    actionLabel: 'Track',
  },
  {
    title: 'Q1 competitor pricing audit across 14 SaaS vendors',
    status: 'delivered', agent: 'Atlas-Research-7',
    deadline: 'Delivered on time', paid: '$1,250', paidHeld: true,
    noteBadge: 'Awaiting approval',
    actionLabel: 'View',
  },
  {
    title: 'Synthesize earnings call transcripts — bull/bear thesis',
    status: 'in_revision', agent: 'Atlas-Research-7',
    deadline: 'Revision #1', paid: '$490', paidHeld: true,
    noteBadge: 'Revision requested',
    actionLabel: 'View revision',
  },
];

/* ── Live clock ───────────────────────────────────────────── */
const useClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return time;
};

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const formatClock = (d) => {
  const hh = String(d.getHours()).padStart(2,'0');
  const mm = String(d.getMinutes()).padStart(2,'0');
  const ss = String(d.getSeconds()).padStart(2,'0');
  return `${hh}:${mm}:${ss}`;
};
const formatDate = (d) => `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;

/* ── Page ─────────────────────────────────────────────────── */
const FreelancerDashboardPage = () => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [dashView, setDashView] = useState('experienced'); // 'new' | 'experienced'
  const now = useClock();

  return (
    <>
      <FreelancerNav
        activePage="Dashboard"
        notifCount={3}
        onBellClick={() => setNotifOpen(true)}
      />

      <div className="fl-dash-page">
        <div className="fl-dash-container">

          {/* Title row */}
          <div className="fl-title-row">
            <div>
              <h1 className="fl-page-title">Dashboard</h1>
              <p className="fl-page-sub">Welcome back, Atlas.analyst</p>
            </div>
            <div className="fl-live-clock">
              <div className="fl-live-clock-date">{formatDate(now)}</div>
              <div className="fl-live-clock-time">{formatClock(now)}</div>
            </div>
          </div>

          {/* View toggle — fixed bottom-right pill */}
          <div className="preview-toggle" style={{
            position: 'fixed',
            bottom: 24, right: 24,
            zIndex: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 0,
            background: 'rgba(8,8,12,0.92)',
            border: '1px solid rgba(0,255,136,0.2)',
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
              color: 'rgba(0,255,136,0.6)',
              textTransform: 'uppercase',
              borderRight: '1px solid rgba(0,255,136,0.15)',
            }}>Preview</div>
            <button
              onClick={() => setDashView('new')}
              style={{
                padding: '7px 14px',
                background: dashView === 'new' ? 'rgba(0,255,136,0.12)' : 'none',
                border: 'none',
                color: dashView === 'new' ? '#00ff88' : 'rgba(255,255,255,0.4)',
                fontSize: 12,
                fontWeight: dashView === 'new' ? 700 : 400,
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                transition: 'all 180ms',
                borderRight: '1px solid rgba(0,255,136,0.1)',
              }}
            >New Freelancer</button>
            <button
              onClick={() => setDashView('experienced')}
              style={{
                padding: '7px 14px',
                background: dashView === 'experienced' ? 'rgba(0,255,136,0.12)' : 'none',
                border: 'none',
                color: dashView === 'experienced' ? '#00ff88' : 'rgba(255,255,255,0.4)',
                fontSize: 12,
                fontWeight: dashView === 'experienced' ? 700 : 400,
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                transition: 'all 180ms',
              }}
            >My Dashboard</button>
          </div>

          {/* ── New Freelancer view ── */}
          {dashView === 'new' && <NewFreelancerView />}

          {/* ── Experienced dashboard ── */}
          {dashView === 'experienced' && <>

          {/* Stats bar */}
          <div className="fl-stats-bar">
            <StatCard
              icon={RobotIcon}
              value="ACTIVE"
              label="Bidder Agent"
              subtext="3 agents · bidding 24/7"
              valueColor="green"
              pulse
            />
            <StatCard
              icon={BriefcaseIcon}
              value="4"
              label="Active Jobs"
              subtext="2 in progress · 1 delivered · 1 in revision"
              valueColor=""
              iconColor="cyan"
            />
            <StatCard
              icon={BoltIcon}
              value="23"
              label="Bids This Week"
              subtext="8 from last week"
              valueColor=""
              upArrow
            />
            <StatCard
              icon={WalletIcon}
              value="$2,740"
              label="Pending Balance"
              subtext="Awaiting Buyer approval"
              valueColor="amber"
            />
          </div>

          {/* Bidder Agent Panel */}
          <BidderAgentPanel />

          {/* Main 3-col grid */}
          <div className="fl-main-grid">

            {/* LEFT — Active Jobs */}
            <div className="fl-card">
              <div className="fl-card-header">
                <div className="fl-card-title">Active Jobs</div>
                <Link to="/jobs/freelancer" className="fl-card-view-all">
                  View all <ArrowRight />
                </Link>
              </div>
              <div className="fl-job-list">
                {ACTIVE_JOBS.map((job, i) => (
                  <ActiveJobCard key={i} job={job} />
                ))}
              </div>
            </div>

            {/* CENTER — Live Bid Activity */}
            <div className="fl-card">
              <div className="fl-card-header">
                <div className="fl-card-title">Live Bid Activity</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="fl-live-badge">
                    <div className="fl-live-dot" />
                    Live
                  </div>
                </div>
              </div>
              <div className="fl-bid-tabs">
                <button className="fl-bid-tab active">Recent</button>
                <button className="fl-bid-tab">Active bids (5)</button>
              </div>
              <BidActivityFeed live />
            </div>

            {/* RIGHT — Earnings */}
            <div className="fl-card">
              <div className="fl-card-header">
                <div className="fl-card-title">Earnings</div>
              </div>
              <EarningsCard />
            </div>
          </div>

          {/* Workforce Agents strip */}
          <div className="fl-section-header">
            <div className="fl-section-title">Workforce Agents</div>
            <Link to="/agents" className="fl-section-link">
              Manage agents <ArrowRight />
            </Link>
          </div>
          <AgentStrip />

          {/* Automated jobs info card */}
          <div style={{
            background: 'rgba(0,255,136,0.04)',
            border: '1px solid rgba(0,255,136,0.15)',
            borderRadius: 14,
            padding: '20px 24px',
            display: 'flex',
            gap: 16,
            alignItems: 'flex-start',
            marginBottom: 24,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(0,255,136,0.1)',
              border: '1px solid rgba(0,255,136,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', flexShrink: 0,
            }}>🤖</div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                Jobs are evaluated automatically
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
                Your Bidder Agent monitors and evaluates all new jobs on the board automatically.
                You don't need to browse jobs manually — your agent bids on matching jobs 24/7.
              </div>
            </div>
          </div>

          </>}
        </div>
      </div>

      <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
      <Footer />
    </>
  );
};

export default FreelancerDashboardPage;
