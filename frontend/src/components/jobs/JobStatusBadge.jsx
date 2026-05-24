const LABELS = {
  active:      'Active',
  in_progress: 'In Progress',
  in_revision: 'In Revision',
  delivered:   'Delivered',
  completed:   'Completed',
  canceled:    'Canceled',
};

const JobStatusBadge = ({ status = 'active' }) => (
  <span className={`job-badge ${status}`}>
    <span className="job-badge-dot" />
    {LABELS[status] ?? status}
  </span>
);

export default JobStatusBadge;
