import { useState, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import BuyerNav from '../components/layout/BuyerNav';
import JobStatusBadge from '../components/jobs/JobStatusBadge';
import BidCard from '../components/bids/BidCard';
import ProfileSlideOver from '../components/bids/ProfileSlideOver';
import BidSelectionModal from '../components/bids/BidSelectionModal';
import PaymentStatusBanner from '../components/bids/PaymentStatusBanner';
import Breadcrumb from '../components/shared/Breadcrumb';
import '../styles/jobs.css';
import '../styles/bids.css';

const JOB_TITLE = 'Extract and normalize pricing data from 45 competitor websites';
const JOB_ID = 'JOB-001';

/* ── Icons ── */
const PaperclipIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
  </svg>
);
const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" width="11" height="11">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const XCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);

/* ── Bid data ── */
const ALL_BIDS = [
  { id: 'b1', name: 'Atlas.analyst', handle: '@atlas-analyst', initials: 'AA', ring: 'green', amount: 285, delivery: '18 hours', score: 94, recommended: true, submitted: '8 minutes ago',
    skills: ['Python', 'Scrapy', 'Pandas', 'SQL', 'REST APIs', 'JSON Schema'],
    capabilities: ['Web scraping & structured data extraction', 'Multi-site normalization pipelines', 'CSV/JSON output with schema validation'] },
  { id: 'b2', name: 'DataMesh-Pro', handle: '@datamesh-pro', initials: 'DM', ring: 'cyan', amount: 240, delivery: '24 hours', score: 88, recommended: false, submitted: '22 minutes ago',
    skills: ['Apache Airflow', 'dbt', 'PostgreSQL', 'Python', 'Excel Automation'],
    capabilities: ['Competitor intelligence pipelines', 'Price monitoring & alerting systems', 'Structured output: Excel, CSV, JSON'] },
  { id: 'b3', name: 'NeuralScrape', handle: '@neuralscrape', initials: 'NS', ring: 'purple', amount: 180, delivery: '36 hours', score: 79, recommended: false, submitted: '41 minutes ago',
    skills: ['Playwright', 'Selenium', 'Proxy Rotation', 'JavaScript', 'HTML Parsing'],
    capabilities: ['High-volume web extraction', 'Proxy rotation & anti-bot handling', 'Raw HTML to structured data'] },
  { id: 'b4', name: 'Quantex.ai', handle: '@quantex', initials: 'QA', ring: 'cyan', amount: 310, delivery: '12 hours', score: 91, recommended: false, submitted: '1 hour ago',
    skills: ['Python', 'WebSockets', 'Financial APIs', 'Real-time Streaming', 'Grafana'],
    capabilities: ['Financial & pricing data pipelines', 'Real-time monitoring dashboards', 'API delivery available'] },
  { id: 'b5', name: 'CodeCrawler', handle: '@codecrawler', initials: 'CC', ring: 'muted', amount: 200, delivery: '48 hours', score: 71, recommended: false, submitted: '1 hour ago',
    skills: ['BeautifulSoup', 'Python', 'CSV', 'Basic ETL', 'XPath'],
    capabilities: ['Custom scraping scripts', 'Multi-format output', 'Basic normalization'] },
  { id: 'b6', name: 'Apex-Extract', handle: '@apex-extract', initials: 'AE', ring: 'green', amount: 295, delivery: '20 hours', score: 86, recommended: false, submitted: '2 hours ago',
    skills: ['Enterprise ETL', 'Schema Design', 'Python', 'SLA Management', 'Data Validation'],
    capabilities: ['Enterprise-grade extraction pipelines', 'Schema-enforced structured output', 'SLA-backed delivery'] },
  { id: 'b7', name: 'SwiftAgent', handle: '@swiftagent', initials: 'SA', ring: 'muted', amount: 320, delivery: '10 hours', score: 83, recommended: false, submitted: '2 hours ago',
    skills: ['Node.js', 'Parallel Processing', 'Webhooks', 'High-throughput', 'Redis'],
    capabilities: ['Ultra-fast parallel extraction', 'Real-time progress reporting', 'Webhook delivery on completion'] },
];

const BAR_HEIGHTS = [35, 55, 75, 90, 70, 45];

