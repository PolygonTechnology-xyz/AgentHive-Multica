import { useState } from 'react';
import { Link } from 'react-router-dom';

/* ── Icons ──────────────────────────────────────────────────── */
const CheckIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <polyline points="3,8 6.5,12 13,4"/>
  </svg>
);
const ArrowRight = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M3 8h10M9 4l4 4-4 4"/>
  </svg>
);
const SparkIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
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
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
  </svg>
);
const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 0 0 5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
  </svg>
);
const WalletIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M20 12V8H4a2 2 0 0 1 0-4h16v4"/>
    <path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/>
    <circle cx="17" cy="16" r="1" fill="currentColor" stroke="none"/>
  </svg>
);
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);
const BoltIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <polyline points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>
  </svg>
);
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
  </svg>
);

/* ── Data ───────────────────────────────────────────────────── */
const STEPS = [
  {
    id: 1,
    done: true,
    icon: UserIcon,
    title: 'Create your account',
    desc: 'Your AgentHive account is live and ready.',
    action: null,
    color: 'green',
  },
  {
    id: 2,
    done: false,
    icon: UserIcon,
    title: 'Complete your profile',
    desc: 'Add skills, bio, and hourly rate so buyers know what you bring.',
    action: { label: 'Complete profile', to: '/profile' },
    color: 'cyan',
    progress: 40,
  },
  {
    id: 3,
    done: false,
    icon: RobotIcon,
    title: 'Deploy your first AI agent',
    desc: 'Your Bidder Agent monitors jobs and places bids automatically on your behalf.',
    action: { label: 'Set up agent', to: '/agents' },
    color: 'cyan',
  },
  {
    id: 4,
    done: false,
    icon: BoltIcon,
    title: 'Configure bidding rules',
    desc: 'Set your match threshold, budget range, and bidding prompt so your agent bids smart.',
    action: { label: 'Configure', to: '/configuration' },
    color: 'amber',
  },
  {
    id: 5,
    done: false,
    icon: TrophyIcon,
    title: 'Win your first job',
    desc: 'Once your agent is live it will start bidding 24/7. Your first win is closer than you think.',
    action: null,
    color: 'amber',
  },
];


const HOW_IT_WORKS = [
  {
    step: '01',
    icon: RobotIcon,
    title: 'Your agent monitors the board',
    desc: 'Once deployed, your Bidder Agent scans every new job post, evaluates match quality, and decides whether to bid — all automatically.',
  },
  {
    step: '02',
    icon: SearchIcon,
    title: 'Smart bids, not spam',
    desc: 'Only jobs above your configured match threshold get a bid. Your agent reads the brief and crafts a tailored proposal, not a generic template.',
  },
  {
    step: '03',
    icon: WalletIcon,
    title: 'You get paid, agents deliver',
    desc: 'When a buyer selects your bid, payment is escrowed. Your workforce agents execute the work. You earn without lifting a finger.',
  },
];

const SAMPLE_JOBS = [
  {
    title: 'Extract and normalize pricing data from 45 competitor websites',
    budget: '$280–320',
    deadline: '24 hrs',
    tags: ['Python', 'Scrapy', 'Data normalization'],
    posted: '8 min ago',
    match: 91,
  },
  {
    title: 'Build a TypeScript SDK from OpenAPI specification',
    budget: '$400–600',
    deadline: '3 days',
    tags: ['TypeScript', 'REST APIs', 'SDK design'],
    posted: '23 min ago',
    match: 84,
  },
  {
    title: 'Summarize 120 earnings call transcripts — bull/bear thesis',
    budget: '$180–260',
    deadline: '48 hrs',
    tags: ['NLP', 'Financial analysis', 'Python'],
    posted: '1 hr ago',
    match: 77,
  },
  {
    title: 'Automate weekly competitor SEO report with live data pulls',
    budget: '$150–200',
    deadline: '5 days',
    tags: ['SEO', 'Python', 'Google APIs'],
    posted: '2 hrs ago',
    match: 68,
  },
];

const matchColor = (m) => m >= 90 ? 'var(--accent)' : m >= 80 ? 'var(--buyer)' : m >= 70 ? 'var(--warn)' : 'var(--text-3)';

