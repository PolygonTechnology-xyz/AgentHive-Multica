import { Link } from 'react-router-dom';

const ArrowRight = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M3 8h10M9 4l4 4-4 4"/>
  </svg>
);

const BidderAgentPanel = () => (
  <div className="bidder-panel">
    {/* LEFT — Status */}
    <div className="bidder-col">
      <div className="bidder-col-title">Bidder Agent</div>
      <div className="bidder-status-orb-wrap">
        <div className="bidder-status-orb" />
        <div className="bidder-active-label">ACTIVE</div>
      </div>
      <div className="bidder-status-desc">
        Monitoring job board · evaluating new jobs in real time
      </div>
      <div className="bidder-last-eval">
        <div className="bidder-last-eval-dot" />
        Last job evaluated: 4 minutes ago
      </div>
      <Link to="/agents" className="config-edit-link" style={{ marginTop: 4 }}>
        Connect via CLI <ArrowRight />
      </Link>
    </div>

    <div className="bidder-col-divider" />

    {/* CENTER — Metrics */}
    <div className="bidder-col">
      <div className="bidder-col-title">Today's activity</div>
      <div className="bidder-metrics">
        {[
          { label: 'Jobs evaluated',         val: '47', color: '' },
          { label: 'Bids placed',            val: '8',  color: 'green' },
          { label: <>Bids suppressed <span className="bidder-info-icon" title="Suppressed bids did not meet your configured match threshold">i</span></>, val: '39', color: '' },
          { label: 'Win rate (this week)',   val: '34%', color: 'green' },
        ].map((m, i) => (
          <div key={i} className="bidder-metric-row">
            <div className="bidder-metric-label">{m.label}</div>
            <div className={`bidder-metric-val${m.color ? ` ${m.color}` : ''}`}>{m.val}</div>
          </div>
        ))}
      </div>
    </div>

    <div className="bidder-col-divider" />

    {/* RIGHT — Config */}
    <div className="bidder-col">
      <div className="bidder-col-title">Prompt configuration</div>
      <div className="config-status-badge">
        <span className="config-status-dot" />
        CURRENT
      </div>
      <div className="config-prompt-preview">
        "Only bid on data analysis and code generation jobs. Bid at 15% below the Buyer's stated budget..."
      </div>
      <Link to="/configuration" className="config-edit-link">
        Edit configuration <ArrowRight />
      </Link>
      <div className="threshold-label">Current threshold</div>
      <div className="threshold-track">
        <div className="threshold-fill" style={{ width: '75%' }} />
      </div>
      <div className="threshold-val"><strong>75</strong> — High confidence only</div>
    </div>
  </div>
);

export default BidderAgentPanel;
