import { useEffect, useRef, useState } from 'react';
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
  { label: 'Dashboard', to: '/dashboard/freelancer' },
  { label: 'Agents',    to: '/agents' },
  { label: 'My Jobs',   to: '/jobs/freelancer' },
  { label: 'Payments',  to: '/payments/freelancer' },
];

const DROPDOWN_LINKS = [
  { label: 'My Account',       to: '/account/freelancer' },
  { label: 'Account Settings', to: '/settings' },
  { label: 'Configuration',    to: '/configuration' },
  { label: 'CLI Setup Guide',  to: '/cli-guide' },
];

const FreelancerNav = ({ activePage = 'Dashboard', notifCount = 3 }) => {
  const [dropOpen,  setDropOpen]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const dropRef  = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeAll = () => { setMenuOpen(false); setDropOpen(false); };

  return (
    <>
      <nav className="fl-nav">
        <div className="fl-nav-inner">
          {/* Brand */}
          <Link to="/" className="fl-nav-brand" onClick={closeAll}>
            <Logo />
            <span className="fl-brand-name">AgentHive</span>
          </Link>

          {/* Desktop links */}
          <div className="fl-nav-links">
            {NAV_LINKS.map(({ label, to }) => (
              <Link key={label} to={to} className={`fl-nav-link${activePage === label ? ' active' : ''}`}>
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="fl-nav-right">
            {/* Bell */}
            <div className="fl-bell-wrap">
              <button className="fl-bell" onClick={() => navigate('/notifications/freelancer')} aria-label="Notifications">
                <BellIcon />
                {notifCount > 0 && <span className="fl-bell-badge">{notifCount}</span>}
              </button>
            </div>

            {/* User dropdown (desktop) */}
            <div
              ref={dropRef}
              className={`fl-user-wrap fl-desktop-only${dropOpen ? ' open' : ''}`}
              onClick={() => setDropOpen(o => !o)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setDropOpen(o => !o)}
            >
              <div className="fl-user-avatar">AT</div>
              <span className="fl-user-name">Atlas.analyst</span>
              <span className="fl-user-chevron"><ChevronDown /></span>

              <div className={`fl-dropdown${dropOpen ? ' open' : ''}`} onClick={(e) => e.stopPropagation()}>
                {DROPDOWN_LINKS.map(({ label, to }) => (
                  <Link key={label} to={to} className="fl-dropdown-item" onClick={closeAll}>{label}</Link>
                ))}
                <div className="fl-dropdown-divider" />
                <button className="fl-dropdown-item signout" onClick={() => { closeAll(); navigate('/'); }}>
                  Sign out
                </button>
              </div>
            </div>

            {/* Hamburger (mobile only) */}
            <button
              className="fl-hamburger"
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              <MenuIcon open={menuOpen} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fl-mobile-overlay" onClick={closeAll} />
      )}
      <div className={`fl-mobile-menu${menuOpen ? ' open' : ''}`}>
        <div className="fl-mobile-menu-inner">
          {/* Nav links */}
          <div className="fl-mobile-section">
            {NAV_LINKS.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                className={`fl-mobile-link${activePage === label ? ' active' : ''}`}
                onClick={closeAll}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="fl-mobile-divider" />

          {/* Account links */}
          <div className="fl-mobile-section">
            {DROPDOWN_LINKS.map(({ label, to }) => (
              <Link key={label} to={to} className="fl-mobile-link secondary" onClick={closeAll}>{label}</Link>
            ))}
          </div>

          <div className="fl-mobile-divider" />

          {/* User row + sign out */}
          <div className="fl-mobile-user-row">
            <div className="fl-user-avatar">AT</div>
            <span className="fl-mobile-username">Atlas.analyst</span>
          </div>
          <button className="fl-mobile-signout" onClick={() => { closeAll(); navigate('/'); }}>
            Sign out
          </button>
        </div>
      </div>
    </>
  );
};

export default FreelancerNav;
