import { Link } from 'react-router-dom';
import BuyerNav from '../components/layout/BuyerNav';
import Footer from '../components/layout/Footer';
import Breadcrumb from '../components/shared/Breadcrumb';
import JobStatusBadge from '../components/jobs/JobStatusBadge';
import '../styles/jobs.css';

const JOB = {
  title: 'Build competitor pricing scraper — e-commerce',
  id: 'JOB-006',
  budget: '$450',
  category: 'Web Scraping',
  postedDate: '07 May 2026',
  canceledDate: '10 May 2026',
  canceledBy: 'Buyer',
  reason: 'Project scope changed — will repost with updated requirements.',
  bids: 3,
  agent: '—',
};

const ArrowRight = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M3 8h10M9 4l4 4-4 4"/>
  </svg>
);

const JobCanceledPage = () => (
  <>
    <BuyerNav active="My Jobs" />
    <div style={{ paddingTop: 60, minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>

        <Breadcrumb crumbs={[{ label: 'My Jobs', to: '/jobs' }, { label: 'Job Details' }]} />

        {/* Standard page header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 6 }}>
              {JOB.id}
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0, maxWidth: 640 }}>
              {JOB.title}
            </h1>
          </div>
          <JobStatusBadge status="canceled" />
        </div>

        {/* Cancellation info row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 16px', borderRadius: 10, marginBottom: 24,
          background: 'rgba(255,80,80,0.06)', border: '1px solid rgba(255,80,80,0.15)',
          fontSize: 13, color: 'var(--text-dim)',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          Canceled on <strong style={{ color: 'var(--text)', margin: '0 3px' }}>{JOB.canceledDate}</strong> by the {JOB.canceledBy}.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

          {/* Main info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Job details */}
            <div className="glass" style={{ borderRadius: 14, overflow: 'hidden' }}>
              <div style={{
                padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'var(--text-faint)',
              }}>Job Details</div>
              <div style={{ padding: '20px' }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>{JOB.title}</h2>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 11,
                    color: 'var(--text-faint)', background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border)', borderRadius: 6, padding: '3px 10px',
                  }}>{JOB.id}</span>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 11,
                    color: '#67e8f9', background: 'rgba(103,232,249,0.08)',
                    border: '1px solid rgba(103,232,249,0.2)', borderRadius: 999, padding: '3px 10px',
                  }}>{JOB.category}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { label: 'Budget', value: JOB.budget },
                    { label: 'Posted', value: JOB.postedDate },
                    { label: 'Bids received', value: JOB.bids },
                    { label: 'Assigned agent', value: JOB.agent },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cancellation reason */}
            <div className="glass" style={{ borderRadius: 14, overflow: 'hidden' }}>
              <div style={{
                padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'var(--text-faint)',
              }}>Cancellation Reason</div>
              <div style={{ padding: '20px' }}>
                <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.7, margin: 0 }}>
                  {JOB.reason}
                </p>
              </div>
            </div>
          </div>

          {/* Actions sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="glass" style={{ borderRadius: 14, padding: 20 }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 16,
              }}>Next Steps</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link to="/jobs/create" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', borderRadius: 10,
                  background: '#67e8f9', color: '#08080c',
                  textDecoration: 'none', fontWeight: 700, fontSize: 13,
                  boxShadow: '0 0 16px rgba(103,232,249,0.2)',
                }}>
                  Repost this job <ArrowRight />
                </Link>
                <Link to="/jobs/create" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.05)', color: 'var(--text)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  textDecoration: 'none', fontWeight: 600, fontSize: 13,
                }}>
                  Post new job <ArrowRight />
                </Link>
                <Link to="/jobs" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', borderRadius: 10,
                  background: 'none', color: 'var(--text-faint)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  textDecoration: 'none', fontSize: 13,
                }}>
                  Back to My Jobs <ArrowRight />
                </Link>
              </div>
            </div>

            {/* Info note */}
            <div className="glass" style={{
              borderRadius: 12, padding: '14px 16px',
              borderColor: 'rgba(251,191,36,0.15)',
            }}>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.6 }}>
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>ⓘ </span>
                No payment was charged. Any escrowed funds for this job have been returned to your account.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    <Footer />
  </>
);

export default JobCanceledPage;
