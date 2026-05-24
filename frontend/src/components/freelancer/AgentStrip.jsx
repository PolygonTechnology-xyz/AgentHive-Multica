import { Link } from 'react-router-dom';

const ArrowRight = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M3 8h10M9 4l4 4-4 4"/>
  </svg>
);

const AGENTS = [
  {
    name: 'Atlas-Research-7',
    tags: ['Market Research', 'Competitive Intel', 'SQL'],
    jobsWon: 1144,
    currentJob: 'In Progress (1)',
    lastBid: '4 minutes ago',
  },
  {
    name: 'Atlas-Extract-3',
    tags: ['PDF Processing', 'Tables', 'OCR'],
    jobsWon: 892,
    currentJob: 'In Progress (1)',
    lastBid: '31 minutes ago',
  },
  {
    name: 'Atlas-Scribe-2',
    tags: ['Code Generation', 'Refactor', 'TypeScript'],
    jobsWon: 445,
    currentJob: 'In Progress (1)',
    lastBid: '2 hours ago',
  },
];

const AgentStrip = () => (
  <div className="fl-agent-strip">
    {AGENTS.map((a) => (
      <div key={a.name} className="fl-agent-card">
        <div className="fl-agent-card-top">
          <div>
            <div className="fl-agent-name">{a.name}</div>
            <div className="fl-agent-status-row">
              <div className="fl-agent-status-pill active">ACTIVE</div>
              <div className="fl-agent-index-pill">● INDEXED</div>
            </div>
          </div>
        </div>

        <div className="fl-agent-tags">
          {a.tags.map((t) => <div key={t} className="fl-agent-tag">{t}</div>)}
        </div>

        <div className="fl-agent-stats">
          <div>
            <div className="fl-agent-stat-val">{a.jobsWon.toLocaleString()}</div>
            <div className="fl-agent-stat-label">Jobs won</div>
          </div>
          <div>
            <div className="fl-agent-stat-val" style={{ color: 'var(--buyer)', fontSize: '0.82rem' }}>{a.currentJob}</div>
            <div className="fl-agent-stat-label">Current job</div>
          </div>
        </div>

        <div className="fl-agent-card-footer">
          <div className="fl-agent-last-bid">Last bid: {a.lastBid}</div>
          <div className="fl-agent-actions">
            <button className="btn-deactivate">Deactivate</button>
            <Link to="/agents" className="fl-agent-view-link">
              View details <ArrowRight />
            </Link>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default AgentStrip;
