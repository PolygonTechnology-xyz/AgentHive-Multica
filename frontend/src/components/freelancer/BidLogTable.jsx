import { useState, useEffect, useRef } from 'react';
import MatchScoreBar from './MatchScoreBar';
import BidOutcomeBadge from './BidOutcomeBadge';

/* ─── static dataset (15 entries) ─────────────────────────── */
const BASE_ENTRIES = [
  {
    id: 'b001', job: 'Q1 Market Intelligence Report', buyer: 'NovaCorp',
    category: 'Market Research', bidAmt: 285, outcome: 'won', status: 'completed',
    match: 94, agent: 'Atlas-Research-7', bidAt: '2 May 09:14',
    proposal: 'Atlas-Research-7 identified strong keyword overlap across 3 matching criteria. Bid set at $285 with a 2-day delivery estimate.',
    suppress: null, jobId: 'job_001',
  },
  {
    id: 'b002', job: 'SaaS Churn Prediction Model', buyer: 'PivotLabs',
    category: 'Data Science', bidAmt: 620, outcome: 'lost', status: null,
    match: 88, agent: 'Atlas-Research-7', bidAt: '30 Apr 14:22',
    proposal: 'Competitive bid at $620. Buyer selected a lower offer at $540.',
    suppress: null, jobId: null,
  },
  {
    id: 'b003', job: 'Legal Contract Summarisation (x40)', buyer: 'LexBridge',
    category: 'Legal AI', bidAmt: 0, outcome: 'suppressed', status: null,
    match: 61, agent: 'Atlas-Research-7', bidAt: '29 Apr 11:07',
    proposal: null,
    suppress: 'Match score 61% fell below your configured threshold of 70%. No bid submitted to protect win-rate.',
    jobId: null,
  },
  {
    id: 'b004', job: 'Competitive Pricing Analysis — Retail', buyer: 'ShelfIQ',
    category: 'Market Research', bidAmt: 410, outcome: 'won', status: 'in-progress',
    match: 91, agent: 'Atlas-Research-7', bidAt: '28 Apr 08:55',
    proposal: 'High-confidence match. Bid $410 with 3-day turnaround, citing 4 comparable jobs.',
    suppress: null, jobId: 'job_002',
  },
  {
    id: 'b005', job: 'Customer Sentiment Dashboard Build', buyer: 'PulseMetric',
    category: 'Data Viz', bidAmt: 750, outcome: 'submitted', status: 'pending',
    match: 83, agent: 'Atlas-Research-7', bidAt: '27 Apr 16:38',
    proposal: 'Bid submitted at $750. Awaiting buyer review.',
    suppress: null, jobId: null,
  },
  {
    id: 'b006', job: 'Annual Report Copyediting & Formatting', buyer: 'FinBridge',
    category: 'Document Processing', bidAmt: 190, outcome: 'won', status: 'delivered',
    match: 96, agent: 'Atlas-Scribe-2', bidAt: '25 Apr 10:12',
    proposal: 'Atlas-Scribe-2 matched on document processing criteria. Bid $190 with same-day delivery.',
    suppress: null, jobId: 'job_003',
  },
  {
    id: 'b007', job: 'Python Data Pipeline Refactor', buyer: 'StreamCore',
    category: 'Engineering', bidAmt: 0, outcome: 'suppressed', status: null,
    match: 55, agent: 'Atlas-Research-7', bidAt: '24 Apr 13:40',
    proposal: null,
    suppress: 'Engineering category not in your configured allowlist. Bid suppressed automatically.',
    jobId: null,
  },
  {
    id: 'b008', job: 'Brand Voice & Messaging Guide', buyer: 'Sprout Studio',
    category: 'Content Strategy', bidAmt: 340, outcome: 'lost', status: null,
    match: 77, agent: 'Atlas-Scribe-2', bidAt: '23 Apr 09:00',
    proposal: 'Bid $340. Buyer awarded to another agent at $295.',
    suppress: null, jobId: null,
  },
  {
    id: 'b009', job: 'E-commerce Product Description Bulk (200)', buyer: 'Trendly',
    category: 'Copywriting', bidAmt: 480, outcome: 'won', status: 'in-revision',
    match: 89, agent: 'Atlas-Scribe-2', bidAt: '21 Apr 11:27',
    proposal: 'Bulk copywriting match. Bid $480, 5-day estimate with 1 revision included.',
    suppress: null, jobId: 'job_004',
  },
  {
    id: 'b010', job: 'SEC Filing Extraction & Structuring', buyer: 'CapEdge',
    category: 'Financial AI', bidAmt: 530, outcome: 'submitted', status: 'pending',
    match: 86, agent: 'Atlas-Extract-3', bidAt: '20 Apr 15:50',
    proposal: 'Atlas-Extract-3 selected for high-precision extraction task. Bid $530.',
    suppress: null, jobId: null,
  },
  {
    id: 'b011', job: 'Multilingual FAQ Translation (DE/FR/ES)', buyer: 'GlobalServe',
    category: 'Translation', bidAmt: 0, outcome: 'suppressed', status: null,
    match: 68, agent: 'Atlas-Scribe-2', bidAt: '19 Apr 08:30',
    proposal: null,
    suppress: 'Translation jobs disabled in your configuration. Match score 68% also below threshold.',
    jobId: null,
  },
  {
    id: 'b012', job: 'Patent Landscape Report — Biotech', buyer: 'Helixara',
    category: 'Research', bidAmt: 820, outcome: 'won', status: 'completed',
    match: 93, agent: 'Atlas-Research-7', bidAt: '17 Apr 14:05',
    proposal: 'Strong research domain match. Won at $820 against 6 competitors.',
    suppress: null, jobId: null,
  },
  {
    id: 'b013', job: 'News Article Summarisation Pipeline', buyer: 'BrieflyAI',
    category: 'NLP', bidAmt: 290, outcome: 'lost', status: null,
    match: 80, agent: 'Atlas-Extract-3', bidAt: '15 Apr 10:48',
    proposal: 'Bid $290 at 80% confidence. Buyer chose an NLP-specialist agent.',
    suppress: null, jobId: null,
  },
  {
    id: 'b014', job: 'Financial Model Validation (DCF)', buyer: 'ValuEdge',
    category: 'Financial AI', bidAmt: 0, outcome: 'suppressed', status: null,
    match: 64, agent: 'Atlas-Extract-3', bidAt: '13 Apr 12:20',
    proposal: null,
    suppress: 'Low match score 64%. No bid submitted — threshold is 70%.',
    jobId: null,
  },
  {
    id: 'b015', job: 'UX Research Synthesis Report', buyer: 'FormLab',
    category: 'UX Research', bidAmt: 375, outcome: 'submitted', status: 'pending',
    match: 84, agent: 'Atlas-Research-7', bidAt: '11 Apr 17:05',
    proposal: 'Bid submitted at $375. Strong UX research keyword overlap.',
    suppress: null, jobId: null,
  },
];

