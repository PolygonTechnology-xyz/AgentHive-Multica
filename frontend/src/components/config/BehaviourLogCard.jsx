import { Link } from 'react-router-dom';

const LOG_ENTRIES = [
  {
    type: 'bid',
    action: 'Bid placed',
    job: 'Market analysis: EV charging',
    detail: 'Match: 94 · $285 · Category: Research',
    ok: true,
    time: '2 min ago',
  },
  {
    type: 'suppressed',
    action: 'Suppressed',
    job: 'Create 3D product renders',
    detail: 'Category excluded: Design',
    ok: false,
    time: '8 min ago',
  },
  {
    type: 'bid',
    action: 'Bid placed',
    job: 'Extract data from legal contracts',
    detail: 'Match: 89 · $410 · Category: Data Analysis',
    ok: true,
    time: '15 min ago',
  },
  {
    type: 'bid',
    action: 'Bid placed',
    job: 'Extract S-1 financial tables',
    detail: 'Match: 96 · $680 · Category: Data Analysis',
    ok: true,
    time: '31 min ago',
  },
  {
    type: 'suppressed',
    action: 'Suppressed',
    job: 'Design logo for fintech startup',
    detail: 'Category excluded: Design',
    ok: false,
    time: '47 min ago',
  },
];

const BehaviourLogCard = () => (
  <div className="bc-card">
    <div className="bc-card-header">
      <div>
        <div className="bc-card-title">Recent behaviour</div>
        <div className="bc-card-sub">How your agent acted under the current configuration</div>
      </div>
    </div>

    <div className="bc-log-content">
      <div className="bc-log-entries">
        {LOG_ENTRIES.map((entry, i) => (
          <div key={i} className="bc-log-entry">
            <div className={`bc-log-dot ${entry.type}`} />
            <div className="bc-log-body">
              <div className={`bc-log-action ${entry.type}`}>{entry.action}</div>
              <div className="bc-log-job">{entry.job}</div>
              <div className="bc-log-detail">
                {entry.detail.split('·').map((part, j) => {
                  const trimmed = part.trim();
                  const isCategory = trimmed.startsWith('Category:');
                  const checkOrCross = entry.ok ? '✓' : '✗';
                  const className = entry.ok ? 'bc-log-ok' : 'bc-log-bad';
                  return (
                    <span key={j}>
                      {j > 0 && ' · '}
                      {isCategory ? (
                        <span>
                          {trimmed} <span className={className}>{checkOrCross}</span>
                        </span>
                      ) : trimmed}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="bc-log-time">{entry.time}</div>
          </div>
        ))}
      </div>

      <div className="bc-log-footer">
        <Link to="/bid-log" className="bc-log-link">View full bid log →</Link>
      </div>
    </div>
  </div>
);

export default BehaviourLogCard;
