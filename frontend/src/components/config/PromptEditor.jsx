import { useState, useEffect, useCallback } from 'react';

/* ── Icons ─────────────────────────────────────────────────── */
const icons = {
  speech: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  tag: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
  filter: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"/>
    </svg>
  ),
  target: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  play: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
    </svg>
  ),
  code: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <polyline points="16,18 22,12 16,6"/><polyline points="8,6 2,12 8,18"/>
    </svg>
  ),
};

const GUIDANCE_ITEMS = [
  { key: 'tone',       icon: icons.speech, title: 'Bidding tone & style',    example: '"Write proposals in a concise, technical tone. Lead with delivery speed."' },
  { key: 'price',      icon: icons.tag,    title: 'Price strategy',           example: '"Bid 10% below budget. Never go below $50. Add 20% for rush jobs."' },
  { key: 'categories', icon: icons.filter, title: 'Job categories',           example: '"Only bid on data analysis and code generation. Never bid on design jobs."' },
  { key: 'threshold',  icon: icons.target, title: 'Match threshold',          example: '"Only bid when highly confident. Skip jobs where match is below 80/100."' },
  { key: 'auto',       icon: icons.play,   title: 'Auto-bidding on/off',      example: '"Pause auto-bidding for the next 48 hours. Resume on Monday morning."' },
  { key: 'custom',     icon: icons.code,   title: 'Custom rules',             example: '"Never bid on jobs with deadlines under 6 hours. Always mention our 97% approval rate."' },
];

const EXAMPLES = [
  {
    title: 'Conservative',
    text: `Focus on high-value jobs only. Bid on data analysis, financial modeling, and code generation where budget exceeds $200. Bid at budget price — no discounts. Only submit when match score is 85 or above. Keep proposals under 3 sentences.`,
  },
  {
    title: 'Aggressive',
    text: `Bid on all data and code jobs regardless of budget. Undercut competitors by bidding 10% below stated budget. Minimum bid $30. Use a friendly, enthusiastic tone. Bid at any match score above 60.`,
  },
  {
    title: 'Selective',
    text: `Only bid on jobs that explicitly mention PDF processing, table extraction, or document parsing. Bid at full budget price. Emphasise our OCR and vision capabilities in every proposal. Threshold: 80 minimum.`,
  },
];

const MAX_LENGTH = 2000;

