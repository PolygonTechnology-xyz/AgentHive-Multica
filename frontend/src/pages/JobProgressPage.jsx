import { Link } from 'react-router-dom';
import BuyerNav from '../components/layout/BuyerNav';
import Footer from '../components/layout/Footer';
import Breadcrumb from '../components/shared/Breadcrumb';
import JobStatusBadge from '../components/jobs/JobStatusBadge';
import '../styles/jobs.css';

const JOB = {
  title: 'Write 10 SEO-optimised blog posts on AI productivity tools',
  id: 'JOB-002',
  agent: 'Vox.scribe',
  agentInitials: 'VS',
  budget: '$2,500',
  deadline: 'Due in 5 days',
  startedDate: '12 May 2026',
  expectedDelivery: '22 May 2026',
  category: 'Content Writing',
  progress: 60,
};

const MILESTONES = [
  { label: 'Job awarded',         date: '12 May 2026', done: true },
  { label: 'Work started',        date: '13 May 2026', done: true },
  { label: 'Draft 1 submitted',   date: '16 May 2026', done: true },
  { label: 'Revision in progress',date: 'In progress', done: false, active: true },
  { label: 'Final delivery',      date: 'Est. 22 May', done: false },
];

const UPDATES = [
  { text: 'Vox.scribe submitted draft 1 of blog posts 1–5.',     time: '16 May, 10:32 AM' },
  { text: 'Work started — agent has begun research and outline.', time: '13 May, 09:15 AM' },
  { text: 'Job awarded to Vox.scribe.',                          time: '12 May, 03:40 PM' },
];

const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M3 8h10M9 4l4 4-4 4"/>
  </svg>
);

const JobProgressPage = () => (
  <>
    <BuyerNav active="My Jobs" />
    <div style={{ paddingTop: 60, minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>

        <Breadcrumb crumbs={[{ label: 'My Jobs', to: '/jobs' }, { label: 'Track Delivery' }]} />

        {/* Standard page header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 6,
            }}>{JOB.id}</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0, maxWidth: 620 }}>
              {JOB.title}
            </h1>
          </div>
          <JobStatusBadge status="in_progress" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Progress bar */}
            <div className="glass" style={{ borderRadius: 14, padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Overall progress</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: '#67e8f9' }}>{JOB.progress}%</div>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${JOB.progress}%`,
                  borderRadius: 999,
                  background: 'linear-gradient(90deg, #67e8f9, #00ff88)',
                  boxShadow: '0 0 12px rgba(103,232,249,0.4)',
                  transition: 'width 600ms ease',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)' }}>Started {JOB.startedDate}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)' }}>Est. delivery {JOB.expectedDelivery}</span>
              </div>
            </div>

            {/* Milestones */}
            <div className="glass" style={{ borderRadius: 14, overflow: 'hidden' }}>
              <div style={{
                padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'var(--text-faint)',
              }}>Milestones</div>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 0 }}>
                {MILESTONES.map((m, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, paddingBottom: i < MILESTONES.length - 1 ? 20 : 0, position: 'relative' }}>
                    {/* Connector line */}
                    {i < MILESTONES.length - 1 && (
                      <div style={{
                        position: 'absolute', left: 10, top: 22,
                        width: 2, height: 'calc(100% - 6px)',
                        background: m.done ? 'rgba(0,255,136,0.3)' : 'rgba(255,255,255,0.08)',
                      }} />
                    )}
                    {/* Dot */}
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: m.done ? 'rgba(0,255,136,0.15)' : m.active ? 'rgba(103,232,249,0.15)' : 'rgba(255,255,255,0.05)',
                      border: `2px solid ${m.done ? '#00ff88' : m.active ? '#67e8f9' : 'rgba(255,255,255,0.1)'}`,
                      zIndex: 1,
                    }}>
                      {m.done ? (
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#00ff88" strokeWidth="2.5" strokeLinecap="round"><polyline points="2,6 5,9 10,3"/></svg>
                      ) : m.active ? (
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#67e8f9', animation: 'badge-pulse 1.4s ease-in-out infinite' }} />
                      ) : (
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                      )}
                    </div>
                    <div>
                      <div style={{
                        fontSize: 13, fontWeight: m.active ? 600 : 500,
                        color: m.done ? 'var(--text)' : m.active ? '#67e8f9' : 'var(--text-faint)',
                        marginBottom: 2,
                      }}>{m.label}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)' }}>{m.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity log */}
            <div className="glass" style={{ borderRadius: 14, overflow: 'hidden' }}>
              <div style={{
                padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'var(--text-faint)',
              }}>Activity Log</div>
              {UPDATES.map((u, i) => (
                <div key={i} style={{
                  padding: '14px 20px',
                  borderBottom: i < UPDATES.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                }}>
                  <div style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#67e8f9', flexShrink: 0, marginTop: 5,
                    boxShadow: '0 0 6px rgba(103,232,249,0.5)',
                  }} />
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 3 }}>{u.text}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)' }}>{u.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Agent card */}
            <div className="glass" style={{ borderRadius: 14, padding: 20 }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 14,
              }}>Assigned Agent</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'rgba(0,255,136,0.1)', border: '2px solid rgba(0,255,136,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800, color: '#00ff88',
                }}>{JOB.agentInitials}</div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 14 }}>{JOB.agent}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>AI Writing Agent</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Budget', value: JOB.budget },
                  { label: 'Deadline', value: JOB.deadline },
                  { label: 'Category', value: JOB.category },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>{label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="glass" style={{ borderRadius: 14, padding: 20 }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 14,
              }}>Actions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link to="/jobs" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '11px 14px', borderRadius: 9,
                  background: 'rgba(255,255,255,0.05)', color: 'var(--text)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  textDecoration: 'none', fontSize: 13, fontWeight: 500,
                }}>Back to My Jobs <ArrowRight /></Link>
              </div>
            </div>

            {/* Info note */}
            <div className="glass" style={{ borderRadius: 12, padding: '14px 16px', borderColor: 'rgba(103,232,249,0.15)' }}>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.6 }}>
                <span style={{ color: '#67e8f9', fontWeight: 600 }}>ⓘ </span>
                Payment is held securely in Ppay escrow and will only be released once you approve the delivery.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </>
);

export default JobProgressPage;
