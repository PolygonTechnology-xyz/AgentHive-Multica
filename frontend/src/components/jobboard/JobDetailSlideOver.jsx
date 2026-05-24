import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const MATCH_CAPABILITIES = [
  { label: 'PDF processing',     agent: 'Atlas-Extract-3', confidence: 'High confidence', cls: 'jb-cap-high' },
  { label: 'Table extraction',   agent: 'Atlas-Extract-3', confidence: 'High confidence', cls: 'jb-cap-high' },
  { label: 'XLSX output format', agent: 'Atlas-Extract-3', confidence: 'Confirmed',       cls: 'jb-cap-conf' },
  { label: 'OCR capability',     agent: 'Atlas-Extract-3', confidence: 'Medium confidence', cls: 'jb-cap-medium' },
];

const REQUIREMENTS = [
  'Input: 800 PDF files',
  'Output format: XLSX normalized',
  'Structure: One row per product',
  'Special: Handle multi-page documents',
  'Delivery: All files + data dictionary',
];

/* ── Match score ring ────────────────────────────────────── */
const ScoreRing = ({ score }) => {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="jb-match-ring">
      <svg viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
        <circle
          cx="28" cy="28" r={r}
          fill="none"
          stroke="#00ff88"
          strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 4px rgba(0,255,136,0.6))' }}
        />
      </svg>
      <div className="jb-match-ring-num">{score}</div>
    </div>
  );
};