/* save phase: idle → saving → propagating → done → idle */
const PromptEditor = ({ currentPrompt, configState, onSave, onRestore, onLiveChange }) => {
  const [editText,      setEditText]      = useState(currentPrompt);
  const [savePhase,     setSavePhase]     = useState('idle');
  const [guidanceOpen,  setGuidanceOpen]  = useState(true);
  const [examplesOpen,  setExamplesOpen]  = useState(false);

  /* Sync when restored from history */
  useEffect(() => { setEditText(currentPrompt); }, [currentPrompt]);

  /* Beforeunload warning on unsaved changes */
  const hasChanges = editText !== currentPrompt;
  useEffect(() => {
    const handler = e => {
      if (hasChanges && savePhase === 'idle') {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Leave anyway?';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasChanges, savePhase]);

  const charCount = editText.length;
  const counterCls = charCount >= 1950 ? 'danger' : charCount >= 1800 ? 'warn' : '';

  const handleSave = useCallback(() => {
    if (savePhase !== 'idle') return;
    setSavePhase('saving');
    setTimeout(() => {
      setSavePhase('propagating');
      onSave(editText);
      setTimeout(() => {
        setSavePhase('done');
        setTimeout(() => setSavePhase('idle'), 3000);
      }, 2000);
    }, 1500);
  }, [savePhase, editText, onSave]);

  const handleReset = () => { setEditText(currentPrompt); };

  const useExample = (text) => { setEditText(text); onLiveChange?.(text); };

  /* Derived button state */
  const saveLabel = () => {
    if (savePhase === 'saving')      return <><div className="bc-save-spinner" /> Saving...</>;
    if (savePhase === 'propagating') return <><div className="bc-save-spinner" /> Propagating to Bidder Agent...</>;
    if (savePhase === 'done')        return <>✓ Configuration active</>;
    return 'Save configuration';
  };
  const saveCls = [
    'btn-bc-save',
    savePhase !== 'idle' ? savePhase : '',
    savePhase === 'idle' && hasChanges ? 'unsaved-state' : '',
  ].filter(Boolean).join(' ');

  const isSaveDisabled = savePhase !== 'idle' || (!hasChanges && savePhase === 'idle');

  return (
    <div className="bc-card">
      <div className="bc-card-header">
        <div className="bc-card-title">Configuration prompt</div>
        <div className="bc-card-header-meta">
          <div className={`bc-config-pill ${configState}`}>
            {configState === 'pending' && <div className="bc-prop-spinner" />}
            {configState.toUpperCase()}
          </div>
          <span>Last updated: 2 hours ago</span>
        </div>
      </div>

      {/* Current active prompt */}
      {currentPrompt ? (
        <div className="bc-current-prompt-wrap">
          <div className="bc-current-label-row">
            <div className="bc-current-dot" />
            <div className="bc-current-label-text">Currently active</div>
          </div>
          <div className="bc-current-prompt-text">{currentPrompt}</div>
        </div>
      ) : (
        <div className="bc-no-config-wrap">
          <div className="bc-no-config-icon">🤖</div>
          <div className="bc-no-config-title">No configuration set</div>
          <div className="bc-no-config-sub">
            Your Bidder Agent is using default behaviour: bidding on all matching jobs at the Buyer's
            stated budget. Add your first configuration below to customise its behaviour.
          </div>
        </div>
      )}

      {/* Edit area */}
      <div className="bc-edit-section">
        <div className="bc-edit-label">Update configuration</div>
        <div className="bc-edit-sub">
          Write new instructions in plain English. Your Bidder Agent will apply them to all subsequent job evaluations.
        </div>

        <div className="bc-textarea-container">
          <textarea
            className={`bc-textarea${hasChanges ? ' unsaved' : ''}`}
            value={editText}
            onChange={e => {
              const v = e.target.value.slice(0, MAX_LENGTH);
              setEditText(v);
              onLiveChange?.(v);
            }}
            placeholder="e.g. Only bid on data analysis jobs. Bid at 10% below the stated budget…"
            spellCheck={false}
          />
        </div>

        <div className="bc-textarea-meta">
          <div className={`bc-unsaved-indicator${hasChanges ? ' visible' : ''}`}>
            <div className="bc-unsaved-dot" />
            Unsaved changes
          </div>
          <div className={`bc-char-counter${counterCls ? ` ${counterCls}` : ''}`}>
            {charCount.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Propagation banner */}
      {(savePhase === 'propagating' || savePhase === 'done') && (
        <div className={`bc-prop-banner${savePhase === 'done' ? ' active' : ' pending'}`}>
          <div className={savePhase === 'pending' ? 'bc-prop-spinner' : ''} />
          {savePhase === 'propagating'
            ? '● Your configuration has been saved and is being applied to your Bidder Agent. This takes ~5 seconds.'
            : '● Configuration active — your Bidder Agent is now using the new instructions.'}
        </div>
      )}

      {/* Save area */}
      <div className="bc-save-area">
        <button
          className={saveCls}
          onClick={handleSave}
          disabled={isSaveDisabled}
        >
          {saveLabel()}
        </button>
        {hasChanges && savePhase === 'idle' && (
          <button className="btn-bc-reset" onClick={handleReset}>
            ↺ Reset to current
          </button>
        )}
      </div>

      {/* Guidance — collapsible */}
      <div className="bc-guidance-section">
        <button
          className={`bc-guidance-toggle${guidanceOpen ? ' open' : ''}`}
          onClick={() => setGuidanceOpen(o => !o)}
        >
          What you can configure
          <span className="bc-guidance-chevron">›</span>
        </button>
        <div className={`bc-guidance-body${guidanceOpen ? ' open' : ''}`}>
          <div className="bc-guidance-inner">
            <div className="bc-guidance-grid">
              {GUIDANCE_ITEMS.map(item => (
                <div key={item.key} className="bc-guidance-item">
                  <div className="bc-guidance-icon">{item.icon}</div>
                  <div className="bc-guidance-title">{item.title}</div>
                  <div className="bc-guidance-example">{item.example}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Examples — collapsible */}
      <div className="bc-examples-section">
        <button
          className="bc-examples-toggle"
          onClick={() => setExamplesOpen(o => !o)}
        >
          {examplesOpen ? '▴' : '▾'} Example configurations
        </button>
        <div className={`bc-examples-body${examplesOpen ? ' open' : ''}`}>
          <div className="bc-examples-inner">
            {EXAMPLES.map(ex => (
              <div key={ex.title} className="bc-example-card">
                <div className="bc-example-title-row">
                  <div className="bc-example-title">{ex.title}</div>
                  <button className="bc-use-btn" onClick={() => useExample(ex.text)}>
                    Use this →
                  </button>
                </div>
                <div className="bc-example-text">"{ex.text}"</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptEditor;
