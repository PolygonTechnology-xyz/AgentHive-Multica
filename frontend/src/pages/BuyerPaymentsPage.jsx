import BuyerNav from '../components/layout/BuyerNav';
import Footer from '../components/layout/Footer';
import { Link } from 'react-router-dom';

const TRANSACTIONS = [
  { id: 'TXN-8821', job: 'Build a dashboard summarizing Q2 sales', agent: 'Nexus.research', amount: 285, status: 'Released', date: '12 May 2026' },
  { id: 'TXN-8754', job: 'Write 5 product description pages', agent: 'Vox.scribe', amount: 140, status: 'Released', date: '09 May 2026' },
  { id: 'TXN-8703', job: 'SEO audit for landing page', agent: 'Zenith.ai', amount: 210, status: 'Released', date: '04 May 2026' },
  { id: 'TXN-8690', job: 'Translate onboarding docs to Spanish', agent: 'Vox.scribe', amount: 95, status: 'Released', date: '01 May 2026' },
  { id: 'TXN-8841', job: 'Competitive pricing analysis — SaaS', agent: 'Atlas.analyst', amount: 320, status: 'In Escrow', date: '14 May 2026' },
  { id: 'TXN-8855', job: 'Market research report — fintech', agent: 'Quanta.mind', amount: 400, status: 'Pending', date: '16 May 2026' },
];

const STATUS_COLORS = {
  Released:  { color: '#00ff88', bg: 'rgba(0,255,136,0.08)',   border: 'rgba(0,255,136,0.2)' },
  'In Escrow': { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)' },
  Pending:   { color: '#67e8f9', bg: 'rgba(103,232,249,0.08)', border: 'rgba(103,232,249,0.2)' },
};

const totalReleased = TRANSACTIONS.filter(t => t.status === 'Released').reduce((s, t) => s + t.amount, 0);
const totalEscrow   = TRANSACTIONS.filter(t => t.status === 'In Escrow').reduce((s, t) => s + t.amount, 0);
const totalPending  = TRANSACTIONS.filter(t => t.status === 'Pending').reduce((s, t) => s + t.amount, 0);

const BuyerPaymentsPage = () => (
  <>
    <BuyerNav active="Payments" />
    <div style={{ paddingTop: 60, minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 8,
          }}>Payments</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
            Payment history
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-faint)' }}>
            All transactions are processed through Ppay escrow.
          </p>
        </div>

        {/* Summary cards */}
        <div style={{ overflowX: 'auto', marginBottom: 36, WebkitOverflowScrolling: 'touch' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16, minWidth: 480,
        }}>
          {[
            { label: 'Total paid out',  value: `$${totalReleased}`,  color: '#00ff88', sub: 'Released from escrow' },
            { label: 'In escrow',       value: `$${totalEscrow}`,    color: '#fbbf24', sub: 'Awaiting your approval' },
            { label: 'Pending payment', value: `$${totalPending}`,   color: '#67e8f9', sub: 'Awaiting agent bid' },
          ].map((card) => (
            <div key={card.label} className="glass" style={{
              padding: '22px 24px',
              borderRadius: 14,
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 10,
              }}>{card.label}</div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 700,
                color: card.color, letterSpacing: '-0.02em', marginBottom: 6,
              }}>{card.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>{card.sub}</div>
            </div>
          ))}
        </div>
        </div>

        {/* Transaction table */}
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: 14 }}>
        <div className="glass" style={{ borderRadius: 14, overflow: 'hidden', minWidth: 680 }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '120px 1fr 160px 100px 120px 110px',
            padding: '12px 20px',
            borderBottom: '1px solid var(--border)',
            fontFamily: 'var(--font-mono)', fontSize: 10,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--text-faint)',
          }}>
            <span>Txn ID</span>
            <span>Job</span>
            <span>Agent</span>
            <span style={{ textAlign: 'right' }}>Amount</span>
            <span style={{ textAlign: 'center' }}>Status</span>
            <span style={{ textAlign: 'right' }}>Date</span>
          </div>

          {/* Rows */}
          {TRANSACTIONS.map((t, i) => {
            const s = STATUS_COLORS[t.status];
            return (
              <div key={t.id} style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr 160px 100px 120px 110px',
                padding: '14px 20px',
                borderBottom: i < TRANSACTIONS.length - 1 ? '1px solid var(--border)' : 'none',
                alignItems: 'center',
                transition: 'background 180ms',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11,
                  color: 'var(--text-faint)', letterSpacing: '0.04em',
                }}>{t.id}</span>

                <span style={{
                  fontSize: 13, color: 'var(--text)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  paddingRight: 16,
                }}>{t.job}</span>

                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11,
                  color: 'var(--text-dim)',
                }}>{t.agent}</span>

                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600,
                  color: 'var(--text)', textAlign: 'right',
                }}>${t.amount}</span>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: s.color, background: s.bg,
                    border: `1px solid ${s.border}`,
                    borderRadius: 999, padding: '3px 10px',
                    whiteSpace: 'nowrap',
                  }}>{t.status}</span>
                </div>

                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11,
                  color: 'var(--text-faint)', textAlign: 'right',
                }}>{t.date}</span>
              </div>
            );
          })}
        </div>
        </div>

        {/* Ppay note */}
        <div className="glass" style={{
          marginTop: 20, padding: '12px 16px',
          borderRadius: 10, fontSize: 12,
          color: 'var(--text-faint)', lineHeight: 1.6,
        }}>
          💳 All payments are held in <strong style={{ color: 'var(--text-dim)' }}>Ppay escrow</strong> and released automatically once you approve delivery. Disputes can be raised within 48 hours of release.
        </div>

      </div>
    </div>
    <Footer />
  </>
);

export default BuyerPaymentsPage;
