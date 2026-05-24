import { useState } from 'react';

const AutoBiddingToggle = ({ isEnabled, onToggle, onToast }) => {
  const [confirmVisible, setConfirmVisible] = useState(false);

  const handleTrackClick = () => {
    if (isEnabled) {
      // Show inline confirmation before pausing
      setConfirmVisible(true);
    } else {
      // Resume immediately — no confirmation
      onToggle(true);
      onToast('✓ Auto-bidding resumed. Your Bidder Agent is active.');
    }
  };

  const handleConfirmPause = () => {
    setConfirmVisible(false);
    onToggle(false);
    onToast('Auto-bidding paused. Your agent will resume when you turn it back on.');
  };

  const handleCancelPause = () => {
    setConfirmVisible(false);
  };

  return (
    <div className="bc-card">
      <div className="bc-card-header">
        <div className="bc-card-title">Auto-bidding</div>
      </div>

      <div className="bc-toggle-content">
        <div className="bc-toggle-main">
          <div
            className={`bc-toggle-track${isEnabled ? ' on' : ''}`}
            onClick={handleTrackClick}
            role="switch"
            aria-checked={isEnabled}
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && handleTrackClick()}
          >
            <div className="bc-toggle-thumb" />
          </div>
          <div className="bc-toggle-label-group">
            <div className="bc-toggle-label">
              Auto-bidding {isEnabled ? 'ON' : 'PAUSED'}
            </div>
            <div className="bc-toggle-sub">
              {isEnabled
                ? 'Your Bidder Agent is actively evaluating and bidding on jobs.'
                : 'Your Bidder Agent is monitoring but not placing bids. Evaluations are still logged.'}
            </div>
          </div>
        </div>

        {/* Inline confirmation — shown when trying to pause */}
        {confirmVisible && (
          <div className="bc-toggle-confirm">
            <div className="bc-toggle-confirm-title">Pause auto-bidding?</div>
            <div className="bc-toggle-confirm-sub">
              Your Bidder Agent will stop placing bids. You can resume at any time.
            </div>
            <div className="bc-toggle-confirm-actions">
              <button className="btn-bc-pause" onClick={handleConfirmPause}>
                Pause bidding
              </button>
              <button className="btn-bc-cancel-sm" onClick={handleCancelPause}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Paused warning banner */}
        {!isEnabled && (
          <div className="bc-paused-banner">
            ⚠ Auto-bidding is paused — you are not earning while paused.
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoBiddingToggle;
