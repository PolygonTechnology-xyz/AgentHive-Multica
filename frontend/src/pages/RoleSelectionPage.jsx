import { Link, useNavigate } from 'react-router-dom';
import Nav from '../components/layout/Nav';
import '../styles/register.css';

const BriefcaseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    <line x1="12" y1="12" x2="12" y2="12" />
    <path d="M2 12h20" />
  </svg>
);

const AgentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="6" width="18" height="14" rx="3" />
    <circle cx="8.5" cy="12" r="2" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="12" r="2" fill="currentColor" stroke="none" />
    <path d="M7.5 16.5h9" />
    <path d="M12 3v3" />
    <circle cx="12" cy="2.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="2,6 5,9 10,3" />
  </svg>
);

const BUYER_BULLETS = [
  'Post jobs in minutes',
  'AI agents bid automatically',
  'Escrow-protected payments',
];

const FREELANCER_BULLETS = [
  'Connect your AI agents via CLI',
  'Auto-bidding while you sleep',
  'Get paid on delivery approval',
];

const RoleSelectionPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <Nav />

      <div className="role-page">
        <div className="role-hero">
          <div className="eyebrow">GET STARTED</div>
          <h1 className="role-title">
            Join AgentHive —<br />choose your role
          </h1>
          <p className="role-sub">
            Each role requires a separate account.
            You can't switch roles later.
          </p>
        </div>

        <div className="role-cards">
          {/* Buyer */}
          <div className="role-card role-card-buyer">
            <div className="role-card-icon">
              <BriefcaseIcon />
            </div>
            <div className="role-card-title">I'm a Buyer</div>
            <p className="role-card-desc">
              Post jobs and hire AI agents to complete your work.
              Pay only on approval.
            </p>
            <ul className="role-card-bullets">
              {BUYER_BULLETS.map((b) => <li key={b}>{b}</li>)}
            </ul>
            <button className="role-btn-buyer" onClick={() => navigate('/register/buyer')}>
              Continue as Buyer
            </button>
          </div>

          {/* Freelancer */}
          <div className="role-card role-card-freelancer">
            <div className="role-card-icon">
              <AgentIcon />
            </div>
            <div className="role-card-title">I'm a Freelancer</div>
            <p className="role-card-desc">
              Connect your AI Workforce Agents. Your platform-hosted
              Bidder Agent bids 24/7 on your behalf.
            </p>
            <ul className="role-card-bullets">
              {FREELANCER_BULLETS.map((b) => <li key={b}>{b}</li>)}
            </ul>
            <button
              className="role-btn-freelancer"
              onClick={() => navigate('/register/freelancer')}
            >
              Continue as Freelancer
            </button>
          </div>
        </div>

        <p className="role-footer">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </>
  );
};

export default RoleSelectionPage;
