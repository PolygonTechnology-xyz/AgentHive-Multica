import { Link } from 'react-router-dom';

const BidderAgentStatusBar = ({ configState = 'current' }) => (
  <div className="bc-status-bar">
    {/* LEFT — Current state */}
    <div className="bc-sb-col">
      <div className="bc-sb-col-label">Current state</div>
      <div className="bc-sb-active">
        <span className="bc-sb-active-dot" />
        ACTIVE
      </div>
      <div className="bc-sb-detail">Monitoring job board in real time</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 2 }}>
        <div className="bc-sb-meta">Last evaluation: 4 minutes ago</div>
        <div className="bc-sb-meta">Evaluations today: 47</div>
      </div>
    </div>

    <div className="bc-sb-divider" />

    {/* CENTER — Configuration state */}
    <div className="bc-sb-col">
      <div className="bc-sb-col-label">Configuration state</div>

      {configState === 'current' && (
        <>
          <div className="bc-config-pill current">CURRENT</div>
          <div className="bc-sb-detail">Configuration active and applied</div>
          <div className="bc-sb-meta">Last updated: 2 hours ago</div>
        </>
      )}
      {configState === 'pending' && (
        <>
          <div className="bc-config-pill pending">
            <div className="bc-prop-spinner" />
            PENDING
          </div>
          <div className="bc-sb-detail">Configuration saved — propagating to Bidder Agent...</div>
          <div className="bc-sb-meta">Estimated: ~5 seconds</div>
        </>
      )}
      {configState === 'default' && (
        <>
          <div className="bc-config-pill default">DEFAULT</div>
          <div className="bc-sb-detail">No custom configuration set</div>
          <div className="bc-sb-meta">Using default bidding behaviour</div>
        </>
      )}
    </div>

    <div className="bc-sb-divider" />

    {/* RIGHT — Quick stats */}
    <div className="bc-sb-col">
      <div className="bc-sb-col-label">Quick stats (current config)</div>
      <div className="bc-sb-stats">
        <div className="bc-sb-stat-row">
          <span className="bc-sb-stat-label">Bids placed</span>
          <span className="bc-sb-stat-val green">312</span>
        </div>
        <div className="bc-sb-stat-row">
          <span className="bc-sb-stat-label">Suppression rate</span>
          <span className="bc-sb-stat-val">83%</span>
        </div>
        <div className="bc-sb-stat-row">
          <span className="bc-sb-stat-label">Avg match score on bids</span>
          <span className="bc-sb-stat-val green">89</span>
        </div>
      </div>
      <Link to="/bid-log" className="bc-sb-log-link">
        View full bid log →
      </Link>
    </div>
  </div>
);

export default BidderAgentStatusBar;
