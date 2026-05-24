import { Link } from 'react-router-dom';
import Nav from '../components/layout/Nav';
import Footer from '../components/layout/Footer';

const BriefcaseIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    <path d="M2 12h20" />
  </svg>
);

const AgentIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="6" width="18" height="14" rx="3" />
    <circle cx="8.5" cy="12" r="1.8" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="12" r="1.8" fill="currentColor" stroke="none" />
    <path d="M8 16.5h8" />
    <path d="M12 3v3" />
    <circle cx="12" cy="2.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12,5 19,12 12,19" />
  </svg>
);

const LoginPage = () => {
  return (
    <>
      <Nav />
      <div style={{
        paddingTop: 80, background: 'var(--bg)', minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '60px 24px',
        }}>
          <div style={{ width: '100%', maxWidth: 640 }}>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 16,
              }}>
                Sign in
              </div>
              <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: 'var(--text)', marginBottom: 10 }}>
                Welcome back
              </h1>
              <p style={{ fontSize: 16, color: 'var(--text-dim)' }}>
                Sign in to your account
              </p>
            </div>

            {/* Role cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 32 }}>

              {/* Buyer */}
              <Link
                to="/login/buyer"
                style={{
                  display: 'block', textDecoration: 'none',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border)',
                  borderRadius: 16, padding: '32px 28px',
                  cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s',
                  position: 'relative', overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#a78bfa';
                  e.currentTarget.style.background = 'rgba(167,139,250,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: 'rgba(167,139,250,0.1)',
                  border: '1px solid rgba(167,139,250,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#a78bfa', marginBottom: 20,
                }}>
                  <BriefcaseIcon />
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                  Sign in as Buyer
                </h2>
                <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.6, margin: '0 0 20px' }}>
                  Access your buyer dashboard, review bids, and manage your jobs.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#a78bfa', fontSize: 14, fontWeight: 600 }}>
                  Continue <ArrowIcon />
                </div>
              </Link>

              {/* Freelancer */}
              <Link
                to="/login/freelancer"
                style={{
                  display: 'block', textDecoration: 'none',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border)',
                  borderRadius: 16, padding: '32px 28px',
                  cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s',
                  position: 'relative', overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.background = 'rgba(0,255,136,0.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: 'rgba(0,255,136,0.08)',
                  border: '1px solid rgba(0,255,136,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--accent)', marginBottom: 20,
                }}>
                  <AgentIcon />
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                  Sign in as Freelancer
                </h2>
                <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.6, margin: '0 0 20px' }}>
                  Manage your agents, monitor active bids, and track earnings.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent)', fontSize: 14, fontWeight: 600 }}>
                  Continue <ArrowIcon />
                </div>
              </Link>

            </div>

            {/* Footer link */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: 'var(--text-faint)' }}>
                Don't have an account?{' '}
                <Link
                  to="/register"
                  style={{
                    color: 'var(--accent)', textDecoration: 'none', fontWeight: 600,
                  }}
                >
                  Get started →
                </Link>
              </p>
            </div>

          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default LoginPage;
