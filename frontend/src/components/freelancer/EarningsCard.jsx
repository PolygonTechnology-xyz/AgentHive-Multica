import { useState } from 'react';
import { Link } from 'react-router-dom';

const BARS = [
  { month: 'Dec', val: 8200  },
  { month: 'Jan', val: 11400 },
  { month: 'Feb', val: 9800  },
  { month: 'Mar', val: 14200 },
  { month: 'Apr', val: 22600 },
  { month: 'May', val: 4820, current: true },
];

const MAX = 22600;
const W = 200; // SVG viewBox width
const H = 80;  // bar area height
const BAR_W = 22;
const GAP    = (W - BARS.length * BAR_W) / (BARS.length + 1);

const fmt = (v) => v >= 1000 ? `$${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : `$${v}`;

const EarningsCard = () => {
  const [hoverIdx, setHoverIdx] = useState(null);

  return (
    <div className="fl-earnings-body">
      {/* Lifetime */}
      <div className="fl-lifetime-num">$184,200</div>
      <div className="fl-lifetime-label">Lifetime net earnings</div>
      <div style={{ fontSize: '0.71rem', color: 'var(--text-3)' }}>After platform commission</div>

      <div className="fl-earnings-divider" />

      {/* This month */}
      <div className="fl-earnings-section-label">This month</div>
      {[
        { label: 'Net earned', val: '$4,820', accent: true },
        { label: 'Jobs completed', val: '3' },
        { label: 'Avg per job', val: '$1,607' },
      ].map((r) => (
        <div key={r.label} className="fl-earnings-row">
          <span className="fl-earnings-row-label">{r.label}</span>
          <span className={`fl-earnings-row-val${r.accent ? ' accent' : ''}`}>{r.val}</span>
        </div>
      ))}

      <div className="fl-earnings-divider" />

      {/* Pending */}
      <div className="fl-earnings-section-label">Pending balance</div>
      <div className="fl-pending-box">
        <div className="fl-pending-total">$2,740</div>
        <div className="fl-pending-label">Awaiting Buyer approval</div>
        {[
          { job: 'Q1 pricing audit',       val: '$1,250' },
          { job: 'Earnings synthesis',      val: '$490' },
          { job: 'S-1 extraction',          val: '$680' },
        ].map((p) => (
          <div key={p.job} className="fl-pending-item">
            <span>{p.job}</span>
            <span className="fl-pending-item-val">{p.val} held</span>
          </div>
        ))}
        <div className="fl-pending-note">Net payout = gross minus 15% commission</div>
      </div>

      {/* Bar chart */}
      <div className="fl-chart-wrap">
        <div className="fl-chart-label">Net earnings — last 6 months</div>
        <div className="fl-chart-svg-wrap">
          {hoverIdx !== null && (
            <div
              className="fl-chart-tooltip"
              style={{
                left: (GAP + hoverIdx * (BAR_W + GAP) + BAR_W / 2) / W * 100 + '%',
                top: 0,
              }}
            >
              {fmt(BARS[hoverIdx].val)}
            </div>
          )}
          <svg
            viewBox={`0 0 ${W} ${H + 18}`}
            width="100%"
            style={{ display: 'block', overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="rgba(0,255,136,0.8)" />
                <stop offset="100%" stopColor="rgba(0,255,136,0.2)" />
              </linearGradient>
              <linearGradient id="bar-grad-current" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="rgba(0,255,136,0.5)" />
                <stop offset="100%" stopColor="rgba(0,255,136,0.1)" />
              </linearGradient>
            </defs>
            {BARS.map((b, i) => {
              const bh = Math.max(2, (b.val / MAX) * H);
              const x  = GAP + i * (BAR_W + GAP);
              const y  = H - bh;
              return (
                <g key={b.month}>
                  <rect
                    className="fl-chart-bar"
                    x={x} y={y}
                    width={BAR_W} height={bh}
                    rx={3}
                    fill={b.current ? 'url(#bar-grad-current)' : 'url(#bar-grad)'}
                    onMouseEnter={() => setHoverIdx(i)}
                    onMouseLeave={() => setHoverIdx(null)}
                    style={{ opacity: hoverIdx === i ? 0.85 : 1 }}
                  />
                  <text
                    x={x + BAR_W / 2}
                    y={H + 13}
                    textAnchor="middle"
                    fontSize="8"
                    fill={b.current ? 'rgba(0,255,136,0.6)' : 'rgba(255,255,255,0.3)'}
                    fontFamily="inherit"
                  >
                    {b.month}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};

export default EarningsCard;
