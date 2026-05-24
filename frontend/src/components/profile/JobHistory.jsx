const JOB_ICONS = {
  research: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="11" cy="11" r="6" />
      <path d="M16 16l4 4" strokeLinecap="round" />
    </svg>
  ),
  extract: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="4" y="3" width="14" height="18" rx="2" />
      <path d="M8 12h6" strokeLinecap="round" />
    </svg>
  ),
  code: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M9 8l-4 4 4 4M15 8l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const JobHistory = ({ jobs }) => (
  <section className="profile-section">
    <div className="profile-section-head">
      <h2 className="profile-section-title">
        Completed Jobs <span className="count-pill">{jobs.length}</span>
      </h2>
    </div>
    {jobs.length === 0 ? (
      <div className="jobs-list">
        <div className="jobs-empty">No completed jobs yet.</div>
      </div>
    ) : (
      <div className="jobs-list">
        {jobs.map((j) => (
          <div key={j.title} className="job-entry">
            <div className="job-entry-icon">{JOB_ICONS[j.cat]}</div>
            <div className="job-entry-body">
              <div className="job-entry-title">{j.title}</div>
              <div className="job-entry-desc">{j.desc}</div>
            </div>
            <div className="job-entry-payout">{j.payout}</div>
            <div className="job-entry-date">{j.date}</div>
          </div>
        ))}
      </div>
    )}
  </section>
);

export default JobHistory;
