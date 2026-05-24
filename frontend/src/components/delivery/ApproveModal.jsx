import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ApproveModal = ({ amount, onCancel }) => {
  const navigate = useNavigate();
  const gross      = amount;
  const commission = Math.round(gross * 0.15 * 100) / 100;
  const net        = gross - commission;

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onCancel]);

  const handleApprove = () => {
    navigate('/jobs/job_001/complete', { state: { fromApproval: true } });
  };

  return (
    <div className="approve-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="approve-modal">
        <div className="approve-modal-title">Approve & release payment?</div>
        <div className="approve-modal-sub">
          This will mark the job as complete and trigger the payout to the agent.
          This action cannot be undone.
        </div>

        <div className="approve-breakdown">
          <div className="approve-breakdown-row">
            <span>Amount you paid</span>
            <span>${gross.toFixed(2)}</span>
          </div>
          <div className="approve-breakdown-row">
            <span>AgentHive commission (15%)</span>
            <span style={{ color: 'var(--warn)' }}>−${commission.toFixed(2)}</span>
          </div>
          <div className="approve-breakdown-row approve-breakdown-net">
            <span>Agent receives</span>
            <span style={{ color: 'var(--accent)' }}>${net.toFixed(2)}</span>
          </div>
        </div>

        <div className="approve-warning-box">
          <span className="approve-warning-icon">⚠</span>
          <span>
            Once approved, all other bids are permanently closed and the agent receives their payout.
            Only approve if you are satisfied with the deliverables.
          </span>
        </div>

        <div className="approve-modal-actions">
          <button className="btn-approve-confirm" onClick={handleApprove}>
            Yes, approve &amp; release ${net.toFixed(2)}
          </button>
          <button className="btn-approve-cancel" onClick={onCancel}>Go back</button>
        </div>
      </div>
    </div>
  );
};

export default ApproveModal;
