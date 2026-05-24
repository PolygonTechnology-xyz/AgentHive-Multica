import { useState } from 'react';
import { Link } from 'react-router-dom';
import BudgetRangeSlider from './BudgetRangeSlider';

const ChevronIcon = ({ open }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    className={`jb-filter-chevron${open ? ' open' : ''}`}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const DEADLINE_OPTIONS = [
  { value: 'any',     label: 'Any deadline' },
  { value: 'today',   label: 'Today' },
  { value: '2days',   label: 'Within 2 days' },
  { value: '1week',   label: 'Within 1 week' },
  { value: '2weeks',  label: 'Within 2 weeks' },
];

const MATCH_OPTIONS = [
  { value: 'any',   label: 'Any match' },
  { value: '90',    label: 'High (90+)',     cls: 'jb-match-label-high' },
  { value: '75',    label: 'Good (75–89)',   cls: 'jb-match-label-good' },
  { value: '60',    label: 'Fair (60–74)',   cls: 'jb-match-label-fair' },
  { value: 'above60', label: 'All above 60' },
];

const ALL_CATEGORIES = [
  { key: 'Data Analysis',            capable: true  },
  { key: 'Code Generation',          capable: true  },
  { key: 'Document Processing',      capable: true  },
  { key: 'Competitive Intelligence', capable: true  },
  { key: 'Financial Analysis',       capable: true  },
  { key: 'Web Scraping',             capable: true  },
  { key: 'Design & Creative',        capable: false },
  { key: 'Translation',              capable: false },
  { key: 'Video & Audio',            capable: false },
];

const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="jb-filter-section">
      <div className="jb-filter-section-header" onClick={() => setOpen(o => !o)}>
        <span className="jb-filter-section-title">{title}</span>
        <ChevronIcon open={open} />
      </div>
      <div className={`jb-filter-body${open ? ' open' : ' closed'}`}>
        <div className="jb-filter-inner">
          {children}
        </div>
      </div>
    </div>
  );
};

const JobBoardFilters = ({ filters, onFilterChange, onClear, activeCount, mobileOpen, onMobileClose }) => {
  const handleCategory = (key, checked) => {
    const next = checked
      ? [...filters.categories, key]
      : filters.categories.filter(c => c !== key);
    onFilterChange({ ...filters, categories: next });
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && <div className="jb-sidebar-overlay open" onClick={onMobileClose} />}
      <div className={`jb-sidebar${mobileOpen ? ' mobile-open' : ''}`}>
      {/* Agent status card */}
      <div className="jb-agent-card">
        <div className="jb-agent-status-row">
          <div className="jb-agent-dot" />
          <span className="jb-agent-status-label">Bidder Agent ACTIVE</span>
        </div>
        <div className="jb-agent-sub">Auto-evaluating all jobs below</div>
        <div className="jb-agent-last">Last evaluation: 4 min ago</div>
        <Link to="/configuration" className="jb-agent-configure">
          → Configure
        </Link>
      </div>

      {/* Filter card */}
      <div className="jb-filter-card">
        {/* Search */}
        <div className="jb-search-wrap" style={{ paddingBottom: 14 }}>
          <svg className="jb-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            className="jb-search-input"
            placeholder="Search job titles and descriptions..."
            value={filters.search}
            onChange={e => onFilterChange({ ...filters, search: e.target.value })}
          />
          {filters.search && (
            <button
              className="jb-search-clear"
              onClick={() => onFilterChange({ ...filters, search: '' })}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Budget */}
        <FilterSection title="Budget">
          <BudgetRangeSlider
            value={filters.budget}
            onChange={budget => onFilterChange({ ...filters, budget })}
          />
        </FilterSection>

        {/* Deadline */}
        <FilterSection title="Deadline">
          <div className="jb-radio-list">
            {DEADLINE_OPTIONS.map(opt => (
              <label key={opt.value} className={`jb-radio-label${filters.deadline === opt.value ? ' selected' : ''}`}>
                <input
                  type="radio"
                  className="jb-radio-input"
                  name="deadline"
                  value={opt.value}
                  checked={filters.deadline === opt.value}
                  onChange={() => onFilterChange({ ...filters, deadline: opt.value })}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Match score */}
        <FilterSection title="Match score">
          <div style={{ fontSize: '0.73rem', color: 'var(--text-faint)', marginBottom: 10, lineHeight: 1.45 }}>
            Filter by estimated match with your agents
          </div>
          <div className="jb-radio-list">
            {MATCH_OPTIONS.map(opt => (
              <label key={opt.value} className={`jb-radio-label${filters.matchScore === opt.value ? ' selected' : ''}`}>
                <input
                  type="radio"
                  className="jb-radio-input"
                  name="matchScore"
                  value={opt.value}
                  checked={filters.matchScore === opt.value}
                  onChange={() => onFilterChange({ ...filters, matchScore: opt.value })}
                />
                <span className={opt.cls || ''}>{opt.label}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Category */}
        <FilterSection title="Category">
          <div className="jb-check-list">
            {ALL_CATEGORIES.map(cat => (
              <label
                key={cat.key}
                className={`jb-check-label${!cat.capable ? ' disabled' : ''}`}
              >
                <input
                  type="checkbox"
                  className="jb-check-input"
                  disabled={!cat.capable}
                  checked={filters.categories.includes(cat.key)}
                  onChange={e => cat.capable && handleCategory(cat.key, e.target.checked)}
                />
                {cat.key}
              </label>
            ))}
          </div>
          <div className="jb-cap-note">
            Connect an agent with these capabilities to bid on greyed-out jobs.{' '}
            <Link to="/agents">Manage agents →</Link>
          </div>
        </FilterSection>

        {/* Already bid toggle */}
        <FilterSection title="Your bids">
          <div className="jb-toggle-row">
            <span className="jb-toggle-text">Hide jobs you've already bid on</span>
            <label className="jb-toggle">
              <input
                type="checkbox"
                className="jb-toggle-input"
                checked={filters.hideBid}
                onChange={e => onFilterChange({ ...filters, hideBid: e.target.checked })}
              />
              <span className="jb-toggle-track" />
            </label>
          </div>
        </FilterSection>

        {/* Footer */}
        <div className="jb-filter-footer">
          <button className="jb-clear-filters" onClick={onClear}>
            Clear all filters
          </button>
          {activeCount > 0 && (
            <span className="jb-active-filters-badge">Active filters: {activeCount}</span>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default JobBoardFilters;
