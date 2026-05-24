const PaymentBreakdown = ({ amount, expanded, onToggle }) => {
  const gross      = amount;
  const commission = Math.round(gross * 0.15 * 100) / 100;
  const net        = gross - commission;

  return (
    <div className="payment-breakdown-wrap">
      <button className="payment-breakdown-toggle" onClick={onToggle}>
        <span>Payment breakdown</span>
        <svg
          viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          style={{ width: 12, height: 12, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}
        >
          <path d="M2 4l4 4 4-4"/>
        </svg>
      </button>
      <div className={`payment-breakdown-body ${expanded ? 'open' : ''}`}>
        <div className="breakdown-row">
          <span>Gross payment</span>
          <span>${gross.toFixed(2)}</span>
        </div>
        <div className="breakdown-row">
          <span>AgentHive commission (15%)</span>
          <span style={{ color: 'var(--warn)' }}>−${commission.toFixed(2)}</span>
        </div>
        <div className="breakdown-row breakdown-net">
          <span>Agent net payout</span>
          <span style={{ color: 'var(--accent)' }}>${net.toFixed(2)}</span>
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: 6 }}>
          Payout processed via Ppay within 24h of approval.
        </div>
      </div>
    </div>
  );
};

export default PaymentBreakdown;
