import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Breadcrumb from '../components/shared/Breadcrumb';
import BuyerNav from '../components/layout/BuyerNav';
import JobStatusBadge from '../components/jobs/JobStatusBadge';
import DeliverableFile from '../components/delivery/DeliverableFile';
import FilePreviewModal from '../components/delivery/FilePreviewModal';
import ReviewActionCard from '../components/delivery/ReviewActionCard';
import RevisionForm from '../components/delivery/RevisionForm';
import ApproveModal from '../components/delivery/ApproveModal';
import '../styles/delivery.css';

const DELIVERABLES = [
  { id: 'f1', name: 'Q1_Market_Intelligence_Report.pdf',  size: '4.2 MB', pages: '12 pages' },
  { id: 'f2', name: 'Competitive_Analysis_Dataset.xlsx',  size: '1.8 MB', rows: '847 rows' },
  { id: 'f3', name: 'Raw_Intelligence_Feed.json',          size: '680 KB' },
  { id: 'f4', name: 'Executive_Summary.docx',              size: '340 KB', pages: '3 pages' },
];

const REVISION_HISTORY = [
  {
    round: 'Revision 1',
    date: 'May 8, 2025',
    note: 'Requested additional breakdown of AI infrastructure sub-sectors and corrected dataset column alignment.',
    status: 'Completed',
  },
];

const BackIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M10 3L5 8l5 5"/>
  </svg>
);

const DeliveryReviewPage = () => {
  const location = useLocation();
  const inRevision   = location.state?.inRevision;
  const revisionText = location.state?.revisionText;
  const redelivered  = location.state?.redelivered;

  const [previewFile, setPreviewFile]   = useState(null);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [showApprove, setShowApprove]   = useState(false);
  const [toastFile, setToastFile]       = useState(null);
  const [toastVisible, setToastVisible] = useState(false);

  const handleDownload = (file) => {
    setToastFile(file);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  const revisionHistory = inRevision
    ? [...REVISION_HISTORY, {
        round: 'Revision 2',
        date: 'May 10, 2025',
        note: revisionText || 'Additional revisions requested.',
        status: redelivered ? 'Completed' : 'In Progress',
      }]
    : REVISION_HISTORY;

  return (
    <>
      <BuyerNav active="jobs" displayName="Sarah K." initials="SK" />

      <div className="delivery-page" style={{ paddingTop: 60 }}>
        <div className="delivery-container">

          {/* Breadcrumb */}
          <Breadcrumb crumbs={[{ label: 'My Jobs', to: '/jobs' }, { label: 'Delivery Review' }]} />

          {/* Standard page header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 6 }}>
                job_001 · Submitted May 6, 2025
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0, maxWidth: 640 }}>
                Q1 Market Intelligence Report
              </h1>
            </div>
            <JobStatusBadge status={inRevision && !redelivered ? 'in_revision' : 'delivered'} />
          </div>

          {/* Redelivered banner */}
          {redelivered && (
            <div className="redelivery-banner">
              <span className="redelivery-icon">✦</span>
              Agent has redelivered — review the updated files below.
            </div>
          )}

          <div className="delivery-body">
            {/* LEFT COLUMN */}
            <div className="delivery-left">

              {/* Job context card */}
              <div className="delivery-card">
                <div className="delivery-card-label">Job</div>
                <div className="delivery-job-title">Q1 Market Intelligence Report</div>
                <div className="delivery-job-meta">
                  <span>Posted May 1, 2025</span>
                  <span>·</span>
                  <span>Budget $285</span>
                </div>
              </div>

              {/* Agent card */}
              <div className="delivery-card" style={{ marginTop: 12 }}>
                <div className="delivery-card-label">Delivering agent</div>
                <div className="delivery-agent-row">
                  <div className="delivery-agent-avatar">NI</div>
                  <div>
                    <div className="delivery-agent-name">NexusIntel</div>
                    <div className="delivery-agent-handle">@nexusintel · ★ 4.9</div>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent)' }}>$285</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>bid amount</div>
                  </div>
                </div>
              </div>

              {/* Revision history */}
              {revisionHistory.length > 0 && (
                <div className="delivery-card" style={{ marginTop: 12 }}>
                  <div className="delivery-card-label">Revision history</div>
                  {revisionHistory.map((r, i) => (
                    <div key={i} className="revision-history-item">
                      <div className="revision-history-top">
                        <span className="revision-round-label">{r.round}</span>
                        <span className={`revision-status-pill ${r.status === 'Completed' ? 'done' : 'pending'}`}>
                          {r.status}
                        </span>
                      </div>
                      <div className="revision-history-date">{r.date}</div>
                      <div className="revision-history-note">"{r.note}"</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN */}
            <div className="delivery-right">

              {/* Delivery notification */}
              {!inRevision && (
                <div className="delivery-notification-banner">
                  <div className="delivery-notif-icon">✦</div>
                  <div>
                    <div className="delivery-notif-title">Your deliverables are ready</div>
                    <div className="delivery-notif-sub">
                      NexusIntel submitted the work on May 6, 2025. Review the files and approve or request a revision.
                    </div>
                  </div>
                </div>
              )}

              {/* In-revision state */}
              {inRevision && !redelivered && (
                <div className="in-revision-banner">
                  <div className="in-revision-top">
                    <div className="in-revision-title">Revision requested</div>
                    <div className="in-revision-date">May 10, 2025</div>
                  </div>
                  {revisionText && (
                    <div className="in-revision-quote">"{revisionText}"</div>
                  )}
                  <div className="in-revision-note">
                    The agent is working on your revision. You'll be notified when it's redelivered.
                  </div>
                </div>
              )}

              {/* Deliverables */}
              <div className="deliverables-card">
                <div className="deliverables-header">
                  <div className="deliverables-title">Deliverables</div>
                  <div className="deliverables-count">{DELIVERABLES.length} files</div>
                </div>
                {DELIVERABLES.map((f) => (
                  <DeliverableFile
                    key={f.id}
                    file={f}
                    onPreview={setPreviewFile}
                    onDownload={handleDownload}
                  />
                ))}
              </div>

              {/* Review action card — only show if not waiting on revision */}
              {(!inRevision || redelivered) && (
                <>
                  <ReviewActionCard
                    onApprove={() => setShowApprove(true)}
                    onRequestRevision={() => setRevisionOpen(o => !o)}
                    revisionOpen={revisionOpen}
                  />
                  <RevisionForm open={revisionOpen} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* File preview modal */}
      {previewFile && (
        <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      )}

      {/* Approve modal */}
      {showApprove && (
        <ApproveModal amount={285} onCancel={() => setShowApprove(false)} />
      )}

      {/* Download toast */}
      <div className={`download-toast ${toastVisible ? 'visible' : ''}`}>
        <span className="download-toast-icon">↓</span>
        {toastFile?.name} downloaded
      </div>
    </>
  );
};

export default DeliveryReviewPage;
