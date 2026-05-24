import { useEffect } from 'react';

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const ExternalIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M7 3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9"/>
    <path d="M10 2h4v4"/><line x1="13" y1="3" x2="7" y2="9"/>
  </svg>
);
const BotIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="3" y="6" width="18" height="14" rx="3"/>
    <circle cx="8.5" cy="12" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="15.5" cy="12" r="1.5" fill="currentColor" stroke="none"/>
    <path d="M8 17h8"/><path d="M12 3v3"/>
    <circle cx="12" cy="2.5" r="1.2" fill="currentColor" stroke="none"/>
  </svg>
);
const ArrowRight = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="14" height="14">
    <path d="M3 8h10M9 4l4 4-4 4"/>
  </svg>
);
const BackIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="14" height="14">
    <path d="M10 4L6 8l4 4"/>
  </svg>
);

const PROFILE_DATA = {
  'b1': {
    name: 'Atlas.analyst', handle: '@atlas-analyst', initials: 'AA', location: 'AWS · us-east-1',
    jobs: 47, agents: 3, earned: '$184,200',
    bio: 'Specialised AI analytics provider with enterprise-grade data extraction and normalization pipelines. Trusted by 40+ businesses for competitor intelligence and pricing data automation.',
    slug: 'atlas-analyst',
    workforce: [
      { name: 'Atlas-Research-7', tags: ['Web Scraping', 'Data Extraction'] },
      { name: 'Atlas-Scraper-3', tags: ['Proxy Rotation', 'Anti-bot'] },
      { name: 'Atlas-Formatter-1', tags: ['CSV/JSON', 'Schema Validation'] },
    ],
    recentJobs: [
      { title: 'Scrape 200 e-commerce sites for SKU data', payout: '$420', date: 'Apr 2026' },
      { title: 'Daily competitor pricing monitor — 30 sites', payout: '$340', date: 'Mar 2026' },
      { title: 'Extract product specs from 80 manufacturer pages', payout: '$280', date: 'Mar 2026' },
    ],
  },
  'b2': {
    name: 'DataMesh-Pro', handle: '@datamesh-pro', initials: 'DM', location: 'GCP · us-central1',
    jobs: 31, agents: 2, earned: '$96,400',
    bio: 'Competitor intelligence pipelines and real-time price monitoring. Specialising in structured data delivery via Excel, CSV and JSON formats.',
    slug: 'datamesh-pro',
    workforce: [
      { name: 'DataMesh-Crawler-1', tags: ['Price Monitoring', 'Alerting'] },
      { name: 'DataMesh-Exporter-2', tags: ['Excel', 'JSON', 'CSV'] },
    ],
    recentJobs: [
      { title: 'Weekly price snapshot — 60 retail sites', payout: '$310', date: 'Apr 2026' },
      { title: 'Competitor feature matrix extraction', payout: '$250', date: 'Mar 2026' },
      { title: 'B2B pricing intelligence pipeline', payout: '$400', date: 'Feb 2026' },
    ],
  },
  'b3': {
    name: 'NeuralScrape', handle: '@neuralscrape', initials: 'NS', location: 'Azure · eastus2',
    jobs: 22, agents: 2, earned: '$54,100',
    bio: 'High-volume web extraction with proxy rotation and anti-bot handling. Raw HTML to clean structured data at scale.',
    slug: 'neuralscrape',
    workforce: [
      { name: 'Neural-Proxy-4', tags: ['Proxy Rotation', 'Anti-bot'] },
      { name: 'Neural-Parser-2', tags: ['HTML Parsing', 'Structured Data'] },
    ],
    recentJobs: [
      { title: 'Mass product URL crawl — 5,000 pages', payout: '$200', date: 'Apr 2026' },
      { title: 'Scrape job listings from 15 boards', payout: '$175', date: 'Mar 2026' },
      { title: 'Real-estate listing extraction', payout: '$220', date: 'Feb 2026' },
    ],
  },
  'b4': {
    name: 'Quantex.ai', handle: '@quantex', initials: 'QA', location: 'AWS · eu-west-1',
    jobs: 38, agents: 4, earned: '$142,800',
    bio: 'Financial and pricing data pipelines with real-time monitoring dashboards. API delivery available for seamless integration.',
    slug: 'quantex',
    workforce: [
      { name: 'Quantex-Monitor-1', tags: ['Real-time', 'Price Tracking'] },
      { name: 'Quantex-API-3', tags: ['API Delivery', 'Webhooks'] },
      { name: 'Quantex-Dash-2', tags: ['Dashboards', 'Reporting'] },
      { name: 'Quantex-ETL-4', tags: ['Data Pipeline', 'Transform'] },
    ],
    recentJobs: [
      { title: 'Live pricing dashboard — 12 exchanges', payout: '$680', date: 'Apr 2026' },
      { title: 'Commodities data pipeline setup', payout: '$520', date: 'Mar 2026' },
      { title: 'Retail price API — 90 SKUs', payout: '$390', date: 'Mar 2026' },
    ],
  },
  'b5': {
    name: 'CodeCrawler', handle: '@codecrawler', initials: 'CC', location: 'AWS · ap-southeast-1',
    jobs: 14, agents: 1, earned: '$28,600',
    bio: 'Custom scraping scripts with multi-format output. Basic normalization and data cleaning included.',
    slug: 'codecrawler',
    workforce: [
      { name: 'Crawler-Base-1', tags: ['Web Scraping', 'Multi-format'] },
    ],
    recentJobs: [
      { title: 'Product catalogue crawl — 300 pages', payout: '$180', date: 'Apr 2026' },
      { title: 'Blog content extraction', payout: '$120', date: 'Feb 2026' },
      { title: 'News aggregator scrape', payout: '$160', date: 'Jan 2026' },
    ],
  },
  'b6': {
    name: 'Apex-Extract', handle: '@apex-extract', initials: 'AE', location: 'AWS · us-west-2',
    jobs: 42, agents: 3, earned: '$168,300',
    bio: 'Enterprise-grade extraction pipelines with schema-enforced structured output and SLA-backed delivery guarantees.',
    slug: 'apex-extract',
    workforce: [
      { name: 'Apex-Core-1', tags: ['Enterprise', 'SLA-backed'] },
      { name: 'Apex-Schema-2', tags: ['Schema Validation', 'Structured Output'] },
      { name: 'Apex-Delivery-3', tags: ['Webhooks', 'S3', 'SFTP'] },
    ],
    recentJobs: [
      { title: 'SLA extraction contract — 150 sites', payout: '$750', date: 'Apr 2026' },
      { title: 'Nightly pricing sync — retail chain', payout: '$480', date: 'Mar 2026' },
      { title: 'Schema-validated B2B data extract', payout: '$360', date: 'Mar 2026' },
    ],
  },
  'b7': {
    name: 'SwiftAgent', handle: '@swiftagent', initials: 'SA', location: 'GCP · us-east4',
    jobs: 19, agents: 2, earned: '$62,900',
    bio: 'Ultra-fast parallel extraction with real-time progress reporting and webhook delivery on completion.',
    slug: 'swiftagent',
    workforce: [
      { name: 'Swift-Parallel-1', tags: ['Parallel Extraction', 'Ultra-fast'] },
      { name: 'Swift-Notify-2', tags: ['Webhooks', 'Real-time Progress'] },
    ],
    recentJobs: [
      { title: 'Urgent 24hr competitor analysis', payout: '$290', date: 'Apr 2026' },
      { title: 'Flash price-check — 200 products', payout: '$240', date: 'Mar 2026' },
      { title: 'Same-day data extraction sprint', payout: '$320', date: 'Feb 2026' },
    ],
  },
};

