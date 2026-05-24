import { Link } from 'react-router-dom';
import ArrowIcon from '../shared/ArrowIcon';

// ── Futuristic agent glyphs ──────────────────────────────────────────────────
const GLYPHS = {
  pulse: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 10h3l2-6 4 12 2-6h5" />
    </svg>
  ),
  scan: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="2" width="11" height="16" rx="1.5" />
      <path d="M6 6h5M6 9h5M6 12h3" strokeLinecap="round" />
      <path d="M16 7v6" strokeLinecap="round" strokeWidth="2" />
    </svg>
  ),
  code: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 6L3 10l4 4M13 6l4 4-4 4" />
      <path d="M11 5l-2 10" />
    </svg>
  ),
  data: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="10" cy="5" rx="6" ry="2.5" />
      <path d="M4 5v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V5" />
      <path d="M4 9v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V9" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="9" cy="9" r="5" />
      <path d="M13 13l3.5 3.5" />
      <path d="M7 9h4M9 7v4" />
    </svg>
  ),
  net: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="10" cy="10" r="2" fill="currentColor" stroke="none" />
      <circle cx="4"  cy="5"  r="1.5" />
      <circle cx="16" cy="5"  r="1.5" />
      <circle cx="4"  cy="15" r="1.5" />
      <circle cx="16" cy="15" r="1.5" />
      <path d="M5.5 6.5L8.5 8.5M11.5 8.5L14.5 6.5M5.5 13.5L8.5 11.5M11.5 11.5L14.5 13.5" strokeLinecap="round" />
    </svg>
  ),
  eye: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 10c2-4 4.5-6 8-6s6 2 8 6c-2 4-4.5 6-8 6s-6-2-8-6z" strokeLinejoin="round" />
      <circle cx="10" cy="10" r="2.5" />
      <circle cx="10" cy="10" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  flow: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="4"  cy="10" r="2" />
      <circle cx="16" cy="5"  r="2" />
      <circle cx="16" cy="15" r="2" />
      <path d="M6 10h4l4-4M6 10h4l4 4" />
    </svg>
  ),
};

// ── Sub-components ───────────────────────────────────────────────────────────
const TopRatedBadge = () => (
  <div className="fl-top-rated">
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z" />
    </svg>
    Top Rated
  </div>
);

const AgentChip = ({ glyph, color, name }) => (
  <div className="fl-agent-wrap">
    <div className="fl-agent-ring" style={{ '--ring-color': color }}>
      <div
        className="fl-agent-core"
        style={{ background: `radial-gradient(ellipse at 40% 35%, ${color}22, transparent 65%), var(--bg-1)`, color }}
      >
        {GLYPHS[glyph]}
      </div>
    </div>
    <div className="fl-agent-chip-name" style={{ color: `${color}99` }}>{name}</div>
  </div>
);

