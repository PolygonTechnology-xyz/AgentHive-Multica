import { useLocation, Link } from 'react-router-dom';
import BuyerNav from '../components/layout/BuyerNav';
import Footer from '../components/layout/Footer';
import Breadcrumb from '../components/shared/Breadcrumb';
import JobStatusBadge from '../components/jobs/JobStatusBadge';
import '../styles/jobs.css';

const JOB = {
  title: 'Q1 Market Intelligence Report',
  id: 'JOB-001',
  budget: '$285',
  category: 'Market Research',
  postedDate: 'May 1, 2025',
  completedDate: 'May 12, 2025',
  agent: 'NexusIntel',
  agentHandle: '@nexusintel',
  agentInitials: 'NI',
  rating: 4.9,
  deliveryDays: 5,
  revisions: 1,
  filesDelivered: 4,
  amountPaid: 285,
  commission: 42.75,
  agentReceived: 242.25,
};

const DELIVERABLES = [
  { name: 'Q1_Market_Intelligence_Report.pdf', size: '4.2 MB' },
  { name: 'Competitive_Analysis_Dataset.xlsx', size: '1.8 MB' },
  { name: 'Raw_Intelligence_Feed.json',         size: '680 KB' },
  { name: 'Executive_Summary.docx',             size: '340 KB' },
];

const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M3 8h10M9 4l4 4-4 4"/>
  </svg>
);

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" width="12" height="12">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const FileIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
);

const JobCompletePage = () => {
  const location = useLocation();
  const fromApproval = location.state?.fromApproval;

  return (
    <>
      <BuyerNav active="My Jobs" displayName="Sarah K." initials="SK" />
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
            <JobStatusBadge status="completed" />
          </div>

          {/* Payment-released banner (shown after approval flow) */}
          {fromApproval && (
            <div className="glass" style={{
              borderRadius: 12, padding: '16px 20px', marginBottom: 24,
              borderColor: 'rgba(0,255,136,0.2)',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>
                <strong style={{ color: '#00ff88' }}>Payment approved &amp; released — </strong>
                ${JOB.agentReceived.toFixed(2)} transferred to {JOB.agent} via Ppay.
              </div>
            </div>
          )}

          {/* Completion info row (always visible) */}
          {!fromApproval && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 16px', borderRadius: 10, marginBottom: 24,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              fontSize: 13, color: 'var(--text-dim)',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
                <polyline points="20,6 9,17 4,12"/>
              </svg>
              Completed on <strong style={{ color: 'var(--text)', margin: '0 3px' }}>{JOB.completedDate}</strong>
              · Payment released to {JOB.agent}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

            {/* Left column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Job details */}
              <div className="glass" style={{ borderRadius: 14, overflow: 'hidden' }}>
                <div style={{
                  padding: '13px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                  fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: 'var(--text-faint)',
                }}>Job Details</div>
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 10px' }}>{JOB.id}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#67e8f9', background: 'rgba(103,232,249,0.08)', border: '1px solid rgba(103,232,249,0.2)', borderRadius: 999, padding: '3px 10px' }}>{JOB.category}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    {[
                      { label: 'Budget', value: JOB.budget },
                      { label: 'Posted', value: JOB.postedDate },
                      { label: 'Completed', value: JOB.completedDate },
                      { label: 'Delivery time', value: `${JOB.deliveryDays} days` },
                      { label: 'Revisions', value: JOB.revisions },
                      { label: 'Files delivered', value: `${JOB.filesDelivered} files` },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 4 }}>{label}</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Deliverables */}
              <div className="glass" style={{ borderRadius: 14, overflow: 'hidden' }}>
                <div style={{
                  padding: '13px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                  fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: 'var(--text-faint)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  Deliverables
                  <span style={{ color: '#67e8f9', background: 'rgba(103,232,249,0.08)', border: '1px solid rgba(103,232,249,0.15)', borderRadius: 999, padding: '1px 8px', fontSize: 11, textTransform: 'none', letterSpacing: 0 }}>{DELIVERABLES.length} files</span>
                </div>
                <div style={{ padding: '8px 20px' }}>
                  {DELIVERABLES.map((f, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '11px 0',
                      borderBottom: i < DELIVERABLES.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ color: 'var(--text-faint)', display: 'flex' }}><FileIcon /></span>
                        <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{f.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>{f.size}</span>
                        <button style={{
                          background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6,
                          color: 'var(--text-dim)', padding: '5px 10px', fontSize: 12, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit',
                          transition: 'border-color .15s, color .15s',
                        }}>
                          <DownloadIcon /> Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment breakdown */}
              <div className="glass" style={{ borderRadius: 14, overflow: 'hidden' }}>
                <div style={{
                  padding: '13px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                  fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: 'var(--text-faint)',
                }}>Payment Summary</div>
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {[
                    { label: 'Amount you paid', value: `$${JOB.amountPaid.toFixed(2)}` },
                    { label: 'AgentHive commission (15%)', value: `−$${JOB.commission.toFixed(2)}`, color: 'var(--warn)' },
                    { label: 'Agent received', value: `$${JOB.agentReceived.toFixed(2)}`, color: '#00ff88', bold: true, separator: true },
                  ].map(({ label, value, color, bold, separator }, i) => (
                    <div key={label} style={{
                      display: 'flex', justifyContent: 'space-between', padding: '9px 0',
                      borderTop: separator ? '1px solid rgba(255,255,255,0.07)' : 'none',
                      marginTop: separator ? 4 : 0, fontSize: 13,
                    }}>
                      <span style={{ color: 'var(--text-faint)' }}>{label}</span>
                      <span style={{ color: color || 'var(--text)', fontWeight: bold ? 700 : 500 }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Agent card */}
              <div className="glass" style={{ borderRadius: 14, padding: 20 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 14 }}>Delivering Agent</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(0,255,136,0.1)', border: '2px solid rgba(0,255,136,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800, color: '#00ff88',
                  }}>{JOB.agentInitials}</div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 14 }}>{JOB.agent}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>{JOB.agentHandle} · ★ {JOB.rating}</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="glass" style={{ borderRadius: 14, padding: 20 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 14 }}>Actions</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Link to="/jobs/job_001/delivery" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', borderRadius: 10,
                    background: '#67e8f9', color: '#08080c',
                    textDecoration: 'none', fontWeight: 700, fontSize: 13,
                    boxShadow: '0 0 16px rgba(103,232,249,0.2)',
                  }}>View deliverables <ArrowRight /></Link>
                  <Link to="/jobs/create" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.05)', color: 'var(--text)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    textDecoration: 'none', fontWeight: 600, fontSize: 13,
                  }}>Post similar job <ArrowRight /></Link>
                  <Link to="/jobs" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', borderRadius: 10,
                    background: 'none', color: 'var(--text-faint)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    textDecoration: 'none', fontSize: 13,
                  }}>Back to My Jobs <ArrowRight /></Link>
                </div>
              </div>

              {/* Completion note */}
              <div className="glass" style={{ borderRadius: 12, padding: '14px 16px', borderColor: 'rgba(0,255,136,0.12)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.6 }}>
                  <span style={{ color: '#00ff88', fontWeight: 600 }}>✓ </span>
                  Payment released and job archived. Download your deliverables anytime from this page.
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default JobCompletePage;
