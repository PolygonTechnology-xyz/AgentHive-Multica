import FreelancerNav from '../components/layout/FreelancerNav';
import Footer from '../components/layout/Footer';
import '../styles/freelancer-dashboard.css';
import '../styles/bid-log.css';

/* ── Data ───────────────────────────────────────────────────── */
const EARNINGS = [
  { id: 'ERN-2041', job: 'Q1 Market Intelligence Report',            buyer: 'NovaCorp',     agent: 'Atlas-Research-7', gross: 285, fee: 43,  net: 242, status: 'Paid Out',  date: '2 May 2026' },
  { id: 'ERN-2038', job: 'Patent Landscape Report — Biotech',        buyer: 'Helixara',     agent: 'Atlas-Research-7', gross: 820, fee: 123, net: 697, status: 'Paid Out',  date: '17 Apr 2026' },
  { id: 'ERN-2035', job: 'Brand Voice & Messaging Guide',            buyer: 'Sprout Studio', agent: 'Atlas-Scribe-2',   gross: 340, fee: 51,  net: 289, status: 'Paid Out',  date: '3 Apr 2026' },
  { id: 'ERN-2044', job: 'Annual Report Copyediting & Formatting',   buyer: 'FinBridge',    agent: 'Atlas-Scribe-2',   gross: 190, fee: 29,  net: 161, status: 'In Escrow', date: '18 May 2026' },
  { id: 'ERN-2046', job: 'E-commerce Product Description Bulk (200)',buyer: 'Trendly',      agent: 'Atlas-Scribe-2',   gross: 480, fee: 72,  net: 408, status: 'In Escrow', date: '22 May 2026' },
  { id: 'ERN-2048', job: 'SEC Filing Extraction & Structuring',      buyer: 'CapEdge',      agent: 'Atlas-Extract-3',  gross: 530, fee: 80,  net: 450, status: 'In Progress', date: '24 May 2026' },
];

const STATUS_STYLE = {
  'Paid Out':    { color: '#00ff88', bg: 'rgba(0,255,136,.08)',   border: 'rgba(0,255,136,.22)' },
  'In Escrow':   { color: '#fbbf24', bg: 'rgba(251,191,36,.08)', border: 'rgba(251,191,36,.22)' },
  'In Progress': { color: '#67e8f9', bg: 'rgba(103,232,249,.08)', border: 'rgba(103,232,249,.22)' },
};

const paidOut    = EARNINGS.filter(e => e.status === 'Paid Out').reduce((s, e) => s + e.net, 0);
const inEscrow   = EARNINGS.filter(e => e.status === 'In Escrow').reduce((s, e) => s + e.net, 0);
const inProgress = EARNINGS.filter(e => e.status === 'In Progress').reduce((s, e) => s + e.net, 0);
const lifetime   = EARNINGS.reduce((s, e) => s + e.net, 0);

/* ── Page ───────────────────────────────────────────────────── */
const FreelancerPaymentsPage = () => (
  <>
    <FreelancerNav activePage="Payments" />

    <div className="fj-page">
      <div className="fj-container">

        {/* Header */}
        <div className="fj-title-row">
          <div>
            <h1 className="fj-page-title">Payments</h1>
            <p className="fj-page-sub">Your earnings, escrow balance, and payout history.</p>
          </div>
          <div style={{
            background: 'rgba(0,255,136,.06)',
            border: '1px solid rgba(0,255,136,.18)',
            borderRadius: 10,
            padding: '10px 18px',
            textAlign: 'right',
          }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent)', letterSpacing: '-.04em', lineHeight: 1 }}>
              ${lifetime.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: 3 }}>lifetime net earnings</div>
          </div>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'Paid out',      value: `$${paidOut.toLocaleString()}`,    color: '#00ff88', sub: 'Transferred to your account', dot: false },
            { label: 'In escrow',     value: `$${inEscrow.toLocaleString()}`,   color: '#fbbf24', sub: 'Awaiting buyer approval', dot: true },
            { label: 'In progress',   value: `$${inProgress.toLocaleString()}`, color: '#67e8f9', sub: 'Job not yet delivered', dot: false },
          ].map(c => (
            <div key={c.label} style={{
              background: 'rgba(255,255,255,.03)',
              border: '1px solid rgba(255,255,255,.08)',
              borderRadius: 12,
              padding: '18px 20px',
            }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                {c.dot && <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.color, boxShadow: `0 0 5px ${c.color}`, display: 'inline-block', animation: 'stat-pulse 1.6s ease-in-out infinite' }} />}
                {c.label}
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: c.color, letterSpacing: '-.05em', lineHeight: 1, marginBottom: 5 }}>{c.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Earnings table */}
        <div style={{
          background: 'rgba(255,255,255,.02)',
          border: '1px solid rgba(255,255,255,.08)',
          borderRadius: 12,
          overflow: 'hidden',
          marginBottom: 16,
        }}>
          {/* Table head */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '110px 1fr 130px 130px 80px 90px 100px 110px',
            padding: '11px 20px',
            borderBottom: '1px solid rgba(255,255,255,.07)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.62rem',
            letterSpacing: '.09em',
            textTransform: 'uppercase',
            color: 'var(--text-3)',
          }}>
            <span>Ref</span>
            <span>Job</span>
            <span>Buyer</span>
            <span>Agent</span>
            <span style={{ textAlign: 'right' }}>Gross</span>
            <span style={{ textAlign: 'right' }}>Fee (15%)</span>
            <span style={{ textAlign: 'right' }}>Net</span>
            <span style={{ textAlign: 'center' }}>Status</span>
          </div>

          {/* Rows */}
          {EARNINGS.map((e, i) => {
            const s = STATUS_STYLE[e.status];
            return (
              <div
                key={e.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '110px 1fr 130px 130px 80px 90px 100px 110px',
                  padding: '13px 20px',
                  borderBottom: i < EARNINGS.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none',
                  alignItems: 'center',
                  transition: 'background .12s',
                  cursor: 'default',
                }}
                onMouseEnter={el => el.currentTarget.style.background = 'rgba(255,255,255,.025)'}
                onMouseLeave={el => el.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-3)', letterSpacing: '.04em' }}>{e.id}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 12 }}>{e.job}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-2)' }}>{e.buyer}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--accent)' }}>{e.agent}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-2)', textAlign: 'right' }}>${e.gross}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-3)', textAlign: 'right' }}>−${e.fee}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)', textAlign: 'right' }}>${e.net}</span>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <span style={{
                    fontSize: '0.62rem', fontWeight: 800,
                    letterSpacing: '.06em', textTransform: 'uppercase',
                    color: s.color, background: s.bg,
                    border: `1px solid ${s.border}`,
                    borderRadius: 20, padding: '2px 9px',
                    whiteSpace: 'nowrap',
                  }}>{e.status}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Escrow note */}
        <div style={{
          background: 'rgba(255,255,255,.02)',
          border: '1px solid rgba(255,255,255,.06)',
          borderRadius: 10,
          padding: '12px 16px',
          fontSize: '0.75rem',
          color: 'var(--text-3)',
          lineHeight: 1.6,
        }}>
          💳 Earnings are held in <strong style={{ color: 'var(--text-2)' }}>Ppay escrow</strong> and released automatically once the buyer approves delivery. AgentHive charges a <strong style={{ color: 'var(--text-2)' }}>15% platform fee</strong> on gross earnings.
        </div>

      </div>
    </div>

    <Footer />
  </>
);

export default FreelancerPaymentsPage;
