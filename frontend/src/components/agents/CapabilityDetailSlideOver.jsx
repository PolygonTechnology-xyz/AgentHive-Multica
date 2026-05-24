import { useEffect, useState } from 'react';

const AgentGlyphSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="4" y="7" width="16" height="12" rx="3"/>
    <circle cx="9" cy="13" r="1.8" fill="currentColor" stroke="none"/>
    <circle cx="15" cy="13" r="1.8" fill="currentColor" stroke="none"/>
    <path d="M9 17.5h6"/><path d="M12 4v3"/>
    <circle cx="12" cy="3.2" r="1.2" fill="currentColor" stroke="none"/>
    <path d="M1 13h3M20 13h3"/>
  </svg>
);

const CAPABILITY_DETAILS = {
  'Atlas-Research-7': [
    {
      category: 'Market Research',
      description: 'Structured competitive analysis, market sizing, trend identification',
      inputs: 'URLs, search queries, document uploads',
      outputs: 'JSON reports, CSV summaries, structured markdown',
      confidence: 'high',
    },
    {
      category: 'Competitive Intelligence',
      description: 'Multi-source competitor profiling and comparison matrices',
      inputs: 'Company names, URLs, industry keywords',
      outputs: 'Comparison tables, SWOT analyses, pricing matrices',
      confidence: 'high',
    },
    {
      category: 'SQL & Data Analysis',
      description: 'Complex query generation, data modeling, analytical reporting',
      inputs: 'Schema definitions, natural language queries',
      outputs: 'SQL queries, analysis reports, charts',
      confidence: 'high',
    },
    {
      category: 'Web Scraping',
      description: 'Structured extraction from public web sources',
      inputs: 'Target URLs, extraction schemas',
      outputs: 'JSON, CSV, XLSX',
      confidence: 'medium',
    },
    {
      category: 'Financial Analysis',
      description: 'Document parsing, metric extraction, ratio calculation',
      inputs: 'PDFs, XLSX, earnings transcripts',
      outputs: 'Structured JSON, Excel models',
      confidence: 'medium',
    },
  ],
};

const RECENT_JOBS = [
  { title: 'Q1 Market Intelligence Report', payout: '$285', date: '2 May' },
  { title: 'Competitive Pricing Analysis — Retail', payout: '$410', date: '28 Apr' },
  { title: 'Patent Landscape Report — Biotech', payout: '$820', date: '17 Apr' },
];

const CapabilityDetailSlideOver = ({ agent, isOpen, onClose, onToast }) => {
  const [reindexing, setReindexing] = useState(false);

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!agent) return null;
  const caps = CAPABILITY_DETAILS[agent.name] || [];

  const handleReindex = () => {
    setReindexing(true);
    setTimeout(() => {
      setReindexing(false);
      onToast('✓ Capabilities re-indexed successfully');
    }, 2000);
  };

  return (
    <>
      <div className={`so-overlay${isOpen ? ' open' : ''}`} onClick={onClose} />
      <div className={`so-panel w480${isOpen ? ' open' : ''}`}>
        {/* Header */}
        <div className="so-header">
          <div className="so-header-row">
            <div>
              <div className="cap-agent-header" style={{ paddingBottom: 0, borderBottom: 'none', marginBottom: 0 }}>
                <div className="cap-agent-glyph">
                  <AgentGlyphSVG />
                </div>
                <div>
                  <div className="cap-agent-name">{agent.name}</div>
                  <div className="cap-agent-version">{agent.version}</div>
                  <div className="cap-agent-status-row">
                    <span className={`am-indexing-badge ${agent.indexingStatus}`}>
                      {agent.indexingStatus.charAt(0).toUpperCase() + agent.indexingStatus.slice(1)}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-3)' }}>
                      Connected {agent.connectedDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button className="so-close" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Body */}
        <div className="so-body">
          {/* Capability breakdown */}
          <div className="so-section-title">Indexed capabilities</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: 12, marginTop: -4, lineHeight: 1.5 }}>
            Parsed from capability manifest at connection time. Last indexed: {agent.indexedAt} ago.
          </p>
          <div className="cap-cats">
            {caps.map((cap, i) => (
              <div key={i} className="cap-cat-card">
                <div className="cap-cat-name">{cap.category}</div>
                <div className="cap-cat-desc">{cap.description}</div>
                <div className="cap-cat-details">
                  <div className="cap-cat-detail-row">
                    <span className="cap-cat-detail-label">Inputs</span>
                    <span className="cap-cat-detail-val">{cap.inputs}</span>
                  </div>
                  <div className="cap-cat-detail-row">
                    <span className="cap-cat-detail-label">Outputs</span>
                    <span className="cap-cat-detail-val">{cap.outputs}</span>
                  </div>
                </div>
                <div className="cap-confidence-row">
                  <span className="cap-confidence-label">Confidence</span>
                  <div className="cap-confidence-track">
                    <div className={`cap-confidence-fill ${cap.confidence}`} />
                  </div>
                  <span className={`cap-confidence-level ${cap.confidence}`}>
                    {cap.confidence.charAt(0).toUpperCase() + cap.confidence.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="so-divider" />

          {/* Performance */}
          <div className="so-section-title">Performance</div>
          <div className="cap-perf-grid">
            <div className="cap-perf-cell">
              <div className="cap-perf-val">{agent.jobsWon.toLocaleString()}</div>
              <div className="cap-perf-label">Total jobs won</div>
            </div>
            <div className="cap-perf-cell">
              <div className="cap-perf-val">89</div>
              <div className="cap-perf-label">Avg match score</div>
            </div>
            <div className="cap-perf-cell">
              <div className="cap-perf-val">{agent.avgDelivery}h</div>
              <div className="cap-perf-label">Avg delivery time</div>
            </div>
            <div className="cap-perf-cell">
              <div className="cap-perf-val">97%</div>
              <div className="cap-perf-label">Client approval rate</div>
            </div>
          </div>

          <div className="so-divider" />

          {/* Recent jobs */}
          <div className="so-section-title">Recent jobs won</div>
          <div className="cap-recent-jobs">
            {RECENT_JOBS.map((job, i) => (
              <div key={i} className="cap-recent-job">
                <div className="cap-recent-job-title">{job.title}</div>
                <div className="cap-recent-job-payout">{job.payout}</div>
                <div className="cap-recent-job-date">{job.date}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="so-footer">
          <button
            className={`cap-reindex-btn${reindexing ? ' loading' : ''}`}
            onClick={handleReindex}
            disabled={reindexing}
          >
            {reindexing ? (
              <>
                <div className="am-spinner" style={{ borderTopColor: 'var(--accent)' }} />
                Re-indexing...
              </>
            ) : (
              '↻ Re-index capabilities'
            )}
          </button>
          <button className="btn-modal-cancel" style={{ flex: 1 }} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </>
  );
};

export default CapabilityDetailSlideOver;
