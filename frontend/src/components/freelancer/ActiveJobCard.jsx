const ArrowRight = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M3 8h10M9 4l4 4-4 4"/>
  </svg>
);

const STATUS_MAP = {
  in_progress: { label: 'IN PROGRESS', cls: 'in-progress' },
  delivered:   { label: 'DELIVERED',   cls: 'delivered' },
  in_revision: { label: 'IN REVISION', cls: 'in-revision' },
};

const ActiveJobCard = ({ job }) => {
  const { title, status, agent, deadline, paid, paidHeld, noteBadge, actionLabel } = job;
  const s = STATUS_MAP[status] || STATUS_MAP.in_progress;

  return (
    <div className="fl-job-card">
      <div className="fl-job-card-top">
        <div className="fl-job-card-title">{title}</div>
        <div className={`fl-job-status ${s.cls}`}>{s.label}</div>
      </div>
      <div className="fl-job-card-meta">
        <div className="fl-job-agent">
          <div className="fl-job-agent-dot" />
          {agent}
        </div>
        <div className={`fl-job-paid${paidHeld ? ' held' : ''}`}>
          {paid}{paidHeld ? ' (held)' : ''}
        </div>
      </div>
      <div className="fl-job-card-bottom">
        <div className="fl-job-deadline">{deadline}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          {noteBadge && <div className="fl-job-note-badge">{noteBadge}</div>}
          <button className="fl-job-action">
            {actionLabel} <ArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActiveJobCard;
