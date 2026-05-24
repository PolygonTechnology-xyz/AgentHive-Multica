import { useState } from 'react';
import FreelancerNav from '../components/layout/FreelancerNav';
import FreelancerJobCard from '../components/freelancer/FreelancerJobCard';
import CompletedJobRow from '../components/freelancer/CompletedJobRow';
import JobDetailSlideOver from '../components/freelancer/JobDetailSlideOver';
import Footer from '../components/layout/Footer';
import '../styles/freelancer-dashboard.css';
import '../styles/bid-log.css';

/* ─── data ──────────────────────────────────────────────── */
const ACTIVE_JOBS = [
  {
    id: 'job_004',
    title: 'E-commerce Product Description Bulk (200)',
    buyer: 'Trendly',
    category: 'Copywriting',
    status: 'in_revision',
    payout: 480,
    deadline: '22 May 2026',
    agent: 'Atlas-Scribe-2',
    dispatchedAt: '21 Apr 2026',
    revisionNote: 'Please make the tone more playful and add a call-to-action at the end of each description.',
    lastAction: 'Atlas-Scribe-2 acknowledged revision request 2 hours ago',
  },
  {
    id: 'job_002',
    title: 'Competitive Pricing Analysis — Retail',
    buyer: 'ShelfIQ',
    category: 'Market Research',
    status: 'in_progress',
    payout: 410,
    deadline: '19 May 2026',
    agent: 'Atlas-Research-7',
    dispatchedAt: '28 Apr 2026',
    progressNote: 'Atlas-Research-7 completed 60% of competitor data collection. On track for deadline.',
    lastAction: 'Agent submitted partial data extraction checkpoint 4 hours ago',
  },
  {
    id: 'job_003',
    title: 'Annual Report Copyediting & Formatting',
    buyer: 'FinBridge',
    category: 'Document Processing',
    status: 'delivered',
    payout: 190,
    deadline: '18 May 2026',
    agent: 'Atlas-Scribe-2',
    dispatchedAt: '25 Apr 2026',
    lastAction: 'Delivery submitted 6 hours ago. Awaiting buyer approval.',
  },
  {
    id: 'job_005',
    title: 'SEC Filing Extraction & Structuring',
    buyer: 'CapEdge',
    category: 'Financial AI',
    status: 'in_progress',
    payout: 530,
    deadline: '24 May 2026',
    agent: 'Atlas-Extract-3',
    dispatchedAt: '20 Apr 2026',
    progressNote: 'Atlas-Extract-3 processing 40 of 120 SEC filings. ETA 3 days.',
    lastAction: 'Agent last active 1 hour ago',
  },
];

const COMPLETED_JOBS = [
  {
    id: 'job_001', title: 'Q1 Market Intelligence Report',
    buyer: 'NovaCorp', category: 'Market Research',
    payout: 285, completedAt: '2 May 2026',
  },
  {
    id: 'job_012', title: 'Patent Landscape Report — Biotech',
    buyer: 'Helixara', category: 'Research',
    payout: 820, completedAt: '17 Apr 2026',
  },
  {
    id: 'job_008', title: 'Brand Voice & Messaging Guide',
    buyer: 'Sprout Studio', category: 'Content Strategy',
    payout: 340, completedAt: '3 Apr 2026',
  },
];

const FreelancerJobsPage = () => {
  const [tab,      setTab]      = useState('Active Jobs');
  const [slideJob, setSlideJob] = useState(null);

  const totalEarned = COMPLETED_JOBS.reduce((s, j) => s + Math.round(j.payout * 0.85), 0);

  return (
    <>
      <FreelancerNav activePage="My Jobs" />

      <div className="fj-page">
        <div className="fj-container">

          {/* Header */}
          <div className="fj-title-row">
            <div>
              <h1 className="fj-page-title">My Jobs</h1>
              <p className="fj-page-sub">Track active work, review deliveries, and manage revisions.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="fj-badge cyan">{ACTIVE_JOBS.length} active</span>
              <span className="fj-badge grey">{COMPLETED_JOBS.length} completed</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="fj-tabs">
            {['Active Jobs', 'Completed'].map(t => (
              <button
                key={t}
                className={`fj-tab${tab === t ? ' active' : ''}`}
                onClick={() => setTab(t)}
              >
                {t}
                {t === 'Active Jobs' && (
                  <span className="fj-tab-count">{ACTIVE_JOBS.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* Active jobs */}
          {tab === 'Active Jobs' && (
            <div className="fj-cards">
              {ACTIVE_JOBS.map(job => (
                <FreelancerJobCard
                  key={job.id}
                  job={job}
                  onViewDetail={setSlideJob}
                />
              ))}
            </div>
          )}

          {/* Completed jobs */}
          {tab === 'Completed' && (
            <div className="completed-section">
              <div className="completed-header">
                <span className="fj-section-title">{COMPLETED_JOBS.length} completed jobs</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 700 }}>
                  Total earned: ${totalEarned.toLocaleString()}
                </span>
              </div>
              <div className="completed-list">
                {COMPLETED_JOBS.map(j => (
                  <CompletedJobRow key={j.id} job={j} />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {slideJob && (
        <JobDetailSlideOver
          job={slideJob}
          onClose={() => setSlideJob(null)}
        />
      )}
      <Footer />
    </>
  );
};

export default FreelancerJobsPage;