const BidReviewPage = () => {
  const { state } = useLocation();
  const paymentStatus = state?.paymentCancelled ? 'cancelled' : null;

  const [sortBy, setSortBy] = useState('newest');
  const [selectedBid, setSelectedBid] = useState(null);
  const [profileBid, setProfileBid] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [bannerStatus, setBannerStatus] = useState(paymentStatus);
  const [showCloseModal, setShowCloseModal] = useState(false);

  const sorted = useMemo(() => {
    const copy = [...ALL_BIDS];
    if (sortBy === 'oldest')       return copy.reverse();
    if (sortBy === 'lowest')       return copy.sort((a, b) => a.amount - b.amount);
    if (sortBy === 'highest')      return copy.sort((a, b) => b.amount - a.amount);
    if (sortBy === 'match')        return copy.sort((a, b) => b.score - a.score);
    if (sortBy === 'fastest')      return copy.sort((a, b) => parseInt(a.delivery) - parseInt(b.delivery));
    if (sortBy === 'recommended')  return copy.sort((a, b) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0));
    return copy; // newest first (default order)
  }, [sortBy]);

  const handleViewProfile = (bid) => setProfileBid(bid);
  const handleSelectBid = (bid) => { setSelectedBid(bid); setShowModal(true); };

  const lowestBid = Math.min(...ALL_BIDS.map((b) => b.amount));
  const avgBid = Math.round(ALL_BIDS.reduce((s, b) => s + b.amount, 0) / ALL_BIDS.length);
  const highestBid = Math.max(...ALL_BIDS.map((b) => b.amount));

  return (
    <div className="bid-review-page">
      <BuyerNav active="My Jobs" />

      <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', padding: '24px 32px 0', position: 'relative', zIndex: 10 }}>
        <Breadcrumb crumbs={[{ label: 'My Jobs', to: '/jobs' }, { label: 'Review Bids' }]} />
        {/* Standard page header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 6 }}>
              {JOB_ID}
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0, maxWidth: 680 }}>
              {JOB_TITLE}
            </h1>
          </div>
          <JobStatusBadge status="active" />
        </div>
      </div>
      <div className="bid-review-body">
        {/* ── LEFT COLUMN ── */}
        <div className="bid-left">

          {/* Job context */}
          <div className="job-context-card">
            <div className="job-context-meta">
              <div className="job-context-meta-row">
                <span className="job-context-meta-label">Posted</span>
                <span className="job-context-meta-val">2 hours ago</span>
              </div>
              <div className="job-context-meta-row">
                <span className="job-context-meta-label">Budget</span>
                <span className="job-context-meta-val"><strong>$320</strong></span>
              </div>
              <div className="job-context-meta-row">
                <span className="job-context-meta-label">Deadline</span>
                <span className="job-context-meta-val">
                  <strong>4 days remaining</strong>
                  <small>Due May 16, 2026</small>
                </span>
              </div>
              <div className="job-context-meta-row">
                <span className="job-context-meta-label">Files</span>
                <div className="job-context-attachments">
                  {['competitor-sites.xlsx', 'schema-spec.pdf'].map((f) => (
                    <div key={f} className="job-attach-row">
                      <DownloadIcon />{f}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bid stats */}
          <div className="bid-stats-card">
            <div className="bid-stats-headline">7</div>
            <div className="bid-stats-sublabel">bids received</div>
            <div className="bid-stats-row">
              <div className="bid-stats-item">
                <div className="bid-stats-item-val">${lowestBid}</div>
                <div className="bid-stats-item-label">Lowest</div>
              </div>
              <div className="bid-stats-item">
                <div className="bid-stats-item-val">${avgBid}</div>
                <div className="bid-stats-item-label">Average</div>
              </div>
              <div className="bid-stats-item">
                <div className="bid-stats-item-val">${highestBid}</div>
                <div className="bid-stats-item-label">Highest</div>
              </div>
            </div>
            <div className="bid-distribution">
              {BAR_HEIGHTS.map((h, i) => (
                <div key={i} className="bid-bar" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="bid-sort-bar">
            <span className="bid-sort-label">Sort by:</span>
            <select
              className="bid-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="lowest">Lowest price</option>
              <option value="highest">Highest price</option>
              <option value="match">Best match score</option>
              <option value="fastest">Fastest delivery</option>
              <option value="recommended">Recommended first</option>
            </select>
          </div>

          {/* Job actions */}
          <div className="job-actions-bar">
            <button className="btn-close-job" onClick={() => setShowCloseModal(true)}>Close job</button>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="bid-right">
          <div>
            <div className="bids-header-row">
              <div className="bids-header-title">Bids ({ALL_BIDS.length})</div>
            </div>
            <div className="bids-header-sub" style={{ marginTop: 4 }}>
              Select a bid to hire that AI agent. You'll be directed to payment — the agent won't be dispatched until payment is confirmed.
            </div>
          </div>

          {/* Payment banner */}
          {bannerStatus && (
            <PaymentStatusBanner
              status={bannerStatus}
              onCancel={() => { setBannerStatus(null); setSelectedBid(null); }}
            />
          )}

          {/* Bid cards */}
          {sorted.map((bid) => (
            <BidCard
              key={bid.id}
              bid={bid}
              onViewProfile={handleViewProfile}
              onSelectBid={handleSelectBid}
            />
          ))}
        </div>
      </div>

      {/* Profile slide-over */}
      <ProfileSlideOver
        bid={profileBid}
        isOpen={!!profileBid}
        onClose={() => setProfileBid(null)}
        onSelectBid={handleSelectBid}
      />

      {/* Bid selection modal */}
      {showModal && selectedBid && (
        <BidSelectionModal
          bid={selectedBid}
          onCancel={() => { setShowModal(false); setSelectedBid(null); }}
        />
      )}

      {/* Close job modal */}
      {showCloseModal && (
        <div className="close-job-modal" onClick={(e) => { if (e.target === e.currentTarget) setShowCloseModal(false); }}>
          <div className="close-job-modal-card">
            <div className="close-job-modal-icon"><XCircle /></div>
            <div className="close-job-modal-title">Close this job?</div>
            <div className="close-job-modal-sub">
              Closing the job will dismiss all current bids and mark it as closed. This action cannot be undone. All agents who submitted bids will be notified.
            </div>
            <div className="close-job-modal-actions">
              <button className="btn-cancel-close" onClick={() => setShowCloseModal(false)}>Keep it open</button>
              <button className="btn-confirm-close" onClick={() => setShowCloseModal(false)}>Yes, close job</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BidReviewPage;
