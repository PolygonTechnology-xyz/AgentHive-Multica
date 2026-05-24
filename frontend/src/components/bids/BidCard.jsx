import MatchScoreBadge from './MatchScoreBadge';

const StarBadge = () => (
  <svg viewBox="0 0 12 12" fill="currentColor">
    <path d="M6 1l1.2 2.4 2.7.4-1.95 1.9.46 2.68L6 7.25l-2.41 1.17.46-2.68L2.1 3.84l2.7-.4z"/>
  </svg>
);

const BidCard = ({ bid, onViewProfile, onSelectBid }) => {
  const { name, handle, initials, ring, amount, delivery, score, recommended, capabilities, skills, submitted } = bid;
  return (
    <div className="bid-card">

      {/* ── Header: avatar | name + handle + match | price ── */}
      <div className="bid-card-top">

        <div className="bid-avatar-wrap">
          <div className="bid-avatar">{initials}</div>
          <div className={`bid-avatar-ring ${ring}`} />
        </div>

        <div className="bid-agent-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span className="bid-agent-name" onClick={() => onViewProfile(bid)}>{name}</span>
            {recommended && (
              <div className="bid-recommended-badge"><StarBadge />Recommended</div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span className="bid-agent-handle">{handle}</span>
            <span className="bid-handle-sep">·</span>
            <MatchScoreBadge score={score} />
          </div>
        </div>

        <div className="bid-amount-col">
          <div className="bid-amount">${amount}</div>
          <div className="bid-delivery">{delivery}</div>
        </div>
      </div>

      {/* Mobile row — CSS-controlled, hidden on desktop */}
      <div className="bid-mobile-row">
        <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Delivery: <strong style={{ color: 'var(--text-2)' }}>{delivery}</strong></div>
        <div className="bid-amount" style={{ fontSize: '1.1rem' }}>${amount}</div>
      </div>

      {/* ── Skills ── */}
      {skills?.length > 0 && (
        <div className="bid-skills">
          {skills.map((s) => (
            <span key={s} className="bid-skill-tag">{s}</span>
          ))}
        </div>
      )}

      {/* ── Capabilities ── */}
      <div className="bid-capabilities">
        {capabilities.map((c, i) => (
          <div key={i} className="bid-capability-item">{c}</div>
        ))}
        <div className="bid-cap-note">Capability data captured at bid time</div>
      </div>

      <div className="bid-card-footer">
        <span className="bid-submitted">Submitted {submitted}</span>
        <div className="bid-card-actions">
          <button className="btn-view-profile" onClick={() => onViewProfile(bid)}>View profile</button>
          <button className="btn-select-bid" onClick={() => onSelectBid(bid)}>Select this bid</button>
        </div>
      </div>
    </div>
  );
};

export default BidCard;
