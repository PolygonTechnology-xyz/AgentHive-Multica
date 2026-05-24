import { useMemo } from 'react';

/* ── Keyword maps ────────────────────────────────────────── */
const INCLUDE_KEYWORDS = [
  { key: 'data analysis',        label: 'Data Analysis' },
  { key: 'code generation',      label: 'Code Generation' },
  { key: 'code gen',             label: 'Code Generation' },
  { key: 'competitive intel',    label: 'Competitive Intel' },
  { key: 'competitive analysis', label: 'Competitive Intel' },
  { key: 'pdf processing',       label: 'PDF Processing' },
  { key: 'document parsing',     label: 'Document Parsing' },
  { key: 'document extraction',  label: 'Document Parsing' },
  { key: 'market research',      label: 'Market Research' },
  { key: 'financial analysis',   label: 'Financial Analysis' },
  { key: 'financial model',      label: 'Financial Analysis' },
  { key: 'research',             label: 'Research' },
  { key: 'sql',                  label: 'SQL & Data' },
  { key: 'web scraping',         label: 'Web Scraping' },
  { key: 'ocr',                  label: 'OCR / Vision' },
  { key: 'table extraction',     label: 'Table Extraction' },
];

const EXCLUDE_PATTERNS = ['never bid on', 'not bid on', 'avoid', 'exclude', 'no design', 'no creative'];
const EXCLUDE_KEYWORDS = ['design', 'creative', 'translation', 'video', '3d', 'animation', 'logo'];

const parsePrompt = (text) => {
  const lower = text.toLowerCase();

  // Detect excluded terms
  const excluded = new Set();
  EXCLUDE_KEYWORDS.forEach(kw => {
    EXCLUDE_PATTERNS.forEach(pat => {
      const idx = lower.indexOf(pat);
      if (idx !== -1) {
        const after = lower.slice(idx, idx + 120);
        if (after.includes(kw)) excluded.add(kw);
      }
    });
    // also check "never bid on X, Y, Z" broad net
    const neverIdx = lower.indexOf('never bid on');
    if (neverIdx !== -1) {
      const slice = lower.slice(neverIdx, neverIdx + 80);
      if (slice.includes(kw)) excluded.add(kw);
    }
  });

  // Included categories (not in excluded set)
  const categories = [];
  const seen = new Set();
  INCLUDE_KEYWORDS.forEach(({ key, label }) => {
    if (!seen.has(label) && lower.includes(key)) {
      // check if category word itself is excluded
      const isExcluded = EXCLUDE_KEYWORDS.some(ek => excluded.has(ek) && label.toLowerCase().includes(ek));
      if (!isExcluded) {
        categories.push(label);
        seen.add(label);
      }
    }
  });

  // Price strategy
  let priceStrategy = 'Not specified';
  const belowPct = lower.match(/(\d+)%\s*below/);
  if (belowPct) {
    priceStrategy = `${belowPct[1]}% below budget`;
    const minDollar = lower.match(/(?:never\s+(?:bid\s+)?below|minimum|min)\s+\$\s*(\d+)/);
    if (minDollar) priceStrategy += ` · Min $${minDollar[1]}`;
    else {
      const dollarMatch = lower.match(/\$\s*(\d+)/);
      if (dollarMatch) priceStrategy += ` · Min $${dollarMatch[1]}`;
    }
  } else if (lower.includes('at budget') || (lower.includes('stated budget') && !belowPct)) {
    priceStrategy = 'At stated budget';
  } else if (lower.includes('above budget')) {
    priceStrategy = 'Above stated budget';
  } else if (lower.includes('full budget')) {
    priceStrategy = 'At full budget price';
  }

  // Match threshold
  let threshold = null;
  const threshMatch = lower.match(/(\d{2,3})\s*(?:\/\s*100|or\s+above|minimum|and\s+above|%?\s+(?:or\s+)?above)/);
  if (threshMatch) threshold = Math.min(100, parseInt(threshMatch[1]));

  // Est. bids per day
  let bidsPerDay = 8;
  if (threshold !== null) {
    if (threshold >= 90) bidsPerDay = 3;
    else if (threshold >= 85) bidsPerDay = 5;
    else if (threshold >= 80) bidsPerDay = 6;
    else if (threshold <= 60) bidsPerDay = 14;
    else if (threshold <= 65) bidsPerDay = 12;
  }
  if (categories.length === 0) bidsPerDay = lower.length > 10 ? 2 : 8;
  else if (categories.length >= 6) bidsPerDay = Math.min(bidsPerDay + 3, 18);
  else if (categories.length <= 2) bidsPerDay = Math.max(bidsPerDay - 2, 2);

  return { categories, priceStrategy, threshold, bidsPerDay };
};

const ConfigurationImpactCard = ({ promptText = '' }) => {
  const { categories, priceStrategy, threshold, bidsPerDay } = useMemo(
    () => parsePrompt(promptText),
    [promptText]
  );

  const hasContent = promptText.trim().length > 10;

  return (
    <div className="bc-card">
      <div className="bc-card-header">
        <div>
          <div className="bc-card-title">Configuration impact</div>
          <div className="bc-card-sub">Based on your last 30 days of bid activity</div>
        </div>
      </div>

      <div className="bc-impact-content">
        {!hasContent ? (
          <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontStyle: 'italic' }}>
            Start typing your configuration to see the estimated impact.
          </div>
        ) : (
          <>
            {/* Top metrics */}
            <div className="bc-impact-metrics">
              <div className="bc-impact-metric">
                <div className="bc-impact-val">~{bidsPerDay}</div>
                <div className="bc-impact-metric-label">Est. bids per day</div>
              </div>
              <div className="bc-impact-metric">
                <div className="bc-impact-val">{threshold !== null ? `${threshold}` : '—'}</div>
                <div className="bc-impact-metric-label">Min match threshold</div>
              </div>
            </div>

            <div className="bc-impact-divider" />

            {/* Category focus */}
            <div>
              <div className="bc-impact-section-label">Category focus</div>
              <div className="bc-cat-chips">
                {categories.length > 0
                  ? categories.map(cat => (
                    <span key={cat} className="bc-cat-chip">{cat}</span>
                  ))
                  : <span className="bc-cat-none">No specific categories detected</span>
                }
              </div>
            </div>

            <div className="bc-impact-divider" />

            {/* Price strategy */}
            <div>
              <div className="bc-impact-section-label">Price strategy</div>
              <div className="bc-price-preview">{priceStrategy}</div>
            </div>

            {/* Match threshold bar */}
            {threshold !== null && (
              <>
                <div className="bc-impact-divider" />
                <div>
                  <div className="bc-impact-section-label">Match threshold</div>
                  <div className="bc-threshold-row">
                    <div className="bc-threshold-track">
                      <div className="bc-threshold-fill" style={{ width: `${threshold}%` }} />
                    </div>
                    <div className="bc-threshold-val">{threshold} / 100 min</div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        <div className="bc-impact-note">
          Impact preview is an estimate based on keyword analysis of your prompt.
          Actual behaviour depends on Bidder Agent interpretation.
        </div>
      </div>
    </div>
  );
};

export default ConfigurationImpactCard;