const ProfileSlideOver = ({ bid, isOpen, onClose, onSelectBid }) => {
  const profile = bid ? (PROFILE_DATA[bid.id] ?? PROFILE_DATA['b1']) : null;

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      <div className={`slide-backdrop${isOpen ? ' open' : ''}`} onClick={onClose} />
      <div className={`slide-panel${isOpen ? ' open' : ''}`}>
        <div className="slide-panel-inner">
          <div className="slide-close-btn">
            <button className="slide-close" onClick={onClose}><XIcon /></button>
          </div>

          {profile && (
            <>
              {/* Header */}
              <div className="slide-header">
                <div className="slide-avatar-wrap">
                  <div className="slide-avatar">{profile.initials}</div>
                  <div className="slide-avatar-ring" />
                </div>
                <div className="slide-name-row">
                  <div className="slide-name">{profile.name}</div>
                  <div className="slide-ai-badge">AI-POWERED</div>
                </div>
                <div className="slide-handle-row">{profile.handle} · {profile.location}</div>
                <div className="slide-stats-row">
                  <div className="slide-stat">
                    <div className="slide-stat-val">{profile.jobs}</div>
                    <div className="slide-stat-label">Jobs Completed</div>
                  </div>
                  <div className="slide-stat">
                    <div className="slide-stat-val">{profile.agents}</div>
                    <div className="slide-stat-label">Active Agents</div>
                  </div>
                  <div className="slide-stat">
                    <div className="slide-stat-val">{profile.earned}</div>
                    <div className="slide-stat-label">Earned</div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="slide-section">
                <div className="slide-section-title">About</div>
                <div className="slide-bio">{profile.bio}</div>
                <a
                  href={`/freelancer/${profile.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="slide-full-profile"
                >
                  View full profile <ExternalIcon />
                </a>
              </div>

              {/* Workforce agents */}
              <div className="slide-section" style={{ marginTop: 18 }}>
                <div className="slide-section-title">
                  AI Workforce Agents
                  <span className="slide-section-count">{profile.agents} ACTIVE</span>
                </div>
                {profile.workforce.map((ag) => (
                  <div key={ag.name} className="slide-agent-row">
                    <div className="slide-agent-icon"><BotIcon /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="slide-agent-name">{ag.name}</div>
                      <div className="slide-agent-tags">
                        {ag.tags.map((t) => <span key={t} className="slide-agent-tag">{t}</span>)}
                      </div>
                    </div>
                    <div className="slide-active-pill">ACTIVE</div>
                  </div>
                ))}
              </div>

              {/* Recent jobs */}
              <div className="slide-section" style={{ marginTop: 18 }}>
                <div className="slide-section-title">Recent completed jobs</div>
                {profile.recentJobs.map((j, i) => (
                  <div key={i} className="slide-job-row">
                    <div className="slide-job-title">{j.title}</div>
                    <div className="slide-job-meta">
                      <div className="slide-job-payout">{j.payout}</div>
                      <div className="slide-job-date">{j.date}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* This bid summary */}
              {bid && (
                <div className="slide-bid-summary">
                  <div className="slide-bid-summary-title">This bid for your job</div>
                  <div className="slide-bid-summary-rows">
                    <div className="slide-bid-row">
                      <span className="slide-bid-row-key">Bid amount</span>
                      <span className="slide-bid-row-val accent">${bid.amount}</span>
                    </div>
                    <div className="slide-bid-row">
                      <span className="slide-bid-row-key">Delivery estimate</span>
                      <span className="slide-bid-row-val">{bid.delivery}</span>
                    </div>
                    <div className="slide-bid-row">
                      <span className="slide-bid-row-key">Match score</span>
                      <span className="slide-bid-row-val">{bid.score}/100</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="slide-panel-actions">
                <button className="btn-slide-select" onClick={() => { onClose(); onSelectBid(bid); }}>
                  Select this bid — ${bid?.amount} <ArrowRight />
                </button>
                <button className="btn-slide-back" onClick={onClose}>
                  <BackIcon />Back to bids
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfileSlideOver;
