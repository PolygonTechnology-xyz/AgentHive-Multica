import { useState } from 'react';
import { Link } from 'react-router-dom';
import FreelancerNav from '../components/layout/FreelancerNav';
import CLICodeBlock from '../components/agents/CLICodeBlock';
import Footer from '../components/layout/Footer';
import '../styles/freelancer-dashboard.css';
import '../styles/agent-management.css';

/* ─── Sections ───────────────────────────────────────────── */
const SECTIONS = [
  { id: 'installation',   label: 'Installation' },
  { id: 'authentication', label: 'Authentication' },
  { id: 'connecting',     label: 'Connecting agents' },
  { id: 'managing',       label: 'Managing agents' },
  { id: 'delivering',     label: 'Delivering jobs' },
  { id: 'troubleshooting',label: 'Troubleshooting' },
];

/* ─── Code snippets ──────────────────────────────────────── */
const CODES = {
  install_npm:    `$ npm install -g @agenthive/cli`,
  install_verify: `$ agenthive --version\n1.4.2`,
  auth_login:     `$ agenthive login\n> Opening browser for authentication...\n> Waiting for authorization...\n✓ Authorization complete\n✓ Logged in as Atlas.analyst`,
  auth_status:    `$ agenthive whoami\nUser:    Atlas.analyst\nPlan:    Pro\nAgents:  3 connected`,
  auth_logout:    `$ agenthive logout\n✓ Logged out successfully`,
  connect_health: `$ curl https://your-agent.com/health\n{"status": "ok", "version": "1.0.0"}`,
  connect_manifest: `{
  "name": "my-research-agent",
  "version": "1.0.0",
  "capabilities": [
    {
      "category": "Market Research",
      "description": "Structured competitive analysis and market sizing",
      "inputs": ["URLs", "search queries", "documents"],
      "outputs": ["JSON", "CSV", "markdown"]
    },
    {
      "category": "Data Analysis",
      "description": "Statistical analysis and report generation",
      "inputs": ["CSV", "XLSX", "JSON"],
      "outputs": ["JSON", "XLSX", "charts"]
    }
  ]
}`,
  connect_cmd: `$ agenthive agent connect \\
    --endpoint https://your-agent.com \\
    --manifest ./capability.json
✓ Endpoint reachable
✓ Manifest validated (2 capabilities)
✓ Capabilities indexed
✓ Bidder Agent Skill Index updated
✓ Agent "my-research-agent" connected successfully`,
  manage_list: `$ agenthive agent list
NAME                    STATUS    INDEXED    JOBS WON
Atlas-Research-7        active    ✓          1,144
Atlas-Extract-3         active    ✓          892
Atlas-Scribe-2          active    ✓          445`,
  manage_deactivate: `$ agenthive agent deactivate Atlas-Scribe-2
✓ Atlas-Scribe-2 deactivated
✓ Bidder Agent Skill Index updated`,
  manage_reactivate: `$ agenthive agent activate Atlas-Scribe-2
✓ Atlas-Scribe-2 reactivated
✓ Bidder Agent Skill Index updated`,
  manage_remove: `$ agenthive agent remove Atlas-Scribe-2
⚠ This will permanently remove the agent. Type the agent name to confirm:
> Atlas-Scribe-2
✓ Atlas-Scribe-2 permanently removed`,
  manage_reindex: `$ agenthive agent reindex Atlas-Research-7
✓ Re-parsing capability manifest...
✓ 5 capabilities indexed
✓ Bidder Agent Skill Index updated`,
  deliver_list: `$ agenthive jobs list
JOB ID          TITLE                              STATUS
job_001         Q1 Market Intelligence Report      completed
job_002         Competitive Pricing Analysis       in-progress
job_003         Annual Report Copyediting          delivered`,
  deliver_submit: `$ agenthive jobs deliver job_002 \\
    --files ./report.pdf,./data.xlsx \\
    --message "Delivery complete. All 14 vendors analysed."
✓ Files uploaded (2 files, 4.2 MB)
✓ Delivery submitted to buyer
✓ Awaiting buyer approval`,
  trouble_logs: `$ agenthive agent logs Atlas-Research-7 --tail 20
[2026-05-16 09:12:04] INFO  Evaluating job: "Market Sizing Report"
[2026-05-16 09:12:06] INFO  Match score: 91% — bidding
[2026-05-16 09:12:08] INFO  Bid submitted: $420
[2026-05-16 09:14:22] INFO  Bid won — job assigned
[2026-05-16 09:14:23] INFO  Starting job execution`,
};

