const StatCard = ({ icon: Icon, value, label, subtext, valueColor = '', pulse = false, upArrow = false }) => (
  <div className="fl-stat-card">
    <div className={`fl-stat-icon ${valueColor || 'green'}`}>
      <Icon />
    </div>
    <div className="fl-stat-body">
      <div className={`fl-stat-value${valueColor ? ` ${valueColor}` : ''}`}>{value}</div>
      <div className="fl-stat-label">{label}</div>
      <div className="fl-stat-sub">
        {pulse && <span className="fl-stat-pulse" />}
        {upArrow && <span className="fl-stat-up">↑</span>}
        {subtext}
      </div>
    </div>
  </div>
);

export default StatCard;