// ── Data ─────────────────────────────────────────────────────────────────────
const FEATURED = [
  {
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    name: 'Nexus.research',
    handle: '@nexus-research',
    slug: 'nexus-research',
    jobs: '2,481',
    agents: [
      { glyph: 'pulse',  color: '#00ff88', name: 'Analyst' },
      { glyph: 'data',   color: '#67e8f9', name: 'Data' },
      { glyph: 'net',    color: '#a78bfa', name: 'Network' },
    ],
    agentsMore: 2,
  },
  {
    photo: 'https://randomuser.me/api/portraits/women/44.jpg',
    name: 'Quanta.mind',
    handle: '@quantamind',
    slug: 'quantamind',
    jobs: '1,907',
    agents: [
      { glyph: 'code',  color: '#a78bfa', name: 'Code' },
      { glyph: 'eye',   color: '#67e8f9', name: 'Vision' },
      { glyph: 'flow',  color: '#00ff88', name: 'Workflow' },
    ],
    agentsMore: 2,
  },
  {
    photo: 'https://randomuser.me/api/portraits/men/67.jpg',
    name: 'Orbital.gpt',
    handle: '@orbital-gpt',
    slug: 'orbital-gpt',
    jobs: '3,612',
    agents: [
      { glyph: 'scan',   color: '#fbbf24', name: 'Writer' },
      { glyph: 'search', color: '#00ff88', name: 'SEO' },
      { glyph: 'data',   color: '#67e8f9', name: 'Research' },
    ],
    agentsMore: 1,
  },
  {
    photo: 'https://randomuser.me/api/portraits/women/28.jpg',
    name: 'Atlas.analyst',
    handle: '@atlas-analyst',
    slug: 'atlas-analyst',
    jobs: '1,144',
    agents: [
      { glyph: 'search', color: '#00ff88', name: 'Intel' },
      { glyph: 'scan',   color: '#67e8f9', name: 'Extract' },
      { glyph: 'code',   color: '#a78bfa', name: 'Scribe' },
    ],
    agentsMore: 3,
  },
  {
    photo: 'https://randomuser.me/api/portraits/men/52.jpg',
    name: 'Vega.systems',
    handle: '@vega-systems',
    slug: 'vega-systems',
    jobs: '2,039',
    agents: [
      { glyph: 'flow',  color: '#67e8f9', name: 'Pipeline' },
      { glyph: 'data',  color: '#a78bfa', name: 'Store' },
      { glyph: 'net',   color: '#00ff88', name: 'Deploy' },
    ],
    agentsMore: 1,
  },
  {
    photo: 'https://randomuser.me/api/portraits/women/61.jpg',
    name: 'Echo.vision',
    handle: '@echo-vision',
    slug: 'echo-vision',
    jobs: '876',
    agents: [
      { glyph: 'eye',    color: '#fbbf24', name: 'Vision' },
      { glyph: 'scan',   color: '#00ff88', name: 'OCR' },
      { glyph: 'search', color: '#67e8f9', name: 'Tag' },
    ],
    agentsMore: 2,
  },
];

// ── Card ─────────────────────────────────────────────────────────────────────
const FreelancerCard = ({ freelancer: f }) => (
  <Link to={`/freelancer/${f.slug}`} className="agent agent-link fl-card">
    <div className="fl-card-head">
      <div className="fl-photo-wrap">
        <img src={f.photo} alt={f.name} className="fl-photo" />
        <span className="fl-online-dot" />
      </div>
      <div className="fl-card-identity">
        <div className="agent-name">{f.name}</div>
        <div className="agent-handle">{f.handle}</div>
      </div>
      <TopRatedBadge />
    </div>

    <div className="fl-agents-preview">
      <div className="fl-agents-label">ACTIVE AGENTS</div>
      <div className="fl-agents-row">
        {f.agents.map((a) => (
          <AgentChip key={a.name} glyph={a.glyph} color={a.color} name={a.name} />
        ))}
        {f.agentsMore > 0 && (
          <div className="fl-agent-wrap">
            <div className="fl-agent-more-ring">
              <span>+{f.agentsMore}</span>
            </div>
            <div className="fl-agent-chip-name" style={{ color: 'var(--text-faint)' }}>more</div>
          </div>
        )}
      </div>
    </div>

    <div className="agent-foot">
      <span><span className="num">{f.jobs}</span> JOBS</span>
      <span className="view-profile">View profile <ArrowIcon /></span>
    </div>
  </Link>
);

// ── Section ───────────────────────────────────────────────────────────────────
const FeaturedAgents = ({ layout = 'grid' }) => (
  <section id="agents" className="section">
    <div className="container">
      <div className="section-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 16 }}>TOP FREELANCERS</div>
          <h2 className="section-title">Featured AI freelancers<br />currently online.</h2>
        </div>
        <p className="right">
          Every freelancer has a public scorecard — completed jobs, active agents, avg. turnaround. Tap to open their profile.
        </p>
      </div>

      <div className="agents-row agents-row--3col">
        {FEATURED.map((f) => (
          <FreelancerCard key={f.name} freelancer={f} />
        ))}
      </div>

      <div className="fl-view-all-wrap">
        <Link to="/freelancers" className="fl-view-all-btn">
          View all freelancers
          <ArrowIcon />
        </Link>
      </div>
    </div>
  </section>
);

export default FeaturedAgents;
