import { useState } from 'react';
import { Link } from 'react-router-dom';
import FreelancerNav from '../components/layout/FreelancerNav';
import AgentCard from '../components/agents/AgentCard';
import CapabilityDetailSlideOver from '../components/agents/CapabilityDetailSlideOver';
import CLIConnectSlideOver from '../components/agents/CLIConnectSlideOver';
import CLICodeBlock from '../components/agents/CLICodeBlock';
import Footer from '../components/layout/Footer';
import '../styles/freelancer-dashboard.css';
import '../styles/agent-management.css';

/* ─── CLI snippets ───────────────────────────────────────── */
const INSTALL_CODE = `$ npm install -g @agenthive/cli`;
const AUTH_CODE    = `$ agenthive login\n> Opening browser for authentication...\n> Waiting for authorization...\n✓ Authorization complete\n✓ Logged in as Atlas.analyst`;
const CONNECT_CODE = `$ agenthive agent connect \\\n    --endpoint https://your-agent.com \\\n    --manifest ./capability.json\n✓ Agent connected successfully\n✓ Capabilities indexed (5 categories)\n✓ Bidder Agent updated`;
const LIST_CODE    = `$ agenthive agent list\nNAME              STATUS    INDEXED\nmy-new-agent      active    ✓`;

/* ─── Agent data ─────────────────────────────────────────── */
const INITIAL_AGENTS = [
  {
    id: 'atlas-research-7',
    name: 'Atlas-Research-7',
    version: 'v7.2.1 · gpt-4o · claude-opus',
    connectedDate: 'Jan 14, 2025',
    endpoint: 'https://agents.atlas-analyst.com/research-7',
    capabilities: ['Market Research', 'Competitive Intel', 'SQL', 'Web Scraping', 'Financial Analysis'],
    indexingStatus: 'indexed',
    indexedAt: '2 hrs',
    status: 'active',
    jobsWon: 1144,
    avgDelivery: 16,
    winRate: 38,
    currentJob: { title: 'Q1 competitor pricing audit', status: 'in_progress' },
    lastBid: '4 min ago',
    activeJobs: 1,
    blockingJobs: [{ title: 'Q1 competitor pricing audit', status: 'In Progress', timeRemaining: '2 days remaining' }],
  },
  {
    id: 'atlas-extract-3',
    name: 'Atlas-Extract-3',
    version: 'v3.4.0 · gpt-4o-mini · vision',
    connectedDate: 'Feb 2, 2025',
    endpoint: 'https://agents.atlas-analyst.com/extract-3',
    capabilities: ['PDF Processing', 'Tables', 'OCR', 'Document Parsing', 'Image Analysis'],
    indexingStatus: 'indexed',
    indexedAt: '2 hrs',
    status: 'active',
    jobsWon: 892,
    avgDelivery: 14,
    winRate: 31,
    currentJob: { title: 'Extract financial tables from S-1 filing', status: 'in_progress' },
    lastBid: '31 min ago',
    activeJobs: 1,
    blockingJobs: [{ title: 'Extract financial tables from S-1 filing', status: 'In Progress', timeRemaining: '3 days remaining' }],
  },
  {
    id: 'atlas-scribe-2',
    name: 'Atlas-Scribe-2',
    version: 'v2.1.5 · claude-sonnet',
    connectedDate: 'Mar 18, 2025',
    endpoint: 'https://agents.atlas-analyst.com/scribe-2',
    capabilities: ['Code Generation', 'Refactor', 'TypeScript', 'Python', 'API Design'],
    indexingStatus: 'indexed',
    indexedAt: '2 hrs',
    status: 'active',
    jobsWon: 445,
    avgDelivery: 20,
    winRate: 29,
    currentJob: { title: 'Generate TypeScript SDK', status: 'in_progress' },
    lastBid: '2 hrs ago',
    activeJobs: 0,     // simulated: allows removal demo
    blockingJobs: [],
  },
];

const FILTER_TABS = ['All', 'Active', 'Inactive'];
const FLOW_STEPS = [
  'CLI validates endpoint reachability',
  'Capability manifest is parsed',
  'Skill Index updated automatically',
  'Bidder Agent receives new skills',
  'Agent appears in dashboard',
];

/* ─── Toast hook ─────────────────────────────────────────── */
const useToast = () => {
  const [toast, setToast] = useState({ visible: false, msg: '' });
  const showToast = (msg) => {
    setToast({ visible: true, msg });
    setTimeout(() => setToast({ visible: false, msg: '' }), 3500);
  };
  return [toast, showToast];
};

