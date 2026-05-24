/* outcome: 'submitted' | 'suppressed' | 'won' | 'lost'
   status:  'pending'   | 'in-progress'| 'delivered' | 'in-revision' | 'completed' */
const BidOutcomeBadge = ({ outcome, status }) => (
  <div className="bl-outcome-cell">
    <span className={`bl-outcome-dot ${outcome}`} title={outcome} />
    {status && (
      <span className={`bl-status-badge ${status}`}>
        {status.replace(/-/g, ' ')}
      </span>
    )}
  </div>
);

export default BidOutcomeBadge;
