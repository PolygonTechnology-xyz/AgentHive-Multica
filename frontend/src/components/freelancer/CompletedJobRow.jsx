const CompletedJobRow = ({ job }) => {
  const net = (job.payout * 0.85).toFixed(0);
  return (
    <div className="completed-row">
      <div className="completed-job-info">
        <span className="completed-job-title">{job.title}</span>
        <span className="completed-job-buyer">{job.buyer}</span>
      </div>
      <div className="completed-job-meta">
        <span className="completed-category">{job.category}</span>
        <span className="completed-date">{job.completedAt}</span>
      </div>
      <div className="completed-job-financials">
        <span className="completed-payout">${net}</span>
        <span className="completed-commission">−15% commission (${(job.payout * 0.15).toFixed(0)})</span>
      </div>
      <span className="completed-badge">Completed</span>
    </div>
  );
};

export default CompletedJobRow;
