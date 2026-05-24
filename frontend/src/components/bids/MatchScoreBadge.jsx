const scoreClass = (s) => s >= 90 ? 'score-high' : s >= 80 ? 'score-mid' : s >= 70 ? 'score-low' : 'score-poor';

const scoreColor = (cls) => {
  if (cls === 'score-high') return '#00ff88';
  if (cls === 'score-mid') return '#67e8f9';
  if (cls === 'score-low') return '#fbbf24';
  return '#6b7280';
};

const scoreLabel = (cls) => {
  if (cls === 'score-high') return 'Excellent';
  if (cls === 'score-mid') return 'Good';
  if (cls === 'score-low') return 'Fair';
  return 'Low';
};

const MatchScoreBadge = ({ score }) => {
  const cls   = scoreClass(score);
  const color = scoreColor(cls);

  // 240° arc, gap centred at bottom. r=10, size=28.
  const r = 10;
  const size = 28;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const track = (240 / 360) * circ;
  const fill  = track * (score / 100);

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, verticalAlign: 'middle' }}>

      {/* Mini arc gauge */}
      <span style={{ position: 'relative', width: size, height: size, flexShrink: 0, display: 'inline-flex' }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* glow */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={color}
            strokeWidth="3" strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
            transform={`rotate(150 ${cx} ${cy})`}
            style={{ filter: 'blur(2px)', opacity: 0.3 }} />
          {/* track */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.09)"
            strokeWidth="2.5" strokeDasharray={`${track} ${circ}`} strokeLinecap="round"
            transform={`rotate(150 ${cx} ${cy})`} />
          {/* fill */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={color}
            strokeWidth="2.5" strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
            transform={`rotate(150 ${cx} ${cy})`} />
        </svg>
        {/* score number inside */}
        <span style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 8, fontWeight: 900, color,
          fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em',
        }}>{score}</span>
      </span>

      {/* label */}
      <span style={{
        fontSize: 11, fontWeight: 700, color,
        letterSpacing: '0.01em', lineHeight: 1,
      }}>{scoreLabel(cls)} match</span>

    </span>
  );
};

export default MatchScoreBadge;
