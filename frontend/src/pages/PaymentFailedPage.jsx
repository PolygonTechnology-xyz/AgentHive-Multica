import { Link } from 'react-router-dom';
import BuyerNav from '../components/layout/BuyerNav';
import '../styles/bids.css';

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const ArrowRight = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="14" height="14" style={{ flexShrink: 0 }}>
    <path d="M3 8h10M9 4l4 4-4 4"/>
  </svg>
);

const PaymentFailedPage = () => (
  <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
    <BuyerNav active="My Jobs" />
    <div className="payment-failed-body">
      <div className="payment-failed-card">
        <div className="pf-x-wrap"><XIcon /></div>
        <div className="pf-title">Payment failed</div>
        <div className="pf-sub">
          Your payment could not be processed. No charge was made.<br />
          Please check your Ppay account details and try again.
        </div>
        <div className="pf-actions">
          <Link to="/jobs/job_001/payment" className="btn-try-again">
            Try again <ArrowRight />
          </Link>
          <Link to="/jobs/job_001/bids" className="btn-diff-bid">
            Select a different bid
          </Link>
        </div>
      </div>
    </div>
  </div>
);

export default PaymentFailedPage;
