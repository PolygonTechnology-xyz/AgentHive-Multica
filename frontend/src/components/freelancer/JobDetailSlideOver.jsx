import { useEffect, useRef } from 'react';

/* step: 'complete' | 'current' | 'locked' */
const TIMELINE_STEPS = [
  { label: 'Job Awarded',       sub: 'Bid accepted by buyer',            status: 'complete' },
  { label: 'Payment Escrowed',  sub: 'Funds held in platform escrow',    status: 'complete' },
  { label: 'Work in Progress',  sub: 'Agent actively working',           status: 'current'  },
  { label: 'Delivery Review',   sub: 'Buyer reviews deliverables',       status: 'locked'   },
  { label: 'Funds Released',    sub: 'Payout transferred to wallet',     status: 'locked'   },
];

const TIMELINE_STEPS_DELIVERED = [
  { label: 'Job Awarded',       sub: 'Bid accepted by buyer',            status: 'complete' },
  { label: 'Payment Escrowed',  sub: 'Funds held in platform escrow',    status: 'complete' },
  { label: 'Work in Progress',  sub: 'Agent actively working',           status: 'complete' },
  { label: 'Delivery Review',   sub: 'Buyer reviewing submission',       status: 'current'  },
  { label: 'Funds Released',    sub: 'Payout transferred to wallet',     status: 'locked'   },
];

const TIMELINE_STEPS_REVISION = [
  { label: 'Job Awarded',       sub: 'Bid accepted by buyer',            status: 'complete' },
  { label: 'Payment Escrowed',  sub: 'Funds held in platform escrow',    status: 'complete' },
  { label: 'Revision Requested',sub: 'Buyer requested changes',          status: 'complete' },
  { label: 'Revision in Progress', sub: 'Agent applying feedback',       status: 'current'  },
  { label: 'Funds Released',    sub: 'Pending final approval',           status: 'locked'   },
];

const getTimeline = status => {
  if (status === 'delivered')   return TIMELINE_STEPS_DELIVERED;
  if (status === 'in_revision') return TIMELINE_STEPS_REVISION;
  return TIMELINE_STEPS;
};

const JobDetailSlideOver = ({ job, onClose }) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const steps = getTimeline(job?.status);

  return (
    <>
      <div
        ref={overlayRef}
        className="jd-overlay open"
        onClick={e => { if (e.target === overlayRef.current) onClose(); }}
      />
      <div className="jd-panel open">
        <div className="jd-header">
          <div>
            <div className="jd-header-label">Job Details</div>
            <div className="jd-job-title">{job.title}</div>
          </div>
          <button className="jd-close" onClick={onClose}>✕</button>
        </div>

        <div className="jd-body">
          {/* Info grid */}
          <div className="jd-info-grid">
            <div className="jd-info-cell">
              <span className="jd-info-label">Buyer</span>
              <span className="jd-info-val">{job.buyer}</span>
            </div>
            <div className="jd-info-cell">
              <span className="jd-info-label">Category</span>
              <span className="jd-info-val">{job.category}</span>
            </div>
            <div className="jd-info-cell">
              <span className="jd-info-label">Budget</span>
              <span className="jd-info-val accent">${job.payout}</span>
            </div>
            <div className="jd-info-cell">
              <span className="jd-info-label">Deadline</span>
              <span className="jd-info-val">{job.deadline}</span>
            </div>
          </div>

          {/* Dispatch card */}
          <div className="jd-dispatch-card">
            <div className="jd-dispatch-label">Agent Dispatch</div>
            <div className="jd-dispatch-row">
              <div className="jd-agent-avatar">{job.agent.charAt(0)}</div>
              <div>
                <div className="jd-agent-name">{job.agent}</div>
                <div className="jd-agent-sub">Dispatched {job.dispatchedAt}</div>
              </div>
              <div className={`jd-agent-status ${job.status}`}>
                {job.status.replace('_', ' ')}
              </div>
            </div>
            {job.lastAction && (
              <div className="jd-last-action">
                <span className="jd-la-dot" />
                <span>{job.lastAction}</span>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="jd-timeline-section">
            <div className="jd-section-label">Progress Timeline</div>
            <div className="jd-timeline">
              {steps.map((step, i) => (
                <div key={i} className={`tl-item ${step.status}`}>
                  <div className="tl-dot" />
                  <div className="tl-content">
                    <div className="tl-label">{step.label}</div>
                    <div className="tl-sub">{step.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JobDetailSlideOver;