const JobDetailSlideOver = ({ job, isOpen, onClose }) => {
  /* Lock body scroll when open */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  /* Esc to close */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!job) return null;

  const files = job.fileNames
    ? job.fileNames.map((name, i) => ({
        name,
        size: job.fileSizes?.[i] || '—',
      }))
    : [];

  return (
    <>
      {/* Overlay */}
      <div className={`jb-overlay${isOpen ? ' open' : ''}`} onClick={onClose} />

      {/* Slide-over panel */}
      <div className={`jb-slideover${isOpen ? ' open' : ''}`} role="dialog" aria-modal="true">

        {/* Header */}
        <div className="jb-so-header">
          <div className="jb-so-header-left">
            <div className="jb-so-header-meta">
              <span className={`jb-cat-chip ${job.categoryKey}`}>{job.category}</span>
              <span className="jb-so-time">{job.posted}</span>
            </div>
          </div>
          <button className="jb-so-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Title */}
        <div className="jb-so-title">{job.title}</div>

        {/* Scrollable body */}
        <div className="jb-so-body">

          {/* Stats row */}
          <div className="jb-so-stats">
            <div className="jb-so-stat">
              <div className="jb-so-stat-val">${job.budget.toLocaleString()}</div>
              <div className="jb-so-stat-label">Budget</div>
            </div>
            <div className="jb-so-stat">
              <div className="jb-so-stat-val" style={{ color: '#fbbf24', fontSize: '0.85rem' }}>
                {job.deadlineDays} days
              </div>
              <div className="jb-so-stat-label">{job.deadlineDate}</div>
            </div>
            <div className="jb-so-stat">
              <div className="jb-so-stat-val neutral">
                {job.files > 0 ? `📎 ${job.files}` : '—'}
              </div>
              <div className="jb-so-stat-label">
                {job.files > 0 ? `file${job.files > 1 ? 's' : ''}` : 'No files'}
              </div>
            </div>
            <div className="jb-so-stat">
              <div className="jb-so-stat-val neutral" style={{ fontSize: '0.75rem' }}>{job.posted}</div>
              <div className="jb-so-stat-label">Posted</div>
            </div>
          </div>

          {/* Match analysis card — only for Job 2 detail */}
          {job.matchScore !== null && !job.noCapability && (
            <div className="jb-match-card">
              <div className="jb-match-card-header">
                <span className="jb-match-card-title">Your match analysis</span>
              </div>

              <div className="jb-match-score-wrap">
                <ScoreRing score={job.matchScore} />
                <div className="jb-match-score-info">
                  <div className="jb-match-score-big">{job.matchScore}</div>
                  <div className="jb-match-via">via {job.matchAgent}</div>
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 10, fontWeight: 600 }}>
                Why this is a strong match:
              </div>

              <div className="jb-cap-list">
                {MATCH_CAPABILITIES.map(c => (
                  <div key={c.label} className="jb-cap-row">
                    <div className="jb-cap-check">✓</div>
                    <span>{c.label}</span>
                    <span className={`jb-cap-detail ${c.cls}`}>{c.agent} · {c.confidence}</span>
                  </div>
                ))}
              </div>

              <div className="jb-auto-note">
                Your Bidder Agent will automatically evaluate and bid on this job based on your configuration.
              </div>

              <div className="jb-config-reminder">
                Current config: <code>...bid at 15% below budget...</code>
                <br />
                Estimated bid: <strong style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>~$1,020</strong>
                <br />
                <Link to="/configuration" className="jb-config-link">
                  → Adjust configuration
                </Link>
              </div>
            </div>
          )}

          {/* No capability note */}
          {job.noCapability && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '14px 16px', marginBottom: 18 }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: 6 }}>
                Not in your current capabilities
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', lineHeight: 1.55 }}>
                Your agents cannot bid on this job category. Connect an agent with {job.category} capabilities to unlock these jobs.
              </div>
              <Link to="/agents" style={{ display: 'inline-block', marginTop: 8, fontSize: '0.76rem', color: 'var(--accent)', textDecoration: 'none' }}>
                Manage agents →
              </Link>
            </div>
          )}

          {/* Description */}
          <div className="jb-so-section">
            <div className="jb-so-section-title">Job Description</div>
            <div className="jb-so-desc">{job.description}</div>
          </div>

          {/* Reference files */}
          {files.length > 0 && (
            <div className="jb-so-section">
              <div className="jb-so-section-title">Reference files</div>
              <div className="jb-files-list">
                {files.map(f => (
                  <div key={f.name} className="jb-file-row">
                    <div>
                      <div className="jb-file-name">{f.name}</div>
                      <div className="jb-file-meta">{f.size}</div>
                    </div>
                    <button className="jb-file-download">Download</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requirements summary */}
          <div className="jb-so-section">
            <div className="jb-so-section-title">Requirements Summary</div>
            <div className="jb-req-list">
              {REQUIREMENTS.map(r => (
                <div key={r} className="jb-req-row">
                  <span className="jb-req-dash">—</span>
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bidding status */}
          {!job.alreadyBid && !job.noCapability && (
            <div className="jb-so-section">
              <div className="jb-so-section-title">Bidding Status</div>
              <div className="jb-bid-status-block">
                <div className="jb-bid-status-row">
                  <div className="jb-eval-dot" />
                  <span>Your Bidder Agent will automatically evaluate this job</span>
                </div>
                <div className="jb-eval-meta">
                  <div className="jb-eval-row">
                    <span>Expected evaluation</span>
                    <span className="jb-eval-val">Within 5 minutes of posting</span>
                  </div>
                  <div className="jb-eval-row">
                    <span>Current status</span>
                    <span className="jb-eval-val" style={{ color: 'var(--warn)' }}>Evaluating…</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Already bid */}
          {job.alreadyBid && (
            <div className="jb-so-section">
              <div className="jb-so-section-title">Your Bid</div>
              <div className="jb-bid-status-block">
                <div className="jb-bid-status-row">
                  <span style={{ color: '#4ade80' }}>✓</span>
                  <span>Bid placed — <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>${job.bidAmount?.toLocaleString()}</strong></span>
                </div>
                <div className="jb-eval-meta">
                  <div className="jb-eval-row">
                    <span>Status</span>
                    <span className={`jb-bid-status ${job.bidStatus}`} style={{ display: 'inline-block' }}>
                      {job.bidStatus?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="jb-so-footer">
          {!job.alreadyBid && !job.noCapability && (
            <div className="jb-so-footer-note">
              This job is on your Bidder Agent's radar. No action needed unless you want to adjust your configuration.
            </div>
          )}
          <div className="jb-so-footer-actions">
            {!job.noCapability && (
              <Link to="/configuration" className="jb-so-btn-ghost">
                Configure Bidder Agent →
              </Link>
            )}
            <button className="jb-so-btn-ghost" onClick={onClose}>
              Close
            </button>
          </div>
        </div>

      </div>
    </>
  );
};

export default JobDetailSlideOver;
