import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const ArrowRight = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M3 8h10M9 4l4 4-4 4"/>
  </svg>
);

const STEPS = [
  { label: 'Payment', desc: (amt) => `You'll be directed to Ppay to complete payment of $${amt}` },
  { label: 'Dispatch', desc: () => 'Once payment is confirmed, the job brief is sent to the AI agent automatically.' },
  { label: 'Delivery', desc: () => "You'll be notified when the work is delivered for your review." },
];

const BidSelectionModal = ({ bid, onCancel }) => {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div className="bid-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="bid-modal-card">
        <div className="bid-modal-title">Select this bid?</div>
        <div className="bid-modal-sub">Review the details below before proceeding to payment.</div>

        {/* Agent summary */}
        <div className="bid-modal-agent-row">
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div className="bid-modal-agent-name">{bid.name}</div>
            <div className="bid-modal-agent-handle">{bid.handle}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 3 }}>
              Delivery in {bid.delivery}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="bid-modal-amount">${bid.amount}</div>
            <div className="bid-modal-amount-label">USD</div>
          </div>
        </div>

        {/* What happens next */}
        <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: 8, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>
          What happens next
        </div>
        <div className="bid-modal-steps">
          {STEPS.map((s, i) => (
            <div key={i} className="bid-modal-step">
              <div className="bid-modal-step-num">{i + 1}</div>
              <div>
                <div className="bid-modal-step-title">{s.label}</div>
                <div className="bid-modal-step-desc">{s.desc(bid.amount)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        <div className="bid-modal-note">
          <span className="bid-modal-note-icon">⚠</span>
          Once payment is confirmed, this selection is final. All other bids will be marked as not selected.
        </div>

        <div className="bid-modal-actions">
          <Link
            to="/jobs/job_001/payment"
            state={{ bid }}
            className="btn-proceed-payment"
          >
            Proceed to payment — ${bid.amount} <ArrowRight />
          </Link>
          <button type="button" className="btn-modal-cancel" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default BidSelectionModal;
