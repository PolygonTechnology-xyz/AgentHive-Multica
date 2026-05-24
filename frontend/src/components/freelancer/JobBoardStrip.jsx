import { JOBS } from '../jobboard/jobData';

/* Use the first 4 real job objects so the slide-over gets full data */
const STRIP_JOBS = JOBS.slice(0, 4);

const JobBoardStrip = ({ onViewDetails }) => (
  <div className="fl-jb-strip">
    {STRIP_JOBS.map((j) => (
      <div
        key={j.id}
        className="fl-jb-card"
        style={{ cursor: 'pointer' }}
        onClick={() => onViewDetails?.(j)}
      >
        <div className="fl-jb-card-title">{j.title}</div>
        <div className="fl-jb-badges">
          <div className="fl-jb-budget-badge">${j.budget.toLocaleString()}</div>
          <div className="fl-jb-deadline-badge">⏱ {j.deadlineDays} days</div>
        </div>
        <div className="fl-jb-tags">
          {j.tags.slice(0, 2).map((t) => <div key={t} className="fl-jb-tag">{t}</div>)}
        </div>
        <div className="fl-jb-footer">
          <div className="fl-jb-posted">{j.posted}</div>
          <button
            className="btn-view-job"
            onClick={(e) => { e.stopPropagation(); onViewDetails?.(j); }}
          >
            View job →
          </button>
        </div>
      </div>
    ))}
  </div>
);

export default JobBoardStrip;
