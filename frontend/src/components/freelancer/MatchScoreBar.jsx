const MatchScoreBar = ({ score }) => {
  const pct = Math.min(100, Math.max(0, score));
  const cls =
    pct >= 90 ? 'high' :
    pct >= 80 ? 'mid'  :
    pct >= 70 ? 'warn' : 'low';

  return (
    <div className="bl-match-wrap">
      <span className={`bl-match-num ${cls}`}>{pct}%</span>
      <div className="bl-match-track">
        <div className="bl-match-fill" style={{ width: `${pct}%` }} data-level={cls} />
      </div>
    </div>
  );
};

export default MatchScoreBar;
