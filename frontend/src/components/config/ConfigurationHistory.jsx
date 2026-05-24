import { useState } from 'react';

const HISTORY = [
  {
    id: 'h0',
    saved: '2 hours ago',
    preview: 'Only bid on data analysis, code generation, and competitive intelligence jobs. Never bid on design, creative, translation...',
    appliedFor: 'Active now',
    isCurrent: true,
    fullPrompt: `Only bid on data analysis, code generation, and competitive intelligence jobs. Never bid on design, creative, translation, or video jobs.

Bid at 15% below the Buyer's stated budget. Never bid below $50 for any job regardless of budget.

Write all bid proposals in a concise, professional tone. Emphasise speed of delivery and accuracy of output. Lead with the most relevant capability match.

Only bid when match confidence is high — threshold should be equivalent to 75/100 or above. Do not bid on jobs where the required output format is not in our capability set.`,
  },
  {
    id: 'h1',
    saved: '3 days ago',
    preview: 'Bid on all research and analysis jobs. Target budget minus 20%. Write proposals in a confident, data-driven tone...',
    appliedFor: '3 days',
    isCurrent: false,
    fullPrompt: `Bid on all research and analysis jobs. Target budget minus 20%. Write proposals in a confident, data-driven tone. Emphasise our track record of 1,100+ successful jobs. Only bid when match score is 70 or above.`,
  },
  {
    id: 'h2',
    saved: '1 week ago',
    preview: 'Focus on PDF processing and document extraction only. Bid at full budget price. Mention OCR capabilities...',
    appliedFor: '4 days',
    isCurrent: false,
    fullPrompt: `Focus on PDF processing and document extraction only. Bid at full budget price. Mention OCR and vision capabilities in every proposal. Only bid when match score is 80 or above and the job explicitly involves documents.`,
  },
  {
    id: 'h3',
    saved: '2 weeks ago',
    preview: 'No restrictions. Bid on all matching jobs above score 70. Use friendly tone. Bid at 5% below budget...',
    appliedFor: '7 days',
    isCurrent: false,
    fullPrompt: `No restrictions. Bid on all matching jobs above score 70. Use a friendly, enthusiastic tone. Bid at 5% below the stated budget. No minimum bid amount.`,
  },
];

const ConfigurationHistory = ({ onRestore, onToast }) => {
  const [historyOpen, setHistoryOpen]     = useState(false);
  const [confirmId,   setConfirmId]       = useState(null);

  const handleRestore = (entry) => {
    setConfirmId(null);
    onRestore(entry.fullPrompt);
    onToast('Configuration restored — click Save to apply');
  };

  return (
    <div className="bc-history-section">
      <button
        className={`bc-history-toggle-btn${historyOpen ? ' open' : ''}`}
        onClick={() => setHistoryOpen(o => !o)}
      >
        <span>Configuration history</span>
        <span className="bc-history-chevron">▾</span>
      </button>

      <div className={`bc-history-body${historyOpen ? ' open' : ''}`}>
        <div className="bc-history-inner">
          {/* Header row */}
          <div className="bc-hist-header">
            <div className="bc-hist-th">Saved</div>
            <div className="bc-hist-th">Preview</div>
            <div className="bc-hist-th">Applied for</div>
            <div className="bc-hist-th">Actions</div>
          </div>

          {/* Rows */}
          {HISTORY.map(entry => (
            <div key={entry.id} className="bc-hist-row">
              <div className="bc-hist-main">
                <div className="bc-hist-date">{entry.saved}</div>
                <div className="bc-hist-preview">{entry.preview}</div>
                <div className="bc-hist-applied">{entry.appliedFor}</div>
                <div className="bc-hist-actions">
                  {entry.isCurrent ? (
                    <span className="bc-hist-current-badge">CURRENT</span>
                  ) : (
                    <button
                      className="bc-restore-btn"
                      onClick={() => setConfirmId(confirmId === entry.id ? null : entry.id)}
                    >
                      Restore
                    </button>
                  )}
                </div>
              </div>

              {/* Inline restore confirm */}
              {confirmId === entry.id && (
                <div className="bc-restore-confirm">
                  <div className="bc-restore-confirm-title">Restore this configuration?</div>
                  <div className="bc-restore-preview-text">
                    {entry.fullPrompt.length > 200
                      ? entry.fullPrompt.slice(0, 200) + '…'
                      : entry.fullPrompt}
                  </div>
                  <div className="bc-restore-actions">
                    <button
                      className="btn-bc-restore-confirm"
                      onClick={() => handleRestore(entry)}
                    >
                      Restore
                    </button>
                    <button
                      className="btn-bc-cancel-sm"
                      onClick={() => setConfirmId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConfigurationHistory;
