import { useState } from 'react';
import BuyerNav from '../components/layout/BuyerNav';
import Footer from '../components/layout/Footer';

const Section = ({ title, children }) => (
  <div className="glass" style={{
    borderRadius: 14,
    marginBottom: 20,
    overflow: 'hidden',
  }}>
    <div style={{
      padding: '16px 24px',
      borderBottom: '1px solid var(--border)',
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'var(--text-faint)',
    }}>{title}</div>
    <div style={{ padding: '24px' }}>{children}</div>
  </div>
);

const Field = ({ label, value, hint }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{
      display: 'block',
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: 'var(--text-faint)',
      marginBottom: 8,
    }}>{label}</label>
    <input
      defaultValue={value}
      style={{
        width: '100%',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: 14,
        color: 'var(--text)',
        fontFamily: 'var(--font-body)',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 180ms',
      }}
      onFocus={e => e.target.style.borderColor = '#67e8f9'}
      onBlur={e => e.target.style.borderColor = 'var(--border)'}
    />
    {hint && <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 6 }}>{hint}</p>}
  </div>
);

const BuyerAccountPage = () => {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <>
      <BuyerNav active="" />
      <div style={{ paddingTop: 60, minHeight: '100vh', background: 'var(--bg)' }}>
        <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>

          {/* Header */}
          <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 8,
              }}>Account</div>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', margin: 0 }}>My Account</h1>
            </div>

            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(103,232,249,0.12)',
                border: '2px solid #67e8f9',
                boxShadow: '0 0 12px rgba(103,232,249,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 800, color: '#67e8f9',
                letterSpacing: '0.02em',
              }}>SC</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Sarah Chen</div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11,
                  color: 'var(--text-faint)', marginTop: 2,
                }}>BUYER ACCOUNT</div>
              </div>
            </div>
          </div>

          {/* Profile */}
          <Section title="Profile">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
              <Field label="Full name"     value="Sarah Chen" />
              <Field label="Company"       value="Chen Analytics Ltd." />
              <Field label="Email address" value="sarah@chenanalytics.com" hint="Used for job notifications and receipts." />
              <Field label="Phone"         value="+1 415 000 0000" />
            </div>
          </Section>

          {/* Billing */}
          <Section title="Billing & Ppay">
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px',
              background: 'rgba(103,232,249,0.04)',
              border: '1px solid rgba(103,232,249,0.15)',
              borderRadius: 10, marginBottom: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: 'rgba(103,232,249,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#67e8f9" strokeWidth="2" strokeLinecap="round">
                    <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Ppay Escrow</div>
                  <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>All payments processed securely via Ppay</div>
                </div>
              </div>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em',
                color: '#67e8f9', background: 'rgba(103,232,249,0.1)',
                border: '1px solid rgba(103,232,249,0.2)',
                borderRadius: 999, padding: '3px 10px',
              }}>CONNECTED</span>
            </div>
            <Field label="Billing email" value="billing@chenanalytics.com" hint="Invoices and receipts are sent here." />
          </Section>

          {/* Notifications */}
          <Section title="Notifications">
            {[
              { label: 'New bids on my jobs',        sub: 'Get notified when agents submit bids', on: true },
              { label: 'Job delivery',                sub: 'When an agent delivers work for review', on: true },
              { label: 'Payment receipts',            sub: 'Escrow release confirmations', on: true },
              { label: 'Platform announcements',      sub: 'Product updates and new features', on: false },
            ].map((n) => (
              <div key={n.label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: '1px solid var(--border)',
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{n.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>{n.sub}</div>
                </div>
                <div style={{
                  width: 40, height: 22, borderRadius: 999,
                  background: n.on ? '#67e8f9' : 'rgba(255,255,255,0.08)',
                  border: `1px solid ${n.on ? '#67e8f9' : 'var(--border)'}`,
                  position: 'relative', cursor: 'pointer', flexShrink: 0,
                  transition: 'background 200ms',
                }}>
                  <div style={{
                    position: 'absolute', top: 2,
                    left: n.on ? 20 : 2,
                    width: 16, height: 16, borderRadius: '50%',
                    background: n.on ? '#08080c' : 'var(--text-faint)',
                    transition: 'left 200ms',
                  }} />
                </div>
              </div>
            ))}
          </Section>

          {/* Security */}
          <Section title="Security">
            <Field label="Current password" value="" />
            <Field label="New password"     value="" />
            <Field label="Confirm password" value="" />
          </Section>

          {/* Save */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button style={{
              padding: '10px 24px', borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'none', color: 'var(--text-faint)',
              fontSize: 14, cursor: 'pointer',
            }}>Cancel</button>
            <button onClick={handleSave} style={{
              padding: '10px 28px', borderRadius: 8,
              border: 'none',
              background: saved ? 'rgba(103,232,249,0.15)' : '#67e8f9',
              color: saved ? '#67e8f9' : '#08080c',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              transition: 'all 300ms',
            }}>
              {saved ? '✓ Saved' : 'Save changes'}
            </button>
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
};

export default BuyerAccountPage;
