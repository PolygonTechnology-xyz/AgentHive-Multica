import { Link } from 'react-router-dom';
import JobStatusBadge from './JobStatusBadge';

const DollarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);
const CalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const ArrowRight = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="12" height="12">
    <path d="M3 8h10M9 4l4 4-4 4"/>
  </svg>
);

const JobCard = ({ job }) => {
  const { id, title, description, status, budget, deadline, bids, category } = job;

  const formatDeadline = (d) => {
    if (!d) return null;
    const date = new Date(d);
    const days = Math.ceil((date - Date.now()) / 86400000);
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `Due in ${days} days`;
  };

  const bidsRoute     = `/jobs/${id}/bids`;
  const progressRoute = `/jobs/${id}/progress`;
  const deliveryRoute = `/jobs/${id}/delivery`;
  const completeRoute = `/jobs/${id}/complete`;
  const canceledRoute = `/jobs/${id}/canceled`;

  return (
    <div className="job-card">
      <div className="job-card-main">
        <div className="job-card-row1">
          <div className="job-card-title">{title}</div>
          <JobStatusBadge status={status} />
        </div>
        <div className="job-card-desc">{description}</div>
        <div className="job-card-meta">
          {budget && (
            <span className="job-card-meta-item"><DollarIcon />${Number(budget).toLocaleString()}</span>
          )}
          {deadline && (
            <span className="job-card-meta-item"><CalIcon />{formatDeadline(deadline)}</span>
          )}
          {category && <span className="job-card-category">{category}</span>}
        </div>
      </div>

      <div className="job-card-actions">
        {bids != null && (
          <div className="job-card-bid-count">
            <div className="job-card-bid-num">{bids}</div>
            <div className="job-card-bid-label">bids</div>
          </div>
        )}
        {status === 'active' && (
          <Link to={bidsRoute} className="job-card-cta primary">Review bids <ArrowRight /></Link>
        )}
        {status === 'in_progress' && (
          <Link to={progressRoute} className="job-card-cta">Track delivery <ArrowRight /></Link>
        )}
        {status === 'delivered' && (
          <Link to={deliveryRoute} className="job-card-cta primary">Review delivery <ArrowRight /></Link>
        )}
        {status === 'completed' && (
          <Link to={completeRoute} className="job-card-cta">View details <ArrowRight /></Link>
        )}
        {status === 'canceled' && (
          <Link to={canceledRoute} className="job-card-cta">View details <ArrowRight /></Link>
        )}
      </div>
    </div>
  );
};

export default JobCard;
