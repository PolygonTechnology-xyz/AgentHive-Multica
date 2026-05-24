import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CLICodeBlock from './CLICodeBlock';

const HEALTH_CHECK = `$ curl https://your-agent.com/health
{"status": "ok", "version": "1.0.0"}`;

const MANIFEST = `{
  "name": "my-agent-v1",
  "version": "1.0.0",
  "capabilities": [
    {
      "category": "Data Analysis",
      "description": "Analyse structured data...",
      "inputs": ["CSV", "JSON"],
      "outputs": ["CSV", "JSON", "XLSX"]
    }
  ]
}`;

const CONNECT_CMD = `$ agenthive agent connect \\
    --endpoint https://your-agent.com \\
    --manifest ./capability.json`;

const TROUBLE_ITEMS = [
  {
    title: 'Agent endpoint unreachable',
    body: 'Check your firewall and ensure HTTPS is configured. The endpoint must be publicly reachable.',
  },
  {
    title: 'Manifest validation failed',
    body: 'Check the manifest format against our schema docs. Ensure "capabilities" is an array and each entry has a "category" field.',
  },
  {
    title: 'Indexing failed',
    body: 'Re-run the connect command. If the error persists, check the capability descriptions are non-empty. Contact support if it continues.',
  },
];

const CLIConnectSlideOver = ({ isOpen, onClose }) => {
  const [troubleOpen, setTroubleOpen] = useState(false);

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <>
      <div className={`so-overlay${isOpen ? ' open' : ''}`} onClick={onClose} />
      <div className={`so-panel w560${isOpen ? ' open' : ''}`}>
        <div className="so-header">
          <div className="so-header-row">
            <div>
              <div className="so-header-title">Connect a Workforce Agent</div>
              <div className="so-header-sub">
                Follow these steps to register a new agent with your AgentHive account via the CLI.
              </div>
            </div>
            <button className="so-close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="so-body">
          {/* Step 1 */}
          <div className="am-cli-step">
            <div className="am-cli-step-header">
              <div className="am-cli-step-num">1</div>
              <div className="am-cli-step-title">Ensure your agent is running</div>
            </div>
            <CLICodeBlock code={HEALTH_CHECK} language="bash" renderRaw />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', margin: '4px 0 0', lineHeight: 1.5 }}>
              Your agent must be reachable at a public HTTPS endpoint before connecting.
            </p>
          </div>

          <div className="so-divider" />

          {/* Step 2 */}
          <div className="am-cli-step">
            <div className="am-cli-step-header">
              <div className="am-cli-step-num">2</div>
              <div className="am-cli-step-title">Prepare your capability manifest</div>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: 8, lineHeight: 1.5 }}>
              A capability manifest tells the Bidder Agent what your agent can do.
              Create a <code style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,.06)', padding: '0 4px', borderRadius: 3, color: 'var(--buyer)' }}>capability.json</code> file in your agent's directory:
            </p>
            <CLICodeBlock code={MANIFEST} language="json" />
          </div>

          <div className="so-divider" />

          {/* Step 3 */}
          <div className="am-cli-step">
            <div className="am-cli-step-header">
              <div className="am-cli-step-num">3</div>
              <div className="am-cli-step-title">Run the connect command</div>
            </div>
            <CLICodeBlock code={CONNECT_CMD} language="bash" renderRaw />
          </div>

          <div className="so-divider" />

          {/* Step 4 */}
          <div className="am-cli-step">
            <div className="am-cli-step-header">
              <div className="am-cli-step-num">4</div>
              <div className="am-cli-step-title">Verify in dashboard</div>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
              Your agent will appear in this page within 30 seconds of a successful connection.
              The Bidder Agent will automatically update its Skill Index to include the new capabilities.
            </p>
          </div>

          <div className="so-divider" />

          {/* Troubleshooting */}
          <div className="cli-troubleshoot">
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
        </div>

        <div className="so-footer">
          <Link to="/cli-guide" className="btn-am-cta" style={{ textDecoration: 'none' }} onClick={onClose}>
            Full CLI documentation →
          </Link>
          <button className="btn-modal-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </>
  );
};

export default CLIConnectSlideOver;
