import { useState } from 'react';

const DeactivateAgentModal = ({ agent, remainingActiveCount, isOpen, onConfirm, onCancel }) => {
  const [loading, setLoading] = useState(false);
  if (!isOpen || !agent) return null;

  const dormancyWarning = remainingActiveCount - 1 === 0;

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onConfirm(agent);
    }, 1500);
  };

  if (dormancyWarning) {
    return (
      <div className="am-modal-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
        <div className="am-modal">
          <div className="am-modal-icon red">🚫</div>
          <div className="am-modal-title">This will make your Bidder Agent dormant</div>
          <div className="am-modal-sub">
            Deactivating {agent.name} would leave you with 0 active agents.
            Your Bidder Agent will stop bidding entirely until you reactivate or add a new agent.
          </div>

          <div className="am-modal-warn-box red">
            ⚠ With no active agents, your Skill Index will be empty and no jobs can be matched.
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
                  Deactivating...
                </>
              ) : 'Deactivate anyway'}
            </button>
            <button className="btn-modal-cancel" onClick={onCancel}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="am-modal-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="am-modal">
        <div className="am-modal-icon amber">⚠</div>
        <div className="am-modal-title">Deactivate {agent.name}?</div>
        <div className="am-modal-sub">
          Deactivating this agent will remove it from job matching. Your Bidder Agent
          will stop bidding on jobs that match this agent's capabilities.
        </div>

        <div className="am-impact-card">
          <div className="am-impact-row">
            <div className="am-impact-row-title">Capabilities removed from Skill Index</div>
            <div className="am-impact-tags">
              {agent.capabilities.map(cap => (
                <span key={cap} className="am-impact-tag">{cap}</span>
              ))}
            </div>
          </div>

          <div className="am-impact-divider" />

          <div className="am-impact-row">
            <div className="am-impact-row-title">Active jobs affected: {agent.activeJobs || 1}</div>
            <div className="am-impact-row-body">
              {agent.currentJob
                ? `"${agent.currentJob.title}" — this job will not be affected. In-progress jobs complete normally.`
                : 'No active jobs will be affected.'}
            </div>
          </div>

          <div className="am-impact-divider" />

          <div className="am-impact-row">
            <div className="am-impact-row-title">Bidder Agent impact</div>
            <div className="am-impact-row-body">
              Will continue bidding using your {remainingActiveCount - 1} remaining active agent{remainingActiveCount - 1 !== 1 ? 's' : ''}.
            </div>
          </div>
        </div>

        <div className="am-modal-warn-box green">
          ✓ Deactivation is reversible. You can reactivate this agent at any time.
        </div>

        <div className="am-modal-actions">
          <button
            className="btn-modal-primary amber"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="am-spinner" style={{ borderTopColor: '#000' }} />
                Deactivating...
              </>
            ) : 'Deactivate agent'}
          </button>
          <button className="btn-modal-cancel" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default DeactivateAgentModal;
