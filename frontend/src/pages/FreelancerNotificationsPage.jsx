import { useState } from 'react';
import { Link } from 'react-router-dom';
import FreelancerNav from '../components/layout/FreelancerNav';
import Footer from '../components/layout/Footer';
import '../styles/freelancer-dashboard.css';

const BidIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const MoneyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);
const RevisionIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
  </svg>
);
const RobotIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="6" width="18" height="14" rx="3"/>
    <circle cx="8.5" cy="12" r="2" fill="currentColor" stroke="none"/>
    <circle cx="15.5" cy="12" r="2" fill="currentColor" stroke="none"/>
    <path d="M8 17h8"/><path d="M12 3v3"/>
  </svg>
);
const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const NOTIFS = [
  {
    id: 1, unread: true, type: 'bid',
    title: 'Bid won — new job started',
    body: 'Your Bidder Agent won the job "Competitive Pricing Analysis — Retail" from ShelfIQ. $410 is now held in escrow. Agent dispatched.',
    time: '4 min ago',
    link: '/jobs/freelancer',
    icon: <CheckIcon />, color: '#00ff88',
  },
  {
    id: 2, unread: true, type: 'bid',
    title: 'Bid submitted',
    body: 'Your Bidder Agent placed a bid of $285 on "Extract and normalize pricing data from 45 competitor websites". Match score: 94.',
    time: '22 min ago',
    link: '/jobs/freelancer',
    icon: <BidIcon />, color: '#00ff88',
  },
  {
    id: 3, unread: true, type: 'revision',
    title: 'Revision requested',
    body: 'Trendly has requested a revision on "E-commerce Product Description Bulk (200)". Buyer note: "Make the tone more playful and add a CTA at the end."',
    time: '2 hrs ago',
    link: '/jobs/freelancer',
    icon: <RevisionIcon />, color: '#fbbf24',
  },
  {
    id: 4, unread: false, type: 'payment',
    title: 'Payout released — $697',
    body: 'Ppay escrow released $697 to your account for "Patent Landscape Report — Biotech" completed for Helixara. Transaction ID: ERN-2038.',
    time: '3 hrs ago',
    link: '/payments/freelancer',
    icon: <MoneyIcon />, color: '#fbbf24',
  },
  {
    id: 5, unread: false, type: 'payment',
    title: 'Payout released — $242',
    body: 'Ppay escrow released $242 to your account for "Q1 Market Intelligence Report" completed for NovaCorp. Transaction ID: ERN-2041.',
    time: '1 day ago',
    link: '/payments/freelancer',
    icon: <MoneyIcon />, color: '#fbbf24',
  },
  {
    id: 6, unread: false, type: 'bid',
    title: 'Bid suppressed — low match',
    body: 'Your Bidder Agent skipped "Logo design for fintech startup" (match score 31). Below your configured threshold of 75.',
    time: '1 day ago',
    link: '/configuration',
    icon: <BidIcon />, color: '#6b7280',
  },
  {
    id: 7, unread: false, type: 'agent',
    title: 'Agent reconnection required',
    body: 'Atlas-Research-7 has been offline for 6 hours. Reconnect via CLI to resume bidding on eligible jobs.',
    time: '2 days ago',
    link: '/agents',
    icon: <RobotIcon />, color: '#67e8f9',
  },
  {
    id: 8, unread: false, type: 'system',
    title: 'Welcome to AgentHive',
    body: 'Your freelancer account is live. Connect an agent via the CLI and your Bidder Agent will start finding jobs automatically.',
    time: '5 days ago',
    link: '/dashboard/freelancer',
    icon: <StarIcon />, color: '#67e8f9',
  },
];

const FILTERS = ['All', 'Bids', 'Revisions', 'Payments', 'Agents', 'System'];

const FreelancerNotificationsPage = () => {
  const [notifs, setNotifs] = useState(NOTIFS);
  const [filter, setFilter] = useState('All');

  const unreadCount = notifs.filter(n => n.unread).length;
  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, unread: false })));
  const markRead    = (id) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));

  const filtered = notifs.filter(n => {
    if (filter === 'All')       return true;
    if (filter === 'Bids')      return n.type === 'bid';
    if (filter === 'Revisions') return n.type === 'revision';
    if (filter === 'Payments')  return n.type === 'payment';
    if (filter === 'Agents')    return n.type === 'agent';
    if (filter === 'System')    return n.type === 'system';
    return true;
  });

  return (
    <>
      <FreelancerNav activePage="Dashboard" notifCount={unreadCount} />
      <div style={{ paddingTop: 60, minHeight: '100vh', background: 'var(--bg)' }}>
        <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 8,
              }}>Inbox</div>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                Notifications
                {unreadCount > 0 && (
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
                    background: 'var(--accent)', color: '#08080c',
                    borderRadius: 999, padding: '2px 9px',
                  }}>{unreadCount}</span>
                )}
              </h1>
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{
                background: 'none', border: '1px solid var(--border)',
                borderRadius: 8, padding: '8px 16px',
                fontSize: 12, color: 'var(--text-faint)',
                cursor: 'pointer', fontFamily: 'var(--font-mono)',
                letterSpacing: '0.04em', transition: 'border-color 180ms, color 180ms',
              }}
                onMouseEnter={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--accent)'; }}
                onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-faint)'; }}
              >Mark all read</button>
            )}
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                background: filter === f ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${filter === f ? 'rgba(0,255,136,0.3)' : 'var(--border)'}`,
                borderRadius: 999,
                padding: '5px 14px',
                fontSize: 12, fontWeight: filter === f ? 600 : 400,
                color: filter === f ? 'var(--accent)' : 'var(--text-faint)',
                cursor: 'pointer', fontFamily: 'var(--font-mono)',
                letterSpacing: '0.04em', transition: 'all 180ms',
              }}>{f}</button>
            ))}
          </div>

          {/* List */}
          <div className="glass" style={{ borderRadius: 14, overflow: 'hidden' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-faint)', fontSize: 14 }}>
                No notifications here.
              </div>
            ) : filtered.map((n, i) => (
              <Link
                to={n.link}
                key={n.id}
                onClick={() => markRead(n.id)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 16,
                  padding: '18px 20px',
                  borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  background: n.unread ? 'rgba(0,255,136,0.04)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'background 180ms',
                  position: 'relative',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = n.unread ? 'rgba(0,255,136,0.04)' : 'transparent'}
              >
                {/* Unread dot */}
                {n.unread && (
                  <div style={{
                    position: 'absolute', left: 7, top: '50%',
                    transform: 'translateY(-50%)',
                    width: 5, height: 5, borderRadius: '50%',
                    background: 'var(--accent)',
                    boxShadow: '0 0 6px rgba(0,255,136,0.8)',
                  }} />
                )}

                {/* Icon */}
                <div style={{
                  width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                  background: `${n.color}18`,
                  border: `1px solid ${n.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: n.color,
                }}>
                  {n.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{
                      fontSize: 13, fontWeight: n.unread ? 600 : 500,
                      color: 'var(--text)',
                    }}>{n.title}</span>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 10,
                      color: 'var(--text-dim)', flexShrink: 0, marginLeft: 12,
                    }}>{n.time}</span>
                  </div>
                  <p style={{
                    fontSize: 12, lineHeight: 1.6, margin: 0,
                    color: 'var(--text-dim)',
                  }}>{n.body}</p>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
};

export default FreelancerNotificationsPage;
