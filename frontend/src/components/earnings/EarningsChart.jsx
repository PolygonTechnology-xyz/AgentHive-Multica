import { useState } from 'react';

/* ── Data ───────────────────────────────────────────────────── */
const MONTHLY_DATA = [
  { month: 'Jun', year: '2025', gross: 8480,  commission: 1272, net: 7208,  jobs: 5  },
  { month: 'Jul', year: '2025', gross: 10620, commission: 1593, net: 9027,  jobs: 7  },
  { month: 'Aug', year: '2025', gross: 9350,  commission: 1403, net: 7948,  jobs: 5  },
  { month: 'Sep', year: '2025', gross: 13400, commission: 2010, net: 11390, jobs: 8  },
  { month: 'Oct', year: '2025', gross: 16800, commission: 2520, net: 14280, jobs: 10 },
  { month: 'Nov', year: '2025', gross: 14200, commission: 2130, net: 12070, jobs: 9  },
  { month: 'Dec', year: '2025', gross: 9650,  commission: 1448, net: 8203,  jobs: 6  },
  { month: 'Jan', year: '2026', gross: 13400, commission: 2010, net: 11390, jobs: 8  },
  { month: 'Feb', year: '2026', gross: 11530, commission: 1730, net: 9801,  jobs: 7  },
  { month: 'Mar', year: '2026', gross: 16706, commission: 2506, net: 14200, jobs: 10 },
  { month: 'Apr', year: '2026', gross: 26588, commission: 3988, net: 22600, jobs: 15 },
  { month: 'May', year: '2026', gross: 5671,  commission: 851,  net: 4820,  jobs: 4, current: true },
];

const WEEKLY_DATA = [
  { week: 'Mar 17', net: 3200 },
  { week: 'Mar 24', net: 3800 },
  { week: 'Mar 31', net: 4600 },
  { week: 'Apr 7',  net: 5100 },
  { week: 'Apr 14', net: 6200 },
  { week: 'Apr 21', net: 8100 },
  { week: 'Apr 28', net: 3200 },
  { week: 'May 5',  net: 2800, current: true },
];

/* ── Chart constants ─────────────────────────────────────── */
const CW = 900, CH = 320;
const PAD  = { top: 24, right: 20, bottom: 46, left: 66 };
const PW   = CW - PAD.left - PAD.right;  // 814
const PH   = CH - PAD.top  - PAD.bottom; // 250

const M_MAX   = 30000;
const M_GRID  = [0, 5000, 10000, 15000, 20000, 25000, 30000];
const SLOT_W  = PW / 12;                    // ~67.8
const BAR_W   = Math.floor(SLOT_W * 0.58); // ~39
const BAR_OFF = (SLOT_W - BAR_W) / 2;

const W_MAX  = 9000;
const W_GRID = [0, 3000, 6000, 9000];
const W_STEP = PW / (WEEKLY_DATA.length - 1); // 7 intervals

