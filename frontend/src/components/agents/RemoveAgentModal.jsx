import { useState } from 'react';

const RemoveAgentModal = ({ agent, hasActiveJobs, blockingJobs = [], isOpen, onConfirm, onCancel }) => {
  const [loading, setLoading] = useState(false);
  if (!isOpen || !agent) return null;

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onConfirm(agent);
    }, 1500);
  };

  /* Blocked state — agent has in-progress jobs */
  if (hasActiveJobs && blockingJobs.length > 0) {
    return (
      <div className="am-modal-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
        <div className="am-modal">
          <div className="am-modal-icon grey">✕</div>
          <div className="am-modal-title">Cannot remove {agent.name}</div>
          <div className="am-modal-sub">
            This agent has {blockingJobs.length} job{blockingJobs.length !== 1 ? 's' : ''} currently
            in progress. You must wait for all active jobs to complete before removing this agent.
          </div>

          <div className="am-impact-card">
            <div className="am-impact-row">
              <div className="am-impact-row-title">Blocking jobs</div>
              {blockingJobs.map((job, i) => (
                <div key={i} className="am-impact-row-body" style={{ marginTop: 4 }}>
                  "{job.title}" — {job.status} · {job.timeRemaining}
                </div>
              ))}
            </div>
          </div>

          <div className="am-modal-actions">
            <button className="btn-modal-cancel" onClick={onCancel} style={{ maxWidth: 'none', width: '100%' }}>
              OK, understood
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* Allowed removal */
  return (
    <div className="am-modal-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="am-modal">
        <div className="am-modal-icon red">🗑</div>
        <div className="am-modal-title">Permanently remove {agent.name}?</div>

        <div className="am-modal-warn-box red">
          This action cannot be undone. The agent's registration and all capability data will be
          permanently deleted from your account.
        </div>

        <div className="am-impact-card">
          <div className="am-impact-row">
            <div className="am-impact-row-title">Capabilities permanently removed</div>
            <div className="am-impact-tags">
              {agent.capabilities.map(cap => (
                <span key={cap} className="am-impact-tag">{cap}</span>
              ))}
            </div>
          </div>

          <div className="am-impact-divider" />

          <div className="am-impact-row">
            <div className="am-impact-row-title">Bidder Agent impact</div>
            <div className="am-impact-row-body">
              Will no longer bid on {agent.capabilities[0].toLowerCase()} jobs unless another
              agent with these capabilities is connected.
            </div>
          </div>

          <div className="am-impact-divider" />

          <div className="am-impact-row">
            <div className="am-impact-row-title">Jobs affected: 0</div>
            <div className="am-impact-row-body">No active jobs — safe to remove.</div>
          </div>
        </div>

        <div style={{ fontSize: '0.73rem', color: 'var(--text-3)', lineHeight: 1.55 }}>
          To use this agent again, you'll need to re-run:{' '}
          <code style={{
            fontFamily: 'JetBrains Mono, monospace',
            background: 'rgba(255,255,255,.06)',
            borderRadius: 4,
            padding: '1px 6px',
            color: 'var(--buyer)',
          }}>agenthive agent connect</code>
        </div>

        <div className="am-modal-actions">
          <button
            className="btn-modal-primary red"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="am-spinner" style={{ borderTopColor: '#fff' }} />
                Removing...
              </>
            ) : 'Permanently remove agent'}
          </button>
          <button className="btn-modal-cancel" onClick={onCancel}>
            Cancel — keep agent
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveAgentModal;
