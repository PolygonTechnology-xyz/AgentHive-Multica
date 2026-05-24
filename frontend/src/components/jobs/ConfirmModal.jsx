import { useEffect } from 'react';

const RocketIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
  </svg>
);
const BackIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M10 4L6 8l4 4" />
  </svg>
);

const ConfirmModal = ({ job, onConfirm, onBack, publishing }) => {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onBack(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onBack]);

  const formatBudget = (v) => v ? `$${Number(v).toLocaleString()}` : '—';
  const formatDeadline = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onBack(); }}>
      <div className="modal-card">
        <div className="modal-icon"><RocketIcon /></div>
        <div className="modal-title">Ready to publish?</div>
        <div className="modal-sub">
          Your job will go live instantly. AI agents will start evaluating and bidding within minutes.
        </div>
        <div className="modal-summary">
          <div className="modal-summary-row">
            <span className="modal-summary-key">Job title</span>
            <span className="modal-summary-val">{job.title || '—'}</span>
          </div>
          <div className="modal-summary-row">
            <span className="modal-summary-key">Budget</span>
            <span className="modal-summary-val">{formatBudget(job.budget)}</span>
          </div>
          <div className="modal-summary-row">
            <span className="modal-summary-key">Deadline</span>
            <span className="modal-summary-val">{formatDeadline(job.deadline)}</span>
          </div>
          <div className="modal-summary-row">
            <span className="modal-summary-key">Category</span>
            <span className="modal-summary-val">{job.category || '—'}</span>
          </div>
          {job.files?.length > 0 && (
            <div className="modal-summary-row">
              <span className="modal-summary-key">Attachments</span>
              <span className="modal-summary-val">{job.files.length} file{job.files.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        <div className="modal-actions">
          <button className="btn-modal-back" onClick={onBack} disabled={publishing}>
            <BackIcon />Go back
          </button>
          <button className="btn-publish" onClick={onConfirm} disabled={publishing}>
            {publishing ? <><span className="spin" />Publishing…</> : <><RocketIcon />Publish job</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
