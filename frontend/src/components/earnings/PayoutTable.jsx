import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

/* ── Data ───────────────────────────────────────────────────── */
export const PAYOUT_DATA = [
  { id: 'p1',  date: 'May 09, 2026', job: 'Build OpenAPI client for Stripe wrapper',                    gross: 1840, commission: 276,  net: 1564, ref: 'PPY-2026-8821' },
  { id: 'p2',  date: 'May 04, 2026', job: 'Extract 500 product specs from manufacturer PDFs',           gross: 1200, commission: 180,  net: 1020, ref: 'PPY-2026-8756' },
  { id: 'p3',  date: 'Apr 28, 2026', job: 'Competitive intelligence: 12 B2B SaaS companies',            gross: 2100, commission: 315,  net: 1785, ref: 'PPY-2026-8690' },
  { id: 'p4',  date: 'Apr 21, 2026', job: 'Tag 4,200 product images with shelf-readiness scores',       gross: 1100, commission: 165,  net: 935,  ref: 'PPY-2026-8621' },
  { id: 'p5',  date: 'Apr 15, 2026', job: 'Generate Python ETL pipeline for data warehouse',            gross: 1500, commission: 225,  net: 1275, ref: 'PPY-2026-8544' },
  { id: 'p6',  date: 'Apr 09, 2026', job: 'Market sizing report: Southeast Asian fintech sector',       gross: 3200, commission: 480,  net: 2720, ref: 'PPY-2026-8477' },
  { id: 'p7',  date: 'Apr 02, 2026', job: 'Extract structured tables from 180-page annual report',      gross: 680,  commission: 102,  net: 578,  ref: 'PPY-2026-8401' },
  { id: 'p8',  date: 'Mar 26, 2026', job: 'Build TypeScript SDK with full test coverage',               gross: 1840, commission: 276,  net: 1564, ref: 'PPY-2026-8322' },
  { id: 'p9',  date: 'Mar 19, 2026', job: 'Analyze 800 customer support tickets by category',           gross: 580,  commission: 87,   net: 493,  ref: 'PPY-2026-8245' },
  { id: 'p10', date: 'Mar 12, 2026', job: 'Competitor pricing matrix: 22 enterprise SaaS vendors',      gross: 1050, commission: 158,  net: 893,  ref: 'PPY-2026-8168' },
];

const PAGE_SIZE = 10;
const TOTAL_PAYOUTS = 106;

const DATE_RANGES = [
  'Last 7 days',
  'Last 30 days',
  'Last 3 months',
  'Last 6 months',
  'All time',
];

/* ── Copy icon ──────────────────────────────────────────── */
const CopyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7,10 12,15 17,10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

/* ── CopyableRef ────────────────────────────────────────── */
const CopyableRef = ({ text, onToast }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    onToast?.(`${text} copied`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span className="er-ref-wrap">
      {text}
      <span
        className={`er-copy-icon${copied ? ' copied' : ''}`}
        onClick={handleCopy}
        title="Copy reference"
      >
        {copied ? '✓' : <CopyIcon />}
      </span>
    </span>
  );
};

/* ── PayoutTable ─────────────────────────────────────────── */
const PayoutTable = ({ onRowClick, onToast }) => {
  const [dateRange, setDateRange] = useState('Last 30 days');
  const [search,    setSearch]    = useState('');
  const [page,      setPage]      = useState(1);

  /* Filter by search term */
  const filtered = PAYOUT_DATA.filter(p =>
    p.job.toLowerCase().includes(search.toLowerCase())
  );

  /* Pagination (cosmetic for demo — we only have 10 rows) */
  const totalShown = Math.min(filtered.length, PAGE_SIZE);
  const pageRows   = filtered.slice(0, totalShown);

  /* Page-visible totals */
  const totGross = pageRows.reduce((s, p) => s + p.gross, 0);
  const totComm  = pageRows.reduce((s, p) => s + p.commission, 0);
  const totNet   = pageRows.reduce((s, p) => s + p.net, 0);

  const handleInvoice = useCallback((e, payout) => {
    e.stopPropagation();
    onToast?.(`Invoice ${payout.ref} downloaded`);
  }, [onToast]);

  return (
    <div className="er-payout-card">
      <div className="er-payout-card-header">
        <div className="er-payout-card-title">Payout history</div>
        <div className="er-payout-card-sub">All confirmed payouts to your Ppay account</div>
      </div>

      {/* Filter bar */}
      <div className="er-filter-bar">
        <select
          className="er-date-select"
          value={dateRange}
          onChange={e => { setDateRange(e.target.value); setPage(1); }}
        >
          {DATE_RANGES.map(r => <option key={r}>{r}</option>)}
        </select>
        <input
          className="er-search-input"
          placeholder="Search job titles…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {/* Table */}
      <div className="er-table-wrap">
        <table className="er-table">
          <thead>
            <tr className="er-thead-row">
              <th className="er-th">Date</th>
              <th className="er-th">Job</th>
              <th className="er-th">Gross</th>
              <th className="er-th">Commission</th>
              <th className="er-th">Net payout</th>
              <th className="er-th">Ppay Ref</th>
              <th className="er-th">Invoice</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map(payout => (
              <tr
                key={payout.id}
                className="er-row"
                onClick={() => onRowClick?.(payout)}
              >
                <td className="er-td er-td-date">{payout.date}</td>
                <td className="er-td er-td-job">
                  <Link
                    to="/jobs/freelancer"
                    onClick={e => e.stopPropagation()}
                  >{payout.job}</Link>
                </td>
                <td className="er-td er-td-gross">${payout.gross.toLocaleString()}</td>
                <td className="er-td er-td-comm">
                  −${payout.commission.toLocaleString()}
                  <span className="er-td-comm-pct">(15%)</span>
                </td>
                <td className="er-td er-td-net">${payout.net.toLocaleString()}</td>
                <td className="er-td er-td-ref">
                  <CopyableRef text={payout.ref} onToast={onToast} />
                </td>
                <td className="er-td">
                  <button
                    className="er-invoice-btn"
                    onClick={e => handleInvoice(e, payout)}
                    title={`Download invoice ${payout.ref}`}
                  >
                    <DownloadIcon />
                  </button>
                </td>
              </tr>
            ))}

            {/* Totals row */}
            <tr className="er-totals-row">
              <td colSpan={2}>
                <span className="er-totals-label">Totals (page)</span>
              </td>
              <td className="er-totals-gross">${totGross.toLocaleString()}</td>
              <td className="er-totals-comm">−${totComm.toLocaleString()}</td>
              <td className="er-totals-net">${totNet.toLocaleString()}</td>
              <td colSpan={2} />
            </tr>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="er-pagination">
        <div className="er-pagination-info">
          Showing 1–{totalShown} of {search ? totalShown : TOTAL_PAYOUTS} payouts
        </div>
        <div className="er-pagination-btns">
          <button className="er-page-btn" disabled>← Prev</button>
          <button className="er-page-btn active">1</button>
          <button className="er-page-btn">2</button>
          <button className="er-page-btn">3</button>
          <span style={{ color: 'var(--text-3)', fontSize: '0.78rem', alignSelf: 'center', padding: '0 4px' }}>…</span>
          <button className="er-page-btn">11</button>
          <button className="er-page-btn">Next →</button>
        </div>
      </div>
    </div>
  );
};

export default PayoutTable;
