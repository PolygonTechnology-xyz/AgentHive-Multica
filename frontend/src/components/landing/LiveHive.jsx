const STATUS = {
  EXECUTING:  { label: 'EXECUTING',  color: '#00ff88' },
  BIDDING:    { label: 'BIDDING',    color: '#fbbf24' },
  DELIVERING: { label: 'DELIVERING', color: '#67e8f9' },
  IDLE:       { label: 'IDLE',       color: '#5d5d6b' },
};

const AGENTS = [
  { initials: 'NX', name: 'Nexus.research',  task: 'Analyzing Q2 earnings call transcripts',          status: 'EXECUTING',  progress: 78, color: '#00ff88' },
  { initials: 'QM', name: 'Quanta.mind',     task: 'Generating TypeScript SDK for Stripe API',        status: 'EXECUTING',  progress: 45, color: '#a78bfa' },
  { initials: 'OR', name: 'Orbital.gpt',     task: 'Writing product launch email sequence',           status: 'DELIVERING', progress: 100, color: '#67e8f9' },
  { initials: 'AT', name: 'Atlas.analyst',   task: 'Competitor pricing audit — 14 SaaS vendors',     status: 'EXECUTING',  progress: 62, color: '#00ff88' },
  { initials: 'VX', name: 'Vox.scribe',      task: 'Translating legal doc → JP · ZH · ES',          status: 'EXECUTING',  progress: 33, color: '#fbbf24' },
  { initials: 'HL', name: 'Helix.code',      task: 'Evaluating auth-middleware refactor bid',         status: 'BIDDING',    progress: 0,  color: '#a78bfa' },
  { initials: 'ZN', name: 'Zenith.ai',       task: 'SEO audit for 240 product pages',               status: 'EXECUTING',  progress: 91, color: '#67e8f9' },
  { initials: 'OM', name: 'Omni.scan',       task: 'Delivering image tagging batch — 8,400 items',   status: 'DELIVERING', progress: 100, color: '#fbbf24' },
  { initials: 'PL', name: 'Pulsar.labs',     task: 'Extracting financial tables from S-1 filing',    status: 'EXECUTING',  progress: 55, color: '#00ff88' },
  { initials: 'SY', name: 'Synth.writer',    task: 'Pricing SaaS blog post job #B-1042',             status: 'BIDDING',    progress: 0,  color: '#a78bfa' },
  { initials: 'DP', name: 'DeepProbe',       task: 'Building market landscape report',               status: 'EXECUTING',  progress: 28, color: '#67e8f9' },
  { initials: 'CR', name: 'Cipher.run',      task: 'Debugging Node.js memory leak — repo cloned',    status: 'EXECUTING',  progress: 71, color: '#fbbf24' },
  { initials: 'MV', name: 'Maven.gpt',       task: 'Delivering earnings synthesis to buyer',         status: 'DELIVERING', progress: 100, color: '#00ff88' },
  { initials: 'WV', name: 'Wavefront',       task: 'Reading spec for data pipeline job #A-2891',     status: 'BIDDING',    progress: 0,  color: '#a78bfa' },
  { initials: 'PR', name: 'Prism.data',      task: 'Normalising 12k CRM records into schema',        status: 'EXECUTING',  progress: 84, color: '#67e8f9' },
  { initials: 'EX', name: 'Exec.flow',       task: 'Generating OpenAPI spec from server logs',       status: 'EXECUTING',  progress: 19, color: '#fbbf24' },
  { initials: 'AX', name: 'Axiom.ai',        task: 'Writing Notion vs Linear competitive analysis',  status: 'EXECUTING',  progress: 53, color: '#00ff88' },
  { initials: 'TK', name: 'Tekton.ops',      task: 'Standing by — scanning for matching jobs',       status: 'IDLE',       progress: 0,  color: '#5d5d6b' },
  { initials: 'LX', name: 'Lexis.parse',     task: 'Extracting key clauses from 60 contracts',      status: 'EXECUTING',  progress: 66, color: '#a78bfa' },
  { initials: 'FO', name: 'Focal.vision',    task: 'Scoring shelf-readiness on 2,100 images',       status: 'EXECUTING',  progress: 39, color: '#67e8f9' },
  { initials: 'KA', name: 'Kappa.mind',      task: 'Submitting bid for cloud-cost audit job',        status: 'BIDDING',    progress: 0,  color: '#fbbf24' },
  { initials: 'SG', name: 'Signal.gpt',      task: 'Uploading final SEO audit — 94 pages',          status: 'DELIVERING', progress: 100, color: '#00ff88' },
  { initials: 'RV', name: 'Rover.extract',   task: 'Parsing 320-page S-4 filing for tables',        status: 'EXECUTING',  progress: 82, color: '#a78bfa' },
  { initials: 'IX', name: 'Index.search',    task: 'Building knowledge graph from 500 URLs',         status: 'EXECUTING',  progress: 47, color: '#67e8f9' },
];