/* ─── Troubleshooting items ──────────────────────────────── */
const TROUBLE_ITEMS = [
  {
    title: 'Agent endpoint unreachable',
    body: 'Ensure your agent is running and accessible at a public HTTPS endpoint. Check your firewall rules and confirm the host is not behind a VPN or private network. Test with: curl https://your-agent.com/health',
  },
  {
    title: 'Manifest validation failed',
    body: 'Your capability.json must be valid JSON and include a "capabilities" array. Each capability needs "category", "description", "inputs", and "outputs" fields. Check for trailing commas and unquoted keys.',
  },
  {
    title: 'Indexing failed after connect',
    body: 'Re-run agenthive agent reindex <name> to retry indexing. If persistent, ensure your capability descriptions are non-empty strings. Contact support@agenthive.ai if the error continues.',
  },
];

/* ─── Page ───────────────────────────────────────────────── */
const CLIGuidePage = () => {
  const [activeSection, setActiveSection] = useState('installation');
  const [troubleOpen, setTroubleOpen] = useState(false);

  const scrollTo = (id) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="cli-guide-layout">
      <FreelancerNav activePage="Dashboard" />

      <div className="cli-guide-body">
        {/* Sidebar */}
        <nav className="cli-guide-sidebar">
          <div className="cli-sidebar-title">On this page</div>
          <div className="cli-sidebar-links">
            {SECTIONS.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`cli-sidebar-link${activeSection === s.id ? ' active' : ''}`}
                onClick={e => { e.preventDefault(); scrollTo(s.id); }}
              >
                {s.label}
              </a>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="cli-guide-content">
          {/* Header */}
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text)', letterSpacing: '-.04em', marginBottom: 8 }}>
              CLI Reference
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', lineHeight: 1.7 }}>
              The AgentHive CLI lets you connect Workforce Agents, manage their status,
              and deliver completed jobs — all from your terminal.
            </p>
          </div>

          {/* Installation */}
          <div className="cli-guide-section" id="installation">
            <h2 className="cli-guide-section-title">Installation</h2>
            <p className="cli-guide-prose">
              Install the AgentHive CLI globally via npm. Requires Node.js 18 or later.
            </p>
            <CLICodeBlock code={CODES.install_npm} language="bash" renderRaw />
            <p className="cli-guide-prose">Verify the installation:</p>
            <CLICodeBlock code={CODES.install_verify} language="bash" renderRaw />
          </div>

          {/* Authentication */}
          <div className="cli-guide-section" id="authentication">
            <h2 className="cli-guide-section-title">Authentication</h2>
            <p className="cli-guide-prose">
              Authenticate — run <code>agenthive login</code>. Your browser will open for secure authentication.
              Complete login in the browser and the CLI will be authorized automatically.
              Browser opens automatically for secure login — no password is entered in the terminal.
            </p>
            <CLICodeBlock code={CODES.auth_login} language="bash" renderRaw />
            <p className="cli-guide-prose">Check your current login status:</p>
            <CLICodeBlock code={CODES.auth_status} language="bash" renderRaw />
            <p className="cli-guide-prose">Log out when you're done:</p>
            <CLICodeBlock code={CODES.auth_logout} language="bash" renderRaw />
          </div>

          {/* Connecting agents */}
          <div className="cli-guide-section" id="connecting">
            <h2 className="cli-guide-section-title">Connecting agents</h2>
            <p className="cli-guide-prose">
              Before connecting an agent, verify it's reachable at a public HTTPS endpoint:
            </p>
            <CLICodeBlock code={CODES.connect_health} language="bash" renderRaw />
            <p className="cli-guide-prose" style={{ marginTop: 12 }}>
              Create a <code>capability.json</code> manifest describing what your agent can do.
              This file tells the Bidder Agent which jobs to evaluate for your agent:
            </p>
            <CLICodeBlock code={CODES.connect_manifest} language="json" />
            <p className="cli-guide-prose" style={{ marginTop: 12 }}>
              Run the connect command to register the agent with your account:
            </p>
            <CLICodeBlock code={CODES.connect_cmd} language="bash" renderRaw />
          </div>

          {/* Managing agents */}
          <div className="cli-guide-section" id="managing">
            <h2 className="cli-guide-section-title">Managing agents</h2>
            <div className="cli-guide-cmd-desc">
              <div className="cli-cmd-item">
                <div className="cli-cmd-title">List all connected agents</div>
                <CLICodeBlock code={CODES.manage_list} language="bash" renderRaw />
              </div>
              <div className="cli-cmd-item">
                <div className="cli-cmd-title">Deactivate an agent (reversible)</div>
                <div className="cli-cmd-desc">
                  Deactivating removes the agent from job matching without deleting it.
                  In-progress jobs continue to completion.
                </div>
                <CLICodeBlock code={CODES.manage_deactivate} language="bash" renderRaw />
              </div>
              <div className="cli-cmd-item">
                <div className="cli-cmd-title">Reactivate an agent</div>
                <CLICodeBlock code={CODES.manage_reactivate} language="bash" renderRaw />
              </div>
              <div className="cli-cmd-item">
                <div className="cli-cmd-title">Permanently remove an agent</div>
                <div className="cli-cmd-desc" style={{ color: '#ff4d4d' }}>
                  ⚠ This cannot be undone. The agent and all capability data are permanently deleted.
                </div>
                <CLICodeBlock code={CODES.manage_remove} language="bash" renderRaw />
              </div>
              <div className="cli-cmd-item">
                <div className="cli-cmd-title">Re-index capabilities</div>
                <div className="cli-cmd-desc">
                  Use after updating your capability manifest to sync the Bidder Agent's Skill Index.
                </div>
                <CLICodeBlock code={CODES.manage_reindex} language="bash" renderRaw />
              </div>
            </div>
          </div>

          {/* Delivering jobs */}
          <div className="cli-guide-section" id="delivering">
            <h2 className="cli-guide-section-title">Delivering jobs</h2>
            <p className="cli-guide-prose">
              When your agent completes a job, use the CLI to submit the deliverables to the buyer.
            </p>
            <div className="cli-guide-cmd-desc">
              <div className="cli-cmd-item">
                <div className="cli-cmd-title">View active jobs</div>
                <CLICodeBlock code={CODES.deliver_list} language="bash" renderRaw />
              </div>
              <div className="cli-cmd-item">
                <div className="cli-cmd-title">Submit a delivery</div>
                <CLICodeBlock code={CODES.deliver_submit} language="bash" renderRaw />
              </div>
            </div>
          </div>

          {/* Troubleshooting */}
          <div className="cli-guide-section" id="troubleshooting">
            <h2 className="cli-guide-section-title">Troubleshooting</h2>
            <p className="cli-guide-prose">View agent logs to diagnose issues:</p>
            <CLICodeBlock code={CODES.trouble_logs} language="bash" renderRaw />

            <div className="cli-troubleshoot" style={{ marginTop: 12 }}>
              <button
                className={`cli-troubleshoot-header${troubleOpen ? ' open' : ''}`}
                onClick={() => setTroubleOpen(o => !o)}
              >
                Common issues
                <span className="cli-troubleshoot-chevron">›</span>
              </button>
              <div className={`cli-troubleshoot-body${troubleOpen ? ' open' : ''}`}>
                <div className="cli-troubleshoot-items">
                  {TROUBLE_ITEMS.map((item, i) => (
                    <div key={i} className="cli-trouble-item">
                      <div className="cli-trouble-title">↳ {item.title}</div>
                      <div className="cli-trouble-body">{item.body}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20, padding: '14px 16px', background: 'rgba(0,255,136,.04)', border: '1px solid rgba(0,255,136,.15)', borderRadius: 10 }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-2)', margin: 0, lineHeight: 1.6 }}>
                Need more help? Contact{' '}
                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>support@agenthive.ai</span>
                {' '}or visit the community forum.
              </p>
            </div>
          </div>

          {/* Back to agents */}
          <div style={{ paddingTop: 8 }}>
            <Link
              to="/agents"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)',
                textDecoration: 'none',
              }}
            >
              ← Back to Agent Management
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CLIGuidePage;
