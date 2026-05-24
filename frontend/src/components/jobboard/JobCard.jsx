/* ── JobCard — list + grid view ──────────────────────────── */

const RobotIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="3" y="11" width="18" height="10" rx="2"/>
    <path d="M12 11V7"/><circle cx="12" cy="5" r="2"/>
    <path d="M7 15h0M17 15h0"/>
  </svg>
);

const deadlineMeta = (days) => {
  if (days <= 0) return { cls: 'red',   label: 'Expires today' };
  if (days === 1) return { cls: 'red',   label: '1 day remaining' };
  if (days <= 3)  return { cls: 'amber', label: `${days} days remaining` };
  return { cls: 'green', label: `${days} days remaining` };
};

const matchCls = (score) => {
  if (score >= 90) return 'high';
  if (score >= 75) return 'good';
  return 'fair';
};

/* ─ List view card ───────────────────────────────────────── */
const ListCard = ({ job, onViewDetails }) => {
  const deadline = deadlineMeta(job.deadlineDays);

  return (
    <div
      className={`jb-card${job.alreadyBid ? ' already-bid' : ''}${job.noCapability ? ' no-capability' : ''}`}
      onClick={() => onViewDetails(job)}
    >
      {/* Left */}
      <div className="jb-card-left">
        <div className="jb-card-top-row">
          <span className={`jb-cat-chip ${job.categoryKey}`}>{job.category}</span>
          <span className="jb-card-time">{job.posted}</span>
        </div>

        <div className="jb-card-title">{job.title}</div>

        <div className="jb-card-desc">{job.description}</div>

        <div className="jb-tags">
          {job.tags.map(t => (
            <span key={t} className="jb-tag">{t}</span>
          ))}
        </div>

        <div className="jb-card-meta">
          <span className="jb-posted-by">Anonymous Buyer</span>
          {job.files > 0 && (
            <span className="jb-attachments">📎 {job.files} file{job.files > 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="jb-card-right">
        <div className="jb-budget-block">
          <div className="jb-budget-val">${job.budget.toLocaleString()}</div>
          <div className="jb-budget-label">Budget</div>
        </div>

        <div>
          <div className={`jb-deadline-badge ${deadline.cls}`}>
            {deadline.label}
          </div>
          <div className="jb-deadline-date" style={{ marginTop: 4 }}>{job.deadlineDate}</div>
        </div>

        {/* Match score */}
        {job.matchScore !== null && !job.noCapability ? (
          <div className="jb-match-block">
            <div className="jb-match-label">Est. match</div>
            <div className={`jb-match-badge ${matchCls(job.matchScore)}`}>
              {job.matchScore}
            </div>
            <div className="jb-match-agent">{job.matchAgent}</div>
          </div>
        ) : job.noCapability ? (
          <div className="jb-no-cap-label">Not in your<br/>capabilities</div>
        ) : null}

        {/* Actions */}
        <div className="jb-card-actions" onClick={e => e.stopPropagation()}>
          {job.alreadyBid ? (
            <>
              <div className="jb-bid-placed">
                ✓ Bid placed — ${job.bidAmount?.toLocaleString()}
              </div>
              <span className={`jb-bid-status ${job.bidStatus}`}>
                {job.bidStatus?.toUpperCase()}
              </span>
            </>
          ) : (
            <>
              {job.autoBid && (
                <div className="jb-auto-bid-btn">
                  <RobotIcon /> Auto-bid enabled
                </div>
              )}
              <button
                className="jb-view-btn-card"
                onClick={() => onViewDetails(job)}
              >
                View details →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─ Grid view card ───────────────────────────────────────── */
const GridCard = ({ job, onViewDetails }) => {
  const deadline = deadlineMeta(job.deadlineDays);

  return (
    <div
      className={`jb-grid-card${job.noCapability ? ' no-capability' : ''}`}
      onClick={() => onViewDetails(job)}
    >
      <div className="jb-grid-card-top">
        <span className={`jb-cat-chip ${job.categoryKey}`}>{job.category}</span>
        <span className="jb-card-time">{job.posted}</span>
      </div>

      <div className="jb-grid-title">{job.title}</div>
      <div className="jb-grid-desc">{job.description}</div>

      <div className="jb-grid-tags">
        {job.tags.slice(0, 2).map(t => (
          <span key={t} className="jb-tag">{t}</span>
        ))}
      </div>

      <div className="jb-grid-divider" />

      <div className="jb-grid-bottom">
        <div className="jb-grid-budget">${job.budget.toLocaleString()}</div>
        <div className="jb-grid-right">
          <div className={`jb-deadline-badge ${deadline.cls}`} style={{ fontSize: '0.66rem', padding: '3px 8px' }}>
            {deadline.label}
          </div>
          {job.matchScore !== null && !job.noCapability && (
            <div className={`jb-match-badge ${matchCls(job.matchScore)}`} style={{ fontSize: '0.76rem' }}>
              {job.matchScore}
            </div>
          )}
          {job.noCapability && (
            <span style={{ fontSize: '0.67rem', color: 'var(--text-faint)', fontStyle: 'italic' }}>
              No capability
            </span>
          )}
        </div>
      </div>

      <button
        className="jb-grid-view-btn"
        onClick={e => { e.stopPropagation(); onViewDetails(job); }}
      >
        View details →
      </button>
    </div>
  );
};

/* ─ Export unified card ──────────────────────────────────── */
const JobCard = ({ job, view = 'list', onViewDetails }) => {
  if (view === 'grid') return <GridCard job={job} onViewDetails={onViewDetails} />;
  return <ListCard job={job} onViewDetails={onViewDetails} />;
};

export default JobCard;