const fmtK  = v => v === 0 ? '$0' : v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`;
const fmtD  = v => `$${v.toLocaleString()}`;

/* ── Monthly bar chart ───────────────────────────────────── */
const MonthlyChart = () => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  return (
    <svg
      viewBox={`0 0 ${CW} ${CH}`}
      className="er-chart-svg"
      onMouseLeave={() => setHoveredIdx(null)}
    >
      <defs>
        <linearGradient id="er-bar-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#00ff88" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#00ff88" stopOpacity="0.56" />
        </linearGradient>
        <linearGradient id="er-bar-hover" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#00ff88" stopOpacity="1"    />
          <stop offset="100%" stopColor="#00ff88" stopOpacity="0.72" />
        </linearGradient>
      </defs>

      {/* Y grid lines + labels */}
      {M_GRID.map(val => {
        const y = PAD.top + PH - (val / M_MAX) * PH;
        return (
          <g key={val}>
            <line
              x1={PAD.left} x2={CW - PAD.right} y1={y} y2={y}
              stroke="rgba(255,255,255,0.05)" strokeWidth="1"
            />
            <text
              x={PAD.left - 8} y={y + 4}
              textAnchor="end" fill="rgba(255,255,255,0.28)"
              fontSize="10.5" fontFamily="system-ui, sans-serif"
            >{fmtK(val)}</text>
          </g>
        );
      })}

      {/* Bars */}
      {MONTHLY_DATA.map((d, i) => {
        const x       = PAD.left + i * SLOT_W + BAR_OFF;
        const grossH  = (d.gross      / M_MAX) * PH;
        const netH    = (d.net        / M_MAX) * PH;
        const commH   = grossH - netH;
        const netY    = PAD.top + PH - netH;
        const commY   = PAD.top + PH - grossH;
        const isHov   = hoveredIdx === i;
        const isCurr  = !!d.current;

        /* Tooltip x: centred on bar, clamped to viewBox */
        const ttW   = 176;
        const ttH   = isCurr ? 96 : 116;
        const ttX   = Math.min(Math.max(x + BAR_W / 2 - ttW / 2, PAD.left - 8), CW - ttW - 4);
        const ttY   = Math.max(commY - ttH - 8, PAD.top - 4);
        const xLbl  = PAD.left + i * SLOT_W + SLOT_W / 2;
        const lbl   = d.month + (d.month === 'Jan' ? " '26" : '');

        return (
          <g
            key={i}
            onMouseEnter={() => setHoveredIdx(i)}
            style={{ cursor: 'default' }}
          >
            {/* Net bar */}
            <rect
              x={x} y={netY} width={BAR_W} height={netH}
              fill={isCurr ? 'rgba(0,255,136,0.38)' : isHov ? 'url(#er-bar-hover)' : 'url(#er-bar-grad)'}
              rx="2"
              stroke={isCurr ? '#00ff88' : 'none'}
              strokeWidth={isCurr ? 1.5 : 0}
              strokeDasharray={isCurr ? '5,3' : undefined}
            />
            {/* Commission overlay */}
            {commH > 0.5 && (
              <rect
                x={x} y={commY} width={BAR_W} height={commH}
                fill={isCurr ? 'rgba(255,255,255,0.06)' : isHov ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.14)'}
                rx="2"
              />
            )}
            {/* Transparent hit area (full slot) */}
            <rect
              x={PAD.left + i * SLOT_W} y={PAD.top}
              width={SLOT_W} height={PH}
              fill="transparent"
            />
            {/* X label */}
            <text
              x={xLbl} y={PAD.top + PH + 16}
              textAnchor="middle"
              fill={isCurr ? 'rgba(0,255,136,0.65)' : isHov ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.28)'}
              fontSize="10" fontFamily="system-ui, sans-serif"
            >{lbl}</text>

            {/* Tooltip */}
            {isHov && (
              <foreignObject x={ttX} y={ttY} width={ttW} height={ttH} style={{ overflow: 'visible' }}>
                <div className="ec-tooltip">
                  <div className="ec-tt-month">{d.month} {d.year}{isCurr ? ' (in progress)' : ''}</div>
                  <div className="ec-tt-row">
                    <span>Gross</span><span>{fmtD(d.gross)}</span>
                  </div>
                  <div className="ec-tt-row ec-tt-comm">
                    <span>Commission (15%)</span><span>−{fmtD(d.commission)}</span>
                  </div>
                  <div className="ec-tt-row ec-tt-net">
                    <span>Net</span><span>{fmtD(d.net)}</span>
                  </div>
                  {!isCurr && (
                    <div className="ec-tt-jobs">{d.jobs} job{d.jobs !== 1 ? 's' : ''} completed</div>
                  )}
                </div>
              </foreignObject>
            )}
          </g>
        );
      })}
    </svg>
  );
};

/* ── Weekly line chart ───────────────────────────────────── */
const WeeklyChart = () => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const pts = WEEKLY_DATA.map((d, i) => ({
    x: PAD.left + i * W_STEP,
    y: PAD.top  + PH - (d.net / W_MAX) * PH,
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const lastPt   = pts[pts.length - 1];
  const firstPt  = pts[0];
  const bottomY  = PAD.top + PH;
  const areaPath = `${linePath} L ${lastPt.x.toFixed(1)},${bottomY} L ${firstPt.x.toFixed(1)},${bottomY} Z`;

  return (
    <svg
      viewBox={`0 0 ${CW} ${CH}`}
      className="er-chart-svg"
      onMouseLeave={() => setHoveredIdx(null)}
    >
      <defs>
        <linearGradient id="er-weekly-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(0,255,136,0.18)" />
          <stop offset="100%" stopColor="rgba(0,255,136,0)"    />
        </linearGradient>
      </defs>

      {/* Y grid lines + labels */}
      {W_GRID.map(val => {
        const y = PAD.top + PH - (val / W_MAX) * PH;
        return (
          <g key={val}>
            <line
              x1={PAD.left} x2={CW - PAD.right} y1={y} y2={y}
              stroke="rgba(255,255,255,0.05)" strokeWidth="1"
            />
            <text
              x={PAD.left - 8} y={y + 4}
              textAnchor="end" fill="rgba(255,255,255,0.28)"
              fontSize="10.5" fontFamily="system-ui, sans-serif"
            >{fmtK(val)}</text>
          </g>
        );
      })}

      {/* Area fill */}
      <path d={areaPath} fill="url(#er-weekly-area)" />

      {/* Line */}
      <path
        d={linePath} fill="none"
        stroke="var(--accent)" strokeWidth="2.5"
        strokeLinejoin="round" strokeLinecap="round"
      />

      {/* Dots, labels, tooltips */}
      {pts.map((p, i) => {
        const d      = WEEKLY_DATA[i];
        const isHov  = hoveredIdx === i;
        const isCurr = !!d.current;
        const ttW    = 176, ttH = 80;
        const ttX    = Math.min(Math.max(p.x - ttW / 2, PAD.left - 8), CW - ttW - 4);
        const ttY    = Math.max(p.y - ttH - 10, PAD.top - 4);

        return (
          <g
            key={i}
            onMouseEnter={() => setHoveredIdx(i)}
            style={{ cursor: 'default' }}
          >
            {/* Hit area */}
            <circle cx={p.x} cy={p.y} r="18" fill="transparent" />
            {/* Dot */}
            <circle
              cx={p.x} cy={p.y}
              r={isHov ? 6 : (isCurr ? 5 : 4)}
              fill={isCurr ? 'rgba(0,255,136,0.55)' : '#00ff88'}
              stroke="#0a0a0f" strokeWidth="2"
            />
            {/* X label */}
            <text
              x={p.x} y={PAD.top + PH + 16}
              textAnchor="middle"
              fill={isCurr ? 'rgba(0,255,136,0.65)' : isHov ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.28)'}
              fontSize="10" fontFamily="system-ui, sans-serif"
            >{d.week}</text>

            {/* Tooltip */}
            {isHov && (
              <foreignObject x={ttX} y={ttY} width={ttW} height={ttH} style={{ overflow: 'visible' }}>
                <div className="ec-tooltip">
                  <div className="ec-tt-month">Week of {d.week}{isCurr ? ' (partial)' : ''}</div>
                  <div className="ec-tt-row ec-tt-net">
                    <span>Net earnings</span><span>{fmtD(d.net)}</span>
                  </div>
                  {isCurr && (
                    <div className="ec-tt-jobs" style={{ color: 'rgba(251,191,36,0.8)' }}>
                      Partial week — in progress
                    </div>
                  )}
                </div>
              </foreignObject>
            )}
          </g>
        );
      })}
    </svg>
  );
};

/* ── EarningsChart ───────────────────────────────────────── */
const EarningsChart = () => {
  const [view, setView] = useState('monthly');

  return (
    <div className="er-chart-card">
      <div className="er-chart-header">
        <div className="er-chart-title">Earnings over time</div>
        <div className="er-chart-tabs">
          <button
            className={`er-chart-tab${view === 'monthly' ? ' active' : ''}`}
            onClick={() => setView('monthly')}
          >Monthly</button>
          <button
            className={`er-chart-tab${view === 'weekly'  ? ' active' : ''}`}
            onClick={() => setView('weekly')}
          >Weekly</button>
        </div>
      </div>

      <div className="er-chart-wrap">
        {view === 'monthly' ? <MonthlyChart /> : <WeeklyChart />}
      </div>

      <div className="er-chart-chips">
        <span className="er-chart-chip best">🏆 Best month: Apr 2026 — $22,600 net</span>
        <span className="er-chart-chip avg">Avg monthly: $11,078 net</span>
        <span className="er-chart-chip current">This month: $4,820 net (in progress)</span>
      </div>
    </div>
  );
};

export default EarningsChart;
