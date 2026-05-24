import { Link, useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-body)',
      padding: '24px',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>

        {/* Glitchy 404 */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(5rem, 18vw, 9rem)',
          fontWeight: 900,
          color: 'transparent',
          WebkitTextStroke: '2px rgba(0,255,136,0.25)',
          lineHeight: 1,
          marginBottom: 8,
          letterSpacing: '-0.04em',
          userSelect: 'none',
        }}>
          404
        </div>

        <div style={{
          width: 48,
          height: 2,
          background: 'rgba(0,255,136,0.3)',
          margin: '0 auto 24px',
          borderRadius: 2,
        }} />

        <div style={{
          fontSize: '1.1rem',
          fontWeight: 700,
          color: 'var(--text)',
          marginBottom: 10,
          letterSpacing: '-0.01em',
        }}>
          Page not found
        </div>

        <div style={{
          fontSize: '0.83rem',
          color: 'var(--text-dim)',
          lineHeight: 1.65,
          marginBottom: 32,
        }}>
          The page you're looking for doesn't exist or has been moved.
          Check the URL or navigate back to a known destination.
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 9,
              padding: '10px 20px',
              fontSize: '0.83rem',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text-dim)'; }}
          >
            ← Go back
          </button>

          <Link to="/" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'rgba(0,255,136,0.08)',
              border: '1px solid rgba(0,255,136,0.25)',
              borderRadius: 9,
              padding: '10px 20px',
              fontSize: '0.83rem',
              fontWeight: 600,
              color: 'var(--accent)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,255,136,0.14)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,255,136,0.08)'; }}
            >
              Go to homepage
            </button>
          </Link>

          <Link to="/dashboard/freelancer" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 9,
              padding: '10px 20px',
              fontSize: '0.83rem',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text-dim)'; }}
            >
              Dashboard
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default NotFoundPage;
