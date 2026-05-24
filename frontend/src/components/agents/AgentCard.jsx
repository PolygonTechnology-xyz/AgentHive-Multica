import { useState } from 'react';

/* ── Icons ─────────────────────────────────────────────────── */
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
const CopyIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <rect x="4" y="4" width="9" height="10" rx="1.5"/>
    <path d="M3 3h-.5A1.5 1.5 0 0 0 1 4.5v9A1.5 1.5 0 0 0 2.5 15H11"/>
  </svg>
);

const AgentCard = ({ agent, onViewCapabilities }) => {
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);

  const isActive = agent.status === 'active';

  const copyEndpoint = () => {
    navigator.clipboard.writeText(agent.endpoint).catch(() => {});
    setCopiedEndpoint(true);
    setTimeout(() => setCopiedEndpoint(false), 2000);
  };

  return (
    <div className={`am-agent-card ${agent.status}`}>
      {/* LEFT — Identity */}
      <div className="am-card-left">
        <div className="am-glyph-row">
          <div className="am-glyph-container">
            <AgentGlyphSVG />
          </div>
          <div className="am-glyph-info">
            <div className="am-agent-name-text">{agent.name}</div>
            <div className="am-agent-version">{agent.version}</div>
          </div>
        </div>

        <div className="am-agent-connected">Connected {agent.connectedDate}</div>

        <div className="am-endpoint-row">
          <span className="am-endpoint-url" title={agent.endpoint}>{agent.endpoint}</span>
          <button
            className="am-copy-btn"
            onClick={copyEndpoint}
            title="Copy endpoint"
          >
            <CopyIcon />
            {copiedEndpoint ? '✓' : 'Copy'}
          </button>
        </div>
      </div>

      {/* CENTER — Capabilities & Stats */}
      <div className="am-card-center">
        <div>
          <div className="am-cap-section-title">Capabilities</div>
          <div className="am-cap-tags" style={{ marginTop: 6 }}>
            {agent.capabilities.map(cap => (
              <span key={cap} className="am-cap-tag">{cap}</span>
            ))}
          </div>
        </div>

        <div>
          <div className={`am-indexing-badge ${agent.indexingStatus}`}>
            {agent.indexingStatus.charAt(0).toUpperCase() + agent.indexingStatus.slice(1)}
          </div>
          <div className="am-indexed-time">Indexed {agent.indexedAt}</div>
        </div>

        <div className="am-card-divider" />

        <div className="am-stats-row">
          <div className="am-stat-item">
            <span className="am-stat-val">{agent.jobsWon.toLocaleString()}</span>
            <span className="am-stat-label">Jobs won</span>
          </div>
          <div className="am-stat-item">
            <span className="am-stat-val">{agent.avgDelivery}h</span>
            <span className="am-stat-label">Avg delivery</span>
          </div>
          <div className="am-stat-item">
            <span className="am-stat-val">{agent.winRate}%</span>
            <span className="am-stat-label">Win rate</span>
          </div>
        </div>
      </div>

      {/* RIGHT — Status & Actions */}
      <div className="am-card-right">
        <div className={`am-status-badge-large ${agent.status}`}>
          {isActive ? 'ACTIVE' : 'INACTIVE'}
        </div>

        <div className="am-current-job-section">
          <div className="am-field-label">Current job</div>
          {agent.currentJob ? (
            <div>
              <div className="am-job-title-text">{agent.currentJob.title}</div>
              <div style={{ marginTop: 4 }}>
                <span className="am-ip-badge">In Progress</span>
              </div>
            </div>
          ) : (
            <div className="am-no-job">No active jobs</div>
          )}
        </div>

        <div className="am-current-job-section">
          <div className="am-field-label">Last bid</div>
          <div className="am-last-bid">
            <span>{agent.lastBid}</span>
          </div>
        </div>

        <div className="am-card-actions">
          <button className="am-action-btn" onClick={() => onViewCapabilities(agent)}>
            View capability detail →
          </button>

          <div style={{
            marginTop: 12,
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8,
            padding: '10px 14px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            color: 'var(--text-dim)',
            lineHeight: 1.7,
          }}>
            <div style={{ color: 'var(--text-faint)', marginBottom: 4, fontFamily: 'var(--font-body)', fontSize: '0.71rem' }}>
              To deactivate or remove this agent, use the CLI:
            </div>
            <div>{`$ agenthive agent deactivate --name ${agent.name}`}</div>
            <div>{`$ agenthive agent remove --name ${agent.name}`}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentCard;
