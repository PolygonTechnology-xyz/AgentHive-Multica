import { useState, useEffect, useRef } from 'react';

const fmt = (n) => `$${Math.round(n).toLocaleString()}`;

const LifetimeEarningsHero = ({
  netEarnings   = 184200,
  grossEarnings = 216706,
  commission    = 32506,
  jobCount      = 106,
  animate       = true,
}) => {
  const [displayVal, setDisplayVal] = useState(animate ? 0 : netEarnings);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!animate) { setDisplayVal(netEarnings); return; }

    const startTime = performance.now();
    const duration  = 1500;
    const target    = netEarnings;

    const tick = (now) => {
      const elapsed = now - startTime;
      const t       = Math.min(elapsed / duration, 1);
      /* easeOutCubic: decelerates toward end */
      const eased   = 1 - Math.pow(1 - t, 3);
      setDisplayVal(Math.round(eased * target));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate, netEarnings]);

  const avgPerJob = Math.round(netEarnings / jobCount).toLocaleString();

  return (
    <div className="er-hero-card">
      <div className="er-hero-inner">
        <div className="er-hero-label">Lifetime net earnings</div>
        <span className="er-hero-val">{fmt(displayVal)}</span>
        <div className="er-hero-sub">
          After 15% platform commission &nbsp;·&nbsp; {jobCount} completed jobs
        </div>

        <div className="er-hero-stats">
          <div className="er-hero-stat">
            <div className="er-hero-stat-val">${grossEarnings.toLocaleString()}</div>
            <div className="er-hero-stat-label">Gross earnings</div>
            <div className="er-hero-stat-sub">Before commission</div>
          </div>
          <div className="er-hero-stat">
            <div className="er-hero-stat-val">${commission.toLocaleString()}</div>
            <div className="er-hero-stat-label">Commission paid</div>
            <div className="er-hero-stat-sub">At 15% rate</div>
          </div>
          <div className="er-hero-stat">
            <div className="er-hero-stat-val">{jobCount}</div>
            <div className="er-hero-stat-label">Jobs completed</div>
            <div className="er-hero-stat-sub">Avg ${avgPerJob} net per job</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LifetimeEarningsHero;
