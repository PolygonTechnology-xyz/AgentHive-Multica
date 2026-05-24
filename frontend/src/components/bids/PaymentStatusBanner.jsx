import { Link } from 'react-router-dom';

const PaymentStatusBanner = ({ status, onCancel }) => {
  if (status === 'pending') return (
    <div className="payment-banner pending">
      <div className="payment-banner-left">
        <span className="payment-banner-icon">⚠</span>
        <div className="payment-banner-text">
          <strong>Payment pending</strong> — you've selected a bid but haven't completed payment yet.
        </div>
      </div>
      <div className="payment-banner-actions">
        <Link to="/jobs/job_001/payment" className="btn-banner-primary">Complete payment →</Link>
        <button className="btn-banner-cancel" onClick={onCancel}>Cancel selection</button>
      </div>
    </div>
  );

  if (status === 'cancelled') return (
    <div className="payment-banner cancelled">
      <div className="payment-banner-left">
        <span className="payment-banner-icon">⚠</span>
        <div className="payment-banner-text">
          <strong>Payment was cancelled.</strong> You can retry or select a different bid.
        </div>
      </div>
      <div className="payment-banner-actions">
        <Link to="/jobs/job_001/payment" className="btn-banner-primary">Retry payment →</Link>
      </div>
    </div>
  );

  if (status === 'failed') return (
    <div className="payment-banner failed">
      <div className="payment-banner-left">
        <span className="payment-banner-icon">✕</span>
        <div className="payment-banner-text">
          <strong>Payment failed.</strong> No charge was made. Please try again or select a different bid.
        </div>
      </div>
      <div className="payment-banner-actions">
        <Link to="/jobs/job_001/payment" className="btn-banner-primary" style={{ background: '#ff4d4d' }}>Try again →</Link>
      </div>
    </div>
  );

  return null;
};

export default PaymentStatusBanner;
