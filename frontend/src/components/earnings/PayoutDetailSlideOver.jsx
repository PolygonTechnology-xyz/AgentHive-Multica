import { useEffect, useState } from 'react';

/* ── Icons ──────────────────────────────────────────────── */
const CopyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7,10 12,15 17,10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

/* ── Payout 1 extended data ─────────────────────────────── */
const PAYOUT_DETAIL = {
  'PPY-2026-8821': {
    jobTitle: 'Build OpenAPI client for Stripe wrapper',
    jobId: 'JOB-008',
    buyer: 'Anonymous Buyer',
    agent: 'Atlas-Scribe-2',
    delivered:        'May 09, 2026 · 12:15 UTC',
    approved:         'May 09, 2026 · 14:28 UTC',
    payoutProcessed:  'May 09, 2026 · 14:32 UTC',
    txnId: 'PPY-TXN-88219283762',
    maskedAccount: '●●●● ●●●● 4821',
    commissionLockedAt: 'May 09, 2026 · 14:28 UTC',
  },
};

const DEFAULT_DETAIL = {
  jobTitle: 'Job details',
  jobId: '—',
  buyer: 'Anonymous Buyer',
  agent: '—',
  delivered: '—',
  approved: '—',
  payoutProcessed: '—',
  txnId: '—',
  maskedAccount: '●●●● ●●●● 0000',
  commissionLockedAt: '—',
};

/* ── CopyableRef ────────────────────────────────────────── */
const CopyableRef = ({ text, onToast }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    onToast?.(`${text} copied`);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      {text}
      <span className="er-so-ref-copy" onClick={handleCopy} title="Copy">
        {copied ? <span style={{ color: 'var(--accent)', fontSize: '0.78rem' }}>✓</span> : <CopyIcon />}
      </span>
    </span>
  );
};

/* ── PayoutDetailSlideOver ──────────────────────────────── */
const PayoutDetailSlideOver = ({ payout, isOpen, onClose, onToast }) => {

  /* Body scroll lock */
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else        document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  /* Escape key */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!payout) return null;

  const detail = PAYOUT_DETAIL[payout.ref] || DEFAULT_DETAIL;
  const commRate = 15;

  const handleInvoiceDl = (type) => {
    onToast?.(`Invoice ${payout.ref}_${type}.pdf downloaded`);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`er-so-overlay${isOpen ? ' open' : ''}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`er-so-panel${isOpen ? ' open' : ''}`}>

        {/* Header */}
        <div className="er-so-header">
          <div className="er-so-header-top">
            <div>
              <div className="er-so-title">Payout details</div>
              <div className="er-so-ref">
                <CopyableRef text={payout.ref} onToast={onToast} />
              </div>
            </div>
            <button className="er-so-close" onClick={onClose}>×</button>
          </div>
          <div className="er-so-date">{detail.payoutProcessed}</div>
        </div>

        {/* Body */}
        <div className="er-so-body">

          {/* Payment breakdown */}
          <div>
            <div className="er-so-section-title">Payment breakdown</div>
            <div className="er-breakdown-card">
              <div className="er-breakdown-row">
                <span className="er-breakdown-label">Gross bid amount</span>
                <span className="er-breakdown-val">${payout.gross.toLocaleString()}.00</span>
              </div>
              <hr className="er-breakdown-divider" />
              <div className="er-breakdown-row comm">
                <span className="er-breakdown-label">Platform commission</span>
                <span className="er-breakdown-val">−${payout.commission.toLocaleString()}.00</span>
              </div>
              <div className="er-breakdown-row comm-sub">
                <span>{commRate}% × ${payout.gross.toLocaleString()}</span>
              </div>
              <hr className="er-breakdown-divider" />
              <div className="er-breakdown-row net">
                <span className="er-breakdown-label">Net payout</span>
                <span className="er-breakdown-val">${payout.net.toLocaleString()}.00</span>
              </div>
              <div className="er-breakdown-double">
                <span className="er-breakdown-underline">${payout.net.toLocaleString()}.00</span>
              </div>
              <div className="er-breakdown-note">
                Commission rate locked at {commRate}% at time of Buyer approval
                ({detail.commissionLockedAt})
              </div>
            </div>
          </div>

          {/* Job details */}
          <div>
            <div className="er-so-section-title">Job details</div>
            <div className="er-detail-grid">
              <div className="er-detail-row">
                <span className="er-detail-key">Job title</span>
                <span className="er-detail-val">{detail.jobTitle}</span>
              </div>
              <div className="er-detail-row">
                <span className="er-detail-key">Job ID</span>
                <span className="er-detail-val mono">{detail.jobId}</span>
              </div>
              <div className="er-detail-row">
                <span className="er-detail-key">Buyer</span>
                <span className="er-detail-val">{detail.buyer}</span>
              </div>
              <div className="er-detail-row">
                <span className="er-detail-key">Agent</span>
                <span className="er-detail-val">{detail.agent}</span>
              </div>
              <div className="er-detail-row">
                <span className="er-detail-key">Delivered</span>
                <span className="er-detail-val">{detail.delivered}</span>
              </div>
              <div className="er-detail-row">
                <span className="er-detail-key">Buyer approved</span>
                <span className="er-detail-val">{detail.approved}</span>
              </div>
              <div className="er-detail-row">
                <span className="er-detail-key">Payout processed</span>
                <span className="er-detail-val">{detail.payoutProcessed}</span>
              </div>
            </div>
          </div>

          {/* Ppay transaction */}
          <div>
            <div className="er-so-section-title">Ppay transaction</div>
            <div className="er-detail-grid">
              <div className="er-detail-row">
                <span className="er-detail-key">Transaction ID</span>
                <span className="er-detail-val mono" style={{ fontSize: '0.74rem' }}>{detail.txnId}</span>
              </div>
              <div className="er-detail-row">
                <span className="er-detail-key">Sent to</span>
                <span className="er-detail-val">
                  <span style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-3)', marginBottom: 2 }}>Your registered Ppay account</span>
                  <span style={{ fontFamily: "'SF Mono','Fira Code',monospace", fontSize: '0.8rem', letterSpacing: '0.06em' }}>{detail.maskedAccount}</span>
                </span>
              </div>
              <div className="er-detail-row">
                <span className="er-detail-key">Status</span>
                <span className="er-detail-val">
                  <span className="er-ppay-status">
                    <span className="er-ppay-status-dot" />
                    Confirmed
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Invoices */}
          <div>
            <div className="er-so-section-title">Invoices</div>
            <div className="er-detail-grid">
              <div className="er-invoice-row">
                <span style={{ fontSize: '0.79rem', color: 'var(--text-2)' }}>
                  Invoice_{payout.ref}_Buyer.pdf
                </span>
                <button className="er-invoice-dl-btn" onClick={() => handleInvoiceDl('Buyer')}>
                  <DownloadIcon /> Download
                </button>
              </div>
              <div className="er-invoice-row">
                <span style={{ fontSize: '0.79rem', color: 'var(--text-2)' }}>
                  Invoice_{payout.ref}_Freelancer.pdf
                </span>
                <button className="er-invoice-dl-btn" onClick={() => handleInvoiceDl('Freelancer')}>
                  <DownloadIcon /> Download
                </button>
              </div>
              <div className="er-invoice-note">
                Invoices were sent to your registered email address at time of payout.
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default PayoutDetailSlideOver;