const PAGE_SIZE = 8;

let simNextId = 100;
const SIM_POOL = [
  { job: 'Real-Time Analytics Dashboard Build', buyer: 'MetricFlow', category: 'Data Viz', match: 87, agent: 'Atlas-Research-7' },
  { job: 'Supply Chain Risk Assessment', buyer: 'LogiCore', category: 'Market Research', match: 92, agent: 'Atlas-Research-7' },
  { job: 'Customer Churn Prediction Brief', buyer: 'RetainIQ', category: 'Data Science', match: 79, agent: 'Atlas-Extract-3' },
  { job: 'Technical Blog Series (12 posts)', buyer: 'DevPulse', category: 'Copywriting', match: 85, agent: 'Atlas-Scribe-2' },
  { job: 'ESG Compliance Report — EMEA', buyer: 'GreenMark', category: 'Research', match: 91, agent: 'Atlas-Research-7' },
  { job: 'Podcast Transcript Cleanup (30hr)', buyer: 'SoundDoc', category: 'Document Processing', match: 72, agent: 'Atlas-Scribe-2' },
];
let simPool = 0;

const BidLogTable = ({ filter, outcomeFilter, page, onPageChange, onTotalChange, onJobClick }) => {
  const [entries, setEntries] = useState(BASE_ENTRIES);
  const [newId,   setNewId]   = useState(null);
  const [expanded, setExpanded] = useState(null);

  /* real-time simulation */
  useEffect(() => {
    const t = setInterval(() => {
      const src = SIM_POOL[simPool % SIM_POOL.length];
      simPool++;
      const outcome = Math.random() > 0.25 ? 'submitted' : 'suppressed';
      const newEntry = {
        id: `sim_${simNextId++}`,
        job: src.job, buyer: src.buyer, category: src.category,
        bidAmt: outcome === 'submitted' ? Math.floor(Math.random() * 600 + 150) : 0,
        outcome, status: outcome === 'submitted' ? 'pending' : null,
        match: src.match, agent: src.agent,
        bidAt: 'just now',
        proposal: outcome === 'submitted' ? `Agent evaluated criteria and submitted a competitive bid.` : null,
        suppress: outcome === 'suppressed' ? 'Match score below configured threshold. No bid submitted.' : null,
        jobId: null,
      };
      setNewId(newEntry.id);
      setEntries(prev => [newEntry, ...prev].slice(0, 50));
      setTimeout(() => setNewId(null), 1200);
    }, 10000);
    return () => clearInterval(t);
  }, []);

  /* filter */
  const filtered = entries.filter(e => {
    const textMatch =
      !filter ||
      e.job.toLowerCase().includes(filter.toLowerCase()) ||
      e.buyer.toLowerCase().includes(filter.toLowerCase()) ||
      e.category.toLowerCase().includes(filter.toLowerCase()) ||
      e.agent.toLowerCase().includes(filter.toLowerCase());
    const outcomeMatch = !outcomeFilter || outcomeFilter === 'all' || e.outcome === outcomeFilter;
    return textMatch && outcomeMatch;
  });

  useEffect(() => { onTotalChange(filtered.length); }, [filtered.length]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggle = id => setExpanded(prev => prev === id ? null : id);

  return (
    <>
      <table className="bl-table">
        <thead>
          <tr className="bl-thead-row">
            <th className="bl-th">Job</th>
            <th className="bl-th">Category</th>
            <th className="bl-th">Bid</th>
            <th className="bl-th">Match</th>
            <th className="bl-th">Outcome / Status</th>
            <th className="bl-th">Agent</th>
            <th className="bl-th">Submitted</th>
            <th className="bl-th bl-th-expand" />
          </tr>
        </thead>
        <tbody>
          {paginated.map(e => {
            const isNew  = e.id === newId;
            const isOpen = expanded === e.id;
            const rowCls = [
              'bl-row',
              e.outcome === 'won'        ? 'won'        : '',
              e.outcome === 'suppressed' ? 'suppressed' : '',
              e.outcome === 'lost'       ? 'lost'       : '',
              isNew                      ? 'new-entry'  : '',
            ].filter(Boolean).join(' ');

            return (
              <>
                <tr key={e.id} className={rowCls} onClick={() => toggle(e.id)}>
                  <td className="bl-td bl-td-job">
                    {e.jobId ? (
                      <button
                        className="bl-job-title bl-job-title-link"
                        onClick={(ev) => { ev.stopPropagation(); onJobClick?.(e); }}
                        title="View job details"
                      >
                        {e.job}
                      </button>
                    ) : (
                      <span className="bl-job-title bl-job-title-closed" title="This job is no longer active">
                        {e.job}
                        <span className="bl-closed-badge">closed</span>
                      </span>
                    )}
                    <span className="bl-job-buyer">{e.buyer}</span>
                  </td>
                  <td className="bl-td">
                    <span className="bl-category-tag">{e.category}</span>
                  </td>
                  <td className="bl-td bl-td-bid">
                    {e.bidAmt > 0 ? <span className="bl-bid-amt">${e.bidAmt}</span> : <span className="bl-bid-na">—</span>}
                  </td>
                  <td className="bl-td">
                    <MatchScoreBar score={e.match} />
                  </td>
                  <td className="bl-td">
                    <BidOutcomeBadge outcome={e.outcome} status={e.status} />
                  </td>
                  <td className="bl-td">
                    <span className="bl-agent-tag">{e.agent}</span>
                  </td>
                  <td className="bl-td bl-td-date">{e.bidAt}</td>
                  <td className="bl-td bl-td-chevron">
                    <span className={`bl-chevron ${isOpen ? 'open' : ''}`}>›</span>
                  </td>
                </tr>
                <tr key={`${e.id}-expand`} className="bl-expand-row">
                  <td colSpan={8} className="bl-expand-td">
                    <div className={`bl-expand-panel ${isOpen ? 'open' : ''}`}>
                      <div className="bl-expand-inner">
                        {e.outcome !== 'suppressed' && e.proposal && (
                          <div className="bl-proposal-box">
                            <div className="bl-expand-label">Agent Proposal</div>
                            <p className="bl-expand-text">{e.proposal}</p>
                          </div>
                        )}
                        {e.outcome === 'suppressed' && (
                          <div className="bl-suppress-detail-box">
                            <div className="bl-expand-label">Why Suppressed</div>
                            <p className="bl-expand-text">{e.suppress}</p>
                            <button className="bl-suppress-cta">Adjust Threshold</button>
                          </div>
                        )}
                        <div className="bl-expand-meta">
                          <div className="bl-meta-row">
                            <span className="bl-meta-label">Buyer</span>
                            <span className="bl-meta-val">{e.buyer}</span>
                          </div>
                          <div className="bl-meta-row">
                            <span className="bl-meta-label">Category</span>
                            <span className="bl-meta-val">{e.category}</span>
                          </div>
                          <div className="bl-meta-row">
                            <span className="bl-meta-label">Agent</span>
                            <span className="bl-meta-val">{e.agent}</span>
                          </div>
                          <div className="bl-meta-row">
                            <span className="bl-meta-label">Match Score</span>
                            <span className="bl-meta-val">{e.match}%</span>
                          </div>
                          {e.bidAmt > 0 && (
                            <div className="bl-meta-row">
                              <span className="bl-meta-label">Bid Amount</span>
                              <span className="bl-meta-val">${e.bidAmt}</span>
                            </div>
                          )}
                          {e.jobId && (
                            <div className="bl-meta-row">
                              <span className="bl-meta-label">Job ID</span>
                              <span className="bl-meta-val bl-job-link">{e.jobId}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </>
            );
          })}
          {paginated.length === 0 && (
            <tr>
              <td colSpan={8} className="bl-empty-row">No entries match your filter.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bl-pagination">
          <button
            className="bl-page-btn prev-next"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
          >← Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={`bl-page-btn ${p === page ? 'active' : ''}`}
              onClick={() => onPageChange(p)}
            >{p}</button>
          ))}
          <button
            className="bl-page-btn prev-next"
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
          >Next →</button>
        </div>
      )}
    </>
  );
};

export default BidLogTable;
