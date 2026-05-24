const CheckIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8l4 4 6-7"/>
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 2l3 3-8 8H3v-3z"/>
  </svg>
);

const ReviewActionCard = ({ onApprove, onRequestRevision, revisionOpen }) => (
  <div className="review-action-card">
    <div className="review-action-title">Review decision</div>
    <div className="review-action-sub">
      You have <strong>7 days</strong> to review the deliverables. If no action is taken, the job will auto-approve.
    </div>

    <div className="review-action-btns">
      <button className="btn-approve-delivery" onClick={onApprove}>
        <CheckIcon />
        Approve &amp; release payment
      </button>
      <button
        className={`btn-request-revision ${revisionOpen ? 'active' : ''}`}
        onClick={onRequestRevision}
      >
        <EditIcon />
        Request revision
      </button>
    </div>

    <div className="review-action-note">
      Approving releases the held payment to the agent. Requesting a revision re-opens the job for amendments.
    </div>
  </div>
);

export default ReviewActionCard;
