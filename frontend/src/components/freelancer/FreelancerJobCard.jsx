const STATUS_CONFIG = {
  in_progress: { label: 'In Progress', cls: 'in-progress' },
  delivered:   { label: 'Delivered',   cls: 'delivered'   },
  in_revision: { label: 'In Revision', cls: 'in-revision' },
};

const FreelancerJobCard = ({ job, onViewDetail }) => {
  const cfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.in_progress;

  return (
    <div className={`fj-card ${cfg.cls}`}>

      {/* ── Row 1: Title + badge + payout ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '18px 20px 0',
      }}>
        <div className="fj-card-title" style={{ flex: 1 }}>{job.title}</div>
        <span className={`fj-card-status-badge ${cfg.cls}`} style={{ flexShrink: 0 }}>
          {cfg.label}
        </span>
        <div className="fj-card-payout-area" style={{ flexShrink: 0 }}>
          <div className="fj-card-payout-amount">${Math.round(job.payout * 0.85)}</div>
          <div className="fj-card-payout-label">payout</div>
        </div>
      </div>

      {/* ── Row 2: Buyer · Category · Deadline ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 20px 14px',
        fontSize: '0.78rem', color: 'var(--text-3)',
        borderBottom: '1px solid rgba(255,255,255,.05)',
      }}>
        <span style={{ color: 'var(--text-2)', fontWeight: 600 }}>{job.buyer}</span>
        <span style={{ opacity: .35 }}>·</span>
        <span>{job.category}</span>
        <span style={{ opacity: .35 }}>·</span>
        <span>Due <strong style={{ color: 'var(--text-2)', fontWeight: 600 }}>{job.deadline}</strong></span>
      </div>

      {/* ── Row 3: Agent + note side by side ── */}
      <div style={{
        display: 'flex', gap: 20, padding: '14px 20px',
        alignItems: 'flex-start',
      }}>
        {/* Agent block */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: '0.67rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8 }}>
            Agent
          </div>
          <div className="fj-agent-chip" style={{ width: 'fit-content' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 5px var(--accent)', flexShrink: 0, display: 'inline-block' }} />
            {job.agent}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: 5 }}>
            dispatched {job.dispatchedAt}
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, background: 'rgba(255,255,255,.06)', alignSelf: 'stretch', flexShrink: 0 }} />

        {/* Status note */}
        <div style={{ flex: 1 }}>
          {job.status === 'in_progress' && job.progressNote && (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
              {job.progressNote}
            </div>
          )}
          {job.status === 'delivered' && (
            <div style={{ fontSize: '0.78rem', color: 'var(--warn)', lineHeight: 1.6 }}>
              Awaiting buyer review — approval or revision expected within 48 hours.
            </div>
          )}
          {job.status === 'in_revision' && (
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--warn)', marginBottom: 6 }}>
                Revision requested by buyer
              </div>
              {job.revisionNote && (
                <div style={{
                  fontSize: '0.76rem', color: 'var(--text-2)', lineHeight: 1.6,
                  fontStyle: 'italic',
                  background: 'rgba(251,191,36,.04)',
                  borderLeft: '2px solid rgba(251,191,36,.35)',
                  padding: '7px 12px',
                  borderRadius: '0 6px 6px 0',
                }}>
                  "{job.revisionNote}"
                </div>
              )}
            </div>
          )}
          {job.status === 'in_progress' && !job.progressNote && (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Agent is working on the job.</div>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="fj-card-footer">
        <div className="fj-footer-left">
          Payout on completion&nbsp;
          <strong style={{ color: 'var(--warn)', fontSize: '0.88rem' }}>${Math.round(job.payout * 0.85)}</strong>
          <span style={{ marginLeft: 4 }}>(${job.payout} gross)</span>
        </div>
        <button
          className={`btn-fj-action${job.status === 'in_revision' ? ' btn-fj-amber' : ''}`}
          onClick={() => onViewDetail(job)}
        >
          View Details →
        </button>
      </div>
    </div>
  );
};

export default FreelancerJobCard;