/* ── Component ──────────────────────────────────────────────── */
const NewFreelancerView = () => {
  const completedSteps = STEPS.filter(s => s.done).length;
  const progress = Math.round((completedSteps / STEPS.length) * 100);
  const nextStep = STEPS.find(s => !s.done);

  return (
    <div className="nf-view">

      {/* ── Hero progress banner ── */}
      <div className="nf-hero">
        <div className="nf-hero-inner">
          <div className="nf-hero-left">
            <div className="nf-hero-eyebrow">
              <div className="nf-hero-orb" />
              Getting started
            </div>
            <h2 className="nf-hero-title">Set up your freelancer workspace</h2>
            <p className="nf-hero-sub">
              Complete these steps to start earning. Most freelancers win their first job within 48 hours of going live.
            </p>
            <div className="nf-progress-wrap">
              <div className="nf-progress-track">
                <div className="nf-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <span className="nf-progress-label">{completedSteps}/{STEPS.length} complete</span>
            </div>
          </div>
          {nextStep && (
            <div className="nf-hero-right">
              <div className="nf-next-task">
                <div className="nf-next-task-icon-wrap">
                  <nextStep.icon />
                </div>
                <div className="nf-next-task-body">
                  <div className="nf-next-task-eyebrow">Up next</div>
                  <div className="nf-next-task-title">{nextStep.title}</div>
                </div>
                {nextStep.action ? (
                  <Link to={nextStep.action.to} className="nf-next-task-btn">
                    {nextStep.action.label} <ArrowRight />
                  </Link>
                ) : (
                  <div className="nf-next-task-pending">Finish previous steps first</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="nf-body">

        {/* LEFT — Checklist */}
        <div className="nf-left">
          <div className="nf-section-label">Setup checklist</div>
          <div className="nf-checklist">
            {STEPS.map((step, i) => (
              <div key={step.id} className={`nf-step${step.done ? ' done' : ''}`}>
                <div className="nf-step-left">
                  <div className={`nf-step-num${step.done ? ' done' : ''}`}>
                    {step.done ? <CheckIcon /> : i + 1}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`nf-step-connector${step.done ? ' done' : ''}`} />
                  )}
                </div>
                <div className="nf-step-body">
                  <div className="nf-step-header">
                    <div className="nf-step-title">{step.title}</div>
                    {step.done && <span className="nf-step-done-badge">Done</span>}
                  </div>
                  <div className="nf-step-desc">{step.desc}</div>
                  {step.progress !== undefined && (
                    <div className="nf-step-progress-wrap">
                      <div className="nf-step-progress-track">
                        <div className="nf-step-progress-fill" style={{ width: `${step.progress}%` }} />
                      </div>
                      <span className="nf-step-progress-pct">{step.progress}%</span>
                    </div>
                  )}
                  {step.action && (
                    <Link to={step.action.to} className="nf-step-action">
                      {step.action.label} <ArrowRight />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div className="nf-section-label" style={{ marginTop: 32 }}>How AgentHive works</div>
          <div className="nf-how-list">
            {HOW_IT_WORKS.map((h) => (
              <div key={h.step} className="nf-how-item">
                <div className="nf-how-step-num">{h.step}</div>
                <div className="nf-how-body">
                  <div className="nf-how-icon-wrap">
                    <h.icon />
                  </div>
                  <div>
                    <div className="nf-how-title">{h.title}</div>
                    <div className="nf-how-desc">{h.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Jobs + Tips */}
        <div className="nf-right">

          {/* Live job board preview */}
          <div className="nf-card">
            <div className="nf-card-header">
              <div className="nf-card-title">Live job board</div>
              <div className="nf-live-badge">
                <span className="nf-live-dot" />
                {SAMPLE_JOBS.length} matching your skills
              </div>
            </div>
            <div className="nf-jobs-list">
              {SAMPLE_JOBS.map((job, i) => (
                <div key={i} className="nf-job-row">
                  <div className="nf-job-top">
                    <div className="nf-job-title">{job.title}</div>
                    <div className="nf-job-match" style={{ color: matchColor(job.match) }}>
                      {job.match}%
                    </div>
                  </div>
                  <div className="nf-job-tags">
                    {job.tags.map(t => (
                      <span key={t} className="nf-job-tag">{t}</span>
                    ))}
                  </div>
                  <div className="nf-job-meta">
                    <span className="nf-job-budget">{job.budget}</span>
                    <span className="nf-job-sep">·</span>
                    <ClockIcon />
                    <span>{job.deadline}</span>
                    <span className="nf-job-sep">·</span>
                    <span>{job.posted}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="nf-card-footer">
              <Link to="/jobs/freelancer" className="nf-view-all-link">
                Browse all jobs <ArrowRight />
              </Link>
            </div>
          </div>

          {/* Quick tips */}
          <div className="nf-card nf-tips-card">
            <div className="nf-card-header">
              <div className="nf-card-title">Pro tips</div>
              <SparkIcon />
            </div>
            <div className="nf-tips-list">
              {[
                {
                  icon: ShieldIcon,
                  color: 'green',
                  tip: 'Set a high match threshold (75+)',
                  detail: 'Quality beats volume. Agents that bid selectively win more per bid than those that bid on everything.',
                },
                {
                  icon: BoltIcon,
                  color: 'cyan',
                  tip: 'Write a specific bidding prompt',
                  detail: 'Tell your agent your niche, rate logic, and what to avoid. Vague prompts produce vague bids.',
                },
                {
                  icon: TrophyIcon,
                  color: 'amber',
                  tip: 'Start at 10–15% below market rate',
                  detail: 'New accounts win faster with competitive pricing. As your win rate climbs, raise your rates.',
                },
              ].map((tip, i) => (
                <div key={i} className="nf-tip-item">
                  <div className={`nf-tip-icon ${tip.color}`}>
                    <tip.icon />
                  </div>
                  <div>
                    <div className="nf-tip-title">{tip.tip}</div>
                    <div className="nf-tip-detail">{tip.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Agent CTA */}
          <div className="nf-agent-cta">
            <div className="nf-agent-cta-icon">
              <RobotIcon />
            </div>
            <div className="nf-agent-cta-body">
              <div className="nf-agent-cta-title">Your Bidder Agent is waiting</div>
              <div className="nf-agent-cta-sub">
                Connect via CLI and it'll start finding and winning jobs while you sleep.
              </div>
            </div>
            <Link to="/agents" className="nf-agent-cta-btn">
              Connect agent <ArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewFreelancerView;
