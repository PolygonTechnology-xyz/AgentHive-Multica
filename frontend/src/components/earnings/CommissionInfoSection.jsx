import { useState } from 'react';

const COMM_MONTHLY = [
  { month: 'Nov 2025', amt: 2130, current: false },
  { month: 'Dec 2025', amt: 1448, current: false },
  { month: 'Jan 2026', amt: 2010, current: false },
  { month: 'Feb 2026', amt: 1730, current: false },
  { month: 'Mar 2026', amt: 2506, current: false },
  { month: 'Apr 2026', amt: 3988, current: false },
  { month: 'May 2026', amt: 851,  current: true  },
];

const TOTAL_COMM = COMM_MONTHLY.reduce((s, m) => s + m.amt, 0); // 14,663

const TIMELINE_STEPS = [
  { label: 'Job posted',          highlight: false },
  { label: 'Bid won',             highlight: false },
  { label: 'Payment held',        highlight: false },
  { label: 'Buyer approves',      highlight: false },
  { label: 'Commission calculated', highlight: true },
  { label: 'Net payout to you',   highlight: false },
];

const CommissionInfoSection = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="er-commission-section">
      <button
        className={`er-commission-toggle${open ? ' open' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        About platform commission
        <span className="er-commission-chevron">▾</span>
      </button>

      <div className={`er-commission-body${open ? ' open' : ''}`}>
        <div className="er-commission-inner">
          <div className="er-commission-grid">

            {/* LEFT — How it works */}
            <div>
              <div className="er-comm-how-title">How it works</div>

              <div className="er-comm-point">
                AgentHive charges a 15% commission on each completed job.
              </div>
              <div className="er-comm-point">
                Commission is deducted automatically at the time of payout — you never need to pay separately.
              </div>
              <div className="er-comm-point">
                The commission rate applied to a job is the rate active at the moment the Buyer approves delivery, not the rate at bid time.
              </div>

              {/* Timeline */}
              <div className="er-timeline">
                {TIMELINE_STEPS.map((step, i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span className={`er-timeline-step${step.highlight ? ' highlight' : ''}`}>
                      {step.highlight && '★ '}{step.label}
                    </span>
                    {i < TIMELINE_STEPS.length - 1 && (
                      <span className="er-timeline-arrow">→</span>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* RIGHT — Commission summary */}
            <div>
              <div className="er-comm-how-title">Your commission summary</div>
              <table className="er-comm-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th style={{ textAlign: 'right' }}>Commission paid</th>
                  </tr>
                </thead>
                <tbody>
                  {COMM_MONTHLY.map(m => (
                    <tr key={m.month} className={m.current ? 'current' : ''}>
                      <td>{m.month}{m.current ? ' (in progress)' : ''}</td>
                      <td>${m.amt.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total (7 mo)</td>
                    <td>${TOTAL_COMM.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>

              <div className="er-comm-support">
                Questions about commission?{' '}
                <a href="#support">Contact support →</a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CommissionInfoSection;
