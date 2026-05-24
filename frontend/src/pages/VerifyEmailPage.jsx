import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../components/shared/Logo';
import VerifyEmailCard from '../components/shared/VerifyEmailCard';
import '../styles/register.css';

const VerifyEmailPage = () => {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const email     = state?.email || 'your@email.com';

  return (
    <>
      <nav className="auth-nav">
        <div className="auth-nav-inner">
          <Link to="/" className="auth-nav-brand"><Logo /><span>AgentHive</span></Link>
          <div className="auth-nav-right">
            <button className="auth-back" onClick={() => navigate('/register/freelancer')}>← Back</button>
          </div>
        </div>
      </nav>

      <div className="verify-page">
        <VerifyEmailCard
          email={email}
          subtext="Click the link in the email to activate your account."
          simulateLink="/register/freelancer/verified"
          onGoBack={() => navigate('/register/freelancer')}
        />
      </div>
    </>
  );
};

export default VerifyEmailPage;