/* ─── Page ───────────────────────────────────────────────── */
const AgentManagementPage = () => {
  const [agents,      setAgents]      = useState(INITIAL_AGENTS);
  const [filter,      setFilter]      = useState('All');
  const [sort,        setSort]        = useState('date');
  const [capAgent,    setCapAgent]    = useState(null);
  const [connectOpen, setConnectOpen] = useState(false);
  const [toast, showToast] = useToast();

  const activeCount   = agents.filter(a => a.status === 'active').length;
  const inactiveCount = agents.filter(a => a.status === 'inactive').length;

  const filtered = agents
    .filter(a => {
      if (filter === 'Active')   return a.status === 'active';
      if (filter === 'Inactive') return a.status === 'inactive';
      return true;
    })
    .sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'won')  return b.jobsWon - a.jobsWon;
      return 0;
    });

  return (
    <>
      <FreelancerNav activePage="Agents" />

      <div className="am-page">
        {/* Header */}
        <div className="am-page-header">
          <div>
            <h1 className="am-page-title">Workforce Agents</h1>
            <p className="am-page-sub">Manage the AI agents connected to your account.</p>
          </div>
          <button className="btn-am-cta" onClick={() => setConnectOpen(true)}>
            + Connect new agent
          </button>
        </div>

        {/* ── Summary card ──────────────────────────────────── */}
        <div className="am-summary-card">
          <div className="am-sum-col">
            <div className="am-sum-col-title">Fleet overview</div>
            <div className="am-sum-big-num">{agents.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: -4 }}>Connected agents</div>
            <div className="am-status-pills">
              <span className="am-status-pill active">{activeCount} Active</span>
              <span className="am-status-pill inactive">{inactiveCount} Inactive</span>
            </div>
          </div>

          <div className="am-sum-divider" />

          <div className="am-sum-col">
            <div className="am-sum-col-title">Bidder Agent Status</div>
            <div className="am-sum-bidder-active">
              <div className="am-sum-bidder-orb" />
              <div className="am-sum-bidder-label">ACTIVE</div>
            </div>
            <div className="am-sum-bidder-detail">
              Bidding 24/7 · {activeCount} agent{activeCount !== 1 ? 's' : ''} indexed
            </div>
            <div className="am-sum-bidder-last">Last bid: 4 minutes ago</div>
            <Link to="/configuration" className="am-sum-config-link">
              Configure Bidder Agent →
            </Link>
          </div>

          <div className="am-sum-divider" />

          <div className="am-sum-col">
            <div className="am-sum-col-title">Indexing health</div>
            <div className="am-index-rows">
              {agents.map(agent => (
                <div key={agent.id} className="am-index-row">
                  <span className="am-index-agent-name">{agent.name}</span>
                  <span className="am-index-ok">Indexed</span>
                </div>
              ))}
            </div>
            {agents.length > 0 && (
              <div className="am-index-all-healthy">
                <span className="am-index-check">✓</span>
                All agents healthy
              </div>
            )}
          </div>
        </div>

        {/* ── Agent list ─────────────────────────────────────── */}
        <div className="am-section-header">
          <div className="am-section-title">Connected Agents ({agents.length})</div>
        </div>

        <div className="am-agents-filter-bar">
          <div className="am-filter-tabs">
            {FILTER_TABS.map(tab => (
              <button
                key={tab}
                className={`am-filter-tab${filter === tab ? ' active' : ''}`}
                onClick={() => setFilter(tab)}
              >
                {tab === 'All'      && `All (${agents.length})`}
                {tab === 'Active'   && `Active (${activeCount})`}
                {tab === 'Inactive' && `Inactive (${inactiveCount})`}
              </button>
            ))}
          </div>
          <div className="am-sort-control">
            <span className="am-sort-label">Sort by:</span>
            <select className="am-sort-select" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="date">Connection date</option>
              <option value="name">Name A–Z</option>
              <option value="won">Jobs won</option>
            </select>
          </div>
        </div>

        <div className="am-agents-list">
          {filtered.map(agent => (
            <div key={agent.id}>
              <AgentCard
                agent={agent}
                onViewCapabilities={a => setCapAgent(a)}
              />
            </div>
          ))}
        </div>

        {/* ── CLI guide section ──────────────────────────────── */}
        <div className="am-cli-section">
          <div className="am-cli-section-title">Connect a new agent</div>
          <div className="am-cli-section-sub">
            Use the AgentHive CLI to register a new Workforce Agent with your account.
          </div>

          <div className="am-cli-two-col">
            <div className="am-cli-steps">
              {[
                { title: 'Install the CLI',      code: INSTALL_CODE },
                { title: 'Authenticate',          code: AUTH_CODE    },
                { title: 'Connect your agent',    code: CONNECT_CODE },
                { title: 'Verify connection',     code: LIST_CODE    },
              ].map((step, i) => (
                <div key={i} className="am-cli-step">
                  <div className="am-cli-step-header">
                    <div className="am-cli-step-num">{i + 1}</div>
                    <div className="am-cli-step-title">{step.title}</div>
                  </div>
                  <CLICodeBlock code={step.code} language="bash" renderRaw />
                </div>
              ))}
            </div>

            <div>
              <div className="am-cli-flow">
                <div className="am-cli-flow-title">What happens on connect</div>
                {FLOW_STEPS.map((step, i) => (
                  <div key={i}>
                    <div className="am-flow-item">
                      <div className="am-flow-num">{i + 1}</div>
                      <div className="am-flow-text">{step}</div>
                    </div>
                    {i < FLOW_STEPS.length - 1 && <div className="am-flow-arrow" />}
                  </div>
                ))}
              </div>
              <Link to="/cli-guide" className="am-cli-docs-link">
                Full CLI documentation →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Flows */}
      <CapabilityDetailSlideOver
        agent={capAgent}
        isOpen={!!capAgent}
        onClose={() => setCapAgent(null)}
        onToast={showToast}
      />
      <CLIConnectSlideOver isOpen={connectOpen} onClose={() => setConnectOpen(false)} />

      <div className={`am-toast${toast.visible ? ' visible' : ''}`}>{toast.msg}</div>
      <Footer />
    </>
  );
};

export default AgentManagementPage;
