import { Link } from 'react-router-dom';

const PENDING_JOBS = [
  {
    id: 'pb1',
    title: 'Q1 competitor pricing audit across 14 SaaS vendors',
    status: 'delivered',
    statusLabel: 'DELIVERED',
    statusSub: 'Awaiting Buyer approval',
    gross: 1250,
    net: 1063,
    action: 'View delivery →',
  },
  {
    id: 'pb2',
    title: 'Synthesize earnings call transcripts — bull/bear thesis',
    status: 'in-revision',
    statusLabel: 'IN REVISION',
    statusSub: 'Revision #1 in progress',
    gross: 490,
    net: 417,
    action: 'View revision →',
  },
  {
    id: 'pb3',
    title: 'Extract financial tables from 320-page S-1 filing',
    status: 'in-progress',
    statusLabel: 'IN PROGRESS',
    statusSub: 'Delivered to agent · awaiting completion',
    gross: 680,
    net: 578,
    tentative: true,
    action: 'Track job →',
  },
];

/* spec totals (server-side total; may differ slightly from displayed row sum) */
const TOTAL_GROSS = 2740;
const EST_NET     = 2329;

const PendingBalanceCard = () => (
  <div className="er-pending-card">
    <div className="er-pending-header">
      <div className="er-pending-title-wrap">
        <div className="er-pending-title">Pending balance</div>
        <div className="er-pending-header-sub">Gross amounts awaiting Buyer approval</div>
      </div>
      <div className="er-pending-total-wrap">
        <div className="er-pending-total">${TOTAL_GROSS.toLocaleString()}</div>
        <div className="er-pending-total-label">total pending</div>
      </div>
    </div>

    <div className="er-pending-note">
      Net payout will be gross amount minus 15% platform commission.&nbsp;
      <span>Estimated net: ~${EST_NET.toLocaleString()}</span>
    </div>

    {/* Column headers */}
    <div className="er-pending-row-header">
      <div className="er-pending-th">Job</div>
      <div className="er-pending-th">Gross held</div>
      <div className="er-pending-th">Est. net</div>
      <div className="er-pending-th">Action</div>
    </div>

    <div className="er-pending-rows">
      {PENDING_JOBS.map(job => (
        <div key={job.id} className="er-pending-row">
          {/* Job cell */}
          <div>
            <div className="er-pending-job-title">{job.title}</div>
            <span className={`er-pending-badge ${job.status}`}>
              <span className="er-pending-badge-dot" />
              {job.statusLabel}
            </span>
            <div className="er-pending-badge-sub">{job.statusSub}</div>
          </div>

          {/* Gross held */}
          <div>
            <div className="er-pending-amt">
              ${job.gross.toLocaleString()}
              {job.tentative && <span style={{ color: 'var(--text-3)', fontSize: '0.7rem', marginLeft: 4 }}>(tentative)</span>}
            </div>
          </div>

          {/* Est. net */}
          <div>
            <div className="er-pending-est">~${job.net.toLocaleString()}</div>
            <div className="er-pending-est-note">after 15%</div>
          </div>

          {/* Action */}
          <div>
            <Link to="/jobs/freelancer" className="er-pending-action">
              {job.action}
            </Link>
          </div>
        </div>
      ))}
    </div>

    <div className="er-pending-footer">
      Payments are released automatically when the Buyer approves delivery.
      In case of a dispute, funds are held until Admin resolution.
    </div>
  </div>
);

export default PendingBalanceCard;
