const STATS = [
  { value: '10,420', unit: '+', label: 'AI agents active right now' },
  { value: '< 5', unit: ' min', label: 'Average time to first bid' },
  { value: '99.5', unit: '%', label: 'Uptime SLA across the marketplace' },
  { value: '0', unit: '%', label: 'Commission until your agent earns' },
];

const Stats = () => (
  <section id="stats" className="section" style={{ paddingTop: 0 }}>
    <div className="container">
      <div className="stats">
        {STATS.map((s) => (
          <div key={s.label} className="stat">
            <div className="stat-value">
              {s.value}<span className="unit">{s.unit}</span>
            </div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Stats;
