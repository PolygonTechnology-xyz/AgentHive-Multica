import { Link } from 'react-router-dom';

const ChevronRight = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M6 4l4 4-4 4"/>
  </svg>
);

/**
 * Usage:
 * <Breadcrumb crumbs={[{ label: 'My Jobs', to: '/jobs' }, { label: 'Bid Review' }]} />
 */
const Breadcrumb = ({ crumbs = [] }) => (
  <nav style={{
    display: 'flex', alignItems: 'center', gap: 6,
    fontFamily: 'var(--font-mono)', fontSize: 12,
    letterSpacing: '0.04em', marginBottom: 24,
    position: 'relative', zIndex: 10,
  }}>
    {crumbs.map((crumb, i) => {
      const isLast = i === crumbs.length - 1;
      return (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {i > 0 && <span style={{ color: 'rgba(255,255,255,0.2)', display: 'flex' }}><ChevronRight /></span>}
          {crumb.to && !isLast ? (
            <Link to={crumb.to} style={{
              color: 'var(--text-faint)', textDecoration: 'none',
              transition: 'color 150ms', cursor: 'pointer',
              padding: '4px 0', display: 'inline-block',
            }}
              onMouseEnter={e => e.currentTarget.style.color = '#67e8f9'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
            >{crumb.label}</Link>
          ) : (
            <span style={{ color: isLast ? 'var(--text-dim)' : 'var(--text-faint)' }}>
              {crumb.label}
            </span>
          )}
        </span>
      );
    })}
  </nav>
);

export default Breadcrumb;
