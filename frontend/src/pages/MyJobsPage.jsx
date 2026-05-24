import { useState } from 'react';
import { Link } from 'react-router-dom';
import BuyerNav from '../components/layout/BuyerNav';
import JobCard from '../components/jobs/JobCard';
import Footer from '../components/layout/Footer';
import '../styles/jobs.css';

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" width="16" height="16" style={{ flexShrink: 0 }}>
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const BriefcaseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M2 12h20"/>
  </svg>
);
const ArrowRight = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="15" height="15" style={{ flexShrink: 0 }}>
    <path d="M3 8h10M9 4l4 4-4 4"/>
  </svg>
);

const DUMMY_JOBS = [
  {
    id: 'job_001',
    title: 'Analyse Q2 sales data and generate executive summary',
    description: 'Review our Q2 sales dataset (attached) and produce a concise executive summary highlighting key trends, performance against targets, and 3 actionable recommendations for Q3.',
    status: 'active',
    budget: '1000',
    deadline: new Date(Date.now() + 12 * 86400000).toISOString(),
    bids: 14,
    category: 'Data Analysis',
  },
  {
    id: 'job_002',
    title: 'Write 10 SEO-optimised blog posts on AI productivity tools',
    description: 'Create 10 blog articles (~800 words each) targeting mid-funnel keywords around AI productivity. Tone: professional but approachable. Include meta descriptions and H2 structure.',
    status: 'in_progress',
    budget: '2500',
    deadline: new Date(Date.now() + 5 * 86400000).toISOString(),
    bids: 7,
    category: 'Content Writing',
  },
  {
    id: 'job_003',
    title: 'Code review of our Python data pipeline (3,000 lines)',
    description: 'Review a 3k-line Python ETL pipeline for correctness, performance bottlenecks, security issues, and PEP 8 compliance. Provide a structured report with severity ratings and fixes.',
    status: 'delivered',
    budget: '800',
    deadline: new Date(Date.now() + 1 * 86400000).toISOString(),
    bids: 4,
    category: 'Code Review',
  },
  {
    id: 'job_004',
    title: 'Translate product documentation from English to Spanish',
    description: 'Translate 45 pages of technical product documentation from US English to Latin American Spanish, maintaining technical terminology and consistent tone throughout.',
    status: 'completed',
    budget: '600',
    deadline: new Date(Date.now() - 3 * 86400000).toISOString(),
    bids: 11,
    category: 'Translation',
  },
  {
    id: 'job_005',
    title: 'Q1 Market Intelligence Report',
    description: 'Synthesize Q1 earnings data across 12 sectors, identify emerging trends, and produce a structured 12-page intelligence report with supporting datasets and executive summary.',
    status: 'completed',
    budget: '285',
    deadline: new Date(Date.now() - 6 * 86400000).toISOString(),
    bids: 7,
    category: 'Market Research',
  },
  {
    id: 'job_006',
    title: 'Build competitor pricing scraper — e-commerce',
    description: 'Develop a scraper to monitor competitor pricing across 5 e-commerce sites daily. Output as a structured CSV with delta alerts when prices change by more than 5%.',
    status: 'canceled',
    budget: '450',
    deadline: new Date(Date.now() - 10 * 86400000).toISOString(),
    bids: 3,
    category: 'Web Scraping',
  },
];

const TABS = [
  { key: 'all',         label: 'All jobs' },
  { key: 'active',      label: 'Active' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'delivered',   label: 'Delivered' },
  { key: 'completed',   label: 'Completed' },
  { key: 'canceled',    label: 'Canceled' },
];

const MyJobsPage = () => {
  const [tab, setTab] = useState('all');

  const filtered = tab === 'all' ? DUMMY_JOBS : DUMMY_JOBS.filter((j) => j.status === tab);

  const tabCount = (key) => key === 'all' ? DUMMY_JOBS.length : DUMMY_JOBS.filter((j) => j.status === key).length;

  return (
    <>
    <div className="my-jobs-page">
      <BuyerNav active="My Jobs" />

      <div className="my-jobs-body">
        <div className="my-jobs-header">
          <h1>My Jobs</h1>
          <Link to="/jobs/create" className="btn-publish" style={{ textDecoration: 'none' }}>
            <PlusIcon />Post a new job
          </Link>
        </div>

        {/* Tabs */}
        <div className="jobs-tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`jobs-tab${tab === t.key ? ' active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              <span className="jobs-tab-count">{tabCount(t.key)}</span>
            </button>
          ))}
        </div>

        {/* Job list */}
        {filtered.length === 0 ? (
          <div className="jobs-empty">
            <div className="jobs-empty-icon"><BriefcaseIcon /></div>
            <div className="jobs-empty-title">No jobs in this category</div>
            <div className="jobs-empty-sub">Jobs you post will appear here with real-time bid counts and status updates.</div>
            <Link to="/jobs/create" className="btn-publish" style={{ textDecoration: 'none', display: 'inline-flex' }}>
              <PlusIcon />Post a job <ArrowRight />
            </Link>
          </div>
        ) : (
          <div className="job-list">
            {filtered.map((job) => <JobCard key={job.id} job={job} />)}
          </div>
        )}
      </div>
    </div>
    <Footer />
    </>
  );
};

export default MyJobsPage;