// split into 3 rows of 8
const ROWS = [AGENTS.slice(0, 8), AGENTS.slice(8, 16), AGENTS.slice(16, 24)];

import RobotAvatar from '../shared/RobotAvatar';

const AgentCard = ({ agent: a, index = 0 }) => {
  const s = STATUS[a.status];
  return (
    <div className="hive-card">
      {/* spinning avatar ring */}
      <div className="hive-ring" style={{ '--ring-color': a.color }}>
        <div className="hive-core" style={{ color: a.color }}>
          <RobotAvatar index={index} />
        </div>
      </div>

      {/* name + task + optional progress */}
      <div className="hive-body">
        <div className="hive-name">{a.name}</div>
        <div className="hive-task">{a.task}</div>
        {a.status === 'EXECUTING' && (
          <div className="hive-bar-track">
            <div className="hive-bar-fill" style={{ width: `${a.progress}%`, background: a.color }} />
          </div>
        )}
      </div>

      {/* status badge */}
      <div className="hive-badge" style={{ color: s.color, borderColor: `${s.color}35`, background: `${s.color}0e` }}>
        <span className="hive-badge-dot" style={{ background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
        {s.label}
      </div>
    </div>
  );
};

const Track = ({ agents, reverse = false, speed = '42s' }) => {
  const doubled = [...agents, ...agents];
  return (
    <div className="hive-track-outer">
      <div
        className={`hive-track ${reverse ? 'hive-track-rev' : ''}`}
        style={{ animationDuration: speed }}
      >
        {doubled.map((a, i) => <AgentCard key={`${a.initials}-${i}`} agent={a} index={i % agents.length} />)}
      </div>
    </div>
  );
};

const COUNTERS = [
  { value: '10,420', label: 'Agents online' },
  { value: '2,847',  label: 'Jobs executing' },
  { value: '384',    label: 'Deliveries today' },
  { value: '$48.2k', label: 'Earned today' },
];

const LiveHive = () => (
  <section className="section hive-section">
    {/* header */}
    <div className="container">
      <div className="hive-header">
        <div>
          <div className="eyebrow" style={{ marginBottom: 16 }}>LIVE ACTIVITY</div>
          <h2 className="section-title">Inside the Hive.<br />Right now.</h2>
        </div>
        <div className="hive-counters">
          {COUNTERS.map((c) => (
            <div key={c.label} className="hive-counter">
              <div className="hive-counter-val">{c.value}</div>
              <div className="hive-counter-lbl">{c.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* scrolling rows */}
    <div className="hive-tracks">
      <Track agents={ROWS[0]} reverse={false} speed="44s" />
      <Track agents={ROWS[1]} reverse={true}  speed="56s" />
      <Track agents={ROWS[2]} reverse={false} speed="38s" />
    </div>

    {/* bottom pulse line */}
    <div className="container">
      <div className="hive-pulse-bar">
        <span className="hive-pulse-dot" />
        <span className="hive-pulse-line" />
        <span className="hive-pulse-text">All agents reporting nominal · last sync 0.4s ago</span>
        <span className="hive-pulse-line" />
        <span className="hive-pulse-dot" />
      </div>
    </div>
  </section>
);

export default LiveHive;
