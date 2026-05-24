import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../shared/Logo';

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const ChevronDown = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <polyline points="4,6 8,10 12,6"/>
  </svg>
);
const MenuIcon = ({ open }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="20" height="20">
    {open
      ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
      : <><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></>
    }
  </svg>
);

const NAV_LINKS = [
  { label: 'Dashboard', to: '/dashboard/buyer' },
  { label: 'My Jobs',   to: '/jobs' },
  { label: 'Post a Job', to: '/jobs/create' },
  { label: 'Payments',  to: '/payments' },
];

const BUYER_ACCENT = '#67e8f9';

const BuyerNav = ({ active = 'Dashboard', displayName = 'Sarah Chen', initials = 'SC', notifCount = 2 }) => {
  const [open,     setOpen]     = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const ref      = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeAll = () => { setMenuOpen(false); setOpen(false); };

  return (
    <>
      <nav className="buyer-nav">
        <div className="buyer-nav-inner">

          {/* Brand */}
          <Link to="/dashboard/buyer" className="buyer-nav-brand" onClick={closeAll}>
            <Logo />
            <span className="buyer-brand-name">AgentHive</span>
          </Link>

          {/* Desktop links */}
          <div className="buyer-nav-links">
            {NAV_LINKS.map((l) => (
              <Link key={l.label} to={l.to} className={`buyer-nav-link${l.label === active ? ' active' : ''}`}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="buyer-nav-right">

            {/* Bell */}
            <div className="buyer-bell-wrap">
              <Link to="/notifications/buyer" className="buyer-bell" aria-label="Notifications">
                <BellIcon />
                {notifCount > 0 && <span className="buyer-bell-badge">{notifCount}</span>}
              </Link>
            </div>

            {/* User dropdown (desktop) */}
            <div
              ref={ref}
              className={`buyer-user-wrap buyer-desktop-only${open ? ' open' : ''}`}
              onClick={() => setOpen((o) => !o)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setOpen((o) => !o)}
            >
              <div className="buyer-user-avatar">{initials}</div>
              <span className="buyer-user-name">{displayName}</span>
              <span className="buyer-user-chevron"><ChevronDown /></span>

              <div className={`buyer-dropdown${open ? ' open' : ''}`} onClick={(e) => e.stopPropagation()}>
                <Link to="/account/buyer" className="buyer-dropdown-item" onClick={closeAll}>My Account</Link>
                <div className="buyer-dropdown-divider" />
                <button className="buyer-dropdown-item signout" onClick={() => { closeAll(); navigate('/'); }}>
                  Sign out
                </button>
              </div>
            </div>

            {/* Hamburger (mobile only) */}
            <button
              className="buyer-hamburger"
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              <MenuIcon open={menuOpen} />
            </button>

          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      {menuOpen && <div className="buyer-mobile-overlay" onClick={closeAll} />}

      <div className={`buyer-mobile-menu${menuOpen ? ' open' : ''}`}>
        <div className="buyer-mobile-menu-inner">
          <div className="buyer-mobile-section">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className={`buyer-mobile-link${l.label === active ? ' active' : ''}`}
                onClick={closeAll}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="buyer-mobile-divider" />

          <div className="buyer-mobile-section">
            <Link to="/account/buyer" className="buyer-mobile-link secondary" onClick={closeAll}>My Account</Link>
          </div>

          <div className="buyer-mobile-divider" />

          <div className="buyer-mobile-user-row">
            <div className="buyer-user-avatar">{initials}</div>
            <span className="buyer-mobile-username">{displayName}</span>
          </div>
          <button className="buyer-mobile-signout" onClick={() => { closeAll(); navigate('/'); }}>
            Sign out
          </button>
        </div>
      </div>
    </>
  );
};

export default BuyerNav;
